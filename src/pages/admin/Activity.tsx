import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { CreditCard, Loader2, MessageSquare, Settings as SettingsIcon, Shield,User } from 'lucide-react';

import { useActivityLogs } from '@/hooks/queries/admin';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'login':
      return <User className="h-4 w-4" />;
    case 'query':
      return <MessageSquare className="h-4 w-4" />;
    case 'subscription':
      return <CreditCard className="h-4 w-4" />;
    case 'profile_update':
      return <SettingsIcon className="h-4 w-4" />;
    case 'admin_action':
      return <Shield className="h-4 w-4" />;
    default:
      return <User className="h-4 w-4" />;
  }
};

const getActivityBadgeVariant = (type: string): 'default' | 'secondary' | 'outline' => {
  switch (type) {
    case 'subscription':
      return 'default';
    case 'admin_action':
      return 'outline';
    default:
      return 'secondary';
  }
};

const getActivityTypeLabel = (type: string) => {
  switch (type) {
    case 'login':
      return 'Login';
    case 'query':
      return 'Pertanyaan';
    case 'subscription':
      return 'Berlangganan';
    case 'profile_update':
      return 'Update Profil';
    case 'admin_action':
      return 'Aksi Admin';
    default:
      return 'Aktivitas';
  }
};

export default function Activity() {
  const { data: logs, isLoading } = useActivityLogs(50);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Log Aktivitas</h1>
        <p className="text-muted-foreground mt-2">
          Pantau semua aktivitas pengguna dan sistem
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Terkini</CardTitle>
          <CardDescription>
            Riwayat aktivitas 50 terakhir
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {logs?.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0"
              >
                <div className="mt-1 p-2 rounded-lg bg-primary/10 text-primary">
                  {getActivityIcon(log.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{log.user_name}</p>
                    <Badge variant={getActivityBadgeVariant(log.type)}>
                      {getActivityTypeLabel(log.type)}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-foreground">{log.action}</p>
                  <p className="text-sm text-muted-foreground">{log.details}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(log.timestamp), {
                      addSuffix: true,
                      locale: idLocale,
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Settings,
  Activity,
  Menu,
  X,
  LogOut,
  ChevronLeft,
  Moon,
  Sun,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: 'Kelola Pengguna',
    href: '/admin/users',
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: 'Aktivitas',
    href: '/admin/activity',
    icon: <Activity className="h-5 w-5" />,
  },
  {
    title: 'Pengaturan',
    href: '/admin/settings',
    icon: <Settings className="h-5 w-5" />,
  },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Berhasil keluar');
    navigate('/admin/login');
  };

  const isActive = (href: string) => location.pathname === href;

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - Desktop */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen transition-all duration-300 hidden lg:block border-r bg-card',
          sidebarOpen ? 'w-64' : 'w-20'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b px-4">
            {sidebarOpen ? (
              <h1 className="text-xl font-bold text-primary">Patriot Desa Admin</h1>
            ) : (
              <span className="text-2xl font-bold text-primary">PD</span>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => navigate(item.href)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive(item.href)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                {item.icon}
                {sidebarOpen && <span>{item.title}</span>}
              </button>
            ))}
          </nav>

          {/* Toggle Button */}
          <div className="border-t p-3">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <ChevronLeft
                className={cn(
                  'h-5 w-5 transition-transform',
                  !sidebarOpen && 'rotate-180'
                )}
              />
              {sidebarOpen && <span className="ml-2">Ciutkan</span>}
            </Button>
          </div>
        </div>
      </aside>

      {/* Sidebar - Mobile */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="fixed left-0 top-0 z-50 h-screen w-64 border-r bg-card lg:hidden">
            <div className="flex h-full flex-col">
              <div className="flex h-16 items-center justify-between border-b px-4">
                <h1 className="text-xl font-bold text-primary">Patriot Desa Admin</h1>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
                {navItems.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => {
                      navigate(item.href);
                      setMobileMenuOpen(false);
                    }}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive(item.href)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>
        </>
      )}

      {/* Main Content */}
      <div
        className={cn(
          'transition-all duration-300',
          sidebarOpen ? 'lg:pl-64' : 'lg:pl-20'
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex-1" />

          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme('light')}>
                Terang
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                Gelap
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                Sistem
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Logout Button */}
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Keluar</span>
          </Button>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

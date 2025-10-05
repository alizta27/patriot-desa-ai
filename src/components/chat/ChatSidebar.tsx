import { MessageSquare, LogOut, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import type { Chat } from "@/pages/Chat";

interface ChatSidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onLogout: () => void;
}

export function ChatSidebar({
  chats,
  currentChatId,
  onNewChat,
  onSelectChat,
  onLogout,
}: ChatSidebarProps) {
  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarContent>
        <div className="p-4">
          <Button
            onClick={onNewChat}
            className="w-full bg-sidebar-primary hover:bg-sidebar-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Chat Baru
          </Button>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground">Riwayat Chat</SidebarGroupLabel>
          <SidebarGroupContent>
            <ScrollArea className="h-[calc(100vh-250px)]">
              <SidebarMenu>
                {chats.map((chat) => (
                  <SidebarMenuItem key={chat.id}>
                    <SidebarMenuButton
                      onClick={() => onSelectChat(chat.id)}
                      isActive={currentChatId === chat.id}
                      className="w-full justify-start"
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      <span className="truncate">{chat.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto p-4 border-t border-sidebar-border">
          <Button
            onClick={onLogout}
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Keluar
          </Button>
        </div>
      </SidebarContent>
      
      <SidebarTrigger className="absolute top-4 -right-10" />
    </Sidebar>
  );
}

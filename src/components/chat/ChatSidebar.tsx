import { useMemo, useState } from "react";
import { LogOut, Plus, MoreHorizontal, Menu, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import type { Chat } from "@/pages/Chat";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ChatSidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onLogout: () => void;
  onRenameChat?: (chatId: string, newTitle: string) => void;
  onDeleteChat?: (chatId: string) => void;
}

export function ChatSidebar({
  chats,
  currentChatId,
  onNewChat,
  onSelectChat,
  onLogout,
  onRenameChat,
  onDeleteChat,
}: ChatSidebarProps) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [renameChatId, setRenameChatId] = useState<string | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteChatId, setDeleteChatId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const openRename = (chat: Chat) => {
    setRenameChatId(chat.id);
    setRenameValue(chat.title);
    setRenameOpen(true);
  };

  const submitRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameChatId || !onRenameChat) return;
    const next = renameValue.trim();
    if (!next) return;
    onRenameChat(renameChatId, next);
    setRenameOpen(false);
  };

  const askDelete = (chatId: string) => {
    setDeleteChatId(chatId);
    setConfirmOpen(true);
  };

  const filteredChats = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return chats;
    return chats.filter((c) => c.title.toLowerCase().includes(q));
  }, [chats, searchText]);

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarContent>
        {/* Header with logo and toggle */}
        <div className="px-3 py-4 flex items-center gap-2 border-b border-sidebar-border">
          <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center text-primary font-semibold">
            PD
          </div>
          <div className="text-sm font-medium text-sidebar-foreground">
            Patriot Desa
          </div>
          <div className="ml-auto">
            <SidebarTrigger>
              {/* <SidebarTrigger asChild> */}
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Menu className="h-4 w-4" />
              </Button>
            </SidebarTrigger>
          </div>
        </div>

        {/* Actions: New chat + Search */}
        <div className="p-3 space-y-2 border-b border-sidebar-border">
          <Button
            onClick={onNewChat}
            variant="outline"
            className="w-full justify-start gap-2"
          >
            <Plus className="h-4 w-4" />
            Chat Baru
          </Button>

          {!searchOpen ? (
            <Button
              onClick={() => setSearchOpen(true)}
              variant="outline"
              className="w-full justify-start gap-2 bg-none"
            >
              <Search className="h-4 w-4" />
              Cari chat
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  className="w-full h-9 rounded-md border bg-background px-3 pr-8 text-sm outline-none text-muted-foreground"
                  placeholder="Cari judul chat..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
                {searchOpen && (
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setSearchText("");
                      setSearchOpen(false);
                    }}
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Chat List */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground">
            Riwayat Chat
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <ScrollArea className="h-full">
              <div className="space-y-1 p-2 w-[230px]">
                {filteredChats.map((chat) => {
                  const active = currentChatId === chat.id;
                  return (
                    <div
                      key={chat.id}
                      className={`group flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors ${
                        active
                          ? "bg-sidebar-accent text-sidebar-foreground"
                          : "hover:bg-sidebar-accent/60"
                      }`}
                      onClick={() => onSelectChat(chat.id)}
                    >
                      <span className="truncate flex-1 pr-2 max-w-[90%]">
                        {chat.title}
                      </span>

                      {(onRenameChat || onDeleteChat) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            {/* <DropdownMenuTrigger asChild> */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-[20px] opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-accent"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent
                            align="end"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {onRenameChat && (
                              <DropdownMenuItem
                                onClick={() => openRename(chat)}
                              >
                                Rename Chat
                              </DropdownMenuItem>
                            )}
                            {onDeleteChat && (
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => askDelete(chat.id)}
                              >
                                Delete Chat
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Logout */}
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

      {/* Rename Dialog */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Rename Chat</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitRename} className="mt-2">
            <input
              className="w-full border rounded-md p-2 bg-background"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setRenameOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this chat?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (deleteChatId && onDeleteChat) onDeleteChat(deleteChatId);
                setConfirmOpen(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sidebar>
  );
}

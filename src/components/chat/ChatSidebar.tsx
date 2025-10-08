import { useMemo, useState } from "react";
import { LogOut, Menu,MoreHorizontal, Plus, Search, X } from "lucide-react";

import type { Chat } from "@/pages/Chat";

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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatSidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onLogout: () => void;
  closeSidebar: () => void;
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
  closeSidebar,
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
    <div className="w-64 h-full border-r border-border bg-background flex flex-col">
      {/* Header with logo */}
      <div className="px-3 py-4 flex items-center gap-2 border-b border-border justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center text-primary font-semibold">
            PD
          </div>
          <div className="text-sm font-medium text-foreground">
            Patriot Desa
          </div>
        </div>
        <div className="flex md:hidden">
          <Button variant="ghost" size="icon" onClick={closeSidebar}>
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Actions: New chat + Search */}
      <div className="p-3 space-y-2 border-b border-border">
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
            className="w-full justify-start gap-2"
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
      <div className="flex-1 flex flex-col min-h-0">
        <div className="px-3 py-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            Riwayat Chat
          </h3>
        </div>
        <div className="flex-1 min-h-0">
          {/* <ScrollArea className="h-full"> */}
          <div className="space-y-1 p-2 h-full overflow-y-auto overflow-x-hidden">
            {filteredChats.map((chat) => {
              const active = currentChatId === chat.id;
              return (
                <div
                  key={chat.id}
                  className={`group flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors ${
                    active ? "bg-accent/50" : "hover:bg-accent/50"
                  }`}
                  onClick={() => onSelectChat(chat.id)}
                >
                  <span className="truncate flex-1 pr-2">{chat.title}</span>

                  {(onRenameChat || onDeleteChat) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-[20px] opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-accent hidden md:block"
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
                          <DropdownMenuItem onClick={() => openRename(chat)}>
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
          {/* </ScrollArea> */}
        </div>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-border">
        <Button
          onClick={onLogout}
          variant="ghost"
          className="w-full justify-start text-foreground hover:bg-accent"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Keluar
        </Button>
      </div>

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
    </div>
  );
}

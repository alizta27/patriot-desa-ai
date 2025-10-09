import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  X,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import type { Chat } from "@/pages/Chat";
import { useDeviceType } from "@/hooks/useDeviceType";

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
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ChatSidebarNewProps {
  chats: Chat[];
  currentChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onLogout: () => void;
  onRenameChat?: (chatId: string, newTitle: string) => void;
  onDeleteChat?: (chatId: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export function ChatSidebarNew({
  chats,
  currentChatId,
  onNewChat,
  onSelectChat,
  onLogout,
  onRenameChat,
  onDeleteChat,
  isCollapsed,
  onToggleCollapse,
  isOpen,
  onClose,
}: ChatSidebarNewProps) {
  const deviceType = useDeviceType();
  const isMobile = deviceType === "mobile";

  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [renameChatId, setRenameChatId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteChatId, setDeleteChatId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [showSearch, setShowSearch] = useState(false);

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

  const confirmDelete = () => {
    if (deleteChatId && onDeleteChat) {
      onDeleteChat(deleteChatId);
    }
    setConfirmOpen(false);
    setDeleteChatId(null);
  };

  const filteredChats = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return chats;
    return chats.filter((c) => c.title.toLowerCase().includes(q));
  }, [chats, searchText]);

  // On mobile, hide completely when not open
  if (isMobile && !isOpen) {
    return null;
  }

  const sidebarWidth = isCollapsed ? "w-16" : "w-64";

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ width: isMobile ? 256 : isCollapsed ? 64 : 256 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className={cn(
          "h-full border-r border-border bg-background flex flex-col relative",
          isMobile && "fixed left-0 top-0 bottom-0 z-50"
        )}
      >
        {/* Header */}
        <div className="px-3 py-4 flex items-center justify-between border-b border-border">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-sm">
                PD
              </div>
              <div className="text-sm font-semibold text-foreground">
                Patriot Desa
              </div>
            </div>
          )}
          
          {isCollapsed && !isMobile && (
            <button
              onClick={onToggleCollapse}
              className="w-10 h-10 rounded-lg hover:bg-accent flex items-center justify-center mx-auto"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {!isCollapsed && (
            <div className="flex items-center gap-1">
              {!isMobile && (
                <button
                  onClick={onToggleCollapse}
                  className="w-8 h-8 rounded-lg hover:bg-accent flex items-center justify-center"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              {isMobile && (
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg hover:bg-accent flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* New Chat Button */}
        <div className="p-3 border-b border-border">
          {!isCollapsed ? (
            <Button
              onClick={onNewChat}
              className="w-full justify-start gap-2 bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Percakapan Baru
            </Button>
          ) : (
            <button
              onClick={onNewChat}
              className="w-10 h-10 rounded-lg bg-primary hover:bg-primary/90 text-white flex items-center justify-center mx-auto"
              title="Percakapan Baru"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-hidden">
          {!isCollapsed ? (
            <div className="h-full flex flex-col">
              {/* Search */}
              <div className="p-3 border-b border-border">
                {!showSearch ? (
                  <Button
                    onClick={() => setShowSearch(true)}
                    variant="ghost"
                    className="w-full justify-start gap-2"
                  >
                    <Search className="h-4 w-4" />
                    Cari percakapan
                  </Button>
                ) : (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      placeholder="Cari..."
                      className="pl-9"
                      autoFocus
                    />
                    <button
                      onClick={() => {
                        setShowSearch(false);
                        setSearchText("");
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                )}
              </div>

              {/* Chat List */}
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                  <div className="text-xs font-medium text-muted-foreground px-3 py-2">
                    Riwayat Percakapan
                  </div>
                  {filteredChats.length === 0 ? (
                    <div className="text-sm text-muted-foreground px-3 py-4 text-center">
                      {searchText ? "Tidak ada hasil" : "Belum ada percakapan"}
                    </div>
                  ) : (
                    filteredChats.map((chat) => (
                      <div
                        key={chat.id}
                        className={cn(
                          "group relative flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors",
                          currentChatId === chat.id
                            ? "bg-accent"
                            : "hover:bg-accent/50"
                        )}
                        onClick={() => onSelectChat(chat.id)}
                      >
                        <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="flex-1 text-sm truncate">
                          {chat.title}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              onClick={(e) => e.stopPropagation()}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openRename(chat)}>
                              Ubah Nama
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => askDelete(chat.id)}
                              className="text-destructive"
                            >
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="p-2 space-y-2">
                {chats.slice(0, 10).map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => onSelectChat(chat.id)}
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center mx-auto transition-colors",
                      currentChatId === chat.id
                        ? "bg-accent"
                        : "hover:bg-accent/50"
                    )}
                    title={chat.title}
                  >
                    <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-border space-y-2">
          {!isCollapsed ? (
            <>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={() => {}}
              >
                <Settings className="h-4 w-4" />
                Pengaturan
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                onClick={onLogout}
              >
                <LogOut className="h-4 w-4" />
                Keluar
              </Button>
            </>
          ) : (
            <>
              <button
                className="w-10 h-10 rounded-lg hover:bg-accent flex items-center justify-center mx-auto"
                title="Pengaturan"
              >
                <Settings className="h-5 h-5" />
              </button>
              <button
                onClick={onLogout}
                className="w-10 h-10 rounded-lg hover:bg-accent flex items-center justify-center mx-auto text-destructive"
                title="Keluar"
              >
                <LogOut className="h-5 h-5" />
              </button>
            </>
          )}
        </div>
      </motion.div>

      {/* Rename Dialog */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ubah Nama Percakapan</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitRename} className="space-y-4">
            <Input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder="Masukkan nama baru"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setRenameOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit">Simpan</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Percakapan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus percakapan ini? Tindakan ini
              tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

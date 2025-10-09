import { useState } from "react";
import { motion } from "framer-motion";
import { Pencil, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatMessageProps {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  onEdit?: (messageId: string, newContent: string) => void;
  onResend?: (messageId: string, content: string) => void;
}

export function ChatMessage({
  id,
  role,
  content,
  isStreaming = false,
  onEdit,
  onResend,
}: ChatMessageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [isCopied, setIsCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSaveEdit = () => {
    if (editedContent.trim() && onEdit) {
      onEdit(id, editedContent.trim());
      setIsEditing(false);
    }
  };

  const handleResend = () => {
    if (onResend) {
      onResend(id, editedContent.trim());
      setIsEditing(false);
    }
  };

  const isUser = role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "group relative py-6 px-4",
        isUser ? "bg-background" : "bg-accent/30"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="max-w-3xl mx-auto">
        <div className="flex gap-4">
          {/* Avatar */}
          <div className={cn(
            "w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-sm font-semibold",
            isUser 
              ? "bg-primary text-primary-foreground" 
              : "bg-gradient-to-br from-primary to-primary-dark text-white"
          )}>
            {isUser ? "A" : "PD"}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-3">
                <Textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="min-h-[100px] resize-none"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleResend}
                    disabled={!editedContent.trim()}
                  >
                    Kirim Ulang
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setEditedContent(content);
                    }}
                  >
                    Batal
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {isUser ? (
                    <p className="whitespace-pre-wrap text-foreground">{content}</p>
                  ) : (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {content}
                    </ReactMarkdown>
                  )}
                </div>

                {/* Action Buttons */}
                {isHovered && !isStreaming && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-2 mt-3"
                  >
                    {isUser && onEdit && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md hover:bg-accent text-sm text-muted-foreground hover:text-foreground transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    )}
                    <button
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md hover:bg-accent text-sm text-muted-foreground hover:text-foreground transition-colors"
                      title="Salin"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

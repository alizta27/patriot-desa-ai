import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, X, Image as ImageIcon, FileIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner-api";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent, fileUrls?: string[]) => void;
  onFileUpload?: (files: File[]) => Promise<string[]>;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
}

interface UploadedFile {
  file: File;
  preview?: string;
  id: string;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  onFileUpload,
  isLoading = false,
  disabled = false,
  placeholder = "Tulis pesan Anda...",
  maxLength = 4000,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      // Use same flow as button submit to include file uploads
      if (!disabled && !isLoading && (value.trim() || uploadedFiles.length > 0)) {
        handleSubmitWithFiles(e as unknown as React.FormEvent);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate file size (max 10MB per file)
    const maxSize = 10 * 1024 * 1024; // 10MB
    const invalidFiles = files.filter(f => f.size > maxSize);
    
    if (invalidFiles.length > 0) {
      toast.error("Ukuran file tidak boleh lebih dari 10MB");
      return;
    }

    // Validate file type (images and common documents)
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    const invalidTypes = files.filter(f => !allowedTypes.includes(f.type));
    if (invalidTypes.length > 0) {
      toast.error("Tipe file tidak didukung");
      return;
    }

    // Create file previews
    const newFiles: UploadedFile[] = files.map(file => ({
      file,
      id: Math.random().toString(36).substring(7),
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    // Clear input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const handleSubmitWithFiles = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Can't submit if no text and no files
    if (!value.trim() && uploadedFiles.length === 0) return;

    let fileUrls: string[] = [];

    // Handle file uploads first if present
    if (uploadedFiles.length > 0 && onFileUpload) {
      try {
        fileUrls = await onFileUpload(uploadedFiles.map(f => f.file));
        setUploadedFiles([]);
      } catch (error) {
        console.error("File upload failed:", error);
        return; // Don't submit if file upload fails
      }
    }
    
    // Submit the message with file URLs
    onSubmit(e, fileUrls);
  };

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      uploadedFiles.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, []);

  return (
    <div className="border-t border-border bg-background">
      <div className="max-w-3xl mx-auto p-4">
        <form onSubmit={handleSubmitWithFiles} className="space-y-3">
          {/* File Previews */}
          <AnimatePresence>
            {uploadedFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-2"
              >
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="relative group rounded-lg border border-border overflow-hidden"
                  >
                    {file.preview ? (
                      <div className="w-20 h-20">
                        <img
                          src={file.preview}
                          alt={file.file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 flex flex-col items-center justify-center bg-accent">
                        <FileIcon className="w-6 h-6 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground mt-1 px-1 truncate w-full text-center">
                          {file.file.name.split('.').pop()?.toUpperCase()}
                        </span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(file.id)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input Area */}
          <div className="relative flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={disabled || isLoading}
                placeholder={placeholder}
                maxLength={maxLength}
                rows={1}
                className={cn(
                  "w-full resize-none rounded-xl border border-input bg-background px-4 py-3 pr-12 text-sm",
                  "placeholder:text-muted-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  "min-h-[52px] max-h-[200px]"
                )}
              />
              
              {/* File Upload Button */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isLoading}
                className="absolute right-3 bottom-3 p-1.5 rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
                title="Lampirkan file"
              >
                <Paperclip className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Send Button */}
            <Button
              type="submit"
              size="icon"
              disabled={disabled || isLoading || (!value.trim() && uploadedFiles.length === 0)}
              className="h-[52px] w-[52px] rounded-xl shrink-0"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>

          {/* Character Count */}
          {value.length > maxLength * 0.8 && (
            <div className="text-xs text-muted-foreground text-right">
              {value.length}/{maxLength}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      offset={64}
      duration={3500}
      richColors
      toastOptions={{
        classNames: {
          toast:
            // Base
            "group toast group-[.toaster]:shadow-lg group-[.toaster]:border-border text-white " +
            // Variant colors
            "[&[data-type=success]]:bg-emerald-500 [&[data-type=success]]:text-white " +
            "[&[data-type=error]]:bg-red-500 [&[data-type=error]]:text-white " +
            // Default/fallback when no type provided
            "group-[.toaster]:bg-background group-[.toaster]:text-foreground",
          description: "group-[.toast]:text-white/90",
          actionButton:
            "group-[.toast]:bg-white/20 group-[.toast]:text-white hover:group-[.toast]:bg-white/30",
          cancelButton:
            "group-[.toast]:bg-white/10 group-[.toast]:text-white hover:group-[.toast]:bg-white/20",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

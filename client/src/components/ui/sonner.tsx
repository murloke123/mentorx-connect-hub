import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white/5 group-[.toaster]:backdrop-blur-2xl group-[.toaster]:text-white group-[.toaster]:border-white/10 group-[.toaster]:shadow-2xl group-[.toaster]:shadow-black/20 group-[.toaster]:rounded-2xl group-[.toaster]:before:absolute group-[.toaster]:before:inset-0 group-[.toaster]:before:rounded-2xl group-[.toaster]:before:bg-gradient-to-br group-[.toaster]:before:from-white/10 group-[.toaster]:before:via-white/5 group-[.toaster]:before:to-transparent group-[.toaster]:before:backdrop-blur-2xl group-[.toaster]:before:-z-10",
          description: "group-[.toast]:text-white/90 group-[.toast]:drop-shadow-sm",
          actionButton:
            "group-[.toast]:bg-white/10 group-[.toast]:text-white group-[.toast]:backdrop-blur-sm group-[.toast]:border-white/20 group-[.toast]:hover:bg-white/20",
          cancelButton:
            "group-[.toast]:bg-white/5 group-[.toast]:text-white/80 group-[.toast]:backdrop-blur-sm group-[.toast]:border-white/10 group-[.toast]:hover:bg-white/10",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

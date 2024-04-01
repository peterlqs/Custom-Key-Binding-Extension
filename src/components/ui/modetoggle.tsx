import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import * as React from "react"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  // Func toggle theme
  const toggleTheme = () => {
    console.log()
    setTheme(() => (theme === "dark" ? "light" : "dark"))
  }

  return (
    <Button variant="outline" size="sm" onClick={toggleTheme}>
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  )
}

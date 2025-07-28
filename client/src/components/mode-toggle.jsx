import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"
import { useState, useRef, useEffect } from "react"

export function ModeToggle() {
  const { setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const handleThemeChange = (theme) => {
    console.log('Changing theme to:', theme)
    setTheme(theme)
    setIsOpen(false)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <Button 
        variant="outline" 
        size="icon" 
        className="relative"
        onClick={() => {
          console.log('Button clicked')
          setIsOpen(!isOpen)
        }}
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
      
      {isOpen && (
        <div 
          className="absolute right-0 top-full mt-2 min-w-[8rem] bg-popover border border-border shadow-lg rounded-md z-[9999]"
          style={{ zIndex: 9999 }}
        >
          <button
            onClick={() => handleThemeChange("light")}
            className="w-full text-left px-3 py-2 text-sm hover:bg-accent cursor-pointer rounded-t-md"
          >
            Light
          </button>
          <button
            onClick={() => handleThemeChange("dark")}
            className="w-full text-left px-3 py-2 text-sm hover:bg-accent cursor-pointer"
          >
            Dark
          </button>
          <button
            onClick={() => handleThemeChange("system")}
            className="w-full text-left px-3 py-2 text-sm hover:bg-accent cursor-pointer rounded-b-md"
          >
            System
          </button>
        </div>
      )}
    </div>
  )
} 
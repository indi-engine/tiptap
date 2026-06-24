import { Button } from "@/components/tiptap-ui-primitive/button"

// --- Icons ---
import { MoonStarIcon } from "@/components/tiptap-icons/moon-star-icon"
import { SunIcon } from "@/components/tiptap-icons/sun-icon"
import { useEffect, useState } from "react"
import { useShadowPortalContainer } from "@/components/tiptap-web-component/shadow-portal-context"

export function ThemeToggle() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false)
  const portalContainer = useShadowPortalContainer()

    useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = () => setIsDarkMode(mediaQuery.matches)
    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  useEffect(() => {
    const initialDarkMode =
      !!document.querySelector('meta[name="color-scheme"][content="dark"]') ||
      window.matchMedia("(prefers-color-scheme: dark)").matches
    setIsDarkMode(initialDarkMode)
  }, [])

    useEffect(() => {
        // Inside a shadow root (web component mode), .dark must be applied to a
        // node INSIDE that shadow tree, since the injected stylesheet's rules
        // can't reach document.documentElement at all. Outside shadow DOM
        // (normal app usage), fall back to <html> as before.
        const target = portalContainer ?? document.documentElement
        target.classList.toggle("dark", isDarkMode)
    }, [isDarkMode, portalContainer])

  const toggleDarkMode = () => setIsDarkMode((isDark) => !isDark)

  return (
    <Button
      onClick={toggleDarkMode}
      aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
      variant="ghost"
    >
      {isDarkMode ? (
        <MoonStarIcon className="tiptap-button-icon" />
      ) : (
        <SunIcon className="tiptap-button-icon" />
      )}
    </Button>
  )
}
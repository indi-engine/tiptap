// src/components/tiptap-web-component/shadow-portal-context.tsx
import { createContext, useContext } from "react"

// Holds the DOM node that Radix portals (DropdownMenu, Popover, etc.)
// should render into, so their content stays inside the shadow root
// and remains visible to the injected stylesheet.
export const ShadowPortalContext = createContext<HTMLElement | null>(null)

export function useShadowPortalContainer() {
    return useContext(ShadowPortalContext)
}

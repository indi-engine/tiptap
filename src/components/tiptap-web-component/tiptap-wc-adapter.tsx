// src/components/tiptap-web-component/tiptap-wc-adapter.tsx
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor"
import { ShadowPortalContext } from "@/components/tiptap-web-component/shadow-portal-context"

interface TiptapWCProps {
    content?: string
}

function getCustomElementHost(container: HTMLElement | null): HTMLElement | null {
    const root = container?.getRootNode()
    if (root instanceof ShadowRoot) {
        return root.host instanceof HTMLElement ? root.host : null
    }
    return null
}

export function TiptapWCAdapter({ content }: TiptapWCProps) {
    const hostRef = useRef<HTMLDivElement>(null)
    const [cssText, setCssText] = useState<string>("")
    const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null)
    const [isReadOnly, setIsReadOnly] = useState(false)

    // r2wc does not re-render when a string attribute is removed (value becomes null).
    // Watch the host element directly so add/removeAttribute('readonly') both work.
    useLayoutEffect(() => {
        const host = getCustomElementHost(hostRef.current)
        if (!host) return

        const syncReadOnly = () => setIsReadOnly(host.hasAttribute("readonly"))
        syncReadOnly()

        const observer = new MutationObserver(syncReadOnly)
        observer.observe(host, { attributes: true, attributeFilter: ["readonly"] })
        return () => observer.disconnect()
    }, [])

    useEffect(() => {
        const cssUrl = new URL("./tiptap-element.css", import.meta.url).href
        fetch(cssUrl, {
            headers: {
                "Accept": "text/css"
            }
        })
            .then((res) => res.text())
            .then(setCssText)
            .catch((err) => console.error("Failed to load Tiptap styles:", err))
    }, [])

    useEffect(() => {
        // Once mounted, hostRef.current lives inside the shadow root.
        // Use it directly as the Radix portal target so dropdowns/popovers
        // render inside the shadow boundary instead of document.body.
        setPortalContainer(hostRef.current)
    }, [])

    const handleContentChange = (html: string) => {
        const root = hostRef.current?.getRootNode() as ShadowRoot | Document
        const host = (root as ShadowRoot)?.host ?? hostRef.current
        host?.dispatchEvent(
            new CustomEvent("content-change", {
                detail: html,
                bubbles: true,
                composed: true,
            })
        )
    }
    return (
        <div ref={hostRef}>
            {cssText && <style>{cssText}</style>}
            <ShadowPortalContext.Provider value={portalContainer}>
                <SimpleEditor content={content} onContentChange={handleContentChange} isReadOnly={isReadOnly} />
            </ShadowPortalContext.Provider>
        </div>
    )
}

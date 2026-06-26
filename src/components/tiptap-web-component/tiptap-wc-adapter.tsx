// src/components/tiptap-web-component/tiptap-wc-adapter.tsx
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor"
import {
    TOOLBAR_PRESETS,
    TOOLBAR_ITEM_IDS,
    type ToolbarConfig,
    type ToolbarItemId,
} from "@/components/tiptap-templates/simple/simple-editor-toolbar"
import { ShadowPortalContext } from "@/components/tiptap-web-component/shadow-portal-context"

interface TiptapWCProps {
    content?: string
    toolbar?: string
    toolbarItems?: string
}

const TOOLBAR_ITEM_ID_SET = new Set<string>(TOOLBAR_ITEM_IDS)

function getCustomElementHost(container: HTMLElement | null): HTMLElement | null {
    const root = container?.getRootNode()
    if (root instanceof ShadowRoot) {
        return root.host instanceof HTMLElement ? root.host : null
    }
    return null
}

function parseToolbarItems(raw: string | null): ToolbarConfig {
    const groups =
        raw
            ?.split("|")
            .map((group) =>
                group
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean)
                    .filter((item): item is ToolbarItemId => {
                        const isKnown = TOOLBAR_ITEM_ID_SET.has(item)
                        if (!isKnown) {
                            console.warn(`Unknown tiptap toolbar item ignored: ${item}`)
                        }
                        return isKnown
                    })
            )
            .filter((group) => group.length > 0) ?? []

    return { groups }
}

function resolveToolbar(host: HTMLElement): ToolbarConfig {
    const toolbarItems = host.getAttribute("toolbar-items")
    if (toolbarItems !== null) {
        return parseToolbarItems(toolbarItems)
    }

    const preset = host.getAttribute("toolbar") ?? "full"
    if (preset in TOOLBAR_PRESETS) {
        return TOOLBAR_PRESETS[preset]
    }

    console.warn(`Unknown tiptap toolbar preset ignored: ${preset}`)
    return TOOLBAR_PRESETS.full
}

export function TiptapWCAdapter({ content }: TiptapWCProps) {
    const hostRef = useRef<HTMLDivElement>(null)
    const [cssText, setCssText] = useState<string>("")
    const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null)
    const [isReadOnly, setIsReadOnly] = useState(false)
    const [toolbarConfig, setToolbarConfig] = useState<ToolbarConfig>(TOOLBAR_PRESETS.full)

    // r2wc does not re-render when a string attribute is removed (value becomes null).
    // Watch the host element directly so add/removeAttribute calls work.
    useLayoutEffect(() => {
        const host = getCustomElementHost(hostRef.current)
        if (!host) return

        const syncHostAttributes = () => {
            setIsReadOnly(host.hasAttribute("readonly"))
            setToolbarConfig(resolveToolbar(host))
        }
        syncHostAttributes()

        const observer = new MutationObserver(syncHostAttributes)
        observer.observe(host, {
            attributes: true,
            attributeFilter: ["readonly", "toolbar", "toolbar-items"],
        })
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
                <SimpleEditor
                    content={content}
                    onContentChange={handleContentChange}
                    isReadOnly={isReadOnly}
                    toolbar={toolbarConfig}
                />
            </ShadowPortalContext.Provider>
        </div>
    )
}

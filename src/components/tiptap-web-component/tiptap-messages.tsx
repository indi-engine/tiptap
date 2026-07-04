import { createContext, useContext } from "react"

export const TIPTAP_L10N_CHANGE_EVENT = "tiptap-l10n-change"

export const DEFAULT_TIPTAP_L10N = {
  editor: {
    ariaLabel: "Main content area, start typing to enter text.",
  },
  history: {
    undo: "Undo",
    redo: "Redo",
  },
  marks: {
    bold: "Bold",
    italic: "Italic",
    underline: "Underline",
    strike: "Strike",
    code: "Code",
    subscript: "Subscript",
    superscript: "Superscript",
  },
  blocks: {
    heading: "Heading",
    headingLevel: "Heading {level}",
    headingOptions: "Format text as heading",
    list: "List",
    listOptions: "List options",
    bulletList: "Bullet List",
    orderedList: "Ordered List",
    taskList: "Task List",
    blockquote: "Blockquote",
    codeBlock: "Code Block",
  },
  style: {
    label: "Style",
    options: "Style options",
  },
  alignment: {
    label: "Text align",
    options: "Text alignment options",
    left: "Align left",
    center: "Align center",
    right: "Align right",
    justify: "Align justify",
  },
  link: {
    label: "Link",
    inputPlaceholder: "Paste a link...",
    apply: "Apply link",
    open: "Open in new window",
    remove: "Remove link",
  },
  image: {
    add: "Add image",
    clickToUpload: "Click to upload",
    dragAndDrop: "or drag and drop",
    maximumFiles: "Maximum {limit} {files}, {size}MB each.",
    fileSingular: "file",
    filePlural: "files",
    uploadingFiles: "Uploading {count} {files}",
    clearAll: "Clear All",
    noFileSelected: "No file selected",
    noFilesToUpload: "No files to upload",
    fileSizeExceeded: "File size exceeds maximum allowed ({size}MB)",
    uploadFunctionMissing: "Upload function is not defined",
    uploadNoUrl: "Upload failed: No URL returned",
    uploadFailed: "Upload failed",
    maximumFilesAllowed: "Maximum {limit} {files} allowed",
  },
  colors: {
    textColor: "Text color",
    removeTextColor: "Remove text color",
    highlight: "Highlight",
    toggleHighlight: "Toggle highlight",
    removeHighlight: "Remove highlight",
    greenText: "Green text",
    redText: "Red text",
    orangeText: "Orange text",
    blueText: "Blue text",
    cyanText: "Cyan text",
    skyText: "Sky text",
    purpleText: "Purple text",
    greenBackground: "Green background",
    redBackground: "Red background",
    orangeBackground: "Orange background",
    blueBackground: "Blue background",
    cyanBackground: "Cyan background",
    skyBackground: "Sky background",
    purpleBackground: "Purple background",
  },
  theme: {
    switchToLight: "Switch to light mode",
    switchToDark: "Switch to dark mode",
  },
} as const

export type TiptapMessages = typeof DEFAULT_TIPTAP_L10N
export type TiptapMessagesOverride = DeepPartial<TiptapMessages>

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K]
}

type MessageRegistry = Record<string, TiptapMessagesOverride>
type ObservableMessageRegistry = MessageRegistry & {
  __tiptapL10nObservable?: true
}

declare global {
  interface Window {
    TiptapEditor?: {
      l10n?: MessageRegistry
    } & Record<string, unknown>
  }
}

export const TiptapMessagesContext =
  createContext<TiptapMessages>(DEFAULT_TIPTAP_L10N)

export function useTiptapMessages() {
  return useContext(TiptapMessagesContext)
}

export function formatMessage(
  template: string,
  values: Record<string, string | number>
) {
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    Object.prototype.hasOwnProperty.call(values, key)
      ? String(values[key])
      : match
  )
}

export function resolveTiptapMessages(locale: string) {
  const normalizedLocale = normalizeLocale(locale)
  const language = normalizedLocale.split("-")[0]
  const registry = getMessageRegistry()

  return mergeMessages(
    DEFAULT_TIPTAP_L10N,
    registry.en,
    registry[language],
    registry[normalizedLocale]
  )
}

export function installTiptapMessageRegistry() {
  if (typeof window === "undefined") return

  window.TiptapEditor = window.TiptapEditor ?? {}
  window.TiptapEditor.l10n = createObservableMessageRegistry(
    window.TiptapEditor.l10n ?? {}
  )
}

function getMessageRegistry() {
  if (typeof window === "undefined") return {}
  return window.TiptapEditor?.l10n ?? {}
}

function normalizeLocale(locale: string) {
  return (locale || "en").trim().toLowerCase() || "en"
}

function createObservableMessageRegistry(registry: MessageRegistry) {
  const observableRegistry = registry as ObservableMessageRegistry
  if (observableRegistry.__tiptapL10nObservable) return observableRegistry

  const proxy = new Proxy(observableRegistry, {
    set(target, property, value) {
      target[property as string] = value
      notifyMessageRegistryChange(String(property))
      return true
    },
    deleteProperty(target, property) {
      delete target[property as string]
      notifyMessageRegistryChange(String(property))
      return true
    },
  }) as ObservableMessageRegistry

  Object.defineProperty(proxy, "__tiptapL10nObservable", {
    value: true,
    enumerable: false,
  })

  return proxy
}

function notifyMessageRegistryChange(locale: string) {
  if (typeof window === "undefined") return

  window.dispatchEvent(
    new CustomEvent(TIPTAP_L10N_CHANGE_EVENT, {
      detail: { locale: normalizeLocale(locale) },
    })
  )
}

function mergeMessages<T extends Record<string, unknown>>(
  base: T,
  ...overrides: Array<DeepPartial<T> | undefined>
): T {
  const merged: Record<string, unknown> = { ...base }

  for (const override of overrides) {
    if (!override) continue

    for (const [key, value] of Object.entries(override)) {
      if (isPlainObject(value) && isPlainObject(merged[key])) {
        merged[key] = mergeMessages(merged[key], value)
      } else if (value !== undefined) {
        merged[key] = value
      }
    }
  }

  return merged as T
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value)
}

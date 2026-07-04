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

declare global {
  interface Window {
    TIPTAP_L10N?: MessageRegistry
    TiptapEditor?: {
      registerL10n?: (
        locale: string,
        messages: TiptapMessagesOverride
      ) => void
      registerMessages?: (
        locale: string,
        messages: TiptapMessagesOverride
      ) => void
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

  window.TIPTAP_L10N = window.TIPTAP_L10N ?? {}
  window.TiptapEditor = window.TiptapEditor ?? {}

  const previousRegisterL10n = window.TiptapEditor.registerL10n
  const previousRegisterMessages = window.TiptapEditor.registerMessages

  window.TiptapEditor.registerL10n = (locale, messages) => {
    const normalizedLocale = normalizeLocale(locale)
    const currentMessages = window.TIPTAP_L10N?.[normalizedLocale]

    window.TIPTAP_L10N = {
      ...(window.TIPTAP_L10N ?? {}),
      [normalizedLocale]: mergeMessages(currentMessages ?? {}, messages),
    }

    previousRegisterL10n?.(normalizedLocale, messages)
    previousRegisterMessages?.(normalizedLocale, messages)

    window.dispatchEvent(
      new CustomEvent(TIPTAP_L10N_CHANGE_EVENT, {
        detail: { locale: normalizedLocale },
      })
    )
  }

  window.TiptapEditor.registerMessages = window.TiptapEditor.registerL10n
}

function getMessageRegistry() {
  if (typeof window === "undefined") return {}
  return window.TIPTAP_L10N ?? {}
}

function normalizeLocale(locale: string) {
  return (locale || "en").trim().toLowerCase() || "en"
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

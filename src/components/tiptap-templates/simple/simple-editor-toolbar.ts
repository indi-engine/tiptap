export const TOOLBAR_ITEM_IDS = [
  "undo",
  "redo",
  "heading",
  "list",
  "blockquote",
  "code-block",
  "bold",
  "italic",
  "strike",
  "code",
  "underline",
  "highlight",
  "link",
  "superscript",
  "subscript",
  "align-left",
  "align-center",
  "align-right",
  "align-justify",
  "image",
  "theme",
] as const

export type ToolbarItemId = (typeof TOOLBAR_ITEM_IDS)[number]

export type ToolbarConfig = {
  groups: ToolbarItemId[][]
}

export const TOOLBAR_PRESETS: Record<string, ToolbarConfig> = {
  full: {
    groups: [
      ["undo", "redo"],
      ["heading", "list", "blockquote", "code-block"],
      ["bold", "italic", "strike", "code", "underline", "highlight", "link"],
      ["superscript", "subscript"],
      ["align-left", "align-center", "align-right", "align-justify"],
      ["image"],
      ["theme"],
    ],
  },
  minimal: {
    groups: [
      ["undo", "redo"],
      ["bold", "italic", "link"],
    ],
  },
  none: {
    groups: [],
  },
}

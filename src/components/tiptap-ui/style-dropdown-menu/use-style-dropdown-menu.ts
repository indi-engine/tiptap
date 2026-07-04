"use client"

import { useEffect, useMemo, useState } from "react"
import type { Editor } from "@tiptap/react"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"
import {
  type TiptapMessages,
  useTiptapMessages,
} from "@/components/tiptap-web-component/tiptap-messages"

// --- Tiptap UI ---
import {
  canToggleMark,
  isMarkActive,
  markIcons,
  type Mark,
} from "@/components/tiptap-ui/mark-button"

// --- Icons ---
import { BoldIcon } from "@/components/tiptap-icons/bold-icon"

export type StyleMark = Extract<
  Mark,
  "bold" | "italic" | "underline" | "code" |"strike" | "subscript" | "superscript"
>

export interface UseStyleDropdownMenuConfig {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null
  /**
   * The mark types to display in the dropdown.
   * @default ["bold", "italic", "underline", "code", "strike", "subscript", "superscript"]
   */
  types?: StyleMark[]
  /**
   * Whether the dropdown should be hidden when no style marks are available.
   * @default false
   */
  hideWhenUnavailable?: boolean
}

export interface StyleOption {
  label: string
  type: StyleMark
  icon: React.ElementType
}

export function getStyleOptions(messages: TiptapMessages): StyleOption[] {
  return [
    {
      label: messages.marks.bold,
      type: "bold",
      icon: markIcons.bold,
    },
    {
      label: messages.marks.italic,
      type: "italic",
      icon: markIcons.italic,
    },
    {
      label: messages.marks.underline,
      type: "underline",
      icon: markIcons.underline,
    },
    {
      label: messages.marks.code,
      type: "code",
      icon: markIcons.code,
    },
    {
      label: messages.marks.strike,
      type: "strike",
      icon: markIcons.strike,
    },
    {
      label: messages.marks.subscript,
      type: "subscript",
      icon: markIcons.subscript,
    },
    {
      label: messages.marks.superscript,
      type: "superscript",
      icon: markIcons.superscript,
    },
  ]
}

export function canToggleAnyStyleMark(
  editor: Editor | null,
  markTypes: StyleMark[]
): boolean {
  if (!editor || !editor.isEditable) return false
  return markTypes.some((type) => canToggleMark(editor, type))
}

export function isAnyStyleMarkActive(
  editor: Editor | null,
  markTypes: StyleMark[]
): boolean {
  if (!editor || !editor.isEditable) return false
  return markTypes.some((type) => isMarkActive(editor, type))
}

export function getActiveStyleMark(
  editor: Editor | null,
  markTypes: StyleMark[]
): StyleMark | undefined {
  if (!editor || !editor.isEditable) return undefined
  return markTypes.find((type) => isMarkActive(editor, type))
}

export function shouldShowStyleDropdown(params: {
  editor: Editor | null
  hideWhenUnavailable: boolean
  canToggleAny: boolean
}): boolean {
  const { editor, hideWhenUnavailable, canToggleAny } = params

  if (!editor) return false

  if (!hideWhenUnavailable) {
    return true
  }

  if (!editor.isActive("code")) {
    return canToggleAny
  }

  return true
}

export function useStyleDropdownMenu(config?: UseStyleDropdownMenuConfig) {
  const {
    editor: providedEditor,
    types = ["bold", "italic", "underline", "strike", "subscript", "superscript"],
    hideWhenUnavailable = false,
  } = config || {}

  const { editor } = useTiptapEditor(providedEditor)
  const messages = useTiptapMessages()
  const [isVisible, setIsVisible] = useState(true)

  const filteredStyles = useMemo(
    () => getStyleOptions(messages).filter((option) => types.includes(option.type)),
    [messages, types]
  )

  const canToggleAny = canToggleAnyStyleMark(editor, types)
  const isAnyActive = isAnyStyleMarkActive(editor, types)
  const activeType = getActiveStyleMark(editor, types)
  const activeStyle = filteredStyles.find((option) => option.type === activeType)

  useEffect(() => {
    if (!editor) return

    const handleSelectionUpdate = () => {
      setIsVisible(
        shouldShowStyleDropdown({
          editor,
          hideWhenUnavailable,
          canToggleAny,
        })
      )
    }

    handleSelectionUpdate()

    editor.on("selectionUpdate", handleSelectionUpdate)

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate)
    }
  }, [canToggleAny, editor, hideWhenUnavailable])

  return {
    isVisible,
    activeType,
    isActive: isAnyActive,
    canToggle: canToggleAny,
    types,
    filteredStyles,
    label: messages.style.label,
    Icon: activeStyle ? markIcons[activeStyle.type] : BoldIcon,
  }
}

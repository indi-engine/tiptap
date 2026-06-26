"use client"

import { useEffect, useMemo, useState } from "react"
import type { Editor } from "@tiptap/react"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Tiptap UI ---
import {
  canSetTextAlign,
  isTextAlignActive,
  textAlignIcons,
  type TextAlign,
} from "@/components/tiptap-ui/text-align-button"

// --- Icons ---
import { AlignLeftIcon } from "@/components/tiptap-icons/align-left-icon"

export interface UseTextAlignDropdownMenuConfig {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null
  /**
   * The text alignment types to display in the dropdown.
   * @default ["left", "center", "right", "justify"]
   */
  types?: TextAlign[]
  /**
   * Whether the dropdown should be hidden when no alignments are available.
   * @default false
   */
  hideWhenUnavailable?: boolean
}

export interface TextAlignOption {
  label: string
  type: TextAlign
  icon: React.ElementType
}

export const textAlignOptions: TextAlignOption[] = [
  {
    label: "Align left",
    type: "left",
    icon: textAlignIcons.left,
  },
  {
    label: "Align center",
    type: "center",
    icon: textAlignIcons.center,
  },
  {
    label: "Align right",
    type: "right",
    icon: textAlignIcons.right,
  },
  {
    label: "Align justify",
    type: "justify",
    icon: textAlignIcons.justify,
  },
]

export function canSetAnyTextAlign(
  editor: Editor | null,
  alignTypes: TextAlign[]
): boolean {
  if (!editor || !editor.isEditable) return false
  return alignTypes.some((type) => canSetTextAlign(editor, type))
}

export function isAnyTextAlignActive(
  editor: Editor | null,
  alignTypes: TextAlign[]
): boolean {
  if (!editor || !editor.isEditable) return false
  return alignTypes.some((type) => isTextAlignActive(editor, type))
}

export function getActiveTextAlign(
  editor: Editor | null,
  alignTypes: TextAlign[]
): TextAlign | undefined {
  if (!editor || !editor.isEditable) return undefined
  return alignTypes.find((type) => isTextAlignActive(editor, type))
}

export function shouldShowTextAlignDropdown(params: {
  editor: Editor | null
  hideWhenUnavailable: boolean
  canSetAny: boolean
}): boolean {
  const { editor, hideWhenUnavailable, canSetAny } = params

  if (!editor) return false

  if (!hideWhenUnavailable) {
    return true
  }

  if (!editor.isActive("code")) {
    return canSetAny
  }

  return true
}

export function useTextAlignDropdownMenu(
  config?: UseTextAlignDropdownMenuConfig
) {
  const {
    editor: providedEditor,
    types = ["left", "center", "right", "justify"],
    hideWhenUnavailable = false,
  } = config || {}

  const { editor } = useTiptapEditor(providedEditor)
  const [isVisible, setIsVisible] = useState(true)

  const filteredAlignments = useMemo(
    () => textAlignOptions.filter((option) => types.includes(option.type)),
    [types]
  )

  const canSetAny = canSetAnyTextAlign(editor, types)
  const isAnyActive = isAnyTextAlignActive(editor, types)
  const activeType = getActiveTextAlign(editor, types)
  const activeAlignment = filteredAlignments.find(
    (option) => option.type === activeType
  )

  useEffect(() => {
    if (!editor) return

    const handleSelectionUpdate = () => {
      setIsVisible(
        shouldShowTextAlignDropdown({
          editor,
          hideWhenUnavailable,
          canSetAny,
        })
      )
    }

    handleSelectionUpdate()

    editor.on("selectionUpdate", handleSelectionUpdate)

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate)
    }
  }, [canSetAny, editor, hideWhenUnavailable])

  return {
    isVisible,
    activeType,
    isActive: isAnyActive,
    canToggle: canSetAny,
    types,
    filteredAlignments,
    label: "Text align",
    Icon: activeAlignment ? textAlignIcons[activeAlignment.type] : AlignLeftIcon,
  }
}

"use client"

import { useCallback, useEffect, useState } from "react"
import { type Editor } from "@tiptap/react"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Lib ---
import {
  isExtensionAvailable,
  isMarkInSchema,
  isNodeTypeSelected,
} from "@/lib/tiptap-utils"

// --- Icons ---
import { TextColorIcon } from "@/components/tiptap-icons/text-color-icon"

export const TEXT_COLORS = [
  {
    label: "Gray text",
    value: "var(--tt-color-text-gray)",
    colorValue: "hsl(45, 2%, 46%)",
    border: "var(--tt-color-text-gray-contrast)",
  },
  {
    label: "Brown text",
    value: "var(--tt-color-text-brown)",
    colorValue: "hsl(19, 31%, 47%)",
    border: "var(--tt-color-text-brown-contrast)",
  },
  {
    label: "Orange text",
    value: "var(--tt-color-text-orange)",
    colorValue: "hsl(30, 89%, 45%)",
    border: "var(--tt-color-text-orange-contrast)",
  },
  {
    label: "Yellow text",
    value: "var(--tt-color-text-yellow)",
    colorValue: "hsl(38, 62%, 49%)",
    border: "var(--tt-color-text-yellow-contrast)",
  },
  {
    label: "Green text",
    value: "var(--tt-color-text-green)",
    colorValue: "hsl(148, 32%, 39%)",
    border: "var(--tt-color-text-green-contrast)",
  },
  {
    label: "Blue text",
    value: "var(--tt-color-text-blue)",
    colorValue: "hsl(202, 54%, 43%)",
    border: "var(--tt-color-text-blue-contrast)",
  },
  {
    label: "Purple text",
    value: "var(--tt-color-text-purple)",
    colorValue: "hsl(274, 32%, 54%)",
    border: "var(--tt-color-text-purple-contrast)",
  },
  {
    label: "Pink text",
    value: "var(--tt-color-text-pink)",
    colorValue: "hsl(328, 49%, 53%)",
    border: "var(--tt-color-text-pink-contrast)",
  },
  {
    label: "Red text",
    value: "var(--tt-color-text-red)",
    colorValue: "hsl(2, 62%, 55%)",
    border: "var(--tt-color-text-red-contrast)",
  },
]

export type TextColor = (typeof TEXT_COLORS)[number]

export interface UseTextColorConfig {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null
  /**
   * The text color to apply.
   */
  textColor?: string
  /**
   * Optional label to display alongside the icon.
   */
  label?: string
  /**
   * Whether the button should hide when the text color extension is not available.
   * @default false
   */
  hideWhenUnavailable?: boolean
  /**
   * When true, uses the actual color value (colorValue) instead of CSS variable (value).
   * @default false
   */
  useColorValue?: boolean
  /**
   * Called when the text color is applied or removed.
   */
  onApplied?: ({ color, label }: { color: string; label: string }) => void
}

export function pickTextColorsByValue(values: string[]) {
  const colorMap = new Map(TEXT_COLORS.map((color) => [color.value, color]))
  return values
    .map((value) => colorMap.get(value))
    .filter((color): color is (typeof TEXT_COLORS)[number] => !!color)
}

export function getTextColorValue(
  color: string,
  useColorValue: boolean = false
): string {
  if (!useColorValue) return color

  const colorItem = TEXT_COLORS.find(
    (c) => c.value === color || c.colorValue === color
  )
  return colorItem?.colorValue || color
}

export function canSetTextColor(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false
  if (
    !isExtensionAvailable(editor, "color") ||
    !isMarkInSchema("textStyle", editor) ||
    isNodeTypeSelected(editor, ["image"])
  )
    return false

  return editor.can().setColor("test")
}

export function isTextColorActive(
  editor: Editor | null,
  textColor?: string
): boolean {
  if (!editor || !editor.isEditable) return false
  return textColor
    ? editor.isActive("textStyle", { color: textColor })
    : !!editor.getAttributes("textStyle").color
}

export function setTextColor(editor: Editor | null, textColor: string): boolean {
  if (!editor || !editor.isEditable || !canSetTextColor(editor)) return false
  return editor.chain().focus().setColor(textColor).run()
}

export function unsetTextColor(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable || !canSetTextColor(editor)) return false
  return editor.chain().focus().unsetColor().run()
}

export function shouldShowButton(props: {
  editor: Editor | null
  hideWhenUnavailable: boolean
}): boolean {
  const { editor, hideWhenUnavailable } = props

  if (!editor) return false

  if (!hideWhenUnavailable) {
    return true
  }

  if (!editor.isEditable) return false
  if (!isExtensionAvailable(editor, "color")) return false
  if (!isMarkInSchema("textStyle", editor)) return false

  if (!editor.isActive("code")) {
    return canSetTextColor(editor)
  }

  return true
}

export function useTextColor(config: UseTextColorConfig = {}) {
  const {
    editor: providedEditor,
    label,
    textColor,
    hideWhenUnavailable = false,
    useColorValue = false,
    onApplied,
  } = config

  const { editor } = useTiptapEditor(providedEditor)
  const [isVisible, setIsVisible] = useState<boolean>(true)
  const canSetTextColorState = canSetTextColor(editor)
  const actualColor = textColor
    ? getTextColorValue(textColor, useColorValue)
    : textColor
  const isActive = isTextColorActive(editor, actualColor)

  useEffect(() => {
    if (!editor) return

    const handleSelectionUpdate = () => {
      setIsVisible(shouldShowButton({ editor, hideWhenUnavailable }))
    }

    handleSelectionUpdate()

    editor.on("selectionUpdate", handleSelectionUpdate)

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate)
    }
  }, [editor, hideWhenUnavailable])

  const handleTextColor = useCallback(() => {
    if (!actualColor) return false

    const success = setTextColor(editor, actualColor)
    if (success) {
      onApplied?.({ color: actualColor, label: label || "Text color" })
    }
    return success
  }, [actualColor, editor, label, onApplied])

  const handleRemoveTextColor = useCallback(() => {
    const success = unsetTextColor(editor)
    if (success) {
      onApplied?.({ color: "", label: "Remove text color" })
    }
    return success
  }, [editor, onApplied])

  return {
    isVisible,
    isActive,
    handleTextColor,
    handleRemoveTextColor,
    canSetTextColor: canSetTextColorState,
    label: label || "Text color",
    Icon: TextColorIcon,
  }
}

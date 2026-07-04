"use client"

import { useCallback, useEffect, useState } from "react"
import { type Editor } from "@tiptap/react"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"
import {
  type TiptapMessages,
  useTiptapMessages,
} from "@/components/tiptap-web-component/tiptap-messages"

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
    label: "Green text",
    value: "var(--palette-color-1)",
    colorValue: "var(--palette-color-1)",
    border: "var(--palette-color-1-contrast)",
  },
  {
    label: "Red text",
    value: "var(--palette-color-2)",
    colorValue: "var(--palette-color-2)",
    border: "var(--palette-color-2-contrast)",
  },
  {
    label: "Orange text",
    value: "var(--palette-color-3)",
    colorValue: "var(--palette-color-3)",
    border: "var(--palette-color-3-contrast)",
  },
  {
    label: "Blue text",
    value: "var(--palette-color-4)",
    colorValue: "var(--palette-color-4)",
    border: "var(--palette-color-4-contrast)",
  },
  {
    label: "Cyan text",
    value: "var(--palette-color-5)",
    colorValue: "var(--palette-color-5)",
    border: "var(--palette-color-5-contrast)",
  },
  {
    label: "Sky text",
    value: "var(--palette-color-6)",
    colorValue: "var(--palette-color-6)",
    border: "var(--palette-color-6-contrast)",
  },
  {
    label: "Purple text",
    value: "var(--palette-color-7)",
    colorValue: "var(--palette-color-7)",
    border: "var(--palette-color-7-contrast)",
  },
]

export type TextColor = (typeof TEXT_COLORS)[number]

export function getTextColors(messages: TiptapMessages): TextColor[] {
  return [
    { ...TEXT_COLORS[0], label: messages.colors.greenText },
    { ...TEXT_COLORS[1], label: messages.colors.redText },
    { ...TEXT_COLORS[2], label: messages.colors.orangeText },
    { ...TEXT_COLORS[3], label: messages.colors.blueText },
    { ...TEXT_COLORS[4], label: messages.colors.cyanText },
    { ...TEXT_COLORS[5], label: messages.colors.skyText },
    { ...TEXT_COLORS[6], label: messages.colors.purpleText },
  ]
}

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

export function pickTextColorsByValue(
  values: string[],
  messages?: TiptapMessages
) {
  const colors = messages ? getTextColors(messages) : TEXT_COLORS
  const colorMap = new Map(colors.map((color) => [color.value, color]))
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
  const messages = useTiptapMessages()
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
      onApplied?.({ color: actualColor, label: label || messages.colors.textColor })
    }
    return success
  }, [actualColor, editor, label, messages.colors.textColor, onApplied])

  const handleRemoveTextColor = useCallback(() => {
    const success = unsetTextColor(editor)
    if (success) {
      onApplied?.({ color: "", label: messages.colors.removeTextColor })
    }
    return success
  }, [editor, messages.colors.removeTextColor, onApplied])

  return {
    isVisible,
    isActive,
    handleTextColor,
    handleRemoveTextColor,
    canSetTextColor: canSetTextColorState,
    label: label || messages.colors.textColor,
    Icon: TextColorIcon,
  }
}

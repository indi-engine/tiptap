import { forwardRef, useCallback, useState, type ForwardedRef } from "react"
import { type Editor } from "@tiptap/react"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"
import { useTiptapMessages } from "@/components/tiptap-web-component/tiptap-messages"

// --- Icons ---
import { ChevronDownIcon } from "@/components/tiptap-icons/chevron-down-icon"

// --- Tiptap UI ---
import {
  TextAlignButton,
  type TextAlign,
} from "@/components/tiptap-ui/text-align-button"
import { useTextAlignDropdownMenu } from "@/components/tiptap-ui/text-align-dropdown-menu/use-text-align-dropdown-menu"

// --- UI Primitives ---
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button"
import { Button } from "@/components/tiptap-ui-primitive/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
} from "@/components/tiptap-ui-primitive/dropdown-menu"

export interface TextAlignDropdownMenuProps
  extends Omit<ButtonProps, "type"> {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor
  /**
   * The text alignment types to display in the dropdown.
   */
  types?: TextAlign[]
  /**
   * Whether the dropdown should be hidden when no alignments are available.
   * @default false
   */
  hideWhenUnavailable?: boolean
  /**
   * Callback for when the dropdown opens or closes.
   */
  onOpenChange?: (isOpen: boolean) => void
  /**
   * Whether the dropdown should use a modal.
   */
  modal?: boolean
}

function TextAlignDropdownMenuImpl(
  {
    editor: providedEditor,
    types = ["left", "center", "right", "justify"],
    hideWhenUnavailable = false,
    onOpenChange,
    modal = true,
    ...props
  }: TextAlignDropdownMenuProps,
  ref: ForwardedRef<HTMLButtonElement>
) {
  const { editor } = useTiptapEditor(providedEditor)
  const messages = useTiptapMessages()
  const [isOpen, setIsOpen] = useState(false)

  const { filteredAlignments, canToggle, isActive, isVisible, Icon } =
    useTextAlignDropdownMenu({
      editor,
      types,
      hideWhenUnavailable,
    })

  const handleOnOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open)
      onOpenChange?.(open)
    },
    [onOpenChange]
  )

  if (!isVisible) {
    return null
  }

  return (
    <DropdownMenu modal={modal} open={isOpen} onOpenChange={handleOnOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          data-active-state={isActive ? "on" : "off"}
          role="button"
          tabIndex={-1}
          disabled={!canToggle}
          data-disabled={!canToggle}
          aria-label={messages.alignment.options}
          tooltip={messages.alignment.label}
          {...props}
          ref={ref}
        >
          <Icon className="tiptap-button-icon" />
          <ChevronDownIcon className="tiptap-button-dropdown-small" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start">
        <DropdownMenuGroup>
          {filteredAlignments.map((option) => (
            <DropdownMenuItem key={option.type} asChild>
              <TextAlignButton
                editor={editor}
                align={option.type}
                text={option.label}
                showTooltip={false}
              />
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const TextAlignDropdownMenu = forwardRef(TextAlignDropdownMenuImpl)

TextAlignDropdownMenu.displayName = "TextAlignDropdownMenu"

export default TextAlignDropdownMenu

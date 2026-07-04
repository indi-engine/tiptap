import { forwardRef, useCallback, useState, type ForwardedRef } from "react"
import { type Editor } from "@tiptap/react"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"
import { useTiptapMessages } from "@/components/tiptap-web-component/tiptap-messages"

// --- Icons ---
import { ChevronDownIcon } from "@/components/tiptap-icons/chevron-down-icon"

// --- Tiptap UI ---
import { MarkButton } from "@/components/tiptap-ui/mark-button"
import {
  useStyleDropdownMenu,
  type StyleMark,
} from "@/components/tiptap-ui/style-dropdown-menu/use-style-dropdown-menu"

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

export interface StyleDropdownMenuProps extends Omit<ButtonProps, "type"> {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor
  /**
   * The mark types to display in the dropdown.
   */
  types?: StyleMark[]
  /**
   * Whether the dropdown should be hidden when no style marks are available.
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

function StyleDropdownMenuImpl(
  {
    editor: providedEditor,
    types = ["bold", "italic", "underline", "code", "strike", "subscript", "superscript"],
    hideWhenUnavailable = false,
    onOpenChange,
    modal = true,
    ...props
  }: StyleDropdownMenuProps,
  ref: ForwardedRef<HTMLButtonElement>
) {
  const { editor } = useTiptapEditor(providedEditor)
  const messages = useTiptapMessages()
  const [isOpen, setIsOpen] = useState(false)

  const { filteredStyles, canToggle, isActive, isVisible, Icon } =
    useStyleDropdownMenu({
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
          aria-label={messages.style.options}
          tooltip={messages.style.label}
          {...props}
          ref={ref}
        >
          <Icon className="tiptap-button-icon" />
          <ChevronDownIcon className="tiptap-button-dropdown-small" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start">
        <DropdownMenuGroup>
          {filteredStyles.map((option) => (
            <DropdownMenuItem key={option.type} asChild>
              <MarkButton
                editor={editor}
                type={option.type}
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

export const StyleDropdownMenu = forwardRef(StyleDropdownMenuImpl)

StyleDropdownMenu.displayName = "StyleDropdownMenu"

export default StyleDropdownMenu

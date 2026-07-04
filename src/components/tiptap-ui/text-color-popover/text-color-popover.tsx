import { forwardRef, useMemo, useRef, useState } from "react"
import { type Editor } from "@tiptap/react"

// --- Hooks ---
import { useMenuNavigation } from "@/hooks/use-menu-navigation"
import { useIsBreakpoint } from "@/hooks/use-is-breakpoint"
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"
import { useTiptapMessages } from "@/components/tiptap-web-component/tiptap-messages"

// --- Icons ---
import { BanIcon } from "@/components/tiptap-icons/ban-icon"
import { TextColorIcon } from "@/components/tiptap-icons/text-color-icon"

// --- UI Primitives ---
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button"
import { Button } from "@/components/tiptap-ui-primitive/button"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/tiptap-ui-primitive/popover"
import { Separator } from "@/components/tiptap-ui-primitive/separator"
import {
  Card,
  CardBody,
  CardItemGroup,
} from "@/components/tiptap-ui-primitive/card"
import { ButtonGroup } from "@/components/tiptap-ui-primitive/button-group"

// --- Tiptap UI ---
import type {
  TextColor,
  UseTextColorConfig,
} from "@/components/tiptap-ui/text-color-button/use-text-color"
import {
  pickTextColorsByValue,
  useTextColor,
} from "@/components/tiptap-ui/text-color-button/use-text-color"
import { TextColorButton } from "@/components/tiptap-ui/text-color-button/text-color-button"

export interface TextColorPopoverContentProps {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null
  /**
   * Optional colors to use in the text color popover.
   */
  colors?: TextColor[]
  /**
   * When true, uses the actual color value (colorValue) instead of CSS variable (value).
   * @default false
   */
  useColorValue?: boolean
}

export interface TextColorPopoverProps
  extends Omit<ButtonProps, "type">,
    Pick<UseTextColorConfig, "editor" | "hideWhenUnavailable" | "onApplied"> {
  /**
   * Optional colors to use in the text color popover.
   */
  colors?: TextColor[]
  /**
   * When true, uses the actual color value (colorValue) instead of CSS variable (value).
   * @default false
   */
  useColorValue?: boolean
}

export const TextColorPopoverButton = forwardRef<
  HTMLButtonElement,
  ButtonProps
>(({ className, children, ...props }, ref) => (
  <TextColorPopoverButtonInner
    className={className}
    ref={ref}
    {...props}
  >
    {children}
  </TextColorPopoverButtonInner>
))

const TextColorPopoverButtonInner = forwardRef<
  HTMLButtonElement,
  ButtonProps
>(({ className, children, ...props }, ref) => {
  const messages = useTiptapMessages()

  return (
    <Button
      type="button"
      className={className}
      variant="ghost"
      data-appearance="default"
      role="button"
      tabIndex={-1}
      aria-label={messages.colors.textColor}
      tooltip={messages.colors.textColor}
      ref={ref}
      {...props}
    >
      {children ?? <TextColorIcon className="tiptap-button-icon" />}
    </Button>
  )
})

TextColorPopoverButton.displayName = "TextColorPopoverButton"

const DEFAULT_TEXT_COLOR_VALUES = [
  "var(--palette-color-1)",
  "var(--palette-color-2)",
  "var(--palette-color-3)",
  "var(--palette-color-4)",
  "var(--palette-color-5)",
  "var(--palette-color-6)",
  "var(--palette-color-7)",
]

export function TextColorPopoverContent({
  editor,
  colors,
  useColorValue = false,
}: TextColorPopoverContentProps) {
  const messages = useTiptapMessages()
  const resolvedColors = colors ?? pickTextColorsByValue(DEFAULT_TEXT_COLOR_VALUES, messages)
  const { handleRemoveTextColor } = useTextColor({ editor })
  const isMobile = useIsBreakpoint()
  const containerRef = useRef<HTMLDivElement>(null)

  const menuItems = useMemo(
    () => [...resolvedColors, { label: messages.colors.removeTextColor, value: "none" }],
    [messages.colors.removeTextColor, resolvedColors]
  )

  const { selectedIndex } = useMenuNavigation({
    containerRef,
    items: menuItems,
    orientation: "both",
    onSelect: (item) => {
      if (!containerRef.current) return false
      const highlightedElement = containerRef.current.querySelector(
        '[data-highlighted="true"]'
      ) as HTMLElement
      if (highlightedElement) highlightedElement.click()
      if (item.value === "none") handleRemoveTextColor()
      return true
    },
    autoSelectFirstItem: false,
  })

  return (
    <Card
      ref={containerRef}
      tabIndex={0}
      style={isMobile ? { boxShadow: "none", border: 0 } : {}}
    >
      <CardBody style={isMobile ? { padding: 0 } : {}}>
        <CardItemGroup orientation="horizontal">
          <ButtonGroup>
            {resolvedColors.map((color, index) => (
              <ButtonGroup key={color.value}>
                <TextColorButton
                  editor={editor}
                  textColor={useColorValue ? color.colorValue : color.value}
                  tooltip={color.label}
                  aria-label={`${color.label} color`}
                  tabIndex={index === selectedIndex ? 0 : -1}
                  data-highlighted={selectedIndex === index}
                  useColorValue={useColorValue}
                />
              </ButtonGroup>
            ))}
          </ButtonGroup>
          <Separator />
          <ButtonGroup>
            <Button
              onClick={handleRemoveTextColor}
              aria-label={messages.colors.removeTextColor}
              tooltip={messages.colors.removeTextColor}
              tabIndex={selectedIndex === resolvedColors.length ? 0 : -1}
              type="button"
              role="menuitem"
              variant="ghost"
              data-highlighted={selectedIndex === resolvedColors.length}
            >
              <BanIcon className="tiptap-button-icon" />
            </Button>
          </ButtonGroup>
        </CardItemGroup>
      </CardBody>
    </Card>
  )
}

export function TextColorPopover({
  editor: providedEditor,
  colors,
  hideWhenUnavailable = false,
  useColorValue = false,
  onApplied,
  ...props
}: TextColorPopoverProps) {
  const { editor } = useTiptapEditor(providedEditor)
  const messages = useTiptapMessages()
  const resolvedColors = colors ?? pickTextColorsByValue(DEFAULT_TEXT_COLOR_VALUES, messages)
  const [isOpen, setIsOpen] = useState(false)
  const { isVisible, canSetTextColor, isActive, label, Icon } = useTextColor({
    editor,
    hideWhenUnavailable,
    onApplied,
  })

  if (!isVisible) return null

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <TextColorPopoverButton
          disabled={!canSetTextColor}
          data-active-state={isActive ? "on" : "off"}
          data-disabled={!canSetTextColor}
          aria-pressed={isActive}
          aria-label={label}
          tooltip={label}
          {...props}
        >
          <Icon className="tiptap-button-icon" />
        </TextColorPopoverButton>
      </PopoverTrigger>
      <PopoverContent aria-label={messages.colors.textColor}>
        <TextColorPopoverContent
          editor={editor}
          colors={resolvedColors}
          useColorValue={useColorValue}
        />
      </PopoverContent>
    </Popover>
  )
}

export default TextColorPopover

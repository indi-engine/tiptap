"use client"

import {
  Fragment,
  type ReactNode,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from "react"
import { EditorContent, EditorContext, useEditor } from "@tiptap/react"

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit"
import { Image } from "@tiptap/extension-image"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { TextAlign } from "@tiptap/extension-text-align"
import { Typography } from "@tiptap/extension-typography"
import { Highlight } from "@tiptap/extension-highlight"
import { Color } from "@tiptap/extension-color"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { TextStyle } from "@tiptap/extension-text-style"
import { Selection } from "@tiptap/extensions"

// --- UI Primitives ---
import { Button } from "@/components/tiptap-ui-primitive/button"
import { Spacer } from "@/components/tiptap-ui-primitive/spacer"
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar"

// --- Tiptap Node ---
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension"
import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension"
import "@/components/tiptap-node/blockquote-node/blockquote-node.scss"
import "@/components/tiptap-node/code-block-node/code-block-node.scss"
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss"
import "@/components/tiptap-node/list-node/list-node.scss"
import "@/components/tiptap-node/image-node/image-node.scss"
import "@/components/tiptap-node/heading-node/heading-node.scss"
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss"

// --- Tiptap UI ---
import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu"
import { ImageUploadButton } from "@/components/tiptap-ui/image-upload-button"
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu"
import { BlockquoteButton } from "@/components/tiptap-ui/blockquote-button"
import { CodeBlockButton } from "@/components/tiptap-ui/code-block-button"
import {
  ColorHighlightPopover,
  ColorHighlightPopoverContent,
  ColorHighlightPopoverButton,
} from "@/components/tiptap-ui/color-highlight-popover"
import {
  LinkPopover,
  LinkContent,
  LinkButton,
} from "@/components/tiptap-ui/link-popover"
import { MarkButton } from "@/components/tiptap-ui/mark-button"
import { StyleDropdownMenu } from "@/components/tiptap-ui/style-dropdown-menu/style-dropdown-menu"
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button"
import { TextAlignDropdownMenu } from "@/components/tiptap-ui/text-align-dropdown-menu/text-align-dropdown-menu"
import {
  TextColorPopover,
  TextColorPopoverButton,
  TextColorPopoverContent,
} from "@/components/tiptap-ui/text-color-popover/text-color-popover"
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button"

// --- Icons ---
import { ArrowLeftIcon } from "@/components/tiptap-icons/arrow-left-icon"
import { HighlighterIcon } from "@/components/tiptap-icons/highlighter-icon"
import { LinkIcon } from "@/components/tiptap-icons/link-icon"
import { TextColorIcon } from "@/components/tiptap-icons/text-color-icon"

// --- Hooks ---
import { useIsBreakpoint } from "@/hooks/use-is-breakpoint"
import { useWindowSize } from "@/hooks/use-window-size"
import { useCursorVisibility } from "@/hooks/use-cursor-visibility"
import { useRefRect } from "@/hooks/use-element-rect"
import {
  TOOLBAR_PRESETS,
  type ToolbarConfig,
  type ToolbarItemId,
} from "@/components/tiptap-templates/simple/simple-editor-toolbar"

// --- Components ---
import { ThemeToggle } from "@/components/tiptap-templates/simple/theme-toggle.tsx"

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from "@/lib/tiptap-utils"

// --- Styles ---
import "@/components/tiptap-templates/simple/simple-editor.scss"
import "@/styles/_keyframe-animations.scss"
import "@/styles/_variables.scss"

//import content from "@/components/tiptap-templates/simple/data/content.json"

type ToolbarRenderContext = {
  onHighlighterClick: () => void
  onTextColorClick: () => void
  onLinkClick: () => void
  isMobile: boolean
}

function renderToolbarItem(
  item: ToolbarItemId,
  {
    onHighlighterClick,
    onTextColorClick,
    onLinkClick,
    isMobile,
  }: ToolbarRenderContext
): ReactNode {
  switch (item) {
    case "undo":
      return <UndoRedoButton action="undo" />
    case "redo":
      return <UndoRedoButton action="redo" />
    case "heading":
      return <HeadingDropdownMenu modal={false} levels={[1, 2, 3, 4]} />
    case "list":
      return (
        <ListDropdownMenu
          modal={false}
          types={["bulletList", "orderedList", "taskList"]}
        />
      )
    case "blockquote":
      return <BlockquoteButton />
    case "code-block":
      return <CodeBlockButton />
    case "style":
      return (
        <StyleDropdownMenu
          modal={false}
          types={[
            "bold",
            "italic",
            "underline",
            "code",
            "strike",
            "subscript",
            "superscript",
          ]}
        />
      )
    case "bold":
      return <MarkButton type="bold" />
    case "italic":
      return <MarkButton type="italic" />
    case "strike":
      return <MarkButton type="strike" />
    case "code":
      return <MarkButton type="code" />
    case "underline":
      return <MarkButton type="underline" />
    case "highlight":
      return isMobile ? (
        <ColorHighlightPopoverButton onClick={onHighlighterClick} />
      ) : (
        <ColorHighlightPopover />
      )
    case "text-color":
      return isMobile ? (
        <TextColorPopoverButton onClick={onTextColorClick} />
      ) : (
        <TextColorPopover />
      )
    case "link":
      return isMobile ? <LinkButton onClick={onLinkClick} /> : <LinkPopover />
    case "superscript":
      return <MarkButton type="superscript" />
    case "subscript":
      return <MarkButton type="subscript" />
    case "align":
      return (
        <TextAlignDropdownMenu
          modal={false}
          types={["left", "center", "right", "justify"]}
        />
      )
    case "align-left":
      return <TextAlignButton align="left" />
    case "align-center":
      return <TextAlignButton align="center" />
    case "align-right":
      return <TextAlignButton align="right" />
    case "align-justify":
      return <TextAlignButton align="justify" />
    case "image":
      return <ImageUploadButton />
    case "theme":
      return <ThemeToggle />
  }
}

const MainToolbarContent = ({
  onHighlighterClick,
  onTextColorClick,
  onLinkClick,
  isMobile,
  toolbar,
}: {
  onHighlighterClick: () => void
  onTextColorClick: () => void
  onLinkClick: () => void
  isMobile: boolean
  toolbar: ToolbarConfig
}) => {
  const renderContext = {
    onHighlighterClick,
    onTextColorClick,
    onLinkClick,
    isMobile,
  }
  const groups = toolbar.groups
    .map((group) =>
      group
        .filter((item) => item !== "theme")
        .map((item) => renderToolbarItem(item, renderContext))
        .filter((item) => item !== null)
    )
    .filter((group) => group.length > 0)
  const themeGroup = toolbar.groups.some((group) => group.includes("theme"))

  return (
    <>
      <Spacer />

      {groups.map((group, index) => (
        <Fragment key={index}>
          {index > 0 && <ToolbarSeparator />}
          <ToolbarGroup>
            {group.map((item, itemIndex) => (
              <Fragment key={itemIndex}>{item}</Fragment>
            ))}
          </ToolbarGroup>
        </Fragment>
      ))}

      <Spacer />

      {themeGroup && (
        <>
          {isMobile && <ToolbarSeparator />}

          <ToolbarGroup>
            <ThemeToggle />
          </ToolbarGroup>
        </>
      )}
    </>
  )
}

const MobileToolbarContent = ({
  type,
  onBack,
}: {
  type: "highlighter" | "text-color" | "link"
  onBack: () => void
}) => (
  <>
    <ToolbarGroup>
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === "highlighter" ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : type === "text-color" ? (
          <TextColorIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === "highlighter" ? (
      <ColorHighlightPopoverContent />
    ) : type === "text-color" ? (
      <TextColorPopoverContent />
    ) : (
      <LinkContent />
    )}
  </>
)

import type { Content } from "@tiptap/react"

export interface SimpleEditorProps {
  content?: Content
  onContentChange?: (html: string) => void
  isReadOnly?: boolean
  toolbar?: ToolbarConfig
}

export function SimpleEditor({
  content,
  onContentChange,
  isReadOnly = false,
  toolbar = TOOLBAR_PRESETS.full,
}: SimpleEditorProps) {
  const isMobile = useIsBreakpoint()
  const { height } = useWindowSize()
  const [mobileView, setMobileView] = useState<
    "main" | "highlighter" | "text-color" | "link"
  >("main")
  const toolbarRef = useRef<HTMLDivElement>(null)
  const hasToolbar = toolbar.groups.length > 0
  const toolbarRect = useRefRect(toolbarRef as RefObject<HTMLDivElement>, {
    enabled: hasToolbar,
    throttleMs: 100,
    useResizeObserver: true,
  })

  const editor = useEditor({
    immediatelyRender: false,
    editable: !isReadOnly,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area, start typing to enter text.",
        class: "simple-editor",
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),
      HorizontalRule,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
      Image,
      Typography,
      Superscript,
      Subscript,
      Selection,
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: handleImageUpload,
        onError: (error) => console.error("Upload failed:", error),
      }),
    ],
    content: content ?? "<p></p>",
    onUpdate: ({ editor }) => {
      onContentChange?.(editor.getHTML())
    },
  })

  const rect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRect.height,
  })

  useEffect(() => {
    if (editor && content !== undefined) {
      const current = editor.getHTML()
      // avoid feedback loop / cursor jump if content matches what's already there
      if (current !== content) {
        editor.commands.setContent(content, { emitUpdate: false })
      }
    }
  }, [content, editor])

  useEffect(() => {
    editor?.setEditable(!isReadOnly)
  }, [editor, isReadOnly])

  const activeMobileView = isMobile ? mobileView : "main"

  return (
    <div className="simple-editor-wrapper">
      <EditorContext.Provider value={{ editor }}>
        {hasToolbar && (
          <Toolbar
            ref={toolbarRef}
            style={{
              ...(isMobile
                ? {
                  bottom: `calc(100% - ${height - rect.y}px)`,
                }
                : {}),
            }}
          >
            {activeMobileView === "main" ? (
              <MainToolbarContent
                onHighlighterClick={() => setMobileView("highlighter")}
                onTextColorClick={() => setMobileView("text-color")}
                onLinkClick={() => setMobileView("link")}
                isMobile={isMobile}
                toolbar={toolbar}
              />
            ) : (
              <MobileToolbarContent
                type={
                  activeMobileView === "highlighter"
                    ? "highlighter"
                    : activeMobileView === "text-color"
                      ? "text-color"
                      : "link"
                }
                onBack={() => setMobileView("main")}
              />
            )}
          </Toolbar>
        )}

        <EditorContent
          editor={editor}
          role="presentation"
          className="simple-editor-content"
        />
      </EditorContext.Provider>
    </div>
  )
}

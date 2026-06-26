import { memo } from "react"

type SvgProps = React.ComponentPropsWithoutRef<"svg">

export const TextColorIcon = memo(({ className, ...props }: SvgProps) => {
  return (
    <svg
      width="24"
      height="24"
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.0786 3.37139C11.2296 2.85161 11.706 2.5 12.2472 2.5H12.7528C13.294 2.5 13.7704 2.85161 13.9214 3.37139L18.6714 19.7214C18.9023 20.5162 18.4453 21.3475 17.6505 21.5785C16.8556 21.8094 16.0243 21.3524 15.7934 20.5575L14.7904 17.1042H10.2096L9.20665 20.5575C8.9757 21.3524 8.14438 21.8094 7.34953 21.5785C6.55468 21.3475 6.0977 20.5162 6.32865 19.7214L11.0786 3.37139ZM11.0806 14.1042H13.9194L12.5 9.21846L11.0806 14.1042Z"
        fill="currentColor"
      />
    </svg>
  )
})

TextColorIcon.displayName = "TextColorIcon"

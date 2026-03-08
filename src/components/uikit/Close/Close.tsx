import React, { forwardRef } from 'react'

type CloseProps = {
  large?: boolean
  href?: string
} & React.HTMLAttributes<HTMLElement>

export const Close = forwardRef<HTMLElement, CloseProps>(
  ({ large, href, className: customClassName, ...props }, ref) => {
    const Tag: React.ElementType = href ? 'a' : 'button'
    const classNames = []
    if (large) classNames.push('uk-close-large')
    if (customClassName) classNames.push(customClassName)

    return (
      <Tag
        // @ts-expect-error -- Polymorphic component: ref type varies with dynamic tag
        ref={ref}
        className={classNames.length > 0 ? classNames.join(' ') : undefined}
        uk-close=""
        href={href}
        {...props}
      />
    )
  }
)
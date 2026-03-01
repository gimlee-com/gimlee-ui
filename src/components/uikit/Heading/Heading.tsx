import React, { forwardRef } from 'react'

export type HeadingSize =
  | 'small'
  | 'medium'
  | 'large'
  | 'xlarge'
  | '2xlarge'
  | '3xlarge'

export type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> & {
  size?: HeadingSize
  divider?: boolean
  bullet?: boolean
  line?: boolean
  /** Element tag to use (defaults to h1) */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | 'span'
}

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  (
    {
      children,
      className: customClassName,
      size,
      divider,
      bullet,
      line,
      as: Tag = 'h1',
      ...props
    },
    ref
  ) => {
    const classNames = []
    if (size) classNames.push(`uk-heading-${size}`)
    if (divider) classNames.push('uk-heading-divider')
    if (bullet) classNames.push('uk-heading-bullet')
    if (line) classNames.push('uk-heading-line')
    if (customClassName) classNames.push(customClassName)

    return (
      <Tag
        ref={ref as React.Ref<HTMLElement>}
        className={classNames.join(' ') || undefined}
        {...props}
      >
        {line ? <span>{children}</span> : children}
      </Tag>
    )
  }
)

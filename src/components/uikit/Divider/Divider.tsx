import React, { forwardRef } from 'react'

export type DividerProps = React.HTMLAttributes<HTMLElement> & {
  variant?: 'icon' | 'small' | 'vertical'
}

export const Divider = forwardRef<HTMLElement, DividerProps>(
  ({ className: customClassName, variant, ...props }, ref) => {
    const classNames = []
    if (variant) classNames.push(`uk-divider-${variant}`)
    if (customClassName) classNames.push(customClassName)

    return (
      <hr
        ref={ref as React.Ref<HTMLHRElement>}
        className={classNames.join(' ') || undefined}
        {...props}
      />
    )
  }
)

import React, { forwardRef } from 'react'
import { useUIKit } from '../../../hooks/useUIkit'
import { useMergeRefs } from '../../../hooks/useMergeRefs'

type GridProps = React.PropsWithChildren<{
  gap?: 'small' | 'medium' | 'large' | 'collapse' | 'adaptive'
  divider?: boolean
  match?: boolean
  masonry?: boolean | 'pack' | 'next'
  parallax?: number
}> &
  React.HTMLAttributes<HTMLDivElement>

export const Grid = forwardRef<HTMLDivElement, GridProps>(
  (
    {
      children,
      className: customClassName,
      gap,
      divider,
      match,
      masonry,
      parallax,
      ...props
    },
    ref
  ) => {
    // We pass the JavaScript-specific options to our hook.
    const { ref: uikitRef } = useUIKit<HTMLElement, HTMLElement>('grid', {
      masonry,
      parallax,
    })

    const classNames = ['uk-grid']
    if (gap) classNames.push(`uk-grid-${gap}`)
    if (divider) classNames.push('uk-grid-divider')
    if (match) classNames.push('uk-grid-match')

    if (customClassName) {
      classNames.push(customClassName)
    }

    // A helper function to merge the refs.
    const mergedRef = useMergeRefs(uikitRef, ref)

    return (
      <div
        ref={mergedRef}
        className={classNames.join(' ')}
        uk-grid=""
        {...props}
      >
        {children}
      </div>
    )
  }
)
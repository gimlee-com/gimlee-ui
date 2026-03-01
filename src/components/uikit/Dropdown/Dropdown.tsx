import React, { forwardRef, useMemo } from 'react'
import { useUIKit } from '../../../hooks/useUIkit'
import { useMergeRefs } from '../../../hooks/useMergeRefs'

export type DropdownProps = React.PropsWithChildren<{
  large?: boolean
  mode?: 'click' | 'hover'
  pos?:
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right'
    | 'left-top'
    | 'left-center'
    | 'left-bottom'
    | 'right-top'
    | 'right-center'
    | 'right-bottom'
  offset?: number
  flip?: boolean
  shift?: boolean
  toggle?: string | HTMLElement | null
  boundary?: string | HTMLElement | null
  container?: string | HTMLElement | boolean
}> &
  React.HTMLAttributes<HTMLDivElement>

export const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(
  (
    {
      children,
      large,
      className: customClassName,
      mode,
      pos,
      offset,
      flip,
      shift,
      toggle,
      boundary,
      container,
      ...props
    },
    ref
  ) => {
    const classNames = ['uk-dropdown']
    if (large) classNames.push('uk-dropdown-large')
    if (customClassName) classNames.push(customClassName)

    const dropdownOptions = useMemo(() => {
      const options: Record<string, unknown> = {
        mode,
        pos,
        offset,
        flip,
        shift,
        toggle,
        boundary,
        container,
      }

      // Use a Record type to allow string indexing safely
      const htmlProps = props as Record<string, unknown>
      for (const key in htmlProps) {
        if (key.startsWith('uk-')) {
          const optionKey = key.replace('uk-', '')
          options[optionKey] = htmlProps[key]
        }
      }

      return options
    }, [mode, pos, offset, flip, shift, toggle, boundary, container, props])

    const { ref: dropdownRef } = useUIKit<unknown, HTMLDivElement>(
      'dropdown',
      dropdownOptions
    )
    const mergedRef = useMergeRefs(dropdownRef, ref)

    const otherProps = { ...props }
    // Remove uk- props from otherProps as they are handled in dropdownOptions
    const filteredProps = Object.keys(otherProps).reduce((acc, key) => {
      if (!key.startsWith('uk-')) {
        acc[key] = otherProps[key as keyof typeof otherProps]
      }
      return acc
    }, {} as Record<string, unknown>)

    return (
      <div ref={mergedRef} className={classNames.join(' ')} {...filteredProps}>
        {children}
      </div>
    )
  }
)
import React, { forwardRef } from 'react'
import { useUIKit } from '../../../hooks/useUIkit'
import { useMergeRefs } from '../../../hooks/useMergeRefs'
import UIkit from 'uikit'

type NavProps = React.PropsWithChildren<{
  variant?: 'default' | 'primary' | 'secondary' | 'center' | 'dropdown'
  size?: 'medium' | 'large' | 'xlarge'
  accordion?: boolean | { multiple?: boolean }
}> &
  React.HTMLAttributes<HTMLUListElement>

export const Nav = forwardRef<HTMLUListElement, NavProps>(
  (
    {
      children,
      variant = 'default',
      size,
      accordion,
      className: customClassName,
      ...props
    },
    ref
  ) => {
    // Determine if we need to initialize the accordion via JavaScript
    const isAccordion = !!accordion
    const uikitOptions =
      typeof accordion === 'object' ? { multiple: accordion.multiple } : {}

    const { ref: uikitRef } = useUIKit<UIkit.UIkitNavElement, HTMLUListElement>(
      'nav',
      isAccordion ? uikitOptions : undefined
    )

    const classNames = ['uk-nav']
    if (variant === 'dropdown') {
      classNames.push('uk-dropdown-nav')
    } else if (variant && variant !== 'default') {
      classNames.push(`uk-nav-${variant}`)
    } else {
      classNames.push('uk-nav-default')
    }

    if (size) {
      classNames.push(`uk-nav-${size}`)
    }
    if (customClassName) {
      classNames.push(customClassName)
    }

    const mergedRef = useMergeRefs(uikitRef, ref)

    const navProps: React.HTMLAttributes<HTMLUListElement> & {
      [key: string]: unknown
    } = {
      className: classNames.join(' '),
      ...props,
    }
    if (isAccordion) {
      navProps['uk-nav'] = ''
    }

    return (
      <ul ref={mergedRef} {...navProps}>
        {children}
      </ul>
    )
  }
)

export const NavItem = forwardRef<
  HTMLLIElement,
  React.PropsWithChildren<{ active?: boolean; parent?: boolean; disabled?: boolean }> &
    React.LiHTMLAttributes<HTMLLIElement>
>(({ children, active, parent, disabled, className: customClassName, ...props }, ref) => {
  const classNames = []
  if (active) classNames.push('uk-active')
  if (parent) classNames.push('uk-parent')
  if (disabled) classNames.push('uk-disabled')
  if (customClassName) classNames.push(customClassName)

  return (
    <li
      ref={ref}
      className={classNames.length > 0 ? classNames.join(' ') : undefined}
      {...props}
    >
      {children}
    </li>
  )
})

export const NavHeader = forwardRef<
  HTMLLIElement,
  React.PropsWithChildren<React.LiHTMLAttributes<HTMLLIElement>>
>(({ children, ...props }, ref) => (
  <li ref={ref} className="uk-nav-header" {...props}>
    {children}
  </li>
))

export const NavDivider = forwardRef<
  HTMLLIElement,
  React.LiHTMLAttributes<HTMLLIElement>
>((props, ref) => <li ref={ref} className="uk-nav-divider" {...props} />)

export const SubNav: React.FC<
  React.PropsWithChildren<React.HTMLAttributes<HTMLUListElement>>
> = ({ children, ...props }) => (
  <ul className="uk-nav-sub" {...props}>
    {children}
  </ul>
)

export const NavSubtitle: React.FC<
  React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>
> = ({ children, className: customClassName, ...props }) => {
  const classNames = ['uk-nav-subtitle']
  if (customClassName) {
    classNames.push(customClassName)
  }
  return (
    <div className={classNames.join(' ')} {...props}>
      {children}
    </div>
  )
}
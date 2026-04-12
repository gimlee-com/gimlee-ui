import React, { forwardRef, useMemo } from 'react'
import { createPortal } from 'react-dom'

type UkBoolean = boolean | 'true' | 'false'

export type ModalProps = React.HTMLAttributes<HTMLDivElement> & {
  escClose?: boolean
  bgClose?: boolean
  stack?: boolean
  /** Where to render the modal. A CSS selector (e.g. '#root') renders via React Portal.
   *  `false` keeps the modal in-place. Defaults to '#root'. */
  container?: string | UkBoolean
  clsPage?: string
  clsPanel?: string
  selClose?: string
}

/**
 * Resolve the portal target element from the `container` prop.
 * Returns null when the modal should render in-place (container is false-ish).
 */
function resolvePortalTarget(container: ModalProps['container']): Element | null {
  if (container === false || container === 'false' || container === undefined) return null
  if (container === true || container === 'true') return document.body
  if (typeof container === 'string') {
    return document.querySelector(container)
  }
  return null
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      className: customClassName,
      children,
      escClose,
      bgClose,
      stack,
      container = '#root',
      clsPage,
      clsPanel,
      selClose,
      ...props
    },
    ref
  ) => {
    const classNames = ['uk-modal']
    if (customClassName) classNames.push(customClassName)

    // Always tell UIkit container: false so it never moves the DOM node.
    // Positioning is handled by React Portal instead.
    const ukModalOptions = useMemo(() => {
      const opts: string[] = []
      if (escClose !== undefined) opts.push(`esc-close: ${escClose}`)
      if (bgClose !== undefined) opts.push(`bg-close: ${bgClose}`)
      if (stack !== undefined) opts.push(`stack: ${stack}`)
      opts.push('container: false')
      if (clsPage) opts.push(`cls-page: ${clsPage}`)
      if (clsPanel) opts.push(`cls-panel: ${clsPanel}`)
      if (selClose) opts.push(`sel-close: ${selClose}`)
      return opts.join('; ')
    }, [escClose, bgClose, stack, clsPage, clsPanel, selClose])

    const modal = (
      <div
        ref={ref}
        className={classNames.join(' ')}
        uk-modal={ukModalOptions || ''}
        {...props}
      >
        {children}
      </div>
    )

    const portalTarget = resolvePortalTarget(container)
    if (portalTarget) {
      return createPortal(modal, portalTarget)
    }

    return modal
  }
)

export const ModalDialog = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className: customClassName, ...props }, ref) => {
  const classNames = ['uk-modal-dialog']
  if (customClassName) classNames.push(customClassName)
  return (
    <div ref={ref} className={classNames.join(' ')} {...props}>
      {children}
    </div>
  )
})

export const ModalHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className: customClassName, ...props }, ref) => {
  const classNames = ['uk-modal-header']
  if (customClassName) classNames.push(customClassName)
  return (
    <div ref={ref} className={classNames.join(' ')} {...props}>
      {children}
    </div>
  )
})

export const ModalBody = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className: customClassName, ...props }, ref) => {
  const classNames = ['uk-modal-body']
  if (customClassName) classNames.push(customClassName)
  return (
    <div ref={ref} className={classNames.join(' ')} {...props}>
      {children}
    </div>
  )
})

export const ModalFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className: customClassName, ...props }, ref) => {
  const classNames = ['uk-modal-footer']
  if (customClassName) classNames.push(customClassName)
  return (
    <div ref={ref} className={classNames.join(' ')} {...props}>
      {children}
    </div>
  )
})

export const ModalTitle = forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ children, className: customClassName, ...props }, ref) => {
  const classNames = ['uk-modal-title']
  if (customClassName) classNames.push(customClassName)
  return (
    <h2 ref={ref} className={classNames.join(' ')} {...props}>
      {children}
    </h2>
  )
})

export const ModalCloseDefault = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className: customClassName, ...props }, ref) => {
  const classNames = ['uk-modal-close-default']
  if (customClassName) classNames.push(customClassName)
  return (
    <button
      ref={ref}
      className={classNames.join(' ')}
      type="button"
      uk-close=""
      {...props}
    />
  )
})

export const ModalCloseOutside = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className: customClassName, ...props }, ref) => {
  const classNames = ['uk-modal-close-outside']
  if (customClassName) classNames.push(customClassName)
  return (
    <button
      ref={ref}
      className={classNames.join(' ')}
      type="button"
      uk-close=""
      {...props}
    />
  )
})

export const ModalCloseFull = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { large?: boolean }
>(({ className: customClassName, large, ...props }, ref) => {
  const classNames = ['uk-modal-close-full']
  if (large) classNames.push('uk-close-large')
  if (customClassName) classNames.push(customClassName)
  return (
    <button
      ref={ref}
      className={classNames.join(' ')}
      type="button"
      uk-close=""
      {...props}
    />
  )
})

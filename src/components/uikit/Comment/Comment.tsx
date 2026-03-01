import React, { forwardRef } from 'react'
import { Image } from '../Image/Image'

type CommentProps = React.HTMLAttributes<HTMLElement> & {
  primary?: boolean
}

export const Comment = forwardRef<HTMLElement, CommentProps>(
  ({ children, primary, className: customClassName, ...props }, ref) => {
    const classNames = ['uk-comment']
    if (primary) classNames.push('uk-comment-primary')
    if (customClassName) classNames.push(customClassName)

    return (
      <article ref={ref} className={classNames.join(' ')} role="comment" {...props}>
        {children}
      </article>
    )
  }
)

export const CommentHeader = forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ children, className: customClassName, ...props }, ref) => {
    const classNames = ['uk-comment-header']
    if (customClassName) classNames.push(customClassName)

    return (
      <header ref={ref} className={classNames.join(' ')} {...props}>
        {children}
      </header>
    )
  }
)

export const CommentBody = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, className: customClassName, ...props }, ref) => {
    const classNames = ['uk-comment-body']
    if (customClassName) classNames.push(customClassName)

    return (
      <div ref={ref} className={classNames.join(' ')} {...props}>
        {children}
      </div>
    )
  }
)

export const CommentTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ children, className: customClassName, ...props }, ref) => {
    const classNames = ['uk-comment-title', 'uk-margin-remove']
    if (customClassName) classNames.push(customClassName)

    return (
      <h4 ref={ref} className={classNames.join(' ')} {...props}>
        {children}
      </h4>
    )
  }
)

export const CommentMeta = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ children, className: customClassName, ...props }, ref) => {
    const classNames = ['uk-comment-meta', 'uk-margin-remove-top']
    if (customClassName) classNames.push(customClassName)

    return (
      <p ref={ref} className={classNames.join(' ')} {...props}>
        {children}
      </p>
    )
  }
)

export const CommentAvatar = forwardRef<HTMLImageElement, React.ImgHTMLAttributes<HTMLImageElement>>(
  ({ className: customClassName, ...props }, ref) => {
    const classNames = ['uk-comment-avatar']
    if (customClassName) classNames.push(customClassName)

    return (
      <Image ref={ref as React.Ref<HTMLElement>} className={classNames.join(' ')} alt="" {...props} />
    )
  }
)

export const CommentList = forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  ({ children, className: customClassName, ...props }, ref) => {
    const classNames = ['uk-comment-list']
    if (customClassName) classNames.push(customClassName)

    return (
      <ul ref={ref} className={classNames.join(' ')} {...props}>
        {children}
      </ul>
    )
  }
)

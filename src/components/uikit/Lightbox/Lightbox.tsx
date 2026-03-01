import React, { forwardRef } from 'react'
import { useUIKit } from '../../../hooks/useUIkit'
import { useMergeRefs } from '../../../hooks/useMergeRefs'

export type LightboxProps = React.HTMLAttributes<HTMLDivElement> & {
  animation?: 'slide' | 'fade' | 'scale'
  autoplay?: boolean
  autoplayInterval?: number
  pauseOnHover?: boolean
  videoAutoplay?: boolean | 'inline'
  counter?: boolean
  nav?: boolean | 'dotnav' | 'thumbnav'
  slidenav?: boolean
  index?: number | string
  delayControls?: number
  toggle?: string
  template?: string
  bgClose?: boolean
}

export const Lightbox = forwardRef<HTMLDivElement, LightboxProps>(
  (
    {
      children,
      animation,
      autoplay,
      autoplayInterval,
      pauseOnHover,
      videoAutoplay,
      counter,
      nav,
      slidenav,
      index,
      delayControls,
      toggle,
      template,
      bgClose,
      className: customClassName,
      ...props
    },
    ref
  ) => {
    const { ref: uikitRef } = useUIKit<unknown, HTMLDivElement>('lightbox', {
      animation,
      autoplay,
      autoplayInterval,
      pauseOnHover,
      videoAutoplay,
      counter,
      nav,
      slidenav,
      index,
      delayControls,
      toggle,
      template,
      bgClose,
    })

    const mergedRef = useMergeRefs(uikitRef, ref)

    const classNames = []
    if (customClassName) classNames.push(customClassName)

    return (
      <div
        ref={mergedRef}
        className={classNames.join(' ') || undefined}
        uk-lightbox=""
        {...props}
      >
        {children}
      </div>
    )
  }
)

export type LightboxItemProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  caption?: string
  alt?: string
  thumb?: string
  poster?: string
  type?: 'image' | 'video' | 'iframe'
  attrs?: string
}

export const LightboxItem = forwardRef<HTMLAnchorElement, LightboxItemProps>(
  ({ children, caption, alt, thumb, poster, type, attrs, ...props }, ref) => {
    return (
      <a
        ref={ref}
        data-caption={caption}
        data-alt={alt}
        data-thumb={thumb}
        data-poster={poster}
        data-type={type}
        data-attrs={attrs}
        {...props}
      >
        {children}
      </a>
    )
  }
)

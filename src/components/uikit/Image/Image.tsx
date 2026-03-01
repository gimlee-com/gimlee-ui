import React, { forwardRef } from 'react'
import { useUIKit } from '../../../hooks/useUIkit'
import { useMergeRefs } from '../../../hooks/useMergeRefs'

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  dataSrc?: string
  dataSrcset?: string
  sources?: string
  loading?: 'lazy' | 'eager'
  margin?: string
  target?: string | false
  as?: React.ElementType
}

export const Image = forwardRef<HTMLElement, ImageProps>(
  (
    {
      dataSrc,
      dataSrcset,
      sources,
      loading,
      margin,
      target,
      as: Component = 'img',
      className,
      src,
      srcSet,
      ...props
    },
    ref
  ) => {
    const { ref: uikitRef } = useUIKit<unknown, HTMLElement>('img', {
      dataSrc: dataSrc || src,
      sources,
      loading,
      margin,
      target,
    })

    const mergedRef = useMergeRefs(uikitRef, ref)

    // For non-img components (like div for background), we don't want to pass src/srcSet attributes
    const extraProps: Record<string, unknown> = {}
    if (Component === 'img') {
      extraProps.src = src
      extraProps.srcSet = srcSet
    }

    return (
      <Component
        ref={mergedRef}
        className={className}
        data-src={dataSrc || src}
        data-srcset={dataSrcset || srcSet}
        {...extraProps}
        {...props}
      />
    )
  }
)

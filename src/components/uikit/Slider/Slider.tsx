import React, { forwardRef } from 'react'
import { useUIKit } from '../../../hooks/useUIkit'
import { useMergeRefs } from '../../../hooks/useMergeRefs'

type SliderProps = React.HTMLAttributes<HTMLDivElement> & {
  autoplay?: boolean
  autoplayInterval?: number
  center?: boolean
  draggable?: boolean
  easing?: string
  finite?: boolean
  index?: number
  active?: 'all' | 'first'
  pauseOnHover?: boolean
  sets?: boolean
  velocity?: number
  parallax?: boolean
  parallaxStart?: string | number
  parallaxEnd?: string | number
}

export const Slider = forwardRef<HTMLDivElement, SliderProps>(
  (
    {
      children,
      autoplay,
      autoplayInterval,
      center,
      draggable,
      easing,
      finite,
      index,
      active,
      pauseOnHover,
      sets,
      velocity,
      parallax,
      parallaxStart,
      parallaxEnd,
      className: customClassName,
      ...props
    },
    ref
  ) => {
    const { ref: uikitRef } = useUIKit<unknown, HTMLDivElement>('slider', {
      autoplay,
      autoplayInterval,
      center,
      draggable,
      easing,
      finite,
      index,
      active,
      pauseOnHover,
      sets,
      velocity,
      parallax,
      parallaxStart,
      parallaxEnd,
    })

    const mergedRef = useMergeRefs(uikitRef, ref)

    const classNames = []
    if (customClassName) classNames.push(customClassName)

    return (
      <div
        ref={mergedRef}
        className={classNames.join(' ') || undefined}
        uk-slider=""
        {...props}
      >
        {children}
      </div>
    )
  }
)

export const SliderContainer = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { offset?: boolean }>(
  ({ children, offset, className: customClassName, ...props }, ref) => {
    const classNames = ['uk-slider-container']
    if (offset) classNames.push('uk-slider-container-offset')
    if (customClassName) classNames.push(customClassName)
    return <div ref={ref} className={classNames.join(' ')} {...props}>{children}</div>
  }
)

export const SliderItems = forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  ({ children, className: customClassName, ...props }, ref) => {
    const classNames = ['uk-slider-items']
    if (customClassName) classNames.push(customClassName)
    return <ul ref={ref} className={classNames.join(' ')} {...props}>{children}</ul>
  }
)

export const SliderItem = forwardRef<HTMLLIElement, React.LiHTMLAttributes<HTMLLIElement>>(
  ({ children, ...props }, ref) => <li ref={ref} {...props}>{children}</li>
)

export const SliderNav = forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  ({ className: customClassName, ...props }, ref) => {
    const classNames = ['uk-slider-nav']
    if (customClassName) classNames.push(customClassName)
    return <ul ref={ref} className={classNames.join(' ')} {...props} />
  }
)

import React, { forwardRef } from 'react'
import { motion } from 'motion/react'
import { useUIKit } from '../../hooks/useUIkit'
import { useMergeRefs } from '../../hooks/useMergeRefs'
import UIkit from 'uikit'

// eslint-disable-next-line react-refresh/only-export-components
export { motion, AnimatePresence } from 'motion/react'
// eslint-disable-next-line react-refresh/only-export-components
export * from './NumberInput'

/**
 * Strips React HTML drag/animation event props that conflict
 * with Framer Motion's own prop types on motion components.
 */
type MotionSafe<T> = Omit<T, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'>

export type FormLayout = 'stacked' | 'horizontal'

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  layout?: FormLayout
}

export const Form = forwardRef<HTMLFormElement, FormProps>(
  ({ children, className: customClassName, layout, ...props }, ref) => {
    const classNames = []
    if (layout === 'stacked') classNames.push('uk-form-stacked')
    if (layout === 'horizontal') classNames.push('uk-form-horizontal')
    if (customClassName) classNames.push(customClassName)

    const { onDrag: _onDrag, ...rest } = props

    return (
      <motion.form
        ref={ref}
        layout
        className={classNames.join(' ')}
        {...(rest as MotionSafe<typeof rest>)}
      >
        {children}
      </motion.form>
    )
  }
)

export type FieldsetProps = React.FieldsetHTMLAttributes<HTMLFieldSetElement>

export const Fieldset = forwardRef<HTMLFieldSetElement, FieldsetProps>(
  ({ children, className: customClassName, ...props }, ref) => {
    const classNames = ['uk-fieldset']
    if (customClassName) classNames.push(customClassName)

    const { onDrag: _onDrag, ...rest } = props

    return (
      <motion.fieldset
        ref={ref}
        layout
        className={classNames.join(' ')}
        {...(rest as MotionSafe<typeof rest>)}
      >
        {children}
      </motion.fieldset>
    )
  }
)

export type LegendProps = React.HTMLAttributes<HTMLLegendElement>

export const Legend = forwardRef<HTMLLegendElement, LegendProps>(
  ({ children, className: customClassName, ...props }, ref) => {
    const classNames = ['uk-legend']
    if (customClassName) classNames.push(customClassName)

    const { onDrag: _onDrag, ...rest } = props

    return (
      <motion.legend
        ref={ref}
        layout
        className={classNames.join(' ')}
        {...(rest as MotionSafe<typeof rest>)}
      >
        {children}
      </motion.legend>
    )
  }
)

export type FormStatus = 'success' | 'danger'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  status?: FormStatus
  variant?: 'blank'
  formWidth?: 'xsmall' | 'small' | 'medium' | 'large'
  layout?: boolean | "position" | "size" | "preserve-aspect"
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className: customClassName,
      status,
      variant,
      formWidth,
      type = 'text',
      layout = true,
      ...props
    },
    ref
  ) => {
    const classNames = []

    if (
      [
        'text',
        'password',
        'datetime-local',
        'date',
        'month',
        'time',
        'week',
        'number',
        'email',
        'url',
        'search',
        'tel',
        'color',
      ].includes(type || '')
    ) {
      classNames.push('uk-input')
    } else if (type === 'checkbox') {
      classNames.push('uk-checkbox')
    } else if (type === 'radio') {
      classNames.push('uk-radio')
    } else if (type === 'range') {
      classNames.push('uk-range')
    }

    if (status) classNames.push(`uk-form-${status}`)
    if (variant === 'blank') classNames.push('uk-form-blank')
    if (formWidth) classNames.push(`uk-form-width-${formWidth}`)
    if (customClassName) classNames.push(customClassName)

    const { onDrag: _onDrag, ...rest } = props

    return (
      <motion.input
        ref={ref}
        layout={layout}
        className={classNames.join(' ') || undefined}
        type={type}
        {...(rest as MotionSafe<typeof rest>)}
      />
    )
  }
)

export const Checkbox = forwardRef<HTMLInputElement, Omit<InputProps, 'type'>>(
  (props, ref) => <Input ref={ref} type="checkbox" {...props} />
)

export const Radio = forwardRef<HTMLInputElement, Omit<InputProps, 'type'>>(
  (props, ref) => <Input ref={ref} type="radio" {...props} />
)

export const Range = forwardRef<HTMLInputElement, Omit<InputProps, 'type'>>(
  (props, ref) => <Input ref={ref} type="range" {...props} />
)

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  status?: FormStatus
  variant?: 'blank'
  formWidth?: 'xsmall' | 'small' | 'medium' | 'large'
  layout?: boolean | "position" | "size" | "preserve-aspect"
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { children, className: customClassName, status, variant, formWidth, layout = true, ...props },
    ref
  ) => {
    const classNames = ['uk-select']
    if (status) classNames.push(`uk-form-${status}`)
    if (variant === 'blank') classNames.push('uk-form-blank')
    if (formWidth) classNames.push(`uk-form-width-${formWidth}`)
    if (customClassName) classNames.push(customClassName)

    const { onDrag: _onDrag, ...rest } = props

    return (
      <motion.select
        ref={ref}
        layout={layout}
        className={classNames.join(' ')}
        {...(rest as MotionSafe<typeof rest>)}
      >
        {children}
      </motion.select>
    )
  }
)

export interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  status?: FormStatus
  variant?: 'blank'
  formWidth?: 'xsmall' | 'small' | 'medium' | 'large'
  layout?: boolean | "position" | "size" | "preserve-aspect"
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className: customClassName, status, variant, formWidth, layout = true, ...props }, ref) => {
    const classNames = ['uk-textarea']
    if (status) classNames.push(`uk-form-${status}`)
    if (variant === 'blank') classNames.push('uk-form-blank')
    if (formWidth) classNames.push(`uk-form-width-${formWidth}`)
    if (customClassName) classNames.push(customClassName)

    const { onDrag: _onDrag, ...rest } = props

    return (
      <motion.textarea
        ref={ref}
        layout={layout}
        className={classNames.join(' ')}
        {...(rest as MotionSafe<typeof rest>)}
      />
    )
  }
)

export type FormLabelProps = React.LabelHTMLAttributes<HTMLLabelElement>

export const FormLabel = forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ children, className: customClassName, ...props }, ref) => {
    const classNames = ['uk-form-label']
    if (customClassName) classNames.push(customClassName)

    const { onDrag: _onDrag, ...rest } = props

    return (
      <motion.label
        ref={ref}
        layout
        className={classNames.join(' ')}
        {...(rest as MotionSafe<typeof rest>)}
      >
        {children}
      </motion.label>
    )
  }
)

export type FormControlsProps = React.HTMLAttributes<HTMLDivElement>

export const FormControls = forwardRef<HTMLDivElement, FormControlsProps>(
  ({ children, className: customClassName, ...props }, ref) => {
    const classNames = ['uk-form-controls']
    if (customClassName) classNames.push(customClassName)

    const { onDrag: _onDrag, ...rest } = props

    return (
      <motion.div
        ref={ref}
        layout
        className={classNames.join(' ')}
        {...(rest as MotionSafe<typeof rest>)}
      >
        {children}
      </motion.div>
    )
  }
)

export interface FormMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: 'error' | 'info'
}

/**
 * A component for displaying validation or informational messages below inputs.
 */
export const FormMessage = forwardRef<HTMLDivElement, FormMessageProps>(
  ({ children, className: customClassName, type = 'error', ...props }, ref) => {
    const classNames = ['uk-margin-remove-top']
    if (type === 'error') classNames.push('uk-text-danger')
    if (type === 'info') classNames.push('uk-text-primary')
    if (customClassName) classNames.push(customClassName)

    const { onDrag: _onDrag, ...rest } = props

    return (
      <motion.div
        ref={ref}
        layout
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ type: 'spring', stiffness: 600, damping: 30 }}
        className={classNames.join(' ')}
        style={{ overflow: 'hidden' }}
        {...(rest as MotionSafe<typeof rest>)}
      >
        <small>{children}</small>
      </motion.div>
    )
  }
)

export interface FormCustomProps extends React.HTMLAttributes<HTMLDivElement> {
  target?: string | boolean
}

export const FormCustom = forwardRef<HTMLDivElement, FormCustomProps>(
  ({ children, className: customClassName, target, ...props }, ref) => {
    const { ref: uikitRef } = useUIKit<UIkit.UIkitElementBase, HTMLDivElement>(
      'formCustom',
      { target }
    )
    const mergedRef = useMergeRefs(uikitRef, ref)

    const classNames = []
    if (customClassName) classNames.push(customClassName)

    return (
      <div
        ref={mergedRef}
        className={classNames.join(' ') || undefined}
        uk-form-custom={
          target === true
            ? 'target: true'
            : typeof target === 'string'
            ? `target: ${target}`
            : ''
        }
        {...props}
      >
        {children}
      </div>
    )
  }
)

export interface FormIconProps extends React.HTMLAttributes<HTMLElement> {
  flip?: boolean
  icon?: string
  tag?: React.ElementType
  [key: string]: unknown
}

export const FormIcon = forwardRef<HTMLElement, FormIconProps>(
  (
    { className: customClassName, flip, icon, tag: Tag = 'span', ...props },
    ref
  ) => {
    const classNames = ['uk-form-icon']
    if (flip) classNames.push('uk-form-icon-flip')
    if (customClassName) classNames.push(customClassName as string)

    /* eslint-disable react-hooks/refs -- Passing forwardRef to createElement is standard React usage */
    return React.createElement(
      Tag as React.ElementType,
      {
        ...props,
        ref,
        className: classNames.join(' '),
      } as Record<string, unknown>,
      icon ? <span uk-icon={`icon: ${icon}`}></span> : props.children as React.ReactNode
    )
    /* eslint-enable react-hooks/refs */
  }
)

export const FormInputContainer = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className: customClassName, ...props }, ref) => {
  const classNames = ['uk-inline']
  if (customClassName) classNames.push(customClassName)
  return (
    <div ref={ref} className={classNames.join(' ')} {...props}>
      {children}
    </div>
  )
})

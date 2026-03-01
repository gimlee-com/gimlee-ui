import React, { forwardRef } from 'react'
import { useUIKit } from '../../../hooks/useUIkit'
import { useMergeRefs } from '../../../hooks/useMergeRefs'
import UIkit from 'uikit'

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

    return (
      <form
        ref={ref}
        className={classNames.join(' ') || undefined}
        {...props}
      >
        {children}
      </form>
    )
  }
)

export type FieldsetProps = React.FieldsetHTMLAttributes<HTMLFieldSetElement>

export const Fieldset = forwardRef<HTMLFieldSetElement, FieldsetProps>(
  ({ children, className: customClassName, ...props }, ref) => {
    const classNames = ['uk-fieldset']
    if (customClassName) classNames.push(customClassName)

    return (
      <fieldset
        ref={ref}
        className={classNames.join(' ') || undefined}
        {...props}
      >
        {children}
      </fieldset>
    )
  }
)

export type LegendProps = React.HTMLAttributes<HTMLLegendElement>

export const Legend = forwardRef<HTMLLegendElement, LegendProps>(
  ({ children, className: customClassName, ...props }, ref) => {
    const classNames = ['uk-legend']
    if (customClassName) classNames.push(customClassName)

    return (
      <legend
        ref={ref}
        className={classNames.join(' ') || undefined}
        {...props}
      >
        {children}
      </legend>
    )
  }
)

export type FormStatus = 'success' | 'danger'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  status?: FormStatus
  variant?: 'blank'
  formWidth?: 'xsmall' | 'small' | 'medium' | 'large'
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className: customClassName,
      status,
      variant,
      formWidth,
      type = 'text',
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

    return (
      <input
        ref={ref}
        className={classNames.join(' ') || undefined}
        type={type}
        {...props}
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
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { children, className: customClassName, status, variant, formWidth, ...props },
    ref
  ) => {
    const classNames = ['uk-select']
    if (status) classNames.push(`uk-form-${status}`)
    if (variant === 'blank') classNames.push('uk-form-blank')
    if (formWidth) classNames.push(`uk-form-width-${formWidth}`)
    if (customClassName) classNames.push(customClassName)

    return (
      <select
        ref={ref}
        className={classNames.join(' ') || undefined}
        {...props}
      >
        {children}
      </select>
    )
  }
)

export interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  status?: FormStatus
  variant?: 'blank' | 'default'
  formWidth?: 'xsmall' | 'small' | 'medium' | 'large'
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className: customClassName, status, variant, formWidth, ...props }, ref) => {
    const classNames = ['uk-textarea']
    if (status) classNames.push(`uk-form-${status}`)
    if (variant === 'blank') classNames.push('uk-form-blank')
    if (formWidth) classNames.push(`uk-form-width-${formWidth}`)
    if (customClassName) classNames.push(customClassName)

    return (
      <textarea
        ref={ref}
        className={classNames.join(' ') || undefined}
        {...props}
      />
    )
  }
)

export type FormLabelProps = React.LabelHTMLAttributes<HTMLLabelElement>

export const FormLabel = forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ children, className: customClassName, ...props }, ref) => {
    const classNames = ['uk-form-label']
    if (customClassName) classNames.push(customClassName)

    return (
      <label
        ref={ref}
        className={classNames.join(' ') || undefined}
        {...props}
      >
        {children}
      </label>
    )
  }
)

export type FormControlsProps = React.HTMLAttributes<HTMLDivElement>

export const FormControls = forwardRef<HTMLDivElement, FormControlsProps>(
  ({ children, className: customClassName, ...props }, ref) => {
    const classNames = ['uk-form-controls']
    if (customClassName) classNames.push(customClassName)

    return (
      <div
        ref={ref}
        className={classNames.join(' ') || undefined}
        {...props}
      >
        {children}
      </div>
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
    if (customClassName) classNames.push(customClassName)

    /* eslint-disable react-hooks/refs -- Passing forwardRef to createElement is standard React usage */
    return React.createElement(
      Tag,
      {
        ...props,
        ref,
        className: classNames.join(' '),
      } as Record<string, unknown>,
      icon ? <span uk-icon={`icon: ${icon}`}></span> : props.children
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
    <div ref={ref} className={classNames.join(' ') || undefined} {...props}>
      {children}
    </div>
  )
})

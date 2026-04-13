import React, { forwardRef, useCallback, useRef } from 'react'
import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { spring } from '../../animations'
import { useMergeRefs } from '../../hooks/useMergeRefs'
import { Icon } from '../uikit/Icon/Icon'
import { Input, type InputProps } from './Form'
import styles from './NumberInput.module.scss'

export interface NumberInputProps extends Omit<InputProps, 'type'> {
  /** Callback triggered when the value changes, providing the numeric value. */
  onValueChange?: (value: number) => void
  min?: number
  max?: number
  step?: number
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ value, onValueChange, onChange, min, max, step = 1, className, formWidth, ...props }, ref) => {
    const { t } = useTranslation()
    const inputRef = useRef<HTMLInputElement>(null)
    const mergedRef = useMergeRefs(ref, inputRef)

    const handleStep = useCallback((delta: number) => {
      const currentValue = Number(inputRef.current?.value) || 0
      const newValue = currentValue + delta
      
      if (min !== undefined && newValue < min) return
      if (max !== undefined && newValue > max) return

      if (inputRef.current) {
        // Programmatically set the value and trigger change events for React/Form libraries
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set
        nativeInputValueSetter?.call(inputRef.current, newValue)
        inputRef.current.dispatchEvent(new Event('input', { bubbles: true }))
        inputRef.current.dispatchEvent(new Event('change', { bubbles: true }))
      }
      
      onValueChange?.(newValue)
    }, [min, max, onValueChange])

    const handleDecrement = useCallback((e: React.MouseEvent) => {
      e.preventDefault()
      handleStep(-step)
    }, [handleStep, step])

    const handleIncrement = useCallback((e: React.MouseEvent) => {
      e.preventDefault()
      handleStep(step)
    }, [handleStep, step])

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      // Call standard onChange (event-based)
      onChange?.(e)
      
      // Call onValueChange (number-based)
      const val = e.target.value
      const newValue = val === '' ? (min !== undefined ? min : 0) : parseInt(val)
      if (!isNaN(newValue)) {
        onValueChange?.(newValue)
      }
    }, [onChange, onValueChange, min])

    const containerClassNames = [
      styles.container,
      formWidth ? styles[`width-${formWidth}`] : '',
      props.status ? styles[`status-${props.status}`] : '',
      className
    ].filter(Boolean).join(' ')

    const numericValue = Number(value) || 0
    const isDecrementDisabled = props.disabled || (min !== undefined && numericValue <= min)
    const isIncrementDisabled = props.disabled || (max !== undefined && numericValue >= max)

    return (
      <div className={containerClassNames}>
        <motion.button
          type="button"
          className={styles.button}
          onClick={handleDecrement}
          disabled={isDecrementDisabled}
          whileTap={!isDecrementDisabled ? { scale: 0.9 } : undefined}
          transition={spring}
          tabIndex={-1}
          aria-label={t('common.decrement')}
        >
          <Icon icon="minus" ratio={0.8} />
        </motion.button>
        <Input
          {...props}
          ref={mergedRef}
          type="number"
          value={value}
          onChange={handleChange}
          className={styles.input}
          min={min}
          max={max}
          step={step}
        />
        <motion.button
          type="button"
          className={styles.button}
          onClick={handleIncrement}
          disabled={isIncrementDisabled}
          whileTap={!isIncrementDisabled ? { scale: 0.9 } : undefined}
          transition={spring}
          tabIndex={-1}
          aria-label={t('common.increment')}
        >
          <Icon icon="plus" ratio={0.8} />
        </motion.button>
      </div>
    )
  }
)

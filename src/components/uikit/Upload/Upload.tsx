import React, { forwardRef } from 'react'
import { useUIKit } from '../../../hooks/useUIkit'
import { useMergeRefs } from '../../../hooks/useMergeRefs'

type UploadProps = React.HTMLAttributes<HTMLDivElement> & {
  url?: string
  multiple?: boolean
  name?: string
  type?: string
  params?: object
  allow?: string
  mime?: string
  maxSize?: number
  concurrent?: number
  method?: string
  msgInvalidMime?: string
  msgInvalidName?: string
  clsDragover?: string
  abort?: (e: ProgressEvent) => void
  beforeAll?: (event: unknown, files: FileList) => void | boolean
  beforeSend?: (env: unknown) => void
  complete?: (xhr: XMLHttpRequest) => void
  completeAll?: (xhr: XMLHttpRequest) => void
  error?: (e: unknown) => void
  load?: (e: ProgressEvent) => void
  loadEnd?: (e: ProgressEvent) => void
  loadStart?: (e: ProgressEvent) => void
  progress?: (e: ProgressEvent) => void
  fail?: (message: string) => void
}

export const Upload = forwardRef<HTMLDivElement, UploadProps>(
  (
    {
      children,
      url,
      multiple,
      name,
      type,
      params,
      allow,
      mime,
      maxSize,
      concurrent,
      method,
      msgInvalidMime,
      msgInvalidName,
      clsDragover,
      abort,
      beforeAll,
      beforeSend,
      complete,
      completeAll,
      error,
      load,
      loadEnd,
      loadStart,
      progress,
      fail,
      className: customClassName,
      ...props
    },
    ref
  ) => {
    const { ref: uikitRef } = useUIKit<unknown, HTMLDivElement>('upload', {
      url,
      multiple,
      name,
      type,
      params,
      allow,
      mime,
      maxSize,
      concurrent,
      method,
      msgInvalidMime,
      msgInvalidName,
      clsDragover,
      abort,
      beforeAll,
      beforeSend,
      complete,
      completeAll,
      error,
      load,
      loadEnd,
      loadStart,
      progress,
      fail,
    })

    const classNames = []
    if (customClassName) classNames.push(customClassName)

    const mergedRef = useMergeRefs(uikitRef, ref)

    return (
      <div ref={mergedRef} className={classNames.join(' ') || undefined} {...props}>
        {children}
      </div>
    )
  }
)

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface FileDropzoneProps {
  files: File[]
  onChange: (files: File[]) => void
  accept?: Record<string, string[]>
  maxFiles?: number
  className?: string
}

const DEFAULT_ACCEPT = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
  'text/plain': ['.txt'],
  'text/markdown': ['.md'],
  'text/x-python': ['.py'],
  'text/javascript': ['.js', '.ts', '.tsx', '.jsx'],
}

export function FileDropzone({
  files,
  onChange,
  accept = DEFAULT_ACCEPT,
  maxFiles = 5,
  className,
}: FileDropzoneProps) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      onChange([...files, ...accepted].slice(0, maxFiles))
    },
    [files, onChange, maxFiles],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: maxFiles - files.length,
  })

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index))
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-white p-8 transition-colors',
          isDragActive && 'border-primary bg-accent/50',
        )}
      >
        <input {...getInputProps()} />
        <Upload className="mb-2 h-8 w-8 text-muted" />
        <p className="text-sm font-medium">Drop files here or click to browse</p>
        <p className="mt-1 text-xs text-muted">
          PDF, DOCX, TXT, MD, code — text is read in your browser (no cloud storage)
        </p>
      </div>

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file, i) => (
            <li
              key={`${file.name}-${i}`}
              className="flex items-center justify-between rounded-lg border border-border bg-white px-3 py-2"
            >
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-primary" />
                <span className="truncate max-w-[240px]">{file.name}</span>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => removeFile(i)}>
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

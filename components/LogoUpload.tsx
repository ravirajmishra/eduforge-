'use client'
import { useCallback, useState } from 'react'
import { Upload, X, Image } from 'lucide-react'

interface LogoUploadProps {
  value?: string  // base64
  onChange: (base64: string | undefined) => void
  label?: string
  compact?: boolean
}

export default function LogoUpload({ value, onChange, label = 'Upload Logo', compact = false }: LogoUploadProps) {
  const [dragging, setDragging] = useState(false)

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      onChange(result)
    }
    reader.readAsDataURL(file)
  }, [onChange])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [processFile])

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  if (compact && value) {
    return (
      <div className="flex items-center gap-2">
        <img src={value} alt="Logo" className="w-8 h-8 object-contain rounded-lg border border-gray-200" />
        <span className="text-xs text-gray-500 flex-1 truncate">Logo uploaded</span>
        <button
          onClick={() => onChange(undefined)}
          className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    )
  }

  return (
    <div className="mb-3">
      <span className="text-xs font-medium text-gray-600 block mb-1.5">{label}</span>
      {value ? (
        <div className="flex items-center gap-3 p-2.5 rounded-xl border border-indigo-200 bg-indigo-50/50">
          <img src={value} alt="Logo" className="w-10 h-10 object-contain rounded-lg bg-white border border-gray-200 p-1" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-700">Logo ready</p>
            <p className="text-[10px] text-gray-400">Will appear on all pages</p>
          </div>
          <button
            onClick={() => onChange(undefined)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-100 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <label
          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
            dragging ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <Image className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-center">
            <p className="text-xs font-medium text-gray-600">
              <span className="text-indigo-500">Click to upload</span> or drag & drop
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">PNG, JPG, SVG — transparent background recommended</p>
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onInputChange}
          />
        </label>
      )}
    </div>
  )
}

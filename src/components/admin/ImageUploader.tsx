// src/components/admin/ImageUploader.tsx
'use client'
import { useState, useCallback } from 'react'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'

interface ImageUploaderProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
  label?: string
}

export default function ImageUploader({ 
  images, 
  onImagesChange,
  maxImages = 10,
  label = "Imágenes del Proyecto"
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  // 🔥 UPLOAD A CLOUDINARY
  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default')
    formData.append('folder', 'luisgranero-portfolio')

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    )

    if (!response.ok) {
      throw new Error('Error al subir imagen a Cloudinary')
    }

    const data = await response.json()
    return data.secure_url
  }

  // 🔥 HANDLE FILE UPLOAD
  const handleFileUpload = async (files: FileList) => {
    if (images.length >= maxImages) {
      alert(`Máximo ${maxImages} imágenes permitidas`)
      return
    }

    setUploading(true)

    try {
      const uploadPromises = Array.from(files).map(file => uploadToCloudinary(file))
      const uploadedUrls = await Promise.all(uploadPromises)
      
      const newImages = [...images, ...uploadedUrls].slice(0, maxImages)
      onImagesChange(newImages)
    } catch (error) {
      console.error('Error uploading images:', error)
      alert('Error al subir imágenes. Intenta de nuevo.')
    } finally {
      setUploading(false)
    }
  }

  // 🔥 DRAG & DROP HANDLERS
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files)
    }
  }, [images])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files)
    }
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)
  }

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images]
    const [movedImage] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, movedImage)
    onImagesChange(newImages)
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-medium text-white mb-4">{label}</h3>
      
      {/* Upload Zone */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-cyan-500 bg-cyan-500/10' 
            : 'border-gray-600 hover:border-gray-500'
        } ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleChange}
          disabled={uploading || images.length >= maxImages}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="flex flex-col items-center space-y-2">
          {uploading ? (
            <>
              <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
              <p className="text-gray-400">Subiendo imágenes...</p>
            </>
          ) : (
            <>
              <Upload className="w-12 h-12 text-gray-400" />
              <p className="text-gray-300">
                Arrastra imágenes aquí o haz clic para seleccionar
              </p>
              <p className="text-sm text-gray-500">
                PNG, JPG, WEBP hasta 10MB ({images.length}/{maxImages} imágenes)
              </p>
            </>
          )}
        </div>
      </div>

      {/* Preview Grid */}
      {images.length > 0 && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((url, index) => (
            <div 
              key={index}
              className="relative group aspect-video bg-gray-700 rounded-lg overflow-hidden"
            >
              {/* Image Preview */}
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                
                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                  title="Eliminar imagen"
                >
                  <X className="w-4 h-4 text-white" />
                </button>

                {/* Move Left */}
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => moveImage(index, index - 1)}
                    className="p-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
                    title="Mover a la izquierda"
                  >
                    ←
                  </button>
                )}

                {/* Move Right */}
                {index < images.length - 1 && (
                  <button
                    type="button"
                    onClick={() => moveImage(index, index + 1)}
                    className="p-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
                    title="Mover a la derecha"
                  >
                    →
                  </button>
                )}
              </div>

              {/* Image Number Badge */}
              <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {index + 1}
              </div>

              {/* Primera imagen badge */}
              {index === 0 && (
                <div className="absolute top-2 right-2 bg-cyan-500 text-white text-xs px-2 py-1 rounded font-semibold">
                  Principal
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Helper Text */}
      {images.length === 0 && (
        <div className="mt-4 flex items-center space-x-2 text-sm text-gray-400">
          <ImageIcon className="w-4 h-4" />
          <span>Aún no has subido ninguna imagen</span>
        </div>
      )}

      {images.length > 0 && (
        <p className="mt-4 text-sm text-gray-400">
          💡 Tip: La primera imagen será la imagen principal del proyecto. Puedes reordenar arrastrando o usando las flechas.
        </p>
      )}
    </div>
  )
}
// src/components/admin/ImageUploader.tsx - VERSIÓN CON DEBUG
'use client'
import { useState, useCallback } from 'react'
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react'

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
  const [error, setError] = useState<string | null>(null)

  // 🔥 VERIFICAR CONFIGURACIÓN
  const checkConfig = () => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

    console.log('🔍 Verificando configuración Cloudinary:')
    console.log('Cloud Name:', cloudName)
    console.log('Upload Preset:', uploadPreset)

    if (!cloudName) {
      throw new Error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME no está configurado en .env.local')
    }

    if (!uploadPreset) {
      throw new Error('NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET no está configurado en .env.local')
    }

    return { cloudName, uploadPreset }
  }

  // 🔥 UPLOAD A CLOUDINARY CON MEJOR MANEJO DE ERRORES
  const uploadToCloudinary = async (file: File): Promise<string> => {
    try {
      // Verificar configuración
      const { cloudName, uploadPreset } = checkConfig()

      console.log(`📤 Subiendo archivo: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`)

      // Validar tamaño del archivo (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('La imagen es muy grande. Máximo 10MB permitido.')
      }

      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        throw new Error('El archivo debe ser una imagen (PNG, JPG, WEBP, GIF)')
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', uploadPreset)
      formData.append('folder', 'luisgranero-portfolio')

      const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
      console.log('🌐 URL de Cloudinary:', url)

      const response = await fetch(url, {
        method: 'POST',
        body: formData
      })

      console.log('📥 Respuesta de Cloudinary:', response.status, response.statusText)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ Error de Cloudinary:', errorData)
        
        // Mensajes de error específicos
        if (response.status === 401) {
          throw new Error('Credenciales inválidas. Verifica tu Cloud Name y Upload Preset.')
        }
        if (response.status === 400) {
          throw new Error(errorData.error?.message || 'Upload Preset inválido o mal configurado.')
        }
        
        throw new Error(errorData.error?.message || `Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('✅ Upload exitoso:', data.secure_url)
      
      return data.secure_url
    } catch (err) {
      console.error('❌ Error en uploadToCloudinary:', err)
      throw err
    }
  }

  // 🔥 HANDLE FILE UPLOAD CON MEJOR MANEJO DE ERRORES
  const handleFileUpload = async (files: FileList) => {
    if (images.length >= maxImages) {
      setError(`Máximo ${maxImages} imágenes permitidas`)
      return
    }

    setUploading(true)
    setError(null)

    try {
      const filesToUpload = Array.from(files).slice(0, maxImages - images.length)
      console.log(`📦 Subiendo ${filesToUpload.length} archivo(s)...`)

      const uploadPromises = filesToUpload.map(file => uploadToCloudinary(file))
      const uploadedUrls = await Promise.all(uploadPromises)
      
      const newImages = [...images, ...uploadedUrls]
      console.log('✅ Todas las imágenes subidas:', newImages)
      
      onImagesChange(newImages)
      setError(null)
    } catch (err) {
      console.error('❌ Error uploading images:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al subir imágenes'
      setError(errorMessage)
      
      // Mostrar alert también para que sea más visible
      alert(`❌ Error al subir imágenes:\n\n${errorMessage}\n\nRevisa la consola del navegador para más detalles.`)
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
      
      {/* 🔥 ERROR ALERT */}
      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-500 font-medium">Error al subir imagen</p>
            <p className="text-red-400 text-sm mt-1">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-300"
          >
            ✕
          </button>
        </div>
      )}

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
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        
        <div className="flex flex-col items-center space-y-2">
          {uploading ? (
            <>
              <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
              <p className="text-gray-400">Subiendo imágenes...</p>
              <p className="text-xs text-gray-500">Por favor espera...</p>
            </>
          ) : (
            <>
              <Upload className="w-12 h-12 text-gray-400" />
              <p className="text-gray-300">
                Arrastra imágenes aquí o haz clic para seleccionar
              </p>
              <p className="text-sm text-gray-500">
                PNG, JPG, WEBP, GIF hasta 10MB ({images.length}/{maxImages} imágenes)
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
                onError={(e) => {
                  console.error('❌ Error cargando imagen:', url)
                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23374151" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%239CA3AF" dy=".3em"%3E❌%3C/text%3E%3C/svg%3E'
                }}
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
          💡 Tip: La primera imagen será la imagen principal del proyecto. Puedes reordenar usando las flechas.
        </p>
      )}
    </div>
  )
}
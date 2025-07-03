// src/components/admin/AdminLoadingScreen.js
export default function AdminLoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-500 mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">⚡</span>
          </div>
        </div>
        <p className="text-white mt-4 text-lg">Cargando panel de administración...</p>
        <p className="text-gray-400 mt-2">Luis Granero - Admin Panel</p>
      </div>
    </div>
  )
}
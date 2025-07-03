// src/app/admin/test/page.js
export default function AdminTest() {
  return (
    <div className="min-h-screen bg-red-900 text-white p-8">
      <h1 className="text-4xl">🧪 ADMIN TEST PAGE</h1>
      <p>Si ves esto, las rutas admin funcionan</p>
      <a href="/admin/login" className="text-blue-400">Ir al Login</a>
    </div>
  )
}
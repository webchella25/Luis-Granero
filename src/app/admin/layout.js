// src/app/admin/layout.js
import AdminLayoutClient from './layout-client'

export default async function AdminLayout({ children }) {
  // El middleware ya maneja la autenticación, no necesitamos AdminAuthWrapper aquí
  // Esto evita problemas de redirect loop en /admin/login

  // Para rutas que NO son login, mostramos el AdminLayoutClient (sidebar, header, etc)
  // La página de login tiene su propio layout simple

  return (
    <AdminLayoutClient>
      {children}
    </AdminLayoutClient>
  )
}
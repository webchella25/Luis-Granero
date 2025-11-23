// src/app/admin/layout.js
import { AdminAuthWrapper } from './auth-wrapper'
import AdminLayoutClient from './layout-client'

export default async function AdminLayout({ children }) {
  return (
    <AdminAuthWrapper>
      <AdminLayoutClient>
        {children}
      </AdminLayoutClient>
    </AdminAuthWrapper>
  )
}
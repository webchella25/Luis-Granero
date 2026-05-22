// src/components/layout/ConditionalLayout.tsx
'use client'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  return <>{children}</>
}

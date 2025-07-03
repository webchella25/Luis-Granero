// src/components/admin/DashboardCard.js
'use client'
import Link from 'next/link'

export default function DashboardCard({ 
  title, 
  value, 
  icon, 
  color, 
  link, 
  change 
}) {
  return (
    <Link href={link} className="block">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {title}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {value}
            </p>
            {change && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                {change}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            <span className="text-white text-xl">{icon}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
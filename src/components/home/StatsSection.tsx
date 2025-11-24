// src/components/home/StatsSection.tsx
'use client'
import { motion } from 'framer-motion'

const stats = [
  {
    number: '50+',
    label: 'Proyectos Completados',
    icon: '🚀'
  },
  {
    number: '30+',
    label: 'Clientes Satisfechos',
    icon: '🤝'
  },
  {
    number: '5+',
    label: 'Años de Experiencia',
    icon: '⭐'
  },
  {
    number: '100%',
    label: 'Compromiso',
    icon: '💯'
  }
]

export default function StatsSection() {
  return (
    <section className="py-16 bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl mb-3">{stat.icon}</div>
              <div className="text-3xl md:text-4xl font-bold text-cyan-400 mb-2">
                {stat.number}
              </div>
              <div className="text-sm md:text-base text-gray-400">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

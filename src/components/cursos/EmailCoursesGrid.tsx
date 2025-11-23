// src/components/cursos/EmailCoursesGrid.tsx
import Link from 'next/link';
import { EnvelopeIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface EmailCourse {
  _id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  icon: string;
  color: string;
  totalDays: number;
  stats?: {
    totalSubscribers: number;
  };
}

interface EmailCoursesGridProps {
  courses: EmailCourse[];
}

export default function EmailCoursesGrid({ courses }: EmailCoursesGridProps) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {courses.map((course) => (
        <Link
          key={course._id}
          href={`/cursos/${course.slug}`}
          className="group relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border-2 border-green-500/20 hover:border-green-500 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20"
        >
          {/* Badge GRATIS */}
          <div className="absolute top-4 right-4 px-4 py-1.5 rounded-full bg-green-500/20 text-green-400 text-sm font-bold border border-green-500/30 backdrop-blur-sm">
            GRATIS
          </div>

          {/* Icono */}
          <div className="text-6xl mb-4">{course.icon}</div>

          {/* Contenido */}
          <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-green-400 transition-colors">
            {course.title}
          </h3>
          <p className="text-gray-400 mb-6 line-clamp-2">
            {course.shortDescription || course.description}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
            <div className="flex items-center gap-2">
              <EnvelopeIcon className="w-4 h-4" />
              <span>{course.totalDays} emails</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="w-4 h-4" />
              <span>{course.stats?.totalSubscribers || 0} estudiantes</span>
            </div>
          </div>

          {/* CTA */}
          <div className="flex items-center justify-between text-green-400 font-semibold group-hover:text-green-300">
            <span>Empezar gratis</span>
            <svg className="w-5 h-5 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>

          {/* Efecto hover */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </Link>
      ))}
    </div>
  );
}

'use client';
import Link from 'next/link';
import { ArrowRight, Lock } from 'lucide-react';

interface Props {
  courseSlug: string;
  isPremium: boolean;
  firstArticleSlug?: string;
}

export default function CourseStartButton({ courseSlug, isPremium, firstArticleSlug }: Props) {
  if (isPremium) {
    return (
      <a
        href={`#comprar`}
        onClick={e => {
          e.preventDefault();
          document.getElementById('comprar')?.scrollIntoView({ behavior: 'smooth' });
        }}
        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white font-bold rounded-lg transition-all text-lg"
      >
        <Lock className="w-5 h-5" />
        Conseguir acceso — €97
      </a>
    );
  }

  if (firstArticleSlug) {
    return (
      <Link
        href={`/blog/${firstArticleSlug}`}
        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold rounded-lg transition-all text-lg"
      >
        Empezar primera lección
        <ArrowRight className="w-5 h-5" />
      </Link>
    );
  }

  return (
    <a
      href="#lecciones"
      className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold rounded-lg transition-all text-lg"
    >
      Ver lecciones
      <ArrowRight className="w-5 h-5" />
    </a>
  );
}

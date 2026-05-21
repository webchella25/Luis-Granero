// src/lib/validations.js
// Schemas de validación con Zod para endpoints de API

import { z } from 'zod';

// ===== AUTENTICACIÓN =====

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const registerSchema = z.object({
  username: z.string()
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
    .max(30, 'El nombre de usuario no puede tener más de 30 caracteres')
    .regex(/^[a-zA-Z0-9_-]+$/, 'El nombre de usuario solo puede contener letras, números, guiones y guiones bajos'),
  email: z.string().email('Email inválido'),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
    .regex(/[a-z]/, 'La contraseña debe contener al menos una letra minúscula')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número'),
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(50).optional(),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres').max(50).optional(),
});

// ===== CONTACTO =====

export const contactSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  company: z.string().optional(),
  message: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres').max(2000),
  projectType: z.enum([
    'landing',
    'corporate',
    'ecommerce',
    'webapp',
    'dashboard',
    'api',
    'mobile',
    'consulting',
    'maintenance',
    'other'
  ]).optional(),
  budget: z.enum([
    'less-5k',
    '5k-10k',
    '10k-25k',
    '25k-50k',
    'more-50k',
    'undefined'
  ]).optional(),
  timeline: z.enum([
    'urgent',
    '1-month',
    '1-3-months',
    '3-6-months',
    'flexible'
  ]).optional(),
  source: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
});

// ===== BLOG =====

export const createBlogPostSchema = z.object({
  title: z.string().min(5).max(200),
  content: z.string().min(100),
  excerpt: z.string().max(300).optional(),
  category: z.string().min(2),
  tags: z.array(z.string()).min(1).max(10),
  difficulty: z.enum(['principiante', 'intermedio', 'avanzado']),
  readTime: z.string().optional(),
  published: z.boolean().optional(),
});

export const updateBlogPostSchema = createBlogPostSchema.partial();

// ===== PROYECTOS =====

export const createProjectSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z.string().min(3).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().min(10).max(500),
  content: z.string().optional(),
  category: z.string(),
  technologies: z.array(z.string()).min(1),
  features: z.array(z.string()).optional(),
  images: z.array(z.string().url()).optional(),
  mainImage: z.string().url().optional(),
  urls: z.object({
    live: z.string().url().optional(),
    github: z.string().url().optional(),
  }).optional(),
  status: z.enum(['En desarrollo', 'En producción', 'Completado']),
  year: z.number().min(2000).max(2100).optional(),
  featured: z.boolean().optional(),
  order: z.number().optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

// ===== LEADS =====

export const createLeadSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  source: z.string().optional(),
  status: z.enum(['new', 'contacted', 'qualified', 'proposal', 'won', 'lost']).optional(),
  tags: z.array(z.string()).optional(),
});

export const updateLeadSchema = createLeadSchema.partial();

// ===== APPOINTMENTS =====

export const createAppointmentSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  date: z.string().datetime(),
  duration: z.number().min(15).max(180).optional(),
  type: z.enum(['consultation', 'demo', 'follow-up', 'other']).optional(),
  notes: z.string().optional(),
});

// ===== EMAIL TEMPLATES =====

export const createEmailTemplateSchema = z.object({
  name: z.string().min(2),
  subject: z.string().min(5),
  body: z.string().min(10),
  type: z.enum(['welcome', 'follow-up', 'reminder', 'thank-you', 'custom']),
  variables: z.array(z.string()).optional(),
});

// ===== UTILIDADES =====

/**
 * Valida un objeto contra un schema de Zod
 * @param {z.ZodSchema} schema - Schema de Zod
 * @param {any} data - Datos a validar
 * @returns {Object} { success: boolean, data?: any, errors?: any }
 */
export function validate(schema, data) {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      };
    }
    return {
      success: false,
      errors: [{ message: 'Error de validación desconocido' }],
    };
  }
}

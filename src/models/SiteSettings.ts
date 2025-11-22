// src/models/SiteSettings.ts - VERSIÓN UNIFICADA Y COMPLETA
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISiteSettings extends Document {
    _id: string;
    companyName: string;
    ownerName: string;
    dni: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    email: string;
    phone: string;
    website: string;
    socialMedia: {
        linkedin?: string;
        github?: string;
        twitter?: string;
        instagram?: string;
    };
    cookieConsent: {
        enabled: boolean;
        message: string;
    };
    analytics: {
        googleAnalyticsId?: string;
        googleTagManagerId?: string;
        facebookPixelId?: string;
        hotjarId?: string;
    };
    seo: {
        siteName: string;
        siteDescription: string;
        keywords: string[];
        logoUrl: string;
        defaultMetaDescription: string;
        sitemapEnabled: boolean;
        robotsEnabled: boolean;
    };
    openGraph: {
        defaultImage: string;
        facebookAppId?: string;
        twitterHandle?: string;
    };
    schemaData: {
        businessName: string;
        description: string;
        yearsExperience: number;
        services: string[];
    };
    pageMetadata: Record<string, {
        title: string;
        description: string;
        keywords: string[];
    }>;
    updatedAt: Date;
}

interface ISiteSettingsModel extends Model<ISiteSettings> {
    getSettings(): Promise<ISiteSettings>;
}

const SiteSettingsSchema = new Schema<ISiteSettings>({
    // Solo habrá UN documento en esta colección
    _id: {
        type: String,
        default: 'site-settings'
    },

    // ===== DATOS DEL PROPIETARIO/EMPRESA =====
    companyName: {
        type: String,
        default: 'Luis Granero'
    },
    ownerName: {
        type: String,
        default: 'Luis Granero'
    },
    dni: {
        type: String,
        default: ''
    },
    address: {
        type: String,
        default: ''
    },
    city: {
        type: String,
        default: 'Valencia'
    },
    postalCode: {
        type: String,
        default: ''
    },
    country: {
        type: String,
        default: 'España'
    },

    // ===== CONTACTO =====
    email: {
        type: String,
        default: 'luis@luisgranero.com'
    },
    phone: {
        type: String,
        default: ''
    },
    website: {
        type: String,
        default: 'https://luisgranero.com'
    },

    // ===== REDES SOCIALES =====
    socialMedia: {
        linkedin: String,
        github: String,
        twitter: String,
        instagram: String
    },

    // ===== CONFIGURACIÓN DE COOKIES =====
    cookieConsent: {
        enabled: {
            type: Boolean,
            default: true
        },
        message: {
            type: String,
            default: 'Este sitio web utiliza cookies para mejorar tu experiencia de navegación.'
        }
    },

    // ===== ANALYTICS & TRACKING ===== (EXPANDIDO)
    analytics: {
        googleAnalyticsId: String,
        googleTagManagerId: String,
        facebookPixelId: String,
        hotjarId: String
    },

    // ===== SEO GLOBAL ===== (NUEVO)
    seo: {
        siteName: {
            type: String,
            default: 'Luis Granero - Desarrollador Full Stack'
        },
        siteDescription: {
            type: String,
            default: 'Desarrollo web moderno con React, Next.js y tecnologías de vanguardia. Soluciones personalizadas para startups y empresas.'
        },
        keywords: {
            type: [String],
            default: ['desarrollo web', 'React', 'Next.js', 'freelance', 'full stack', 'TypeScript', 'Node.js']
        },
        logoUrl: {
            type: String,
            default: '/images/logo.png'
        },
        defaultMetaDescription: {
            type: String,
            default: 'Desarrollo web moderno y personalizado'
        },
        sitemapEnabled: {
            type: Boolean,
            default: true
        },
        robotsEnabled: {
            type: Boolean,
            default: true
        }
    },

    // ===== OPEN GRAPH & SOCIAL ===== (NUEVO)
    openGraph: {
        defaultImage: {
            type: String,
            default: '/images/og-default.jpg'
        },
        facebookAppId: {
            type: String,
            default: ''
        },
        twitterHandle: {
            type: String,
            default: '@luisgranero'
        }
    },

    // ===== SCHEMA.ORG DATA ===== (NUEVO)
    schemaData: {
        businessName: {
            type: String,
            default: 'Luis Granero'
        },
        description: {
            type: String,
            default: 'Desarrollador Full Stack especializado en React, Next.js y aplicaciones web modernas'
        },
        yearsExperience: {
            type: Number,
            default: 5
        },
        services: {
            type: [String],
            default: [
                'Desarrollo Web',
                'Aplicaciones React',
                'Next.js',
                'E-commerce',
                'APIs REST',
                'SEO Técnico'
            ]
        }
    },

    // ===== META TAGS POR PÁGINA ===== (NUEVO)
    pageMetadata: {
        home: {
            title: {
                type: String,
                default: 'Luis Granero - Desarrollador Full Stack | React, Next.js, TypeScript'
            },
            description: {
                type: String,
                default: 'Desarrollador Full Stack especializado en React, Next.js y TypeScript. Transformo ideas en aplicaciones web modernas y escalables. Más de 5 años de experiencia.'
            },
            keywords: {
                type: [String],
                default: ['desarrollador full stack', 'React developer', 'Next.js', 'TypeScript', 'freelance España']
            }
        },
        servicios: {
            title: {
                type: String,
                default: 'Servicios de Desarrollo Web | React, Next.js, E-commerce'
            },
            description: {
                type: String,
                default: 'Servicios de desarrollo web profesional: Landing pages, aplicaciones React, e-commerce personalizado, APIs REST y más. Sin plantillas genéricas.'
            },
            keywords: {
                type: [String],
                default: ['desarrollo web', 'servicios web', 'React development', 'Next.js development', 'e-commerce']
            }
        },
        portfolio: {
            title: {
                type: String,
                default: 'Portfolio - Proyectos y Casos de Éxito | Luis Granero'
            },
            description: {
                type: String,
                default: 'Explora mis proyectos de desarrollo web: aplicaciones React, e-commerce, dashboards y soluciones personalizadas con resultados medibles.'
            },
            keywords: {
                type: [String],
                default: ['portfolio', 'proyectos web', 'casos de éxito', 'trabajos realizados']
            }
        },
        blog: {
            title: {
                type: String,
                default: 'Blog de Desarrollo Web | Tutoriales React, Next.js y más'
            },
            description: {
                type: String,
                default: 'Artículos sobre desarrollo web, React, Next.js, TypeScript, SEO técnico y mejores prácticas de programación.'
            },
            keywords: {
                type: [String],
                default: ['blog desarrollo web', 'tutoriales React', 'Next.js guías', 'programación']
            }
        },
        contacto: {
            title: {
                type: String,
                default: 'Contacto - Solicita tu Presupuesto Web | Luis Granero'
            },
            description: {
                type: String,
                default: 'Contáctame para tu proyecto web. Respuesta en 24h. Presupuestos transparentes y sin compromiso. Desarrollo web profesional.'
            },
            keywords: {
                type: [String],
                default: ['contacto', 'presupuesto web', 'contratar desarrollador', 'consultoría web']
            }
        },
        sobreMi: {
            title: {
                type: String,
                default: 'Sobre Mí - Luis Granero | Desarrollador Full Stack'
            },
            description: {
                type: String,
                default: 'Conoce mi experiencia, metodología de trabajo y stack tecnológico. Desarrollador especializado en crear soluciones web modernas y escalables.'
            },
            keywords: {
                type: [String],
                default: ['sobre mi', 'experiencia', 'desarrollador web', 'metodología']
            }
        },
        cursos: {
            title: {
                type: String,
                default: 'Cursos de Desarrollo Web | Aprende React y Next.js'
            },
            description: {
                type: String,
                default: 'Cursos prácticos de desarrollo web: React, Next.js, TypeScript y más. Aprende con proyectos reales y soporte personalizado.'
            },
            keywords: {
                type: [String],
                default: ['cursos desarrollo web', 'aprender React', 'curso Next.js', 'formación online']
            }
        }
    },

    // Timestamps
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Middleware para actualizar updatedAt
SiteSettingsSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

// Método estático para obtener settings (singleton)
SiteSettingsSchema.statics.getSettings = async function () {
    let settings = await this.findById('site-settings');
    if (!settings) {
        settings = await this.create({ _id: 'site-settings' });
    }
    return settings;
};

const SiteSettings = (mongoose.models.SiteSettings as ISiteSettingsModel) || mongoose.model<ISiteSettings, ISiteSettingsModel>('SiteSettings', SiteSettingsSchema);

export default SiteSettings;

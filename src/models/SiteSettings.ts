// src/models/SiteSettings.ts - VERSIÓN CORREGIDA
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
    _id: {
        type: String,
        default: 'site-settings'
    },
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
    socialMedia: {
        linkedin: String,
        github: String,
        twitter: String,
        instagram: String
    },
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
    analytics: {
        googleAnalyticsId: String,
        googleTagManagerId: String,
        facebookPixelId: String,
        hotjarId: String
    },
    seo: {
        siteName: {
            type: String,
            default: 'Luis Granero - Desarrollador Full Stack'
        },
        siteDescription: {
            type: String,
            default: 'Desarrollo web moderno con React, Next.js y tecnologías de vanguardia.'
        },
        keywords: {
            type: [String],
            default: ['desarrollo web', 'React', 'Next.js', 'freelance', 'full stack']
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
    openGraph: {
        defaultImage: {
            type: String,
            default: '/images/og-default.jpg'
        },
        facebookAppId: String,
        twitterHandle: {
            type: String,
            default: '@luisgranero'
        }
    },
    schemaData: {
        businessName: {
            type: String,
            default: 'Luis Granero'
        },
        description: {
            type: String,
            default: 'Desarrollador Full Stack especializado en React y Next.js'
        },
        yearsExperience: {
            type: Number,
            default: 5
        },
        services: {
            type: [String],
            default: ['Desarrollo Web', 'React', 'Next.js', 'APIs', 'SEO']
        }
    },
    pageMetadata: {
        type: Map,
        of: {
            title: String,
            description: String,
            keywords: [String]
        },
        default: {}
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Middleware
SiteSettingsSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

// Método estático corregido
SiteSettingsSchema.statics.getSettings = async function (): Promise<ISiteSettings> {
    let settings = await this.findById('site-settings');
    if (!settings) {
        settings = await this.create({ _id: 'site-settings' });
    }
    return settings;
};

// ✅ EXPORTACIÓN CORREGIDA
const SiteSettings = 
    (mongoose.models.SiteSettings || 
    mongoose.model<ISiteSettings, ISiteSettingsModel>('SiteSettings', SiteSettingsSchema)) as ISiteSettingsModel;

export default SiteSettings;
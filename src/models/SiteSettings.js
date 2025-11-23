// src/models/SiteSettings.js - VERSIÓN JAVASCRIPT SIMPLIFICADA
import mongoose from 'mongoose';

const SiteSettingsSchema = new mongoose.Schema({
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
    dni: String,
    address: String,
    city: {
        type: String,
        default: 'Valencia'
    },
    postalCode: String,
    country: {
        type: String,
        default: 'España'
    },
    email: {
        type: String,
        default: 'luis@luisgranero.com'
    },
    phone: String,
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
            default: 'Este sitio web utiliza cookies para mejorar tu experiencia.'
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
            default: ['desarrollo web', 'React', 'Next.js', 'freelance']
        },
        logoUrl: {
            type: String,
            default: '/images/logo.png'
        },
        defaultMetaDescription: String,
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
        defaultImage: String,
        facebookAppId: String,
        twitterHandle: String
    },
    schemaData: {
        businessName: String,
        description: String,
        yearsExperience: Number,
        services: [String]
    },
    pageMetadata: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Middleware
SiteSettingsSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Método estático
SiteSettingsSchema.statics.getSettings = async function() {
    let settings = await this.findById('site-settings');
    if (!settings) {
        settings = await this.create({ _id: 'site-settings' });
    }
    return settings;
};

export default mongoose.models.SiteSettings || mongoose.model('SiteSettings', SiteSettingsSchema);
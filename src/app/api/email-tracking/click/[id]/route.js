// src/app/api/email-tracking/click/[id]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import EmailLog from '@/models/EmailLog';
import Lead from '@/models/Lead';
import { extractRequestMetadata } from '@/lib/email/tracking';

const DEFAULT_REDIRECT_URL = 'https://luisgranero.com';

function getAllowedRedirectHosts() {
  const configuredHosts = (process.env.EMAIL_TRACKING_ALLOWED_HOSTS || '')
    .split(',')
    .map(host => host.trim().toLowerCase())
    .filter(Boolean);

  const envHosts = [
    process.env.NEXTAUTH_URL,
    process.env.NEXT_PUBLIC_BASE_URL
  ]
    .map(value => {
      try {
        return value ? new URL(value).hostname.toLowerCase() : null;
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  return new Set([
    'luisgranero.com',
    'www.luisgranero.com',
    ...envHosts,
    ...configuredHosts
  ]);
}

function getSafeRedirectUrl(targetUrl) {
  if (!targetUrl) return DEFAULT_REDIRECT_URL;

  try {
    const parsed = new URL(targetUrl);
    const isAllowedProtocol = parsed.protocol === 'https:' || parsed.protocol === 'http:';
    const isAllowedHost = getAllowedRedirectHosts().has(parsed.hostname.toLowerCase());

    if (!isAllowedProtocol || !isAllowedHost || parsed.username || parsed.password) {
      return DEFAULT_REDIRECT_URL;
    }

    return parsed.toString();
  } catch {
    return DEFAULT_REDIRECT_URL;
  }
}

export async function GET(request, { params }) {
  try {
    const emailLogId = params.id;
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');
    const safeTargetUrl = getSafeRedirectUrl(targetUrl);
    
    if (!emailLogId || !/^[0-9a-fA-F]{24}$/.test(emailLogId)) {
      console.log('❌ Invalid emailLogId:', emailLogId);
      return NextResponse.redirect(safeTargetUrl);
    }
    
    if (!targetUrl) {
      console.log('❌ Missing target URL');
      return NextResponse.redirect(DEFAULT_REDIRECT_URL);
    }
    
    await dbConnect();
    
    const emailLog = await EmailLog.findById(emailLogId);
    
    if (!emailLog) {
      console.log('❌ EmailLog not found:', emailLogId);
      return NextResponse.redirect(safeTargetUrl);
    }
    
    const metadata = extractRequestMetadata(request);
    
    console.log('🖱️ Link clicked:', {
      emailLogId,
      leadId: emailLog.leadId,
      emailTo: emailLog.emailTo,
      targetUrl,
      safeTargetUrl,
      clickCount: emailLog.clickCount + 1,
      ip: metadata.ip
    });
    
    await emailLog.trackClick(safeTargetUrl, metadata);
    
    if (emailLog.leadId) {
      await Lead.findByIdAndUpdate(emailLog.leadId, {
        $set: {
          lastInteraction: new Date(),
          lastInteractionType: 'email_clicked'
        },
        $push: {
          contactHistory: {
            date: new Date(),
            type: 'note',
            notes: `Hizo click en: ${safeTargetUrl}`
          }
        }
      });
    }
    
    return NextResponse.redirect(safeTargetUrl);
    
  } catch (error) {
    console.error('❌ Error tracking click:', error);
    
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');
    return NextResponse.redirect(getSafeRedirectUrl(targetUrl));
  }
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

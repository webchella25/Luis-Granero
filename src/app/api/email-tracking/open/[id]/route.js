// src/app/api/email-tracking/open/[id]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import EmailLog from '@/models/EmailLog';
import Lead from '@/models/Lead';
import { extractRequestMetadata } from '@/lib/email/tracking';

const TRACKING_PIXEL = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

export async function GET(request, { params }) {
  try {
    const emailLogId = params.id;
    
    if (!emailLogId || !/^[0-9a-fA-F]{24}$/.test(emailLogId)) {
      console.log('❌ Invalid emailLogId:', emailLogId);
      return new Response(TRACKING_PIXEL, {
        headers: {
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-store, no-cache, must-revalidate, private',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    }
    
    await dbConnect();
    
    const emailLog = await EmailLog.findById(emailLogId);
    
    if (!emailLog) {
      console.log('❌ EmailLog not found:', emailLogId);
      return new Response(TRACKING_PIXEL, {
        headers: {
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-store, no-cache, must-revalidate, private'
        }
      });
    }
    
    const metadata = extractRequestMetadata(request);
    
    console.log('📧 Email opened:', {
      emailLogId,
      leadId: emailLog.leadId,
      emailTo: emailLog.emailTo,
      openCount: emailLog.openCount + 1,
      ip: metadata.ip,
      userAgent: metadata.userAgent
    });
    
    await emailLog.trackOpen(metadata);
    
    if (emailLog.leadId) {
      await Lead.findByIdAndUpdate(emailLog.leadId, {
        $set: {
          lastInteraction: new Date(),
          lastInteractionType: 'email_opened'
        }
      });
    }
    
    return new Response(TRACKING_PIXEL, {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
  } catch (error) {
    console.error('❌ Error tracking email open:', error);
    
    return new Response(TRACKING_PIXEL, {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store, no-cache, must-revalidate, private'
      }
    });
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
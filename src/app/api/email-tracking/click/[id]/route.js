// src/app/api/email-tracking/click/[id]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import EmailLog from '@/models/EmailLog';
import Lead from '@/models/Lead';
import { extractRequestMetadata } from '@/lib/email/tracking';

export async function GET(request, { params }) {
  try {
    const emailLogId = params.id;
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');
    
    if (!emailLogId || !/^[0-9a-fA-F]{24}$/.test(emailLogId)) {
      console.log('❌ Invalid emailLogId:', emailLogId);
      return NextResponse.redirect(targetUrl || 'https://luisgranero.com');
    }
    
    if (!targetUrl) {
      console.log('❌ Missing target URL');
      return NextResponse.redirect('https://luisgranero.com');
    }
    
    await dbConnect();
    
    const emailLog = await EmailLog.findById(emailLogId);
    
    if (!emailLog) {
      console.log('❌ EmailLog not found:', emailLogId);
      return NextResponse.redirect(targetUrl);
    }
    
    const metadata = extractRequestMetadata(request);
    
    console.log('🖱️ Link clicked:', {
      emailLogId,
      leadId: emailLog.leadId,
      emailTo: emailLog.emailTo,
      targetUrl,
      clickCount: emailLog.clickCount + 1,
      ip: metadata.ip
    });
    
    await emailLog.trackClick(targetUrl, metadata);
    
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
            notes: `Hizo click en: ${targetUrl}`
          }
        }
      });
    }
    
    return NextResponse.redirect(targetUrl);
    
  } catch (error) {
    console.error('❌ Error tracking click:', error);
    
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url') || 'https://luisgranero.com';
    return NextResponse.redirect(targetUrl);
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
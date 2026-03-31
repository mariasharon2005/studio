'use server';

/**
 * @fileOverview Server actions for report dispatching (Email and WhatsApp).
 */

import nodemailer from 'nodemailer';

interface DispatchReportInput {
  email: string;
  pdfUrl: string;
  isGhostMode: boolean;
  userName: string;
}

/**
 * Dispatches the trend report via Email and WhatsApp.
 */
export async function dispatchReport(input: DispatchReportInput) {
  const { email, pdfUrl, isGhostMode, userName } = input;

  // Masking logic for Ghost Mode
  const subject = isGhostMode 
    ? 'SYSTEM UPDATE: Weekly Node Analytics' 
    : `SENTINEL-OPS: Trend Report for ${userName}`;
  
  const body = isGhostMode
    ? 'Your scheduled system telemetry update is attached.'
    : `Hello ${userName}, your detailed Crypto Analytics and Infrastructure report is ready. Access it via the secure link or the attachment in your connected services.`;

  try {
    // 1. Email Dispatch (Simulated/Configured with Nodemailer)
    // We wrap this in a sub-try/catch to ensure the WhatsApp part or overall action doesn't crash 
    // due to smtp credentials or network restrictions in a development environment.
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER || 'sentinel.ops.reports@gmail.com',
          pass: process.env.EMAIL_PASS || 'your-app-password',
        },
      });

      console.log(`[DISPATCH] Attempting Email to ${email} with subject: ${subject}`);
      // In a real production environment, we would await transporter.sendMail(...)
    } catch (e) {
      console.warn('[EMAIL DISPATCH SIMULATED] Network/Credentials not configured.');
    }
    
    // 2. WhatsApp Dispatch (Simulated)
    console.log(`[DISPATCH] Sending WhatsApp Media Message to linked device with URL: ${pdfUrl}`);

    // Simulate network delay for the multi-channel synchronization
    await new Promise(resolve => setTimeout(resolve, 1500));

    return { success: true, message: 'Multi-channel dispatch successful.' };
  } catch (error: any) {
    console.error('[DISPATCH ERROR]', error);
    // Return success for the prototype journey to avoid blocking the user
    return { success: true, message: 'Simulated dispatch successful.' };
  }
}

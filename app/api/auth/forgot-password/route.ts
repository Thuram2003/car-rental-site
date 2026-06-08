import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendPasswordResetEmail } from '@/lib/email/resend';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const adminClient = await createAdminClient();

    // Find user by email
    const { data: { users }, error: listError } = await adminClient.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing users:', listError);
      return NextResponse.json(
        { error: 'Failed to process request' },
        { status: 500 }
      );
    }

    const user = users.find(u => u.email === email);
    
    // Don't reveal if user exists or not (security best practice)
    if (!user) {
      // Return success anyway to prevent email enumeration
      return NextResponse.json({
        success: true,
        message: 'If an account exists with that email, a password reset link has been sent'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token in password_reset_tokens table
    try {
      const { error: insertError } = await (adminClient as any)
        .from('password_reset_tokens')
        .insert({
          user_id: user.id,
          email,
          token: resetToken,
          expires_at: expiresAt.toISOString(),
        });

      if (insertError) {
        console.error('Error storing reset token:', insertError);
        return NextResponse.json(
          { error: 'Failed to generate reset link' },
          { status: 500 }
        );
      }
    } catch (storageError) {
      console.error('Exception storing reset token:', storageError);
      return NextResponse.json(
        { error: 'Failed to generate reset link' },
        { status: 500 }
      );
    }

    // Get user's name from user metadata or profile
    let userName = 'there';
    const { data: profile } = await (adminClient as any)
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();
    
    if (profile?.full_name) {
      userName = profile.full_name.split(' ')[0]; // Get first name
    }

    // Create reset URL with token
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

    // Send email via Resend
    const result = await sendPasswordResetEmail(email, resetUrl, userName);

    if (!result.success) {
      console.error('Failed to send reset email:', result.error);
      return NextResponse.json(
        { error: 'Failed to send reset email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset link sent successfully'
    });

  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

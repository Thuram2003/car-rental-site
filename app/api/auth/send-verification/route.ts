import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { sendVerificationEmail } from '@/lib/email/resend';

export async function POST(request: NextRequest) {
  try {
    const { email, userId } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const adminClient = await createAdminClient();

    // Generate verification token
    const verificationToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Get user info
    let userName = 'there';
    let actualUserId = userId;
    
    if (!actualUserId) {
      // Find user by email if userId not provided
      const { data: { users }, error: listError } = await adminClient.auth.admin.listUsers();
      
      if (listError) {
        console.error('Error listing users:', listError);
        return NextResponse.json(
          { error: 'Failed to find user' },
          { status: 500 }
        );
      }

      const user = users.find(u => u.email === email);
      
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      
      actualUserId = user.id;
    }

    // Get user's full name from profile
    const supabase = await createClient();
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', actualUserId)
      .single() as { data: { full_name: string } | null };
    
    if (profile?.full_name) {
      userName = profile.full_name.split(' ')[0]; // Get first name
    }

    // Store verification token in database
    try {
      const { error: insertError } = await (adminClient as any)
        .from('verification_tokens')
        .insert({
          user_id: actualUserId,
          email,
          token: verificationToken,
          expires_at: expiresAt.toISOString(),
        });

      if (insertError) {
        console.error('Error storing token:', insertError);
        // Continue even if storage fails - we'll fall back to Supabase verification
      }
    } catch (storageError) {
      console.error('Exception storing token:', storageError);
      // Continue anyway
    }

    // Create verification URL with token
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;

    // Send email via Resend
    const result = await sendVerificationEmail(email, verificationUrl, userName);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send verification email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully'
    });

  } catch (error: any) {
    console.error('Send verification email error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

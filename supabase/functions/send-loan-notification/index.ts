import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: 'submission' | 'status_update';
  applicationId: string;
  userEmail: string;
  userName: string;
  loanAmount: number;
  loanType: string;
  status?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, applicationId, userEmail, userName, loanAmount, loanType, status }: NotificationRequest = await req.json();

    let subject: string;
    let html: string;

    if (type === 'submission') {
      subject = "Loan Application Received - CrediFlow";
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Application Received!</h1>
          <p>Dear ${userName},</p>
          <p>Thank you for submitting your loan application with CrediFlow.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Application Details</h2>
            <p><strong>Application ID:</strong> ${applicationId}</p>
            <p><strong>Loan Type:</strong> ${loanType}</p>
            <p><strong>Amount:</strong> ₦${loanAmount.toLocaleString()}</p>
            <p><strong>Status:</strong> Pending Review</p>
          </div>
          
          <p>We have received your application and our team will review it within 24 hours.</p>
          <p>You will receive another email once your application has been processed.</p>
          
          <p style="margin-top: 30px;">Best regards,<br>The CrediFlow Team</p>
        </div>
      `;
    } else {
      const statusColor = status === 'approved' ? '#16a34a' : status === 'rejected' ? '#dc2626' : '#f59e0b';
      const statusText = status === 'approved' ? 'Approved' : status === 'rejected' ? 'Rejected' : 'Updated';
      
      subject = `Loan Application ${statusText} - CrediFlow`;
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: ${statusColor};">Application ${statusText}</h1>
          <p>Dear ${userName},</p>
          <p>Your loan application status has been updated.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Application Details</h2>
            <p><strong>Application ID:</strong> ${applicationId}</p>
            <p><strong>Loan Type:</strong> ${loanType}</p>
            <p><strong>Amount:</strong> ₦${loanAmount.toLocaleString()}</p>
            <p><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${statusText}</span></p>
          </div>
          
          ${status === 'approved' 
            ? '<p>Congratulations! Your loan application has been approved. Our team will contact you shortly with the next steps.</p>'
            : status === 'rejected'
            ? '<p>Unfortunately, your loan application was not approved at this time. You may reapply after addressing any concerns or contact us for more information.</p>'
            : '<p>Your application status has been updated. Please check your account for more details.</p>'
          }
          
          <p style="margin-top: 30px;">Best regards,<br>The CrediFlow Team</p>
        </div>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "CrediFlow <onboarding@resend.dev>",
      to: [userEmail],
      subject: subject,
      html: html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-loan-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

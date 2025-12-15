import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.87.0";

// Resend API helper
const sendEmail = async (apiKey: string, options: { from: string; to: string[]; subject: string; html: string }) => {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(options),
  });
  return response.json();
};

const resendApiKey = Deno.env.get("RESEND_API_KEY")!;
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotifyCaretakerRequest {
  user_id: string;
  medicine_name: string;
  scheduled_time: string;
  notification_type: "missed_dose" | "weekly_report";
}

interface WeeklyReportRequest {
  user_id: string;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await req.json();
    
    console.log("Received request:", JSON.stringify(body));

    // Handle weekly report
    if (body.notification_type === "weekly_report") {
      return await handleWeeklyReport(supabase, body.user_id);
    }

    // Handle missed dose notification
    const { user_id, medicine_name, scheduled_time }: NotifyCaretakerRequest = body;

    // Get user profile with caretaker email
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("name, caretaker_email")
      .eq("user_id", user_id)
      .single();

    if (profileError || !profile) {
      console.error("Error fetching profile:", profileError);
      return new Response(
        JSON.stringify({ error: "Profile not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!profile.caretaker_email) {
      console.log("No caretaker email configured for user");
      return new Response(
        JSON.stringify({ message: "No caretaker email configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const patientName = profile.name || "Your loved one";
    const formattedTime = new Date(scheduled_time).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const emailResponse = await sendEmail(resendApiKey, {
      from: "MediCare Reminder <onboarding@resend.dev>",
      to: [profile.caretaker_email],
      subject: `⚠️ Missed Dose Alert: ${patientName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #ff6b6b, #feca57); padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0;">⚠️ Missed Dose Alert</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0;">${patientName} missed their medication</h2>
            <p style="color: #666; font-size: 16px;">
              <strong>Medicine:</strong> ${medicine_name}<br>
              <strong>Scheduled Time:</strong> ${formattedTime}
            </p>
          </div>
          
          <p style="color: #888; font-size: 14px; text-align: center;">
            Please check in with them to ensure they take their medication.
          </p>
          
          <div style="text-align: center; margin-top: 20px;">
            <p style="color: #aaa; font-size: 12px;">
              Sent by MediCare Reminder App 💊
            </p>
          </div>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailResponse }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in notify-caretaker function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function handleWeeklyReport(supabase: any, userId: string): Promise<Response> {
  try {
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("name, caretaker_email, adherence_score")
      .eq("user_id", userId)
      .single();

    if (profileError || !profile || !profile.caretaker_email) {
      console.log("No caretaker email or profile not found");
      return new Response(
        JSON.stringify({ message: "No caretaker email configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get last 7 days of dose logs
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const { data: doseLogs, error: logsError } = await supabase
      .from("dose_logs")
      .select("status")
      .eq("user_id", userId)
      .gte("scheduled_time", weekAgo.toISOString());

    if (logsError) {
      console.error("Error fetching dose logs:", logsError);
      throw logsError;
    }

    const total = doseLogs?.length || 0;
    const taken = doseLogs?.filter((log: any) => log.status === "taken").length || 0;
    const missed = doseLogs?.filter((log: any) => log.status === "missed").length || 0;
    const weeklyScore = total > 0 ? Math.round((taken / total) * 100) : 100;

    const patientName = profile.name || "Your loved one";

    const emailResponse = await sendEmail(resendApiKey, {
      from: "MediCare Reminder <onboarding@resend.dev>",
      to: [profile.caretaker_email],
      subject: `📊 Weekly Report: ${patientName}'s Medication Adherence`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0;">📊 Weekly Adherence Report</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin-bottom: 20px; text-align: center;">
            <h2 style="color: #333; margin-top: 0;">${patientName}'s Progress</h2>
            <div style="font-size: 48px; font-weight: bold; color: ${weeklyScore >= 80 ? '#10b981' : weeklyScore >= 50 ? '#f59e0b' : '#ef4444'};">
              ${weeklyScore}%
            </div>
            <p style="color: #666; margin-bottom: 0;">Weekly Adherence Score</p>
          </div>
          
          <div style="display: flex; justify-content: space-around; margin-bottom: 20px;">
            <div style="text-align: center; padding: 15px; background: #d1fae5; border-radius: 8px; flex: 1; margin: 0 5px;">
              <div style="font-size: 24px; font-weight: bold; color: #10b981;">${taken}</div>
              <div style="color: #666; font-size: 12px;">Doses Taken</div>
            </div>
            <div style="text-align: center; padding: 15px; background: #fee2e2; border-radius: 8px; flex: 1; margin: 0 5px;">
              <div style="font-size: 24px; font-weight: bold; color: #ef4444;">${missed}</div>
              <div style="color: #666; font-size: 12px;">Doses Missed</div>
            </div>
            <div style="text-align: center; padding: 15px; background: #e0e7ff; border-radius: 8px; flex: 1; margin: 0 5px;">
              <div style="font-size: 24px; font-weight: bold; color: #6366f1;">${total}</div>
              <div style="color: #666; font-size: 12px;">Total Doses</div>
            </div>
          </div>
          
          <p style="color: #888; font-size: 14px; text-align: center;">
            ${weeklyScore >= 80 ? "Great job! Keep up the excellent work! 🎉" : 
              weeklyScore >= 50 ? "There's room for improvement. Consider checking in more often. 💪" : 
              "Please check in with them regularly to help improve adherence. ❤️"}
          </p>
          
          <div style="text-align: center; margin-top: 20px;">
            <p style="color: #aaa; font-size: 12px;">
              Sent by MediCare Reminder App 💊
            </p>
          </div>
        </div>
      `,
    });

    console.log("Weekly report sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, weeklyScore, emailResponse }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error sending weekly report:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

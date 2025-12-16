import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "No image provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a medical prescription analyzer. Extract ONLY medicine names from prescription images.

Rules:
- Return ONLY a JSON array of medicine name strings
- Extract medicine/drug names only (not dosages, frequencies, or instructions)
- Include both brand names and generic names if visible
- Clean up any OCR-like errors in medicine names
- If no medicines are found, return an empty array []
- Do NOT include dosage amounts (mg, ml, etc.) in the names
- Do NOT include instructions like "twice daily" or "after food"

Example output: ["Paracetamol", "Amoxicillin", "Omeprazole"]`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract all medicine names from this prescription image. Return only a JSON array of medicine name strings."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";
    
    // Parse the response - extract JSON array from the content
    let medicines: string[] = [];
    try {
      // Try to find JSON array in the response
      const jsonMatch = content.match(/\[[\s\S]*?\]/);
      if (jsonMatch) {
        medicines = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Fallback: try to extract medicine names from text
      const lines = content.split(/[,\n]/).map((l: string) => l.trim().replace(/["\[\]]/g, '')).filter((l: string) => l.length > 2);
      medicines = lines;
    }

    // Clean and validate medicine names
    medicines = medicines
      .filter((name: any) => typeof name === 'string' && name.length >= 2)
      .map((name: string) => name.trim())
      .filter((name: string) => !name.toLowerCase().match(/^\d+$|^mg$|^ml$|^tablet|^capsule|^daily|^twice|^once/))
      .slice(0, 15);

    console.log("Extracted medicines:", medicines);

    return new Response(
      JSON.stringify({ medicines }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error analyzing prescription:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to analyze prescription";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

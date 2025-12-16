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
            content: `You are an expert medical transcriptionist specializing in deciphering and accurately transcribing handwritten and printed medical prescriptions. Your role is to meticulously analyze prescription images and extract medication information with the highest degree of precision.

IMPORTANT RULES:
- Focus ONLY on extracting medication/drug names
- Handle messy handwriting, abbreviations, and poor image quality
- Recognize common medicine name patterns and suffixes (-ol, -in, -ide, -ine, -ate, -one, -pril, -sartan, etc.)
- Include both brand names and generic names if visible
- Clean up any errors in medicine names (e.g., "Paracetam0l" → "Paracetamol")
- If a name is partially visible but recognizable, include it
- Do NOT include dosage amounts (mg, ml, etc.) in the names
- Do NOT include instructions like "twice daily", "after food", "BD", "TDS"
- If no medicines are found, return an empty array []

COMMON MEDICINE CATEGORIES TO LOOK FOR:
- Antibiotics (Amoxicillin, Azithromycin, Ciprofloxacin, etc.)
- Pain relievers (Paracetamol, Ibuprofen, Diclofenac, etc.)
- Antacids/GI (Omeprazole, Pantoprazole, Ranitidine, etc.)
- Vitamins (Vitamin D, B12, Folic Acid, etc.)
- Blood pressure (Amlodipine, Losartan, Metoprolol, etc.)
- Diabetes (Metformin, Glimepiride, etc.)
- Antihistamines (Cetirizine, Loratadine, etc.)

Example handwritten prescription might show: "Tab Amox 500mg BD x 5 days" → Extract: "Amoxicillin"
Example: "Cap Omez 20 OD" → Extract: "Omeprazole" or "Omez"

OUTPUT FORMAT:
Return ONLY a valid JSON array of medicine name strings.
Example: ["Paracetamol", "Amoxicillin", "Omeprazole", "Vitamin D3"]`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Carefully analyze this prescription image. Extract ALL medicine/drug names you can identify, even if handwriting is messy. Return only a JSON array of medicine name strings, nothing else."
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

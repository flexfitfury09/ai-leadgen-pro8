import { GoogleGenAI } from "@google/genai";
import { Lead, Source } from '../types';

function extractJsonFromString(text: string): any {
    const match = text.match(/```json\s*([\s\S]*?)\s*```|(\[[\s\S]*\])/);
    if (match) {
        // Prefer the captured group from ```json ... ```, otherwise take the standalone array.
        const jsonStr = match[1] || match[2];
        try {
            return JSON.parse(jsonStr);
        } catch (e) {
            console.error("Failed to parse extracted JSON:", e);
            throw new Error("The AI returned a response, but it was not valid JSON.");
        }
    }
    throw new Error("Could not find a valid JSON array in the AI's response.");
}

export const generateLeads = async (
  niche: string,
  city: string,
  country: string,
  numberOfLeads: number,
  apiKey: string
): Promise<{ leads: Lead[]; sources: Source[] }> => {
  if (!apiKey) {
    throw new Error("Please enter your Gemini API Key to generate leads.");
  }
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Find up to ${numberOfLeads} local businesses for the niche '${niche}' in '${city}, ${country}'.
    For each business, find the following details: name, full address, phone number, website URL, a publicly available contact email, business type (e.g., "Restaurant", "Retail"), an estimated number of employees, and an estimated annual revenue.
    
    Your entire response MUST be ONLY a valid JSON array of objects inside a \`\`\`json markdown block.
    Do not include any text or explanation before or after the JSON block.

    Each JSON object must have these exact keys: "name", "address", "phone", "website", "email", "businessType", "employeeCount", "annualRevenue".
    If a piece of information is not available, return an empty string "" for that value. Do not invent data.

    Example:
    \`\`\`json
    [
      {
        "name": "Example Coffee Roasters",
        "address": "123 Main St, San Francisco, USA",
        "phone": "+1-555-123-4567",
        "website": "https://www.example.com",
        "email": "contact@example.com",
        "businessType": "Coffee Shop",
        "employeeCount": "10-20",
        "annualRevenue": "~$500k"
      }
    ]
    \`\`\`
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.1, // Lower temperature for more predictable, structured output
      },
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map(
      (chunk: any) => ({
        uri: chunk.web.uri,
        title: chunk.web.title,
      })
    ).filter(source => source.uri && source.title) || [];

    if (!response.text) {
        throw new Error("The AI returned an empty response. Please try refining your search.");
    }
    
    let leadsData: any[];
    try {
        leadsData = extractJsonFromString(response.text);
    } catch (e) {
        try {
            leadsData = JSON.parse(response.text);
        } catch (parseError) {
            console.error("Final parsing attempt failed. Response was:", response.text);
            throw new Error("The AI returned an invalid response format. Please try again.");
        }
    }


    if (!Array.isArray(leadsData)) {
      throw new Error("The AI response was not a valid list of leads.");
    }

    const validatedLeads: Lead[] = leadsData.map(item => ({
      name: item.name || '',
      address: item.address || '',
      phone: item.phone || '',
      website: item.website || '',
      email: item.email || '',
      businessType: item.businessType || '',
      employeeCount: item.employeeCount || '',
      annualRevenue: item.annualRevenue || '',
    }));

    return { leads: validatedLeads, sources };

  } catch (error) {
    console.error("Error generating leads from Gemini:", error);
    if (error instanceof Error && (error.message.includes('API key is invalid') || error.message.includes('API key not valid'))) {
        throw new Error("The provided API key is invalid. Please double-check the key and try again.");
    }
    if (error instanceof Error && error.message.includes("quota")) {
        throw new Error("You have exceeded your API quota. Please check your Google AI account for usage limits.");
    }
    throw new Error("Communication with the AI failed. This is often due to an invalid API key. Please verify your key. If the key is correct, check your browser's developer console (F12) for network errors (e.g., CORS).");
  }
};
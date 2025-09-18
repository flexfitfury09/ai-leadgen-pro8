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
    Find up to ${numberOfLeads} local businesses matching the niche '${niche}' in '${city}, ${country}'.
    For each business, find the business name, full address, phone number, website URL, a publicly available contact email address, business type (e.g., "Restaurant", "Retail"), estimated number of employees, and estimated annual revenue.
    Your entire response MUST be a valid JSON array of objects, where each object represents a business.
    Do not include any text, explanation, or markdown formatting (like \`\`\`json) before or after the JSON array.

    The JSON object for each lead must have these exact keys: "name", "address", "phone", "website", "email", "businessType", "employeeCount", "annualRevenue".
    If a piece of information is not available for any field, return an empty string "" for that value. Do not make up data.

    Example format:
    [
      {
        "name": "Example Business Name",
        "address": "123 Example St, City, Country",
        "phone": "+1-555-123-4567",
        "website": "https://www.example.com",
        "email": "contact@example.com",
        "businessType": "Coffee Shop",
        "employeeCount": "10-20",
        "annualRevenue": "~$500k"
      }
    ]
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
    
    // Some models wrap the JSON in markdown, so we try to extract it.
    // If not, we assume the whole response is the JSON.
    let leadsData: any[];
    try {
        leadsData = extractJsonFromString(response.text);
    } catch (e) {
        // If extraction fails, try parsing the whole text directly.
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

    // Validate structure of each lead object
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
        throw new Error("The provided API key is invalid. Please check the key and try again.");
    }
    if (error instanceof Error && error.message.includes("quota")) {
        throw new Error("You have exceeded your API quota. Please check your Google AI account.");
    }
    throw new Error("Failed to communicate with the AI service. The API key might be invalid or there could be a network issue.");
  }
};
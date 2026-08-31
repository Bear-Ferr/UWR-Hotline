export interface AIVisionDiagnosis {
  speciesName: string;
  scientificName?: string;
  category: 'Passerine' | 'Raptors' | 'Herons' | 'Precocials' | 'Seabirds' | 'Mammals' | 'Fawns/Bears' | 'Raccoons' | 'Herptiles';
  isNative: boolean;
  isProhibited: boolean;
  ageStage: 'Naked Baby / Nestling' | 'Feathered Fledgling' | 'Adult / Older' | 'Unknown';
  physicalCondition: 'Injured / Sick / Bleeding' | 'Cat Caught / Bite' | 'Dog Attack' | 'Orphaned / Nestling' | 'Feathered Fledgling' | 'Healthy Trapped in Live Trap';
  confidenceScore: number; // e.g. 0.95
  visualObservations: string[];
  recommendedAction: string;
  rawAnalysisText: string;
}

export async function analyzeWildlifeImage(
  base64Image: string,
  customApiKey?: string
): Promise<AIVisionDiagnosis> {
  const activeKey =
    customApiKey ||
    localStorage.getItem('uwr_gemini_api_key') ||
    import.meta.env.VITE_GEMINI_API_KEY ||
    '';

  if (!activeKey) {
    throw new Error('MISSING_API_KEY');
  }

  // Strip prefix if present (e.g. data:image/jpeg;base64,)
  const cleanedBase64 = base64Image.includes('base64,')
    ? base64Image.split('base64,')[1]
    : base64Image;

  const mimeType = base64Image.includes('data:image/png') ? 'image/png' : 'image/jpeg';

  const systemPrompt = `You are an expert Wildlife Rehabilitator and Taxonomist for Umpqua Wildlife Rescue in Douglas County, Oregon.
Analyze the uploaded photo of wildlife and provide a strict JSON response with key diagnostic details.

Return ONLY a valid JSON object matching this exact TypeScript structure:
{
  "speciesName": "Common Name of species",
  "scientificName": "Genus species",
  "category": "Passerine" | "Raptors" | "Herons" | "Precocials" | "Seabirds" | "Mammals" | "Fawns/Bears" | "Raccoons" | "Herptiles",
  "isNative": true | false,
  "isProhibited": true | false,
  "ageStage": "Naked Baby / Nestling" | "Feathered Fledgling" | "Adult / Older" | "Unknown",
  "physicalCondition": "Injured / Sick / Bleeding" | "Cat Caught / Bite" | "Dog Attack" | "Orphaned / Nestling" | "Feathered Fledgling" | "Healthy Trapped in Live Trap",
  "confidenceScore": 0.95,
  "visualObservations": ["observation 1", "observation 2"],
  "recommendedAction": "Action advice for hotline dispatcher"
}

Note Oregon State Non-Native / Prohibited species: Opossum, Nutria, Fox Squirrel, Starling, House Sparrow, Eurasian Collared Dove, Adult Raccoon, Coyote, Cougar, Marine Mammal/Seal.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${activeKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: systemPrompt },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: cleanedBase64
                  }
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            response_mime_type: 'application/json'
          }
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      if (errText.includes('leaked')) {
        throw new Error('API Key Disabled: Google reported this API key as leaked because it was posted in public code. Please generate a new API key in Google AI Studio and paste it in the key settings box.');
      }
      throw new Error(`Gemini API Error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const parsed = JSON.parse(rawText);

    return {
      speciesName: parsed.speciesName || 'Unknown Wildlife Species',
      scientificName: parsed.scientificName || '',
      category: parsed.category || 'Passerine',
      isNative: parsed.isNative ?? true,
      isProhibited: parsed.isProhibited ?? false,
      ageStage: parsed.ageStage || 'Unknown',
      physicalCondition: parsed.physicalCondition || 'Injured / Sick / Bleeding',
      confidenceScore: parsed.confidenceScore || 0.9,
      visualObservations: parsed.visualObservations || ['Visual analysis completed.'],
      recommendedAction: parsed.recommendedAction || 'Consult UWR Rehabber roster based on species category.',
      rawAnalysisText: rawText
    };
  } catch (err: any) {
    throw new Error(err.message || String(err));
  }
}

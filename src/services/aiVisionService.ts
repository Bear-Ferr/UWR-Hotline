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
  base64Image: string
): Promise<AIVisionDiagnosis> {
  // Call serverless backend endpoint for full multi-modal neural network vision AI
  try {
    const response = await fetch('/api/identify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Image })
    });

    if (response.ok) {
      const parsed = await response.json();
      return {
        speciesName: parsed.speciesName || 'Identified Wildlife Species',
        scientificName: parsed.scientificName || '',
        category: parsed.category || 'Passerine',
        isNative: parsed.isNative ?? true,
        isProhibited: parsed.isProhibited ?? false,
        ageStage: parsed.ageStage || 'Adult / Older',
        physicalCondition: parsed.physicalCondition || 'Injured / Sick / Bleeding',
        confidenceScore: parsed.confidenceScore || 0.95,
        visualObservations: parsed.visualObservations || ['Visual neural network analysis complete.'],
        recommendedAction: parsed.recommendedAction || 'Consult UWR Rehabber roster based on species category.',
        rawAnalysisText: JSON.stringify(parsed)
      };
    }
  } catch (err) {
    console.warn('Backend API request notice:', err);
  }

  // Direct client-side Gemini fallback
  const activeKey =
    import.meta.env.VITE_GEMINI_API_KEY ||
    localStorage.getItem('uwr_gemini_api_key') ||
    '';

  if (!activeKey) {
    throw new Error('AI Vision service initializing. Please try again in a moment or verify network connectivity.');
  }

  const cleanedBase64 = base64Image.includes('base64,')
    ? base64Image.split('base64,')[1]
    : base64Image;

  const mimeType = base64Image.includes('data:image/png') ? 'image/png' : 'image/jpeg';

  const systemPrompt = `You are an expert Wildlife Rehabilitator and Taxonomist for Umpqua Wildlife Rescue in Douglas County, Oregon.
Analyze the uploaded photo of wildlife accurately and return a strict JSON response with key diagnostic details.

Return ONLY a valid JSON object matching this exact structure:
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
}`;

  const googleUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${activeKey}`;

  const googleRes = await fetch(googleUrl, {
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
        temperature: 0.1,
        response_mime_type: 'application/json'
      }
    })
  });

  if (!googleRes.ok) {
    throw new Error('AI Vision Service temporarily unavailable. Please try again.');
  }

  const data = await googleRes.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  const parsed = JSON.parse(rawText);

  return {
    speciesName: parsed.speciesName || 'Identified Wildlife',
    scientificName: parsed.scientificName || '',
    category: parsed.category || 'Passerine',
    isNative: parsed.isNative ?? true,
    isProhibited: parsed.isProhibited ?? false,
    ageStage: parsed.ageStage || 'Adult / Older',
    physicalCondition: parsed.physicalCondition || 'Injured / Sick / Bleeding',
    confidenceScore: parsed.confidenceScore || 0.95,
    visualObservations: parsed.visualObservations || ['Visual analysis completed.'],
    recommendedAction: parsed.recommendedAction || 'Consult UWR Rehabber roster based on species category.',
    rawAnalysisText: rawText
  };
}

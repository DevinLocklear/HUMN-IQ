// api/grade.js
export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { imageBase64, mediaType } = req.body;
  if (!imageBase64 || !mediaType) return res.status(400).json({ error: 'Missing fields' });
  if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ error: 'API key not configured' });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'base64', media_type: mediaType, data: imageBase64 }
              },
              {
                type: 'text',
                text: 'Look at this trading card image and assess its physical condition.'
              }
            ]
          },
          {
            role: 'assistant',
            content: 'I will analyze this trading card condition and provide a grading assessment in JSON format.\n\n```json\n{'
          },
          {
            role: 'user',
            content: 'Complete the JSON with cardName, set, overallGrade (number), psaEquivalent, centering (score, frontLeftRight, frontTopBottom, notes), corners (score, notes), edges (score, notes), surface (score, notes), submitRecommendation (boolean), submitReason, estimatedValue (raw, psa8, psa9, psa10). Return only the completed JSON.'
          }
        ]
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.error?.message || 'API error' });

    // Log full response for debugging
    console.log('API response:', JSON.stringify(data.content));

    const textBlock = data.content?.find(b => b.type === 'text');
    const text = textBlock?.text || '';

    // Try to find JSON in the response
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');

    if (jsonStart === -1 || jsonEnd === -1) {
      // Return raw text for debugging
      return res.status(500).json({ error: 'No JSON found', raw: text.slice(0, 500) });
    }

    const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
    return res.status(200).json(parsed);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

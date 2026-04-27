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
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: imageBase64 }
            },
            {
              type: 'text',
              text: `Look at this trading card image and assess its physical condition.

Return ONLY a JSON object with no other text:
{
  "cardName": "name on card",
  "set": "set name",
  "overallGrade": 8.5,
  "psaEquivalent": "PSA 8",
  "centering": {"score": 9, "frontLeftRight": "55/45", "frontTopBottom": "52/48", "notes": "notes"},
  "corners": {"score": 8, "notes": "notes"},
  "edges": {"score": 9, "notes": "notes"},
  "surface": {"score": 8, "notes": "notes"},
  "submitRecommendation": true,
  "submitReason": "reason",
  "estimatedValue": {"raw": "$45-60", "psa8": "$120-150", "psa9": "$200-250", "psa10": "$500+"}
}`
            }
          ]
        }]
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.error?.message || 'API error' });

    const textBlock = data.content?.find(b => b.type === 'text');
    const text = textBlock?.text || '';
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) return res.status(500).json({ error: 'No JSON in response' });

    const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
    return res.status(200).json(parsed);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

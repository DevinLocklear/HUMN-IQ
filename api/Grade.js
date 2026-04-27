// api/grade.js
// Vercel serverless function — proxies requests to Anthropic API
// API key is stored as ANTHROPIC_API_KEY in Vercel environment variables

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { imageBase64, mediaType } = req.body;

  if (!imageBase64 || !mediaType) {
    return res.status(400).json({ error: 'Missing imageBase64 or mediaType' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

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
        system: `You are an expert Pokemon TCG card grader with years of experience grading for PSA, BGS, and CGC. 
Analyze card images and provide detailed grading assessments. 
Always respond with valid JSON only, no markdown, no explanation outside the JSON.`,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: imageBase64 }
            },
            {
              type: 'text',
              text: `Grade this Pokemon card like a professional PSA grader. Analyze the four key criteria and provide scores.

Respond ONLY with this exact JSON format:
{
  "cardName": "card name if visible",
  "set": "set name if visible",
  "overallGrade": 8.5,
  "psaEquivalent": "PSA 8",
  "centering": {
    "score": 9,
    "frontLeftRight": "55/45",
    "frontTopBottom": "52/48",
    "notes": "Slightly off-center left to right"
  },
  "corners": {
    "score": 8,
    "notes": "Minor wear on top-right corner, others clean"
  },
  "edges": {
    "score": 9,
    "notes": "Clean edges with minimal whitening"
  },
  "surface": {
    "score": 8,
    "notes": "Light scratch near center, print is clean"
  },
  "submitRecommendation": true,
  "submitReason": "Strong candidate for PSA 8-9. Surface scratch may cost a point.",
  "estimatedValue": {
    "raw": "$45-60",
    "psa8": "$120-150",
    "psa9": "$200-250",
    "psa10": "$500+"
  }
}`
            }
          ]
        }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Anthropic API error' });
    }

    const text = data.content?.[0]?.text || '';

    try {
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      return res.status(200).json(parsed);
    } catch (parseErr) {
      return res.status(500).json({ error: 'Failed to parse grading result', raw: text });
    }

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

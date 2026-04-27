// api/grade.js
// Vercel serverless function — proxies requests to Anthropic API

export const config = {
  maxDuration: 60,
};

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
        system: 'You are a trading card condition analyst. Analyze card images and return a JSON condition report. Respond with valid JSON only.',
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: imageBase64 }
            },
            {
              type: 'text',
              text: 'Analyze the condition of this trading card. Return ONLY valid JSON in this exact format, no other text: {"cardName":"name if visible","set":"set if visible","overallGrade":8.5,"psaEquivalent":"PSA 8","centering":{"score":9,"frontLeftRight":"55/45","frontTopBottom":"52/48","notes":"description"},"corners":{"score":8,"notes":"description"},"edges":{"score":9,"notes":"description"},"surface":{"score":8,"notes":"description"},"submitRecommendation":true,"submitReason":"explanation","estimatedValue":{"raw":"$45-60","psa8":"$120-150","psa9":"$200-250","psa10":"$500+"}}'
            }
          ]
        }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'API error' });
    }

    // Find the text content block — skip any non-text blocks
    const textBlock = data.content?.find(block => block.type === 'text');
    const text = textBlock?.text || '';

    // Extract JSON from the response — find first { and last }
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');

    if (jsonStart === -1 || jsonEnd === -1) {
      return res.status(500).json({ error: 'No JSON found in response' });
    }

    const jsonStr = text.slice(jsonStart, jsonEnd + 1);
    const parsed = JSON.parse(jsonStr);
    return res.status(200).json(parsed);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

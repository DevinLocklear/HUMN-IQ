// api/grade.js
export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { imageUrl } = req.body;
  if (!imageUrl) return res.status(400).json({ error: 'Missing imageUrl' });
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
        model: 'claude-haiku-4-5-20251001', // Changed model for better compatibility
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'url', url: imageUrl }
            },
            {
              type: 'text',
              text: `Please analyze this Pokemon trading card's condition and provide a detailed assessment in JSON format: {"cardName":"name","set":"set","overallGrade":8.5,"psaEquivalent":"PSA 8","centering":{"score":9,"frontLeftRight":"55/45","frontTopBottom":"52/48","notes":"notes"},"corners":{"score":8,"notes":"notes"},"edges":{"score":9,"notes":"notes"},"surface":{"score":8,"notes":"notes"},"submitRecommendation":true,"submitReason":"reason","estimatedValue":{"raw":"$45-60","psa8":"$120-150","psa9":"$200-250","psa10":"$500+"}}`
            }
          ]
        }]
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.error?.message || 'API error' });

    // Check for refusal
    if (data.stop_reason === 'refusal') {
      return res.status(400).json({
        error: 'Request blocked by safety classifier',
        suggestion: 'Try rephrasing your prompt or using a different approach'
      });
    }

    const textBlock = data.content?.find(b => b.type === 'text');
    let text = textBlock?.text || '';
    text = text.replace(/<[^>]+>[\s\S]*?<\/[^>]+>/g, '').trim();

    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) {
      return res.status(500).json({ error: 'No JSON found', raw: text.slice(0, 300) });
    }

    const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
    return res.status(200).json(parsed);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
/**
 * Vercel Serverless Function — Food Photo Analyzer
 * POST /api/analyze-food
 * Body: { image: base64string }
 *
 * OpenAI API key stored in Vercel env vars (OPENAI_API_KEY)
 * User never sees the key — all calls go through this backend
 */

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://bodybvilder.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { image } = req.body || {};

  if (!image) {
    return res.status(400).json({ error: 'No image provided' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server config error' });
  }

  const prompt = `You are a precise nutrition expert. Analyze this food photo and return macro data.

Respond ONLY with valid JSON, no other text:
{
  "foods": [
    {
      "name": "food name",
      "portion": "estimated portion",
      "calories": 350,
      "protein": 25,
      "carbs": 30,
      "fat": 12,
      "fiber": 3
    }
  ],
  "total": {
    "calories": 350,
    "protein": 25,
    "carbs": 30,
    "fat": 12,
    "fiber": 3
  },
  "confidence": "high",
  "notes": "brief note"
}

Rules: realistic portions, all values in grams, calories in kcal, confidence: high/medium/low`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${image}`,
                  detail: 'low', // ~$0.002 per image
                },
              },
            ],
          },
        ],
        max_tokens: 600,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('OpenAI error:', err);
      return res.status(502).json({ error: 'AI analysis failed. Try again.' });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      return res.status(502).json({ error: 'No response from AI' });
    }

    // Parse JSON response
    const result = JSON.parse(content);
    return res.status(200).json(result);

  } catch (err) {
    console.error('Food scan error:', err.message);
    return res.status(500).json({ error: 'Analysis failed. Try again.' });
  }
}

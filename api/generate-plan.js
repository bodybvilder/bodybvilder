/**
 * Vercel Serverless Function — AI Workout Plan Generator
 * POST /api/generate-plan
 * Body: { goal, level, daysPerWeek, equipment, focusMuscles }
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://bodybvilder.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Server config error' });

  const { goal, level, daysPerWeek, equipment, focusMuscles } = req.body || {};

  if (!goal || !level || !daysPerWeek) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const equipmentStr = Array.isArray(equipment) && equipment.length
    ? equipment.join(', ')
    : 'bodyweight only';

  const focusStr = Array.isArray(focusMuscles) && focusMuscles.length
    ? focusMuscles.join(', ')
    : 'full body';

  const prompt = `You are an expert bodybuilding coach. Create a ${daysPerWeek}-day per week workout plan.

User profile:
- Goal: ${goal}
- Fitness level: ${level}
- Equipment: ${equipmentStr}
- Focus: ${focusStr}

Available exercises (use ONLY these exercise IDs):
Chest: pushup, incline-pushup, decline-pushup, diamond-pushup, wide-pushup, dumbbell-fly, cable-fly, incline-dumbbell-press
Back: pullup, chinup, bodyweight-row, barbell-row, dumbbell-row, lat-pulldown, seated-cable-row, dead-hang, superman, barbell-deadlift, romanian-deadlift
Shoulders: pike-pushup, lateral-raise, front-raise, overhead-press, arnold-press, face-pull, cable-lateral-raise, shoulder-tap
Triceps: dip, bench-dip, tricep-extension, skull-crusher, tricep-pushdown, cable-kickback
Arms (biceps): bicep-curl, hammer-curl, concentration-curl, barbell-curl, cable-curl
Legs: squat, lunge, glute-bridge, jump-squat, single-leg-squat, calf-raise, barbell-squat, bulgarian-split-squat
Core: plank, crunch, mountain-climber, leg-raise, russian-twist, hollow-body

Respond ONLY with valid JSON, no other text:
{
  "planName": "Short descriptive plan name",
  "description": "1-2 sentence description",
  "daysPerWeek": ${daysPerWeek},
  "weeks": 4,
  "days": [
    {
      "dayNumber": 1,
      "name": "Day name (e.g. Push, Pull, Legs, Full Body)",
      "focus": "muscle groups focused",
      "exercises": [
        {
          "exerciseId": "exercise-id-from-list",
          "sets": 3,
          "reps": 12,
          "rest": 60,
          "notes": "optional form tip"
        }
      ]
    }
  ]
}

Rules:
- Only use exercise IDs from the list above
- Match equipment to what user has
- ${daysPerWeek} unique training days
- 4-7 exercises per day
- Beginner: 3 sets, intermediate: 3-4 sets, advanced: 4-5 sets
- Rest in seconds between sets`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      return res.status(502).json({ error: 'AI generation failed' });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) return res.status(502).json({ error: 'No response' });

    const plan = JSON.parse(content);
    return res.status(200).json(plan);
  } catch (err) {
    console.error('Plan generation error:', err.message);
    return res.status(500).json({ error: 'Generation failed. Try again.' });
  }
}

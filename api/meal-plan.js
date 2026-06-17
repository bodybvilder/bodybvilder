/**
 * Vercel Serverless Function — AI Meal Plan Generator
 * POST /api/meal-plan
 * Body: { weightKg, heightCm, age, sex, activityLevel, goal, mealsPerDay, dietType }
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Server config error' });

  const {
    weightKg, heightCm, age, sex = 'male',
    activityLevel = 'moderate', goal = 'maintain',
    mealsPerDay = 4, dietType = 'standard'
  } = req.body || {};

  if (!weightKg || !heightCm || !age) {
    return res.status(400).json({ error: 'Missing required fields: weightKg, heightCm, age' });
  }

  // Mifflin-St Jeor BMR
  const bmr = sex === 'female'
    ? 10 * weightKg + 6.25 * heightCm - 5 * age - 161
    : 10 * weightKg + 6.25 * heightCm - 5 * age + 5;

  const activityMultipliers = {
    sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, veryActive: 1.9
  };
  const tdee = Math.round(bmr * (activityMultipliers[activityLevel] || 1.55));

  const goalCalories = {
    cut: Math.round(tdee * 0.8),
    maintain: tdee,
    bulk: Math.round(tdee * 1.15),
    agressiveBulk: Math.round(tdee * 1.25),
  };
  const targetCalories = goalCalories[goal] || tdee;

  // Macro splits by goal
  const macroSplits = {
    cut:          { protein: 0.40, carbs: 0.35, fat: 0.25 },
    maintain:     { protein: 0.30, carbs: 0.45, fat: 0.25 },
    bulk:         { protein: 0.30, carbs: 0.50, fat: 0.20 },
    agressiveBulk:{ protein: 0.25, carbs: 0.55, fat: 0.20 },
  };
  const split = macroSplits[goal] || macroSplits.maintain;
  const proteinG = Math.round((targetCalories * split.protein) / 4);
  const carbsG   = Math.round((targetCalories * split.carbs) / 4);
  const fatG     = Math.round((targetCalories * split.fat) / 9);

  const goalLabel = { cut: 'Fat Loss (Cut)', maintain: 'Maintain', bulk: 'Muscle Gain (Bulk)', agressiveBulk: 'Aggressive Bulk' }[goal] || goal;

  const prompt = `You are a professional sports nutritionist specializing in bodybuilding.

Create a FULL one-day meal plan for this athlete:
- Weight: ${weightKg}kg | Height: ${heightCm}cm | Age: ${age} | Sex: ${sex}
- Activity: ${activityLevel} | Goal: ${goalLabel}
- TDEE: ${tdee} kcal/day → Target: ${targetCalories} kcal
- Macros: ${proteinG}g protein / ${carbsG}g carbs / ${fatG}g fat
- Meals per day: ${mealsPerDay}
- Diet preference: ${dietType}

IMPORTANT: Make meals practical, bodybuilder-focused, and hit the macro targets precisely.
Include pre/post workout meals if training is involved.

Respond ONLY with valid JSON, no other text:
{
  "tdee": ${tdee},
  "targetCalories": ${targetCalories},
  "goal": "${goalLabel}",
  "macros": { "protein": ${proteinG}, "carbs": ${carbsG}, "fat": ${fatG} },
  "meals": [
    {
      "name": "Meal name (e.g. Breakfast, Pre-Workout, Post-Workout Shake, Lunch, Dinner, Night Snack)",
      "time": "Suggested time (e.g. 7:00 AM)",
      "calories": 500,
      "macros": { "protein": 40, "carbs": 50, "fat": 10 },
      "foods": [
        { "name": "Food item with amount", "calories": 200, "protein": 20, "carbs": 10, "fat": 5 }
      ],
      "notes": "Optional tip (e.g. eat 30 min pre-workout)"
    }
  ],
  "tips": ["3-4 practical nutrition tips for this athlete's goal"],
  "supplements": ["Optional: 2-3 evidence-based supplement suggestions if relevant"]
}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2500,
        temperature: 0.6,
      }),
    });

    if (!response.ok) return res.status(502).json({ error: 'AI generation failed' });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) return res.status(502).json({ error: 'No response from AI' });

    // Strip markdown code fences if present
    const clean = content.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    const plan = JSON.parse(clean);
    return res.status(200).json(plan);
  } catch (err) {
    console.error('Meal plan error:', err.message);
    return res.status(500).json({ error: 'Generation failed. Try again.' });
  }
}

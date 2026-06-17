/**
 * Vercel Serverless Function — AI Personal Trainer
 * POST /api/trainer
 * Body: { message, history, userContext }
 *
 * GPT-4o with full user context — acts as a professional bodybuilding coach
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://bodybvilder.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Server config error' });

  const { message, chatHistory = [], userContext = {} } = req.body || {};
  if (!message) return res.status(400).json({ error: 'No message' });

  // Build system prompt with full user context
  const {
    name = 'Athlete',
    stats = {},
    recentWorkouts = [],
    currentPlan = null,
    goals = [],
    level = 'beginner',
    equipment = [],
  } = userContext;

  const workoutSummary = recentWorkouts.length > 0
    ? recentWorkouts.slice(0, 5).map(w =>
        `- ${w.exerciseName}: ${w.reps} reps, form score ${w.score}/100, ${Math.round(w.duration / 60)}min`
      ).join('\n')
    : 'No recent workouts yet.';

  const systemPrompt = `You are an elite AI personal trainer and bodybuilding coach inside the BODYBVILDER app. Your name is "Coach B".

You know everything about your athlete:
- Name: ${name}
- Fitness level: ${level}
- Total workouts completed: ${stats.workoutsCompleted || 0}
- Current streak: ${stats.streak || 0} days
- Total reps ever: ${stats.totalReps || 0}
- Total training time: ${Math.round((stats.totalTime || 0) / 60)} minutes
- Goals: ${goals.length ? goals.join(', ') : 'general fitness'}
- Equipment: ${equipment.length ? equipment.join(', ') : 'bodyweight'}

Recent workout history:
${workoutSummary}

${currentPlan ? `Current training plan: ${currentPlan.planName} (${currentPlan.daysPerWeek}x/week)` : 'No active training plan.'}

Your personality:
- Motivating but direct — like a professional coach who tells you the truth
- Data-driven — reference their actual scores and stats when giving advice
- Specific — give exact sets, reps, rest times, not vague advice
- Knowledgeable — IFBB/NPC bodybuilding standards, hypertrophy science, progressive overload
- Concise — max 3-4 short paragraphs per response, no fluff

You can help with:
- Analyzing their form scores and what to improve
- Creating workout plans and adjustments
- Nutrition advice (macros, meal timing, bulking/cutting)
- Bodybuilding posing advice
- Recovery and rest advice
- Motivation and accountability
- Answering any fitness/bodybuilding question

Always personalize your response using their actual data. If they have low form scores, mention it. If they haven't worked out in days, address it.

Keep responses concise and actionable. Format lists with simple dashes, no markdown headers.`;

  // Build messages array with chat history (last 10 messages)
  const messages = [
    { role: 'system', content: systemPrompt },
    ...chatHistory.slice(-10).map(m => ({
      role: m.role,
      content: m.content,
    })),
    { role: 'user', content: message },
  ];

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages,
        max_tokens: 500,
        temperature: 0.75,
      }),
    });

    if (!response.ok) {
      return res.status(502).json({ error: 'AI unavailable. Try again.' });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim();
    if (!reply) return res.status(502).json({ error: 'No response' });

    return res.status(200).json({ reply });
  } catch (err) {
    console.error('Trainer error:', err.message);
    return res.status(500).json({ error: 'Failed. Try again.' });
  }
}

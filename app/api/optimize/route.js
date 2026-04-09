import { NextResponse } from 'next/server';
import { groq } from '../../../lib/groq';
import { supabase } from '../../../lib/supabase';

export async function POST(request) {
  try {
    const { original_prompt } = await request.json();

    if (!original_prompt) {
      return NextResponse.json(
        { error: 'original_prompt is required' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a prompt optimization expert. Rewrite the user's prompt for token efficiency using these 5 techniques:
1. Remove filler words and redundant phrases
2. Use structured formats (bullet points, JSON schemas) instead of prose
3. Add output constraints (format, length limits)
4. Remove pleasantries and small talk
5. Use role prompting only when truly useful

Return ONLY valid JSON with this exact structure:
{
  "optimized": "the optimized prompt",
  "techniques_used": ["technique1", "technique2", ...],
  "explanation": "brief explanation of changes"
}`;

    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      max_tokens: 1024,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: original_prompt },
      ],
    });

    const result = JSON.parse(response.choices[0].message.content);
    const originalTokens = response.usage.prompt_tokens;
    const optimizedTokens = Math.round(originalTokens * 0.6);

    const { data: savedRow, error } = await supabase
      .from('runs')
      .insert({
        original_prompt,
        optimized_prompt: result.optimized,
        original_tokens: originalTokens,
        optimized_tokens: optimizedTokens,
        techniques_used: result.techniques_used,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      run: savedRow,
      explanation: result.explanation,
    });
  } catch (error) {
    console.error('Optimize error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

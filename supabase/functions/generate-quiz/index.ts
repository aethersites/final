import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();

    if (!text || typeof text !== 'string') {
      throw new Error('Text is required');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Generating quiz questions for text:', text.slice(0, 100));

    // Create a detailed prompt for generating quiz questions
    const prompt = `You are an expert educator creating multiple-choice quiz questions. Based on the following text, create 5-8 quiz questions that test comprehension and key concepts.

Text to analyze:
"""
${text}
"""

Requirements:
- Create multiple-choice questions with exactly 4 options each (A, B, C, D)
- Questions should test understanding of key concepts, facts, and relationships
- Make questions challenging but fair
- Ensure only one answer is clearly correct
- Vary question types (factual recall, conceptual understanding, application)
- Each question should be self-contained and clear

Return your response as a JSON array of objects, where each object has:
- "question": the question text
- "options": array of exactly 4 answer choices
- "correctAnswer": the index (0-3) of the correct answer

Example format:
[
  {
    "question": "What is the main concept discussed?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 2
  }
]

Return ONLY the JSON array, no other text.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert educator creating quiz questions. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI response:', data);

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid OpenAI response format');
    }

    const generatedContent = data.choices[0].message.content.trim();
    console.log('Generated content:', generatedContent);

    // Parse the JSON response
    let questions;
    try {
      questions = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Content that failed to parse:', generatedContent);
      throw new Error('Failed to parse generated questions as JSON');
    }

    if (!Array.isArray(questions)) {
      throw new Error('Generated content is not an array');
    }

    // Validate and add IDs to questions
    const validatedQuestions = questions.map((q, index) => {
      if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 || typeof q.correctAnswer !== 'number') {
        throw new Error(`Invalid question format at index ${index}`);
      }
      
      if (q.correctAnswer < 0 || q.correctAnswer > 3) {
        throw new Error(`Invalid correct answer index at question ${index}`);
      }

      return {
        id: index + 1,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer
      };
    });

    console.log(`Generated ${validatedQuestions.length} quiz questions`);

    return new Response(
      JSON.stringify({ questions: validatedQuestions }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in generate-quiz function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An error occurred while generating quiz questions'
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
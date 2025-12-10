import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text } = await req.json()

    if (!text || !text.trim()) {
      return new Response(
        JSON.stringify({ error: 'Text content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Use the system OpenAI API key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')

    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const prompt = `You are an expert educator creating study flashcards. Based on the following text, generate exactly 15-20 comprehensive flashcards that cover the key concepts, definitions, and important details.

Text to analyze:
${text}

Please respond with a JSON array of flashcard objects in this exact format:
[
  {
    "question": "Clear, specific question about a key concept",
    "answer": "Comprehensive answer that thoroughly explains the concept"
  }
]

Guidelines:
- Focus on the most important concepts and facts
- Make questions clear and specific
- Provide detailed, educational answers
- Cover different aspects of the material
- Use varied question types (what, how, why, when, where)
- Ensure answers are comprehensive but concise
- Only return the JSON array, no additional text`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('OpenAI API error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to generate flashcards from OpenAI API' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = await response.json()
    const generatedText = data.choices[0]?.message?.content

    if (!generatedText) {
      return new Response(
        JSON.stringify({ error: 'No content generated from OpenAI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    try {
      // Parse the JSON response from OpenAI
      const flashcards = JSON.parse(generatedText)
      
      // Add IDs to flashcards
      const flashcardsWithIds = flashcards.map((card: any, index: number) => ({
        id: index + 1,
        question: card.question,
        answer: card.answer
      }))

      return new Response(
        JSON.stringify({ flashcards: flashcardsWithIds }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError)
      console.log('Raw response:', generatedText)
      
      return new Response(
        JSON.stringify({ error: 'Failed to parse generated flashcards' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
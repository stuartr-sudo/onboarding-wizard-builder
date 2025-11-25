import OpenAI from 'openai'
import { NextResponse } from 'next/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { question, previousAnswers, context } = await req.json()

    if (!question) {
      return NextResponse.json({ error: 'No question provided' }, { status: 400 })
    }

    // Build context from previous answers
    const contextPrompt = previousAnswers && Object.keys(previousAnswers).length > 0
      ? `\n\nBased on previous answers:\n${Object.entries(previousAnswers).map(([q, a]) => `- ${q}: ${a}`).join('\n')}`
      : ''

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-2024-08-06',
      messages: [
        {
          role: 'system',
          content: `You are helping someone fill out an app discovery questionnaire. Provide intelligent, concise suggestions based on the question and any previous context. Keep answers brief and professional. For yes/no questions, just say "Yes" or "No" with brief reasoning.`
        },
        {
          role: 'user',
          content: `Question: ${question}${contextPrompt}${context ? `\n\nAdditional context: ${context}` : ''}\n\nProvide a helpful, concise answer:`
        }
      ],
      max_tokens: 150,
      temperature: 0.7,
    })

    const suggestion = completion.choices[0]?.message?.content || ''

    return NextResponse.json({ suggestion })
  } catch (error) {
    console.error('Error generating AI suggestion:', error)
    return NextResponse.json({ error: 'AI suggestion failed' }, { status: 500 })
  }
}



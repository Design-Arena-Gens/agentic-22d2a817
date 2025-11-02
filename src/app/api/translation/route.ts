import { NextResponse } from 'next/server';

const providerUrl = process.env.TRANSLATION_WEBHOOK_URL;
const providerToken = process.env.TRANSLATION_WEBHOOK_TOKEN;

export async function POST(request: Request) {
  const { text, targetLanguage, sourceLanguage } = await request.json();

  if (!text || !targetLanguage) {
    return NextResponse.json({ error: 'Missing text or targetLanguage' }, { status: 400 });
  }

  if (!providerUrl) {
    return NextResponse.json({
      translatedText: text,
      targetLanguage,
      sourceLanguage: sourceLanguage ?? 'auto',
      provider: 'fallback'
    });
  }

  try {
    const response = await fetch(providerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(providerToken ? { Authorization: `Bearer ${providerToken}` } : {})
      },
      body: JSON.stringify({ text, targetLanguage, sourceLanguage })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return NextResponse.json(
        { error: 'Translation provider error', details: errorBody },
        { status: response.status }
      );
    }

    const payload = await response.json();

    return NextResponse.json({
      translatedText: payload.translatedText ?? payload.text ?? text,
      targetLanguage: payload.targetLanguage ?? targetLanguage,
      sourceLanguage: payload.sourceLanguage ?? sourceLanguage ?? 'auto',
      provider: payload.provider ?? 'external'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Translation request failed', details: (error as Error).message },
      { status: 500 }
    );
  }
}

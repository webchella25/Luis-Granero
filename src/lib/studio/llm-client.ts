import Anthropic from '@anthropic-ai/sdk';

export interface LLMMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface LLMConfig {
  llm_motor?: string;
  openai_api_key?: string;
  openrouter_api_key?: string;
  gemini_api_key?: string;
}

export interface LLMCallOptions {
  system: string;
  messages: LLMMessage[];
  maxTokens?: number;
  model?: 'main' | 'fast'; // 'main' = guión completo, 'fast' = SEO/hooks/calendario
  canalConfig: LLMConfig;
}

// Modelos por motor
const CLAUDE_MODELS = {
  main: 'claude-sonnet-4-6',
  fast: 'claude-haiku-4-5-20251001',
};
const OPENAI_MODELS = {
  main: 'gpt-4o',
  fast: 'gpt-4o-mini',
};
const ALLOW_PAID_OPENROUTER_FALLBACK = process.env.OPENROUTER_ALLOW_PAID_FALLBACK === 'true';
const OPENROUTER_MODELS: Record<'main' | 'fast', string[]> = {
  main: [
    process.env.OPENROUTER_MAIN_MODEL,
    'openrouter/owl-alpha',
    'google/gemma-3-27b-it:free',
    ALLOW_PAID_OPENROUTER_FALLBACK ? 'google/gemma-3-27b-it' : undefined,
  ].filter(Boolean) as string[],
  fast: [
    process.env.OPENROUTER_FAST_MODEL,
    'openrouter/owl-alpha',
    'baidu/cobuddy:free',
    'google/gemma-3-12b-it:free',
    ALLOW_PAID_OPENROUTER_FALLBACK ? 'google/gemma-3-12b-it' : undefined,
  ].filter(Boolean) as string[],
};
const GEMINI_MODELS = {
  main: 'gemini-2.5-flash',
  fast: 'gemini-2.5-flash',
};

export async function callLLM(opts: LLMCallOptions): Promise<string> {
  const { system, messages, maxTokens = 2048, model = 'fast', canalConfig } = opts;
  const motor = canalConfig.llm_motor ?? 'claude';

  if (motor === 'openai') {
    return callOpenAI({ system, messages, maxTokens, model, apiKey: canalConfig.openai_api_key ?? '' });
  }
  if (motor === 'openrouter') {
    return callOpenRouter({ system, messages, maxTokens, model, apiKey: canalConfig.openrouter_api_key ?? '' });
  }
  if (motor === 'gemini') {
    try {
      return await callGemini({ system, messages, maxTokens, model, apiKey: canalConfig.gemini_api_key ?? '' });
    } catch (error) {
      if (!isTransientLLMError(error)) throw error;
      console.warn('Gemini temporalmente no disponible, usando fallback LLM:', error instanceof Error ? error.message : error);
      return callLLMFallback({ system, messages, maxTokens, model, canalConfig });
    }
  }
  return callClaude({ system, messages, maxTokens, model });
}

function isTransientLLMError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /\b(429|500|502|503|504)\b/.test(message) ||
    /UNAVAILABLE|RESOURCE_EXHAUSTED|rate limit|high demand|temporar/i.test(message);
}

async function callLLMFallback(opts: Required<Pick<LLMCallOptions, 'system' | 'messages' | 'maxTokens' | 'model' | 'canalConfig'>>): Promise<string> {
  const { system, messages, maxTokens, model, canalConfig } = opts;
  if (process.env.ANTHROPIC_API_KEY) {
    return callClaude({ system, messages, maxTokens, model });
  }
  if (canalConfig.openai_api_key) {
    return callOpenAI({ system, messages, maxTokens, model, apiKey: canalConfig.openai_api_key });
  }
  if (canalConfig.openrouter_api_key) {
    return callOpenRouter({ system, messages, maxTokens, model, apiKey: canalConfig.openrouter_api_key });
  }
  throw new Error('Gemini está temporalmente saturado y no hay LLM fallback configurado');
}

async function callClaude(opts: {
  system: string;
  messages: LLMMessage[];
  maxTokens: number;
  model: 'main' | 'fast';
}): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY no configurada');

  const anthropic = new Anthropic({ apiKey });
  const message = await anthropic.messages.create({
    model: CLAUDE_MODELS[opts.model],
    max_tokens: opts.maxTokens,
    system: opts.system,
    messages: opts.messages,
  });

  return message.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { type: 'text'; text: string }).text)
    .join('');
}

async function callOpenAI(opts: {
  system: string;
  messages: LLMMessage[];
  maxTokens: number;
  model: 'main' | 'fast';
  apiKey: string;
}): Promise<string> {
  if (!opts.apiKey) throw new Error('OpenAI API key no configurada en este canal');

  const openaiMessages = [
    { role: 'system', content: opts.system },
    ...opts.messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${opts.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: OPENAI_MODELS[opts.model],
      max_tokens: opts.maxTokens,
      messages: openaiMessages,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json() as {
    choices: Array<{ message: { content: string } }>;
  };

  return data.choices[0]?.message?.content ?? '';
}

async function callOpenRouter(opts: {
  system: string;
  messages: LLMMessage[];
  maxTokens: number;
  model: 'main' | 'fast';
  apiKey: string;
}): Promise<string> {
  if (!opts.apiKey) throw new Error('OpenRouter API key no configurada en este canal');

  // Gemma y otros modelos de OpenRouter no soportan rol "system" — se fusiona con el primer user message
  const userMessages = opts.messages.map((m) => ({ role: m.role, content: m.content }));
  if (userMessages.length > 0 && userMessages[0].role === 'user') {
    userMessages[0] = { role: 'user', content: `${opts.system}\n\n${userMessages[0].content}` };
  }

  const MAX_RETRIES = 3;
  const RETRY_DELAY_MS = 8000;
  const models = OPENROUTER_MODELS[opts.model];
  const errors: string[] = [];

  for (const openrouterModel of models) {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${opts.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: openrouterModel,
          max_tokens: opts.maxTokens,
          messages: userMessages,
        }),
      });

      if (res.status === 429 && attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * attempt));
        continue;
      }

      if (!res.ok) {
        const err = await res.text();
        const shortError = `OpenRouter ${openrouterModel} error ${res.status}: ${err.slice(0, 200)}`;
        errors.push(shortError);
        if (shouldTryNextOpenRouterModel(res.status, err)) break;
        throw new Error(shortError);
      }

      const data = await res.json() as {
        choices: Array<{ message: { content: string } }>;
      };

      return data.choices[0]?.message?.content ?? '';
    }
  }

  throw new Error(`OpenRouter: ningún modelo disponible. ${errors.join(' | ')}`);
}

function shouldTryNextOpenRouterModel(status: number, body: string): boolean {
  if (status === 404 && /No endpoints found/i.test(body)) return true;
  if (status === 429) return true;
  return false;
}

async function callGemini(opts: {
  system: string;
  messages: LLMMessage[];
  maxTokens: number;
  model: 'main' | 'fast';
  apiKey: string;
}): Promise<string> {
  if (!opts.apiKey) throw new Error('Gemini API key no configurada en este canal');

  const modelId = GEMINI_MODELS[opts.model];
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${opts.apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: opts.system }] },
      contents: opts.messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
      generationConfig: { maxOutputTokens: opts.maxTokens, thinkingConfig: { thinkingBudget: 0 } },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini error ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json() as {
    candidates: Array<{ content: { parts: Array<{ text: string; thought?: boolean }> } }>;
  };

  return (
    data.candidates[0]?.content?.parts
      ?.filter((p) => !p.thought)
      .map((p) => p.text)
      .join('') ?? ''
  );
}

// Limpia bloques markdown de código que los modelos a veces añaden
export function extractJSON(raw: string): string {
  return raw
    .replace(/^```json\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

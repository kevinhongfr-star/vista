export interface DeepSeekOptions {
  model?: 'flash' | 'pro'
  maxTokens?: number
  temperature?: number
  responseFormat?: 'json' | 'text'
}

const DEFAULT_FLASH_MODEL = 'deepseek-chat'
const DEFAULT_PRO_MODEL = 'deepseek-reasoner'

function getApiKey(): string {
  const key = process.env.DEEPSEEK_API_KEY
  if (!key) {
    throw new Error('DEEPSEEK_API_KEY is not set in environment variables')
  }
  return key
}

function getBaseUrl(): string {
  return process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1'
}

function resolveModel(preference: 'flash' | 'pro' = 'flash'): string {
  if (preference === 'pro') {
    return process.env.DEEPSEEK_MODEL_PRO || DEFAULT_PRO_MODEL
  }
  return process.env.DEEPSEEK_MODEL_FLASH || DEFAULT_FLASH_MODEL
}

function extractJsonFromText(text: string): string {
  const trimmed = text.trim()

  const firstBrace = trimmed.indexOf('{')
  const lastBrace = trimmed.lastIndexOf('}')
  const firstBracket = trimmed.indexOf('[')
  const lastBracket = trimmed.lastIndexOf(']')

  const hasBrace = firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace
  const hasBracket = firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket

  if (hasBrace && hasBracket) {
    if (firstBracket < firstBrace) {
      return trimmed.slice(firstBracket, lastBracket + 1)
    } else {
      return trimmed.slice(firstBrace, lastBrace + 1)
    }
  }

  if (hasBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1)
  }

  if (hasBracket) {
    return trimmed.slice(firstBracket, lastBracket + 1)
  }

  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim()
  }

  return trimmed
}

export async function callDeepSeek(
  prompt: string,
  options?: DeepSeekOptions
): Promise<string> {
  const apiKey = getApiKey()
  const baseUrl = getBaseUrl()
  const model = resolveModel(options?.model || 'flash')
  const maxTokens = options?.maxTokens || 2048
  const temperature = options?.temperature ?? 0.7
  const responseFormat = options?.responseFormat || 'text'

  const messages = [
    {
      role: 'user' as const,
      content: prompt,
    },
  ]

  const body: Record<string, unknown> = {
    model,
    messages,
    max_tokens: maxTokens,
    temperature,
  }

  if (responseFormat === 'json') {
    body.response_format = { type: 'json_object' }
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `DeepSeek API error (${response.status}): ${errorText}`
    )
  }

  const data = await response.json()

  const content = data?.choices?.[0]?.message?.content
  if (typeof content !== 'string') {
    throw new Error('Unexpected response format from DeepSeek API')
  }

  return content
}

export async function callDeepSeekJSON<T = unknown>(
  prompt: string,
  options?: DeepSeekOptions
): Promise<T> {
  const responseText = await callDeepSeek(prompt, {
    ...options,
    responseFormat: 'json',
  })

  const jsonString = extractJsonFromText(responseText)

  try {
    return JSON.parse(jsonString) as T
  } catch (parseError) {
    throw new Error(
      `Failed to parse DeepSeek JSON response: ${(parseError as Error).message}\nRaw: ${responseText.slice(0, 500)}`
    )
  }
}

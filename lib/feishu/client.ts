/**
 * Feishu/Lark API client
 * Supports text messages, post messages with @mentions, and interactive cards
 */

let cachedBotOpenId: string | null = null

export async function getTenantAccessToken(): Promise<string> {
  const appId = process.env.FEISHU_APP_ID
  const appSecret = process.env.FEISHU_APP_SECRET
  
  if (!appId || !appSecret) {
    throw new Error('FEISHU_APP_ID and FEISHU_APP_SECRET must be set')
  }
  
  const res = await fetch(
    'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app_id: appId,
        app_secret: appSecret,
      }),
    }
  )
  const data = await res.json()
  if (!data.tenant_access_token) {
    throw new Error(`Feishu auth failed: ${JSON.stringify(data)}`)
  }
  return data.tenant_access_token
}

/**
 * Get the bot's own open_id (cached after first call)
 */
async function getBotOpenId(): Promise<string> {
  if (cachedBotOpenId) return cachedBotOpenId || ""
  
  const token = await getTenantAccessToken()
  const res = await fetch('https://open.feishu.cn/open-apis/bot/v3/info', {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await res.json()
  cachedBotOpenId = data?.bot?.open_id || ''
  
  if (!cachedBotOpenId) {
    console.error('Failed to get bot open_id:', JSON.stringify(data))
  }
  
  return cachedBotOpenId || ""
}

/**
 * Send a plain text message to a group chat
 */
export async function sendMessage(chatId: string, message: string): Promise<void> {
  const token = await getTenantAccessToken()
  const res = await fetch(
    `https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=chat_id`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        receive_id: chatId,
        msg_type: 'text',
        content: JSON.stringify({ text: message }),
      }),
    }
  )
  const data = await res.json()
  if (data.code !== 0) {
    console.error('Feishu sendMessage error:', data)
  }
}

/**
 * Send a message with @mention of the bot itself (so the bot gets triggered)
 * Uses Feishu "post" message type with proper <at> tags
 */
export async function sendMentionMessage(
  chatId: string,
  message: string,
  title?: string
): Promise<void> {
  const token = await getTenantAccessToken()
  const botOpenId = await getBotOpenId()
  
  // Build post content with @mention at the beginning
  const contentBlocks: any[][] = []
  
  // First line: @BotName followed by the message
  const firstLine: any[] = []
  if (botOpenId) {
    firstLine.push({
      tag: 'at',
      user_id: botOpenId,
      user_name: 'VISTA',
    })
  }
  firstLine.push({
    tag: 'text',
    text: ` ${message}`,
  })
  contentBlocks.push(firstLine)
  
  const postContent = {
    zh_cn: {
      title: title || 'VISTA Agent Trigger',
      content: contentBlocks,
    },
  }
  
  const res = await fetch(
    `https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=chat_id`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        receive_id: chatId,
        msg_type: 'post',
        content: JSON.stringify(postContent),
      }),
    }
  )
  const data = await res.json()
  if (data.code !== 0) {
    console.error('Feishu sendMentionMessage error:', data)
  }
}

/**
 * Send an interactive card message (rich formatting)
 */
export async function sendCardMessage(
  chatId: string,
  card: Record<string, unknown>
): Promise<void> {
  const token = await getTenantAccessToken()
  const res = await fetch(
    `https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=chat_id`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        receive_id: chatId,
        msg_type: 'interactive',
        content: JSON.stringify(card),
      }),
    }
  )
  const data = await res.json()
  if (data.code !== 0) {
    console.error('Feishu sendCardMessage error:', data)
  }
}

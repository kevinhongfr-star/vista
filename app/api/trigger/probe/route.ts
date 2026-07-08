import { NextResponse } from 'next/server'
import { sendMessage } from '@/lib/feishu/client'

export async function POST() {
  try {
    const chatId = process.env.FEISHU_CHAT_PROBE
    const message =
      '[VISTA] Trigger: Refresh pipeline summary and encirclement data.'
    await sendMessage(chatId || '', message)
    return NextResponse.json({ success: true, agent: 'PROBE' })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { sendMessage } from '@/lib/feishu/client'

export async function POST() {
  try {
    const chatId = process.env.FEISHU_CHAT_CARL
    const message =
      '[VISTA] Trigger: Review strategic notes for contacts with score_delta in last 7 days.'
    await sendMessage(chatId || '', message)
    return NextResponse.json({ success: true, agent: 'CARL' })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}

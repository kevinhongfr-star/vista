import { NextResponse } from 'next/server'
import { sendMessage } from '@/lib/feishu/client'

export async function POST() {
  try {
    const chatId = process.env.FEISHU_CHAT_MARIA
    const message =
      '[VISTA] Trigger: Generate campaign drafts for top 10 Hot contacts with no recent outreach.'
    await sendMessage(chatId || '', message)
    return NextResponse.json({ success: true, agent: 'MARIA' })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}

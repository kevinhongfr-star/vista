import { NextResponse } from 'next/server'
import { sendMessage } from '@/lib/feishu/client'

export async function POST() {
  try {
    const chatId = process.env.FEISHU_CHAT_LENS
    const message =
      '[VISTA] Trigger: Run LENS scoring on all contacts. Priority: contacts with decay_flag=true or score=0.'
    await sendMessage(chatId || '', message)
    return NextResponse.json({ success: true, agent: 'LENS' })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}

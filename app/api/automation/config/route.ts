import { NextResponse } from 'next/server'
import type { AutomationConfig } from '@/lib/types'

const DEFAULT_CONFIG: AutomationConfig = {
  frequency: 'daily',
  last_signal_detection: null,
  last_scoring: null,
  last_clustering: null,
  next_scheduled_run: null,
}

let inMemoryConfig: AutomationConfig = DEFAULT_CONFIG

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      config: inMemoryConfig,
    })
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { frequency, last_signal_detection, last_scoring, last_clustering, next_scheduled_run } = body

    if (frequency && !['daily', 'weekly', 'manual'].includes(frequency)) {
      return NextResponse.json(
        { error: 'Invalid frequency value' },
        { status: 400 }
      )
    }

    inMemoryConfig = {
      ...inMemoryConfig,
      ...(frequency !== undefined && { frequency }),
      ...(last_signal_detection !== undefined && { last_signal_detection }),
      ...(last_scoring !== undefined && { last_scoring }),
      ...(last_clustering !== undefined && { last_clustering }),
      ...(next_scheduled_run !== undefined && { next_scheduled_run }),
    }

    return NextResponse.json({
      success: true,
      config: inMemoryConfig,
    })
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}

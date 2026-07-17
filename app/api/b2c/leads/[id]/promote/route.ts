import { NextResponse } from "next/server"
import { promoteB2CToB2B } from "@/lib/b2c/promotion"

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const result = await promoteB2CToB2B(id)

    return NextResponse.json({
      success: true,
      contact_id: result.contact_id,
      created_new: result.created_new,
      matched_via: result.matched_via,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}

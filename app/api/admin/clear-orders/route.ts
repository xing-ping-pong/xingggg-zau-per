import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Order from '@/lib/models/Order'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    // Delete all orders
    const result = await Order.deleteMany({})
    return NextResponse.json({
      success: true,
      message: `All orders deleted. Count: ${result.deletedCount}`
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to clear orders'
    }, { status: 500 })
  }
}

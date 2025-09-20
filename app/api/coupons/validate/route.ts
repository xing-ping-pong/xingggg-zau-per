import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Coupon from '@/lib/models/Coupon'

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const { code } = await req.json()

    if (!code) {
      return NextResponse.json({
        success: false,
        message: 'Coupon code is required'
      }, { status: 400 })
    }

    // Find the coupon
    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(),
      isActive: true,
      $or: [
        { expiryDate: { $gt: new Date() } },
        { expiryDate: null }
      ]
    })

    if (!coupon) {
      return NextResponse.json({
        success: false,
        message: 'Invalid or expired coupon code'
      }, { status: 404 })
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({
        success: false,
        message: 'Coupon usage limit exceeded'
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      discount: coupon.discountPercentage,
      message: 'Coupon applied successfully'
    })

  } catch (error) {
    console.error('Error validating coupon:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

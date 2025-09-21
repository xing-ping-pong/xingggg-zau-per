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

    // Find the coupon by code first
    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase()
    })

    if (!coupon) {
      return NextResponse.json({
        success: false,
        message: 'Invalid coupon code'
      }, { status: 404 })
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return NextResponse.json({
        success: false,
        message: 'This coupon is no longer active'
      }, { status: 400 })
    }

    // Check if coupon is expired
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return NextResponse.json({
        success: false,
        message: 'This coupon has expired'
      }, { status: 400 })
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

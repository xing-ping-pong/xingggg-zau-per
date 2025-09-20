import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Coupon from '@/lib/models/Coupon'

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const coupons = await Coupon.find().sort({ createdAt: -1 })

    return NextResponse.json({
      success: true,
      data: coupons
    })

  } catch (error) {
    console.error('Error fetching coupons:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const {
      code,
      description,
      discountPercentage,
      discountAmount,
      minOrderAmount,
      maxDiscountAmount,
      usageLimit,
      isActive,
      expiryDate
    } = await req.json()

    // Validate required fields
    if (!code || !description || discountPercentage === undefined) {
      return NextResponse.json({
        success: false,
        message: 'Code, description, and discount percentage are required'
      }, { status: 400 })
    }

    // Check if code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() })
    if (existingCoupon) {
      return NextResponse.json({
        success: false,
        message: 'Coupon code already exists'
      }, { status: 400 })
    }

    // Create new coupon
    const coupon = new Coupon({
      code: code.toUpperCase(),
      description,
      discountPercentage,
      discountAmount,
      minOrderAmount,
      maxDiscountAmount,
      usageLimit,
      isActive: isActive !== false, // Default to true
      expiryDate: expiryDate ? new Date(expiryDate) : undefined
    })

    await coupon.save()

    return NextResponse.json({
      success: true,
      message: 'Coupon created successfully',
      data: coupon
    })

  } catch (error) {
    console.error('Error creating coupon:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

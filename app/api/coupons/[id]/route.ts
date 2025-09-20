import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Coupon from '@/lib/models/Coupon'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const { id } = params
    const updateData = await req.json()

    // Remove undefined values
    const cleanedData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    )

    // Handle date conversion
    if (cleanedData.expiryDate) {
      cleanedData.expiryDate = new Date(cleanedData.expiryDate)
    }

    const coupon = await Coupon.findByIdAndUpdate(
      id,
      cleanedData,
      { new: true, runValidators: true }
    )

    if (!coupon) {
      return NextResponse.json({
        success: false,
        message: 'Coupon not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Coupon updated successfully',
      data: coupon
    })

  } catch (error) {
    console.error('Error updating coupon:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const { id } = params

    const coupon = await Coupon.findByIdAndDelete(id)

    if (!coupon) {
      return NextResponse.json({
        success: false,
        message: 'Coupon not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Coupon deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting coupon:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

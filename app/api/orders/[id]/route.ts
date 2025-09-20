import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Order from '@/lib/models/Order'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const { id } = params
    const order = await Order.findById(id)

    if (!order) {
      return NextResponse.json({
        success: false,
        message: 'Order not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: order
    })

  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const { id } = params
    const updateData = await req.json()

    // Validate status if provided
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'on_hold']
    if (updateData.status && !validStatuses.includes(updateData.status)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid status'
      }, { status: 400 })
    }

    // Handle special status updates
    const updateFields: any = { ...updateData }

    if (updateData.status === 'delivered') {
      updateFields.deliveredAt = new Date()
    }

    if (updateData.status === 'cancelled') {
      updateFields.cancelledAt = new Date()
    }

    const order = await Order.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    )

    if (!order) {
      return NextResponse.json({
        success: false,
        message: 'Order not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      data: order
    })

  } catch (error) {
    console.error('Error updating order:', error)
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
    const order = await Order.findByIdAndDelete(id)

    if (!order) {
      return NextResponse.json({
        success: false,
        message: 'Order not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting order:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}
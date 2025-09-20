import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Order from '@/lib/models/Order'
import Product from '@/lib/models/Product'

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const {
      guestInfo,
      items,
      pricing,
      couponCode
    } = await req.json()

    // Validate required fields
    if (!guestInfo || !items || !pricing) {
      return NextResponse.json({
        success: false,
        message: 'Guest information, items, and pricing are required'
      }, { status: 400 })
    }

    // Validate guest information
    const requiredGuestFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'zipCode', 'country']
    for (const field of requiredGuestFields) {
      if (!guestInfo[field]) {
        return NextResponse.json({
          success: false,
          message: `${field} is required`
        }, { status: 400 })
      }
    }

    // Validate items
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'At least one item is required'
      }, { status: 400 })
    }

    // Verify products exist and get current data
    const productIds = items.map(item => item.productId)
    const products = await Product.find({ _id: { $in: productIds } })
    
    if (products.length !== productIds.length) {
      return NextResponse.json({
        success: false,
        message: 'One or more products not found'
      }, { status: 400 })
    }

    // Create product map for easy lookup
    const productMap = new Map(products.map(p => [p._id.toString(), p]))

    // Validate and prepare order items
    const orderItems = items.map(item => {
      const product = productMap.get(item.productId)
      if (!product) {
        throw new Error(`Product ${item.productId} not found`)
      }

      // Check stock availability
      if (product.stockQuantity < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stockQuantity}, Requested: ${item.quantity}`)
      }

      const discountedPrice = product.discount > 0 
        ? product.price - (product.price * product.discount / 100)
        : product.price

      return {
        productId: item.productId,
        productName: product.name,
        productImage: product.imageUrl,
        quantity: item.quantity,
        price: product.price,
        discount: product.discount,
        totalPrice: discountedPrice * item.quantity
      }
    })

    // Generate order number
    const orderCount = await Order.countDocuments()
    const orderNumber = `ORD-${String(orderCount + 1).padStart(6, '0')}`

    // Create the order
    const order = new Order({
      orderNumber,
      guestInfo,
      items: orderItems,
      pricing,
      paymentMethod: 'cash_on_delivery',
      status: 'pending',
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    })

    await order.save()

    // Update product stock quantities
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stockQuantity: -item.quantity } }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Order placed successfully',
      data: {
        orderNumber: order.orderNumber,
        orderId: order._id,
        status: order.status,
        total: order.pricing.total,
        estimatedDelivery: order.estimatedDelivery
      }
    })

  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')
    const orderNumber = searchParams.get('orderNumber')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    let query: any = {}

    if (email) {
      query['guestInfo.email'] = email
    }

    if (orderNumber) {
      query.orderNumber = orderNumber
    }

    if (status) {
      query.status = status
    }

    const skip = (page - 1) * limit

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query)
    ])

    return NextResponse.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}
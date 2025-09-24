import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Order from '@/lib/models/Order'
import Product from '@/lib/models/Product'
import Coupon from '@/lib/models/Coupon'

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const {
      guestInfo,
      items,
      pricing
    } = await req.json()

    // Extract coupon code from pricing object
    const couponCode = pricing?.couponCode

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

    // Validate pricing structure
    if (!pricing || typeof pricing !== 'object') {
      return NextResponse.json({
        success: false,
        message: 'Pricing information is required'
      }, { status: 400 })
    }

    const requiredPricingFields = ['subtotal', 'shipping', 'tax', 'total']
    for (const field of requiredPricingFields) {
      if (typeof pricing[field] !== 'number' || pricing[field] < 0) {
        return NextResponse.json({
          success: false,
          message: `Invalid pricing: ${field} must be a non-negative number`
        }, { status: 400 })
      }
    }

    // Verify products exist and get current data
    const productIds = items.map(item => item.productId)
    
    // Validate product IDs are valid MongoDB ObjectIds
    const mongoose = require('mongoose')
    const invalidIds = productIds.filter(id => !mongoose.Types.ObjectId.isValid(id))
    if (invalidIds.length > 0) {
      return NextResponse.json({
        success: false,
        message: `Invalid product IDs: ${invalidIds.join(', ')}`
      }, { status: 400 })
    }
    
    const products = await Product.find({ _id: { $in: productIds } })
    
    if (products.length !== productIds.length) {
      const foundIds = products.map(p => p._id.toString())
      const missingIds = productIds.filter(id => !foundIds.includes(id))
      return NextResponse.json({
        success: false,
        message: `Products not found: ${missingIds.join(', ')}`
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

    // Generate unique order number
    let orderNumber
    let attempts = 0
    const maxAttempts = 10
    
    // Get the highest existing order number
    const lastOrder = await Order.findOne({}, { orderNumber: 1 }).sort({ orderNumber: -1 })
    let nextNumber = 1
    
    if (lastOrder && lastOrder.orderNumber) {
      const lastNumber = parseInt(lastOrder.orderNumber.replace('ORD-', ''))
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1
      }
    }
    
    do {
      orderNumber = `ORD-${String(nextNumber + attempts).padStart(6, '0')}`
      
      // Check if this order number already exists
      const existingOrder = await Order.findOne({ orderNumber })
      if (!existingOrder) {
        break
      }
      
      attempts++
    } while (attempts < maxAttempts)
    
    if (attempts >= maxAttempts) {
      // Fallback to timestamp-based order number
      orderNumber = `ORD-${Date.now().toString().slice(-6)}`
    }
    
    console.log(`Generated order number: ${orderNumber} (attempts: ${attempts})`)

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

    try {
      await order.save()
    } catch (saveError) {
      if (saveError.code === 11000 && saveError.keyPattern?.orderNumber) {
        // Duplicate order number error - generate a new one
        console.log(`Duplicate order number detected: ${orderNumber}, generating new one...`)
        orderNumber = `ORD-${Date.now().toString().slice(-6)}`
        order.orderNumber = orderNumber
        await order.save()
      } else {
        throw saveError
      }
    }

    // Update product stock quantities
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stockQuantity: -item.quantity } }
      )
    }

    // Update coupon usage count if coupon was used
    if (couponCode) {
      console.log(`Updating coupon usage for code: ${couponCode}`)
      const updateResult = await Coupon.findOneAndUpdate(
        { code: couponCode.toUpperCase() },
        { $inc: { usedCount: 1 } },
        { new: true }
      )
      console.log(`Coupon usage updated:`, updateResult ? `New count: ${updateResult.usedCount}` : 'Coupon not found')
    } else {
      console.log('No coupon code provided, skipping usage update')
    }

    return NextResponse.json({
      success: true,
      message: 'Order placed successfully',
      data: {
        orderNumber: order.orderNumber,
        orderId: order._id,
        status: order.status,
        total: order.pricing?.total || 0,
        estimatedDelivery: order.estimatedDelivery
      }
    })

  } catch (error) {
    console.error('Error creating order:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    // Log request body safely
    try {
      const requestBody = await req.json()
      console.error('Request body:', JSON.stringify(requestBody, null, 2))
    } catch (parseError) {
      console.error('Could not parse request body for logging')
    }
    
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
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
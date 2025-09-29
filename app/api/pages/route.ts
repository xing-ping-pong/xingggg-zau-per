import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Page from '@/lib/models/page'
import { verifyToken } from '@/lib/auth'

// GET /api/pages - Get all pages (public)
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'
    
    const query = activeOnly ? { isActive: true } : {}
    
    const pages = await Page.find(query)
      .select('slug title metaTitle metaDescription isActive createdAt updatedAt')
      .sort({ createdAt: -1 })
    
    return NextResponse.json({
      success: true,
      data: { pages }
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Error fetching pages:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch pages' },
      { status: 500 }
    )
  }
}

// POST /api/pages - Create new page (admin only)
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authorization token required' },
        { status: 401 }
      )
    }

    const user = await verifyToken(token)
    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }

    await connectDB()
    
    const body = await request.json()
    const { slug, title, content, metaTitle, metaDescription, isActive = true } = body

    // Validate required fields
    if (!slug || !title || !content) {
      return NextResponse.json(
        { success: false, message: 'Slug, title, and content are required' },
        { status: 400 }
      )
    }

    // Check if page with slug already exists
    const existingPage = await Page.findOne({ slug })
    if (existingPage) {
      return NextResponse.json(
        { success: false, message: 'Page with this slug already exists' },
        { status: 400 }
      )
    }

    const page = new Page({
      slug,
      title,
      content,
      metaTitle,
      metaDescription,
      isActive
    })

    await page.save()

    return NextResponse.json({
      success: true,
      message: 'Page created successfully',
      data: { page }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating page:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create page' },
      { status: 500 }
    )
  }
}

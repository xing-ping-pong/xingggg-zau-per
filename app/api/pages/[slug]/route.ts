import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Page from '@/lib/models/page'
import { verifyToken } from '@/lib/auth'

// GET /api/pages/[slug] - Get page by slug (public)
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'
    
    const query: any = { slug: params.slug }
    if (!includeInactive) {
      query.isActive = true
    }
    
    const page = await Page.findOne(query)
    
    if (!page) {
      return NextResponse.json(
        { success: false, message: 'Page not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: { page }
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Error fetching page:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch page' },
      { status: 500 }
    )
  }
}

// PUT /api/pages/[slug] - Update page (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
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
    const { title, content, metaTitle, metaDescription, isActive } = body

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (content !== undefined) updateData.content = content
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription
    if (isActive !== undefined) updateData.isActive = isActive

    const page = await Page.findOneAndUpdate(
      { slug: params.slug },
      updateData,
      { new: true, runValidators: true }
    )

    if (!page) {
      return NextResponse.json(
        { success: false, message: 'Page not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Page updated successfully',
      data: { page }
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Error updating page:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update page' },
      { status: 500 }
    )
  }
}

// DELETE /api/pages/[slug] - Delete page (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
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
    
    const page = await Page.findOneAndDelete({ slug: params.slug })

    if (!page) {
      return NextResponse.json(
        { success: false, message: 'Page not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Page deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting page:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete page' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    const faviconPath = path.join(process.cwd(), 'public', 'favicon.png')
    
    if (!fs.existsSync(faviconPath)) {
      return new NextResponse('Favicon not found', { status: 404 })
    }

    const faviconBuffer = fs.readFileSync(faviconPath)
    
    return new NextResponse(faviconBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Favicon error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

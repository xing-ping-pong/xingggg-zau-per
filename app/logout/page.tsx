"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    // Clear authentication data
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    
    // Redirect to home page
    router.push("/")
    router.refresh()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Signing Out...</h1>
        <p className="text-gray-300">You are being redirected to the home page.</p>
      </div>
    </div>
  )
}

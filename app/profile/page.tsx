"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Mail, Calendar, Shield, ArrowLeft, Home, Key } from "lucide-react"
import { fetchWithAuth, isAuthenticated } from "@/lib/auth-utils"
import ChangePasswordForm from "@/components/change-password-form"

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile')
  const router = useRouter()

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!isAuthenticated()) {
        router.push("/login")
        return
      }

      try {
        const response = await fetchWithAuth("/api/auth/profile")
        const data = await response.json()
        
        if (data.success) {
          setUser(data.data.user)
        } else {
          router.push("/login")
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
        router.push("/login")
      } finally {
        setFetching(false)
      }
    }

    fetchUserProfile()
  }, [router])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetchWithAuth("/api/auth/profile", {
        method: "PUT",
        body: JSON.stringify({
          username: user.username,
          email: user.email
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess("Profile updated successfully!")
        // Update local storage
        localStorage.setItem("user", JSON.stringify(data.data.user))
        setUser(data.data.user)
      } else {
        setError(data.message || "Update failed")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value
    })
  }

  if (fetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Navigation */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              
              <div className="flex items-center text-sm text-gray-400">
                <Home className="w-4 h-4 mr-1" />
                <span>/</span>
                <User className="w-4 h-4 mx-1" />
                <span>Profile</span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Loading profile...</h1>
            <p className="text-gray-300">Please wait while we fetch your information.</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Navigation */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              
              <div className="flex items-center text-sm text-gray-400">
                <Home className="w-4 h-4 mr-1" />
                <span>/</span>
                <User className="w-4 h-4 mx-1" />
                <span>Profile</span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Authentication Required</h1>
            <p className="text-gray-300 mb-6">Please log in to view your profile.</p>
            <Button
              onClick={() => router.push("/login")}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
            >
              <User className="w-4 h-4 mr-2" />
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Navigation */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            
            <div className="flex items-center text-sm text-gray-400">
              <Home className="w-4 h-4 mr-1" />
              <span>/</span>
              <User className="w-4 h-4 mx-1" />
              <span>Profile</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-white/10 rounded-lg p-1">
            <Button
              onClick={() => setActiveTab('profile')}
              variant={activeTab === 'profile' ? 'default' : 'ghost'}
              className={`flex-1 ${
                activeTab === 'profile'
                  ? 'bg-amber-500 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <User className="w-4 h-4 mr-2" />
              Profile Info
            </Button>
            <Button
              onClick={() => setActiveTab('password')}
              variant={activeTab === 'password' ? 'default' : 'ghost'}
              className={`flex-1 ${
                activeTab === 'password'
                  ? 'bg-amber-500 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Key className="w-4 h-4 mr-2" />
              Change Password
            </Button>
          </div>
        </div>

        {activeTab === 'profile' ? (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                <User className="w-6 h-6" />
                User Profile
              </CardTitle>
              <CardDescription className="text-gray-300">
                Manage your account information
              </CardDescription>
            </CardHeader>
            <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              {error && (
                <Alert className="bg-red-500/10 border-red-500/20">
                  <AlertDescription className="text-red-300">{error}</AlertDescription>
                </Alert>
              )}
              
              {success && (
                <Alert className="bg-green-500/10 border-green-500/20">
                  <AlertDescription className="text-green-300">{success}</AlertDescription>
                </Alert>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-white flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Username
                  </Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    value={user.username}
                    onChange={handleChange}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={user.email}
                    onChange={handleChange}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Member Since
                </Label>
                <Input
                  value={new Date(user.createdAt).toLocaleDateString()}
                  disabled
                  className="bg-white/5 border-white/10 text-gray-400"
                />
              </div>
              
              {user.isAdmin && (
                <div className="space-y-2">
                  <Label className="text-white flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Role
                  </Label>
                  <Input
                    value="Administrator"
                    disabled
                    className="bg-amber-500/20 border-amber-500/30 text-amber-300"
                  />
                </div>
              )}
              
              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update Profile"}
                </Button>
                
                <Button 
                  type="button"
                  onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    router.push("/");
                  }}
                  variant="outline"
                  className="bg-red-500/10 border-red-500/20 text-red-300 hover:bg-red-500/20 hover:text-red-200"
                >
                  Logout
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        ) : (
          <ChangePasswordForm 
            onSuccess={() => {
              setSuccess("Password changed successfully!")
              setTimeout(() => setSuccess(""), 3000)
            }}
          />
        )}
      </div>
    </div>
  )
}

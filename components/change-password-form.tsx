"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Lock, CheckCircle, XCircle } from "lucide-react"
import { fetchWithAuth } from "@/lib/auth-utils"

interface ChangePasswordFormProps {
  onSuccess?: () => void
}

export default function ChangePasswordForm({ onSuccess }: ChangePasswordFormProps) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Check password strength for new password
    if (name === 'newPassword') {
      const strength = checkPasswordStrength(value)
      setPasswordStrength(strength)
    }
    
    // Clear errors when user starts typing
    if (error) setError("")
    if (success) setSuccess("")
  }

  const checkPasswordStrength = (password: string) => {
    let score = 0
    let feedback = ''

    if (password.length >= 8) score += 1
    else feedback += 'At least 8 characters. '

    if (/[a-z]/.test(password)) score += 1
    else feedback += 'Lowercase letter. '

    if (/[A-Z]/.test(password)) score += 1
    else feedback += 'Uppercase letter. '

    if (/[0-9]/.test(password)) score += 1
    else feedback += 'Number. '

    if (/[^A-Za-z0-9]/.test(password)) score += 1
    else feedback += 'Special character. '

    const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']
    const strengthColors = ['text-red-500', 'text-orange-500', 'text-yellow-500', 'text-blue-500', 'text-green-500']

    return {
      score,
      feedback: feedback || 'Strong password!',
      label: strengthLabels[Math.min(score, 4)],
      color: strengthColors[Math.min(score, 4)]
    }
  }

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    // Client-side validation
    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match")
      setLoading(false)
      return
    }

    if (formData.newPassword.length < 6) {
      setError("New password must be at least 6 characters long")
      setLoading(false)
      return
    }

    if (formData.currentPassword === formData.newPassword) {
      setError("New password must be different from current password")
      setLoading(false)
      return
    }

    try {
      const response = await fetchWithAuth("/api/auth/change-password", {
        method: "PUT",
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess("Password changed successfully!")
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        setPasswordStrength({ score: 0, feedback: '' })
        onSuccess?.()
      } else {
        setError(data.message || "Failed to change password")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getStrengthBar = () => {
    const bars = []
    for (let i = 0; i < 5; i++) {
      bars.push(
        <div
          key={i}
          className={`h-1 w-full rounded ${
            i < passwordStrength.score
              ? passwordStrength.score <= 2
                ? 'bg-red-500'
                : passwordStrength.score <= 3
                ? 'bg-orange-500'
                : passwordStrength.score <= 4
                ? 'bg-blue-500'
                : 'bg-green-500'
              : 'bg-gray-300'
          }`}
        />
      )
    }
    return bars
  }

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
          <Lock className="w-5 h-5" />
          Change Password
        </CardTitle>
        <CardDescription className="text-gray-300">
          Update your account password for better security
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert className="bg-red-500/10 border-red-500/20">
              <XCircle className="h-4 w-4" />
              <AlertDescription className="text-red-300">{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="bg-green-500/10 border-green-500/20">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-green-300">{success}</AlertDescription>
            </Alert>
          )}

          {/* Current Password */}
          <div className="space-y-2">
            <Label htmlFor="currentPassword" className="text-white">
              Current Password
            </Label>
            <div className="relative">
              <Input
                id="currentPassword"
                name="currentPassword"
                type={showPasswords.current ? "text" : "password"}
                value={formData.currentPassword}
                onChange={handleChange}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pr-10"
                placeholder="Enter your current password"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility('current')}
              >
                {showPasswords.current ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-white">
              New Password
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                name="newPassword"
                type={showPasswords.new ? "text" : "password"}
                value={formData.newPassword}
                onChange={handleChange}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pr-10"
                placeholder="Enter your new password"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility('new')}
              >
                {showPasswords.new ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
            
            {/* Password Strength Indicator */}
            {formData.newPassword && (
              <div className="space-y-2">
                <div className="flex gap-1">
                  {getStrengthBar()}
                </div>
                <p className={`text-xs ${passwordStrength.color}`}>
                  {passwordStrength.label} - {passwordStrength.feedback}
                </p>
              </div>
            )}
          </div>

          {/* Confirm New Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-white">
              Confirm New Password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPasswords.confirm ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pr-10"
                placeholder="Confirm your new password"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility('confirm')}
              >
                {showPasswords.confirm ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
            
            {/* Password Match Indicator */}
            {formData.confirmPassword && (
              <div className="flex items-center gap-2 text-xs">
                {formData.newPassword === formData.confirmPassword ? (
                  <div className="flex items-center gap-1 text-green-400">
                    <CheckCircle className="h-3 w-3" />
                    Passwords match
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-400">
                    <XCircle className="h-3 w-3" />
                    Passwords do not match
                  </div>
                )}
              </div>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
            disabled={loading || formData.newPassword !== formData.confirmPassword || passwordStrength.score < 2}
          >
            {loading ? "Changing Password..." : "Change Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

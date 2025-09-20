"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Globe, Shield, Database, Bell, Users, CreditCard, Save, Eye, EyeOff } from "lucide-react"

export default function AdminSettings() {
  const [showApiKey, setShowApiKey] = useState(false)
  const [settings, setSettings] = useState({
    siteName: "ROSIA",
    siteDescription: "Luxury Perfume Collection",
    contactEmail: "contact@rosia.com",
    supportEmail: "support@rosia.com",
    currency: "USD",
    taxRate: "8.5",
    shippingFee: "15.00",
    freeShippingThreshold: "100.00",
    maintenanceMode: false,
    emailNotifications: true,
    orderNotifications: true,
    lowStockAlerts: true,
    newUserRegistration: true,
    guestCheckout: true,
    productReviews: true,
    blogComments: false,
    socialLogin: true,
    twoFactorAuth: false,
    apiKey: "sk_live_51234567890abcdef",
    webhookUrl: "https://rosia.com/api/webhooks",
    backupFrequency: "daily",
    maxFileSize: "10",
    allowedFileTypes: "jpg,png,webp,pdf",
  })

  const handleSave = () => {
    // Handle save logic here
    console.log("Settings saved:", settings)
  }

  const handleInputChange = (key: string, value: string | boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-playfair font-bold text-amber-400 mb-2">Settings</h1>
          <p className="text-gray-400">Manage your ROSIA admin panel configuration</p>
        </div>
        <Button onClick={handleSave} className="bg-amber-400 hover:bg-amber-500 text-black">
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-gray-900 border border-gray-800">
          <TabsTrigger value="general" className="data-[state=active]:bg-amber-400 data-[state=active]:text-black">
            <Globe className="mr-2 h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="ecommerce" className="data-[state=active]:bg-amber-400 data-[state=active]:text-black">
            <CreditCard className="mr-2 h-4 w-4" />
            E-commerce
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="data-[state=active]:bg-amber-400 data-[state=active]:text-black"
          >
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-amber-400 data-[state=active]:text-black">
            <Shield className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="system" className="data-[state=active]:bg-amber-400 data-[state=active]:text-black">
            <Database className="mr-2 h-4 w-4" />
            System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-amber-400 flex items-center">
                <Globe className="mr-2 h-5 w-5" />
                Site Information
              </CardTitle>
              <CardDescription className="text-gray-400">Basic information about your perfume store</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName" className="text-gray-300">
                    Site Name
                  </Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => handleInputChange("siteName", e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail" className="text-gray-300">
                    Contact Email
                  </Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteDescription" className="text-gray-300">
                  Site Description
                </Label>
                <Textarea
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) => handleInputChange("siteDescription", e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-amber-400 flex items-center">
                <Users className="mr-2 h-5 w-5" />
                User Settings
              </CardTitle>
              <CardDescription className="text-gray-400">Configure user registration and access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-gray-300">New User Registration</Label>
                  <p className="text-sm text-gray-500">Allow new users to create accounts</p>
                </div>
                <Switch
                  checked={settings.newUserRegistration}
                  onCheckedChange={(checked) => handleInputChange("newUserRegistration", checked)}
                />
              </div>
              <Separator className="bg-gray-800" />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-gray-300">Guest Checkout</Label>
                  <p className="text-sm text-gray-500">Allow purchases without account creation</p>
                </div>
                <Switch
                  checked={settings.guestCheckout}
                  onCheckedChange={(checked) => handleInputChange("guestCheckout", checked)}
                />
              </div>
              <Separator className="bg-gray-800" />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-gray-300">Social Login</Label>
                  <p className="text-sm text-gray-500">Enable Google/Facebook login</p>
                </div>
                <Switch
                  checked={settings.socialLogin}
                  onCheckedChange={(checked) => handleInputChange("socialLogin", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ecommerce" className="space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-amber-400 flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Payment & Shipping
              </CardTitle>
              <CardDescription className="text-gray-400">Configure payment and shipping options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-gray-300">
                    Currency
                  </Label>
                  <Input
                    id="currency"
                    value={settings.currency}
                    onChange={(e) => handleInputChange("currency", e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxRate" className="text-gray-300">
                    Tax Rate (%)
                  </Label>
                  <Input
                    id="taxRate"
                    value={settings.taxRate}
                    onChange={(e) => handleInputChange("taxRate", e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shippingFee" className="text-gray-300">
                    Shipping Fee ($)
                  </Label>
                  <Input
                    id="shippingFee"
                    value={settings.shippingFee}
                    onChange={(e) => handleInputChange("shippingFee", e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="freeShippingThreshold" className="text-gray-300">
                    Free Shipping Threshold ($)
                  </Label>
                  <Input
                    id="freeShippingThreshold"
                    value={settings.freeShippingThreshold}
                    onChange={(e) => handleInputChange("freeShippingThreshold", e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-amber-400">Product Settings</CardTitle>
              <CardDescription className="text-gray-400">Configure product-related features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-gray-300">Product Reviews</Label>
                  <p className="text-sm text-gray-500">Allow customers to review products</p>
                </div>
                <Switch
                  checked={settings.productReviews}
                  onCheckedChange={(checked) => handleInputChange("productReviews", checked)}
                />
              </div>
              <Separator className="bg-gray-800" />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-gray-300">Blog Comments</Label>
                  <p className="text-sm text-gray-500">Enable comments on blog posts</p>
                </div>
                <Switch
                  checked={settings.blogComments}
                  onCheckedChange={(checked) => handleInputChange("blogComments", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-amber-400 flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                Email Notifications
              </CardTitle>
              <CardDescription className="text-gray-400">Configure when to send email notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="supportEmail" className="text-gray-300">
                  Support Email
                </Label>
                <Input
                  id="supportEmail"
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => handleInputChange("supportEmail", e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <Separator className="bg-gray-800" />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-gray-300">Email Notifications</Label>
                  <p className="text-sm text-gray-500">Send general email notifications</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleInputChange("emailNotifications", checked)}
                />
              </div>
              <Separator className="bg-gray-800" />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-gray-300">Order Notifications</Label>
                  <p className="text-sm text-gray-500">Notify about new orders and status changes</p>
                </div>
                <Switch
                  checked={settings.orderNotifications}
                  onCheckedChange={(checked) => handleInputChange("orderNotifications", checked)}
                />
              </div>
              <Separator className="bg-gray-800" />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-gray-300">Low Stock Alerts</Label>
                  <p className="text-sm text-gray-500">Alert when products are running low</p>
                </div>
                <Switch
                  checked={settings.lowStockAlerts}
                  onCheckedChange={(checked) => handleInputChange("lowStockAlerts", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-amber-400 flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription className="text-gray-400">Configure security and authentication options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-gray-300">Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-500">Require 2FA for admin accounts</p>
                </div>
                <Switch
                  checked={settings.twoFactorAuth}
                  onCheckedChange={(checked) => handleInputChange("twoFactorAuth", checked)}
                />
              </div>
              <Separator className="bg-gray-800" />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-gray-300">Maintenance Mode</Label>
                  <p className="text-sm text-gray-500">Put site in maintenance mode</p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => handleInputChange("maintenanceMode", checked)}
                />
              </div>
              <Separator className="bg-gray-800" />
              <div className="space-y-2">
                <Label htmlFor="apiKey" className="text-gray-300">
                  API Key
                </Label>
                <div className="flex space-x-2">
                  <Input
                    id="apiKey"
                    type={showApiKey ? "text" : "password"}
                    value={settings.apiKey}
                    onChange={(e) => handleInputChange("apiKey", e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="border-gray-700 hover:bg-gray-800"
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="webhookUrl" className="text-gray-300">
                  Webhook URL
                </Label>
                <Input
                  id="webhookUrl"
                  value={settings.webhookUrl}
                  onChange={(e) => handleInputChange("webhookUrl", e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-amber-400 flex items-center">
                <Database className="mr-2 h-5 w-5" />
                System Configuration
              </CardTitle>
              <CardDescription className="text-gray-400">Configure system-level settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="backupFrequency" className="text-gray-300">
                    Backup Frequency
                  </Label>
                  <Input
                    id="backupFrequency"
                    value={settings.backupFrequency}
                    onChange={(e) => handleInputChange("backupFrequency", e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxFileSize" className="text-gray-300">
                    Max File Size (MB)
                  </Label>
                  <Input
                    id="maxFileSize"
                    value={settings.maxFileSize}
                    onChange={(e) => handleInputChange("maxFileSize", e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="allowedFileTypes" className="text-gray-300">
                  Allowed File Types
                </Label>
                <Input
                  id="allowedFileTypes"
                  value={settings.allowedFileTypes}
                  onChange={(e) => handleInputChange("allowedFileTypes", e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="jpg,png,webp,pdf"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-amber-400">System Status</CardTitle>
              <CardDescription className="text-gray-400">Current system information and status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Database Status</span>
                  <Badge className="bg-green-900 text-green-300">Connected</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Cache Status</span>
                  <Badge className="bg-green-900 text-green-300">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Email Service</span>
                  <Badge className="bg-green-900 text-green-300">Operational</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Storage</span>
                  <Badge className="bg-yellow-900 text-yellow-300">75% Used</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

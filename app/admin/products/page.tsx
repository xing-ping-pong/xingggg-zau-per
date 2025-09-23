"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Upload, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: {
    _id: string;
    name: string;
  };
  featured: boolean;
  isFeatured: boolean;
  discount: number;
  discountEndDate?: string;
  stockQuantity: number;
  imageUrl: string;
  images?: string[];
  sku?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  fragranceNotes?: {
    top: string[];
    middle: string[];
    base: string[];
  };
  features?: string[];
  longevity?: string;
  sillage?: string;
  occasion?: string[];
  season?: string[];
  createdAt: string;
}

interface Category {
  _id: string;
  name: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    categoryId: "",
    featured: false,
    discount: "0",
    discountEndDate: "",
    stock: "0",
    imageUrl: "",
    images: [] as string[],
    sku: "",
    weight: "",
    dimensions: {
      length: "",
      width: "",
      height: ""
    },
    fragranceNotes: {
      top: [] as string[],
      middle: [] as string[],
      base: [] as string[]
    },
    features: [] as string[],
    longevity: "",
    sillage: "",
    occasion: [] as string[],
    season: [] as string[]
  })

  // Fetch products and categories
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      console.log('🔄 Fetching data from API...')
      
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories')
      ])

      console.log('📡 API responses:', {
        productsStatus: productsRes.status,
        categoriesStatus: categoriesRes.status
      })

      const productsData = await productsRes.json()
      const categoriesData = await categoriesRes.json()

      console.log('📄 API data:', {
        productsSuccess: productsData.success,
        productsCount: productsData.data?.products?.length || 0,
        categoriesSuccess: categoriesData.success,
        categoriesCount: categoriesData.data?.categories?.length || 0
      })

      if (productsData.success) {
        setProducts(productsData.data.products)
        console.log('✅ Products loaded:', productsData.data.products.length)
      } else {
        console.error('❌ Products API error:', productsData.message)
        setError('Failed to load products: ' + productsData.message)
      }
      
      if (categoriesData.success) {
        setCategories(categoriesData.data.categories)
        console.log('✅ Categories loaded:', categoriesData.data.categories.length)
      } else {
        console.error('❌ Categories API error:', categoriesData.message)
      }
    } catch (err) {
      setError('Failed to fetch data')
      console.error('❌ Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")

    try {
      // Validate discount end date if discount is set
      let discountEndDate = null;
      if (formData.discountEndDate) {
        const date = new Date(formData.discountEndDate);
        if (isNaN(date.getTime())) {
          setError("Please enter a valid discount end date");
          setSaving(false);
          return;
        }
        discountEndDate = date.toISOString();
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.categoryId || null,
        featured: formData.featured,
        discount: parseFloat(formData.discount) || 0,
        discountEndDate: discountEndDate,
        stockQuantity: parseInt(formData.stock) || 0,
        imageUrl: formData.imageUrl || '/placeholder.jpg'
      }

      console.log('📝 Submitting product data:', JSON.stringify(productData, null, 2))
      console.log('📝 Form data before conversion:', JSON.stringify(formData, null, 2))

      const url = editingProduct ? `/api/products/${editingProduct._id}` : '/api/products'
      const method = editingProduct ? 'PUT' : 'POST'

      console.log(`🔄 ${method} request to ${url}`)

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      })

      console.log('📡 Response status:', response.status)
      const data = await response.json()
      console.log('📄 Response data:', data)

      if (data.success) {
        console.log('✅ Product saved successfully')
        await fetchData() // Refresh data
    setIsAddDialogOpen(false)
        setEditingProduct(null)
    resetForm()
        setError('') // Clear any previous errors
      } else {
        console.error('❌ Save failed:', data.message)
        setError(data.message || 'Failed to save product')
      }
    } catch (err) {
      console.error('❌ Submit error:', err)
      setError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      console.log('🗑️ Deleting product:', productId)
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      })

      console.log('📡 Delete response status:', response.status)
      const data = await response.json()
      console.log('📄 Delete response data:', data)

      if (data.success) {
        console.log('✅ Product deleted successfully, refreshing data...')
        await fetchData() // Refresh data
        setError('') // Clear any previous errors
      } else {
        console.error('❌ Delete failed:', data.message)
        setError(data.message || 'Failed to delete product')
      }
    } catch (err) {
      console.error('❌ Delete error:', err)
      setError('Network error. Please try again.')
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    
    // Format discount end date for datetime-local input
    let formattedDate = "";
    if (product.discountEndDate) {
      const date = new Date(product.discountEndDate);
      if (!isNaN(date.getTime())) {
        // Format for datetime-local input (YYYY-MM-DDTHH:MM)
        formattedDate = date.toISOString().slice(0, 16);
      }
    }
    
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || "",
      categoryId: product.category?._id || "",
      featured: product.isFeatured || product.featured,
      discount: product.discount.toString(),
      discountEndDate: formattedDate,
      stock: (product.stockQuantity || 0).toString(),
      imageUrl: product.imageUrl || "",
      images: product.images || [],
      sku: product.sku || "",
      weight: product.weight?.toString() || "",
      dimensions: {
        length: product.dimensions?.length?.toString() || "",
        width: product.dimensions?.width?.toString() || "",
        height: product.dimensions?.height?.toString() || ""
      },
      fragranceNotes: {
        top: product.fragranceNotes?.top || [],
        middle: product.fragranceNotes?.middle || [],
        base: product.fragranceNotes?.base || []
      },
      features: product.features || [],
      longevity: product.longevity || "",
      sillage: product.sillage || "",
      occasion: product.occasion || [],
      season: product.season || []
    })
    setIsAddDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      originalPrice: "",
      categoryId: "",
      featured: false,
      discount: "0",
      discountEndDate: "",
      stock: "0",
      imageUrl: "",
      images: [],
      sku: "",
      weight: "",
      dimensions: {
        length: "",
        width: "",
        height: ""
      },
      fragranceNotes: {
        top: [],
        middle: [],
        base: []
      },
      features: [],
      longevity: "",
      sillage: "",
      occasion: [],
      season: []
    })
    setEditingProduct(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading products...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/admin" className="hover:text-foreground transition-colors">
          Admin
        </Link>
        <span>/</span>
        <span className="text-foreground">Products</span>
        </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Admin</span>
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Products</h1>
            <p className="text-muted-foreground">
              Manage your luxury perfume collection
            </p>
          </div>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Edit Product" : "Add New Product"}
              </DialogTitle>
              <DialogDescription>
                {editingProduct 
                  ? "Update the product information below." 
                  : "Fill in the details to add a new product to your collection."
                }
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-3 rounded">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-300">
                    Product Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="text-gray-300">
                    Price (PKR)
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-300">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-gray-300">
                    Category
                  </Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl" className="text-gray-300">
                    Image URL
                  </Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="/image-name.jpg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discount" className="text-gray-300">
                    Discount (%)
                  </Label>
                  <Input
                    id="discount"
                    type="number"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                {/* Discount End Date - Only show if discount > 0 */}
                {parseFloat(formData.discount) > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="discountEndDate" className="text-gray-300">
                      Discount End Date
                    </Label>
                    <Input
                      id="discountEndDate"
                      type="datetime-local"
                      value={formData.discountEndDate}
                      onChange={(e) => {
                        let value = e.target.value;
                        // If only date is provided, set default time to end of day (23:59)
                        if (value && !value.includes('T')) {
                          value = value + 'T23:59';
                        }
                        setFormData({ ...formData, discountEndDate: value });
                      }}
                      className="bg-gray-800 border-gray-700 text-white"
                      min={new Date().toISOString().slice(0, 16)} // Prevent past dates
                    />
                    <p className="text-xs text-gray-400">
                      Leave time empty to set end of day (23:59)
                    </p>
              </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="stock" className="text-gray-300">
                    Stock
                  </Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                  </div>
                </div>

              {/* Additional Product Details */}
              <div className="space-y-6 pt-6 border-t border-gray-700">
                <h4 className="text-lg font-semibold text-gray-300">Additional Details</h4>
                
                {/* SKU and Weight */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sku" className="text-gray-300">SKU</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="Product SKU"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight" className="text-gray-300">Weight (g)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="100"
                    />
                  </div>
                </div>

                {/* Dimensions */}
                <div className="space-y-2">
                  <Label className="text-gray-300">Dimensions (cm)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      placeholder="Length"
                      value={formData.dimensions.length}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        dimensions: { ...formData.dimensions, length: e.target.value }
                      })}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                    <Input
                      placeholder="Width"
                      value={formData.dimensions.width}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        dimensions: { ...formData.dimensions, width: e.target.value }
                      })}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                    <Input
                      placeholder="Height"
                      value={formData.dimensions.height}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        dimensions: { ...formData.dimensions, height: e.target.value }
                      })}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>

                {/* Fragrance Notes */}
                <div className="space-y-4">
                  <Label className="text-gray-300">Fragrance Notes</Label>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label className="text-sm text-gray-400">Top Notes (comma-separated)</Label>
                      <Input
                        value={formData.fragranceNotes.top.join(', ')}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          fragranceNotes: { 
                            ...formData.fragranceNotes, 
                            top: e.target.value.split(',').map(note => note.trim()).filter(note => note)
                          }
                        })}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="Bergamot, Pink Pepper, Mandarin"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-gray-400">Middle Notes (comma-separated)</Label>
                      <Input
                        value={formData.fragranceNotes.middle.join(', ')}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          fragranceNotes: { 
                            ...formData.fragranceNotes, 
                            middle: e.target.value.split(',').map(note => note.trim()).filter(note => note)
                          }
                        })}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="Midnight Jasmine, Black Rose, Violet"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-gray-400">Base Notes (comma-separated)</Label>
                      <Input
                        value={formData.fragranceNotes.base.join(', ')}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          fragranceNotes: { 
                            ...formData.fragranceNotes, 
                            base: e.target.value.split(',').map(note => note.trim()).filter(note => note)
                          }
                        })}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="Warm Amber, Sandalwood, Vanilla, Musk"
                      />
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <Label className="text-gray-300">Key Features (comma-separated)</Label>
                  <Textarea
                    value={formData.features.join(', ')}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      features: e.target.value.split(',').map(feature => feature.trim()).filter(feature => feature)
                    })}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="Long-lasting 8-12 hour wear, Premium French ingredients, Handcrafted crystal bottle, Cruelty-free and sustainable"
                    rows={3}
                  />
                </div>

                {/* Longevity and Sillage */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="longevity" className="text-gray-300">Longevity</Label>
                    <Input
                      id="longevity"
                      value={formData.longevity}
                      onChange={(e) => setFormData({ ...formData, longevity: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="8-12 hours"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sillage" className="text-gray-300">Sillage</Label>
                    <Input
                      id="sillage"
                      value={formData.sillage}
                      onChange={(e) => setFormData({ ...formData, sillage: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="Moderate to Strong"
                    />
                  </div>
                </div>

                {/* Occasion and Season */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Occasions (comma-separated)</Label>
                    <Input
                      value={formData.occasion.join(', ')}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        occasion: e.target.value.split(',').map(occ => occ.trim()).filter(occ => occ)
                      })}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="Evening, Special Occasions, Date Night"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Seasons (comma-separated)</Label>
                    <Input
                      value={formData.season.join(', ')}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        season: e.target.value.split(',').map(sea => sea.trim()).filter(sea => sea)
                      })}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="Fall, Winter, Spring"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-6">
                  <Checkbox
                    id="featured"
                    checked={formData.featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, featured: !!checked })}
                  />
                  <Label htmlFor="featured" className="text-gray-300">
                  Featured
                  </Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingProduct ? "Update Product" : "Add Product"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
          <CardDescription>
            A list of all products in your store
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
              <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                <TableRow key={product._id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-3">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-10 w-10 rounded object-cover"
                      />
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {product.description?.substring(0, 50)}...
                        </div>
                      </div>
                    </div>
                    </TableCell>
                  <TableCell>{product.category?.name || 'Uncategorized'}</TableCell>
                    <TableCell>
                    <div className="flex items-center space-x-2">
                      <span>PKR {product.price.toFixed(2)}</span>
                      {product.discount > 0 && (
                        <Badge variant="secondary">
                          -{product.discount}%
                        </Badge>
                      )}
                    </div>
                    </TableCell>
                  <TableCell>{product.stockQuantity || 0}</TableCell>
                    <TableCell>
                    <div className="flex space-x-1">
                      {(product.isFeatured || product.featured) && (
                        <Badge variant="default">Featured</Badge>
                      )}
                      {(product.stockQuantity || 0) === 0 && (
                        <Badge variant="destructive">Out of Stock</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(product)}
                        >
                        <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                        onClick={() => handleDelete(product._id)}
                        >
                        <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  )
}

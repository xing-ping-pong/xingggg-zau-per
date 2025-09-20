"use client"

import type React from "react"

import { useState } from "react"
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
import { Plus, Edit, Trash2, Upload } from "lucide-react"

// Mock data - replace with actual data fetching
const mockProducts = [
  {
    id: 1,
    name: "Chanel No. 5",
    price: 150.0,
    category: "Designer Perfumes",
    featured: true,
    discount: 0,
    image: "/chanel-perfume-bottle.jpg",
  },
  {
    id: 2,
    name: "Dior Sauvage",
    price: 120.0,
    category: "Dior",
    featured: false,
    discount: 15,
    image: "/dior-sauvage-perfume.jpg",
  },
  {
    id: 5,
    name: "Ambre Nut 2.0",
    price: 1220.0,
    category: "Designer Perfumes",
    featured: true,
    discount: 10,
    image: "/luxury-amber-perfume.jpg",
  },
]

const categories = [
  { id: 1, name: "Designer Perfumes" },
  { id: 2, name: "Women's Perfume" },
  { id: 4, name: "Dior" },
]

export default function ProductsPage() {
  const [products, setProducts] = useState(mockProducts)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    featured: false,
    discount: "0",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission logic here
    console.log("Form submitted:", formData)
    setIsAddDialogOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      categoryId: "",
      featured: false,
      discount: "0",
    })
    setEditingProduct(null)
  }

  const handleEdit = (product: any) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      categoryId: product.categoryId?.toString() || "",
      featured: product.featured,
      discount: product.discount.toString(),
    })
    setIsAddDialogOpen(true)
  }

  const handleDelete = (productId: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      setProducts(products.filter((p) => p.id !== productId))
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-amber-400">Product Management</h1>
          <p className="text-gray-400 mt-1">Manage your perfume inventory</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-400 hover:bg-amber-500 text-black">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-800 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-amber-400">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                {editingProduct ? "Update product information" : "Create a new product in your inventory"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                    Price ($)
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
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount" className="text-gray-300">
                    Discount (%)
                  </Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="image" className="text-gray-300">
                    Product Image
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Input id="image" type="file" accept="image/*" className="bg-gray-800 border-gray-700 text-white" />
                    <Button type="button" variant="outline" size="icon" className="border-gray-700 bg-transparent">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, featured: checked as boolean })}
                  />
                  <Label htmlFor="featured" className="text-gray-300">
                    Featured Product
                  </Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false)
                    resetForm()
                  }}
                  className="border-gray-700"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-amber-400 hover:bg-amber-500 text-black">
                  {editingProduct ? "Update Product" : "Add Product"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-amber-400">Products</CardTitle>
          <CardDescription className="text-gray-400">Manage your perfume inventory and product details</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800">
                <TableHead className="text-gray-300">ID</TableHead>
                <TableHead className="text-gray-300">Image</TableHead>
                <TableHead className="text-gray-300">Name</TableHead>
                <TableHead className="text-gray-300">Price</TableHead>
                <TableHead className="text-gray-300">Category</TableHead>
                <TableHead className="text-gray-300">Featured</TableHead>
                <TableHead className="text-gray-300">Discount</TableHead>
                <TableHead className="text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id} className="border-gray-800">
                  <TableCell className="text-white">{product.id}</TableCell>
                  <TableCell>
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  </TableCell>
                  <TableCell className="text-white font-medium">{product.name}</TableCell>
                  <TableCell className="text-white">${product.price.toFixed(2)}</TableCell>
                  <TableCell className="text-gray-300">{product.category}</TableCell>
                  <TableCell>
                    {product.featured ? (
                      <Badge className="bg-amber-400/20 text-amber-400">Featured</Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                        Regular
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-white">{product.discount}%</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(product)}
                        className="border-gray-700 hover:bg-gray-800"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                        className="border-red-700 text-red-400 hover:bg-red-900/20"
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

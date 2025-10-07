"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2, FolderTree, Loader2 } from "lucide-react"
import { useToast } from "@/lib/contexts/toast-context"

interface Category {
  _id: string
  name: string
  description?: string
  slug: string
  parentCategory?: {
    _id: string
    name: string
  }
  isActive: boolean
  createdAt: string
  updatedAt: string
  imageUrl?: string
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const { showToast } = useToast()

  interface CategoryFormData {
    name: string;
    description: string;
    parentCategory: string;
    isActive: boolean;
    image: File | null;
    imagePreview: string;
  }
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    description: "",
    parentCategory: "",
    isActive: true,
    image: null,
    imagePreview: ""
  })

  // Fetch categories from API
  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await fetch('/api/categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      
      if (data.success) {
        setCategories(data.data.categories)
      } else {
        showToast('Failed to load categories', 'error')
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      showToast('Failed to load categories', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const token = localStorage.getItem("token")
      const formDataToSend = new FormData()
      formDataToSend.append("name", formData.name)
      formDataToSend.append("description", formData.description)
      formDataToSend.append("parentCategory", formData.parentCategory === "none" ? "" : formData.parentCategory || "")
      formDataToSend.append("isActive", formData.isActive ? "true" : "false")
      if (formData.image) {
        formDataToSend.append("image", formData.image)
      }
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      })
      const data = await response.json()
      if (data.success) {
        showToast('Category created successfully!', 'success')
        setIsAddDialogOpen(false)
        resetForm()
        fetchCategories()
      } else {
        showToast(data.message || 'Failed to create category', 'error')
      }
    } catch (error) {
      console.error('Error creating category:', error)
      showToast('Failed to create category', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCategory) return
    setSaving(true)
    try {
      const token = localStorage.getItem("token")
      const formDataToSend = new FormData()
      formDataToSend.append("name", formData.name)
      formDataToSend.append("description", formData.description)
      formDataToSend.append("parentCategory", formData.parentCategory === "none" ? "" : formData.parentCategory || "")
      formDataToSend.append("isActive", formData.isActive ? "true" : "false")
      if (formData.image) {
        formDataToSend.append("image", formData.image)
      }
      const response = await fetch(`/api/categories/${editingCategory._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      })
      const data = await response.json()
      if (data.success) {
        showToast('Category updated successfully!', 'success')
        setIsEditDialogOpen(false)
        resetForm()
        fetchCategories()
      } else {
        showToast(data.message || 'Failed to update category', 'error')
      }
    } catch (error) {
      console.error('Error updating category:', error)
      showToast('Failed to update category', 'error')
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      parentCategory: "none",
      isActive: true,
      image: null,
      imagePreview: ""
    })
    setEditingCategory(null)
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || "",
      parentCategory: category.parentCategory?._id || "none",
      isActive: category.isActive,
      image: null,
      imagePreview: category.imageUrl || ""
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = async (categoryId: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch(`/api/categories/${categoryId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        const data = await response.json()
        
        if (data.success) {
          showToast('Category deleted successfully!', 'success')
          fetchCategories()
        } else {
          showToast(data.message || 'Failed to delete category', 'error')
        }
      } catch (error) {
        console.error('Error deleting category:', error)
        showToast('Failed to delete category', 'error')
      }
    }
  }

  const getParentCategories = () => {
    return categories.filter((cat) => !cat.parentCategory)
  }

  const getCategoryHierarchy = () => {
    const hierarchy: Category[] = []

    // Get top-level categories first
    const topLevel = categories.filter((cat) => !cat.parentCategory)

    topLevel.forEach((parent) => {
      hierarchy.push(parent)

      // Get children of this parent
      const children = categories.filter((cat) => cat.parentCategory?._id === parent._id)
      children.forEach((child) => {
        hierarchy.push(child)
      })
    })

    return hierarchy
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Loading categories...</span>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-amber-400">Category Management</h1>
          <p className="text-gray-400 mt-1">Organize your product categories</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-400 hover:bg-amber-500 text-black">
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-amber-400">Add New Category</DialogTitle>
              <DialogDescription className="text-gray-400">
                Create a new category for organizing your products
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="image" className="text-gray-300">Category Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files?.[0] || null
                    setFormData(prev => ({
                      ...prev,
                      image: file,
                      imagePreview: file ? URL.createObjectURL(file) : ""
                    }))
                  }}
                  className="bg-gray-800 border-gray-700 text-white"
                />
                {formData.imagePreview && (
                  <img src={formData.imagePreview} alt="Preview" className="w-32 h-20 object-cover rounded border mt-2" />
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">
                  Category Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="e.g., Designer Perfumes"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-300">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white min-h-[100px]"
                  placeholder="Brief description of this category..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parent" className="text-gray-300">
                  Parent Category (Optional)
                </Label>
                <Select
                  value={formData.parentCategory}
                  onValueChange={(value) => setFormData({ ...formData, parentCategory: value })}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="None (Top Level)" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="none">None (Top Level)</SelectItem>
                    {getParentCategories().map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-gray-300">
                  Status
                </Label>
                <Select
                  value={formData.isActive ? "active" : "inactive"}
                  onValueChange={(value) => setFormData({ ...formData, isActive: value === "active" })}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
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
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-amber-400 hover:bg-amber-500 text-black"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Add Category'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Category Modal */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-amber-400">Edit Category</DialogTitle>
            <DialogDescription className="text-gray-400">Update category information</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="edit-image" className="text-gray-300">Category Image</Label>
              <Input
                id="edit-image"
                type="file"
                accept="image/*"
                onChange={e => {
                  const file = e.target.files?.[0] || null
                  setFormData(prev => ({
                    ...prev,
                    image: file,
                    imagePreview: file ? URL.createObjectURL(file) : prev.imagePreview
                  }))
                }}
                className="bg-gray-800 border-gray-700 text-white"
              />
              {formData.imagePreview && (
                <img src={formData.imagePreview} alt="Preview" className="w-32 h-20 object-cover rounded border mt-2" />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-gray-300">
                Category Name *
              </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="e.g., Designer Perfumes"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description" className="text-gray-300">
                Description
              </Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-gray-800 border-gray-700 text-white min-h-[100px]"
                placeholder="Brief description of this category..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-parent" className="text-gray-300">
                Parent Category (Optional)
              </Label>
              <Select
                value={formData.parentCategory}
                onValueChange={(value) => setFormData({ ...formData, parentCategory: value })}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="None (Top Level)" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="none">None (Top Level)</SelectItem>
                  {getParentCategories()
                    .filter((cat) => cat._id !== editingCategory?._id)
                    .map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status" className="text-gray-300">
                Status
              </Label>
              <Select
                value={formData.isActive ? "active" : "inactive"}
                onValueChange={(value) => setFormData({ ...formData, isActive: value === "active" })}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false)
                  resetForm()
                }}
                className="border-gray-700"
                disabled={saving}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-amber-400 hover:bg-amber-500 text-black"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Category'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-amber-400 flex items-center">
            <FolderTree className="mr-2 h-5 w-5" />
            Categories
          </CardTitle>
          <CardDescription className="text-gray-400">
            Manage your product categories in a hierarchical structure
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <FolderTree className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">No categories found</h3>
              <p className="text-gray-500 mb-4">Create your first category to organize your products</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800">
                  <TableHead className="text-gray-300">Category Name</TableHead>
                  <TableHead className="text-gray-300">Description</TableHead>
                  <TableHead className="text-gray-300">Parent Category</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getCategoryHierarchy().map((category) => (
                  <TableRow key={category._id} className="border-gray-800">
                    <TableCell className="text-white">
                      <div className="flex items-center">
                        {category.parentCategory && <span className="text-gray-500 mr-2">└─</span>}
                        <div>
                          <div className="font-medium">{category.name}</div>
                          <div className="text-xs text-gray-500">/{category.slug}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-300 max-w-xs">
                      <div className="truncate">
                        {category.description || "No description"}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {category.parentCategory ? category.parentCategory.name : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={category.isActive ? "default" : "secondary"}
                        className={category.isActive ? "bg-green-600" : "bg-gray-600"}
                      >
                        {category.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(category)}
                          className="border-gray-700 hover:bg-gray-800"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(category._id)}
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}

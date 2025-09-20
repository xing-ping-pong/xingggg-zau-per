"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2, FolderTree } from "lucide-react"

// Mock data - replace with actual data fetching
const mockCategories = [
  { id: 1, name: "Designer Perfumes", parentId: null, level: 0 },
  { id: 2, name: "Women's Perfume", parentId: 1, level: 1 },
  { id: 4, name: "Dior", parentId: 1, level: 1 },
  { id: 5, name: "Men's Cologne", parentId: null, level: 0 },
  { id: 6, name: "Luxury Collection", parentId: null, level: 0 },
]

export default function CategoriesPage() {
  const [categories, setCategories] = useState(mockCategories)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)

  const [formData, setFormData] = useState({
    name: "",
    parentId: "0", // Updated default value to be a non-empty string
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission logic here
    console.log("Form submitted:", formData)
    setIsAddDialogOpen(false)
    resetForm()
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle edit form submission logic here
    console.log("Edit form submitted:", formData, editingCategory)
    setIsEditDialogOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: "",
      parentId: "0", // Updated default value to be a non-empty string
    })
    setEditingCategory(null)
  }

  const handleEdit = (category: any) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      parentId: category.parentId?.toString() || "0", // Updated default value to be a non-empty string
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = (categoryId: number) => {
    if (confirm("Are you sure you want to delete this category?")) {
      setCategories(categories.filter((c) => c.id !== categoryId))
    }
  }

  const getParentCategories = () => {
    return categories.filter((cat) => cat.parentId === null)
  }

  const getCategoryHierarchy = () => {
    const hierarchy: any[] = []

    // Get top-level categories first
    const topLevel = categories.filter((cat) => cat.parentId === null)

    topLevel.forEach((parent) => {
      hierarchy.push({ ...parent, level: 0 })

      // Get children of this parent
      const children = categories.filter((cat) => cat.parentId === parent.id)
      children.forEach((child) => {
        hierarchy.push({ ...child, level: 1 })
      })
    })

    return hierarchy
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
                <Label htmlFor="name" className="text-gray-300">
                  Category Name
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
                <Label htmlFor="parent" className="text-gray-300">
                  Parent Category (Optional)
                </Label>
                <Select
                  value={formData.parentId}
                  onValueChange={(value) => setFormData({ ...formData, parentId: value })}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="None (Top Level)" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="0">None (Top Level)</SelectItem>{" "}
                    {/* Updated value prop to be a non-empty string */}
                    {getParentCategories().map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
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
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-amber-400 hover:bg-amber-500 text-black">
                  Add Category
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
              <Label htmlFor="edit-name" className="text-gray-300">
                Category Name
              </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-gray-800 border-gray-700 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-parent" className="text-gray-300">
                Parent Category (Optional)
              </Label>
              <Select
                value={formData.parentId}
                onValueChange={(value) => setFormData({ ...formData, parentId: value })}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="None (Top Level)" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="0">None (Top Level)</SelectItem>{" "}
                  {/* Updated value prop to be a non-empty string */}
                  {getParentCategories()
                    .filter((cat) => cat.id !== editingCategory?.id)
                    .map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
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
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-amber-400 hover:bg-amber-500 text-black">
                Update Category
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
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800">
                <TableHead className="text-gray-300">Category Name</TableHead>
                <TableHead className="text-gray-300">Parent Category</TableHead>
                <TableHead className="text-gray-300">Level</TableHead>
                <TableHead className="text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getCategoryHierarchy().map((category) => (
                <TableRow key={category.id} className="border-gray-800">
                  <TableCell className="text-white">
                    <div style={{ paddingLeft: `${category.level * 20}px` }} className="flex items-center">
                      {category.level > 0 && <span className="text-gray-500 mr-2">└─</span>}
                      {category.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {category.parentId ? categories.find((c) => c.id === category.parentId)?.name || "-" : "-"}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {category.level === 0 ? "Top Level" : `Level ${category.level}`}
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
                        onClick={() => handleDelete(category.id)}
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

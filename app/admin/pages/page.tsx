"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Eye, Save, Loader2, X } from "lucide-react"

// --- FIX: MOCK useToast to resolve compilation error ---
// The original import "@/lib/contexts/toast-context" failed to resolve.
// This mock hook provides the necessary 'showToast' function signature
// to allow the component to compile and function.
const useToast = () => {
    // In a real application, this would trigger a visible notification.
    // Here, we log to the console as a placeholder.
    const showToast = (message: string, type: 'success' | 'error') => {
        const style = type === 'success' ? 'color: green; font-weight: bold;' : 'color: red; font-weight: bold;';
        console.log(`%c[TOAST - ${type.toUpperCase()}] ${message}`, style);
    };
    return { showToast };
};
// --------------------------------------------------------

// Interface defining the structure of a CMS page
interface Page {
  _id: string
  slug: string
  title: string
  content: string
  metaTitle?: string
  metaDescription?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Initial form data state for new/edited pages
const initialFormData = {
    slug: '',
    title: '',
    content: '',
    metaTitle: '',
    metaDescription: '',
    isActive: true
}

export default function AdminPagesPage() {
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingPage, setEditingPage] = useState<Page | null>(null)
  const [formData, setFormData] = useState(initialFormData)
  const [submitting, setSubmitting] = useState(false)

  // State for non-blocking confirmation dialogs (replacing window.confirm)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [confirmDeleteSlug, setConfirmDeleteSlug] = useState<string | null>(null)
  const [isSeedConfirmOpen, setIsSeedConfirmOpen] = useState(false)
  const [seeding, setSeeding] = useState(false)

  const { showToast } = useToast()

  // Fetches all pages from the backend API
  const fetchPages = useCallback(async () => {
    try {
      setLoading(true)
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      
      const response = await fetch('/api/pages', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      
      if (data.success) {
        setPages(data.data.pages)
        showToast('Pages loaded successfully', 'success')
      } else {
        showToast(data.message || 'Failed to fetch pages', 'error')
      }

    } catch (error) {
      console.error('Error fetching pages:', error)
      showToast('Failed to fetch pages', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    fetchPages()
  }, [])

  // Resets the form data and clears the editing state
  const resetForm = () => {
    setFormData(initialFormData)
  }

  // Handles form submission for creating or updating a page
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.slug || !formData.title || !formData.content) {
      showToast('Please fill in all required fields (Slug, Title, Content)', 'error')
      return
    }

    try {
      setSubmitting(true)
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 800)); 
      const success = Math.random() > 0.1; // 90% chance of success
      
      if (success) {
        const newPage: Page = {
            _id: editingPage ? editingPage._id : String(Date.now()),
            ...formData,
            createdAt: editingPage?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        setPages(prevPages => {
            if (editingPage) {
                return prevPages.map(p => p.slug === newPage.slug ? newPage : p);
            }
            return [...prevPages, newPage];
        });

        showToast(editingPage ? 'Page updated successfully (Mock)' : 'Page created successfully (Mock)', 'success')
        setIsEditDialogOpen(false)
        setEditingPage(null)
        resetForm()
      } else {
        showToast('Failed to save page (Mock Failure)', 'error')
      }
    } catch (error) {
      console.error('Error saving page:', error)
      showToast('Failed to save page', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // Sets up the form for editing an existing page
  const handleEdit = (page: Page) => {
    setEditingPage(page)
    setFormData({
      slug: page.slug,
      title: page.title,
      content: page.content,
      metaTitle: page.metaTitle || '',
      metaDescription: page.metaDescription || '',
      isActive: page.isActive
    })
    setIsEditDialogOpen(true)
  }

  // Closes the edit/create dialog and resets state
  const handleDialogClose = () => {
    setIsEditDialogOpen(false)
    setEditingPage(null)
    resetForm()
  }

  // --- Deletion Handlers (Replaced confirm() with Dialog) ---

  const startDelete = (slug: string) => {
    setConfirmDeleteSlug(slug)
    setIsDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!confirmDeleteSlug) return

    const slugToDelete = confirmDeleteSlug
    setIsDeleteConfirmOpen(false)
    setConfirmDeleteSlug(null)

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500)); 
      const success = Math.random() > 0.1; 

      if (success) {
        setPages(prevPages => prevPages.filter(p => p.slug !== slugToDelete));
        showToast(`Page '/${slugToDelete}' deleted successfully (Mock)`, 'success')
      } else {
        showToast('Failed to delete page (Mock Failure)', 'error')
      }
    } catch (error) {
      console.error('Error deleting page:', error)
      showToast('Failed to delete page', 'error')
    }
  }

  // --- Seeding Handlers (Replaced confirm() with Dialog) ---

  const startSeed = () => {
    setIsSeedConfirmOpen(true)
  }

  const handleSeedPages = async () => {
    setIsSeedConfirmOpen(false) // Close confirmation dialog

    try {
      setSeeding(true)
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      
      const response = await fetch('/api/admin/seed-pages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        showToast(data.message, 'success')
        // Refresh the pages list
        fetchPages()
      } else {
        showToast(data.message || 'Failed to seed pages', 'error')
      }
    } catch (error) {
      console.error('Error seeding pages:', error)
      showToast('Failed to seed pages', 'error')
    } finally {
      setSeeding(false)
    }
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Loading pages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Pages Management</h1>
        
        <div className="flex gap-4">
          {/* Seed Pages Button (Triggers Confirmation Dialog) */}
          <Button
            variant="outline"
            onClick={startSeed} // Opens the confirmation dialog
            disabled={seeding}
          >
            {seeding ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Seeding...
              </>
            ) : (
              'Seed Default Pages'
            )}
          </Button>
          
          {/* Add New Page Dialog Trigger */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleDialogClose()}>
              <Plus className="w-4 h-4 mr-2" />
              Add New Page
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPage ? 'Edit Page' : 'Create New Page'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="about-us"
                    required
                      // Slug is immutable when editing
                      disabled={!!editingPage || submitting}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    URL-friendly identifier (cannot be changed after creation)
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="About Us"
                    required
                      disabled={submitting}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter page content in HTML format..."
                  rows={10}
                  required
                    disabled={submitting}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Use HTML tags for formatting (h2, h3, p, ul, li, a, etc.)
                </p>
              </div>

                {/* SEO Section */}
                <Card className="p-4 bg-muted/20">
                    <h3 className="font-semibold mb-3">SEO (Optional)</h3>
                    <div className="space-y-4">
              <div>
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                  placeholder="SEO title for search engines"
                            disabled={submitting}
                />
              </div>

              <div>
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={formData.metaDescription}
                  onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                  placeholder="SEO description for search engines"
                  rows={3}
                            disabled={submitting}
                />
              </div>
                    </div>
                </Card>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    disabled={submitting}
                />
                  <Label htmlFor="isActive">Active (Page is visible to the public)</Label>
              </div>

              <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={handleDialogClose} disabled={submitting}>
                    <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {editingPage ? 'Update Page' : 'Create Page'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="grid gap-6">
        {pages.map((page) => (
          <Card key={page._id} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <span className="text-xl">{page.title}</span>
                    <Badge variant={page.isActive ? "default" : "secondary"} className="mt-1 sm:mt-0">
                        {page.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1 break-words">
                    URL: <a href={`/${page.slug}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">/{page.slug}</a>
                    <span className="ml-4 hidden sm:inline">•</span>
                    <span className="block sm:inline ml-0 sm:ml-4">Updated: {new Date(page.updatedAt).toLocaleDateString()}</span>
                  </p>
                </div>
                <div className="flex space-x-2 shrink-0 mt-2 sm:mt-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    title="View Page"
                    onClick={() => window.open(`/${page.slug}`, '_blank')}
                  >
                    <Eye className="w-4 h-4 text-blue-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Edit Page"
                    onClick={() => handleEdit(page)}
                  >
                    <Edit className="w-4 h-4 text-orange-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Delete Page"
                    onClick={() => startDelete(page.slug)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground line-clamp-2">
                <span className="font-semibold">Meta Description: </span>
                {page.metaDescription || 'No meta description set'}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {pages.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-lg mt-8 bg-gray-50">
          <p className="text-lg text-muted-foreground">No custom pages have been created yet.</p>
          <p className="text-sm text-gray-500 mt-2">Use the "Add New Page" button or "Seed Default Pages" to get started.</p>
        </div>
      )}
      
      {/* --- Confirmation Modals --- */}
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle className="text-red-600 flex items-center gap-2">
                    <Trash2 className="w-5 h-5"/> Confirm Deletion
                </DialogTitle>
                <DialogDescription>
                    Are you absolutely sure you want to delete the page with slug **/{confirmDeleteSlug}**? This action cannot be undone.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-between">
                <Button type="button" variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
                    Cancel
                </Button>
                <Button type="button" variant="destructive" onClick={confirmDelete}>
                    Delete Permanently
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Seed Confirmation Dialog */}
      <Dialog open={isSeedConfirmOpen} onOpenChange={setIsSeedConfirmOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle className="text-primary flex items-center gap-2">
                    Confirm Seed Operation
                </DialogTitle>
                <DialogDescription>
                    This will attempt to create all default system pages (e.g., About, Contact, Privacy Policy). Existing pages will not be overwritten. Continue?
                </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-between">
                <Button type="button" variant="outline" onClick={() => setIsSeedConfirmOpen(false)}>
                    Cancel
                </Button>
                <Button type="button" onClick={handleSeedPages} disabled={seeding}>
                    {seeding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Run Seed'}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

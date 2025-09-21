"use client"

import React, { createContext, useContext, useState, useCallback } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

interface Toast {
  id: string
  title?: string
  description?: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  simple?: boolean // For single-line toasts
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id }
    
    setToasts(prev => [...prev, newToast])
    
    // Auto remove after duration (default 3 seconds)
    const duration = toast.duration || 3000
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

function ToastContainer() {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
    }
  }

  const getBackgroundColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200 dark:bg-green-900/90 dark:border-green-700'
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-900/90 dark:border-red-700'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/90 dark:border-yellow-700'
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/90 dark:border-blue-700'
    }
  }

  // Simple single-line toast
  if (toast.simple) {
    return (
      <div
        className={`
          ${getBackgroundColor()}
          border-2 rounded-lg px-4 py-3 shadow-xl max-w-sm w-full
          animate-in slide-in-from-right-full duration-300
          backdrop-blur-sm
        `}
      >
        <div className="flex items-center space-x-2">
          {getIcon()}
          <span className="text-sm font-medium text-foreground dark:text-white flex-1">
            {toast.title || toast.description}
          </span>
          <button
            onClick={() => onRemove(toast.id)}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground dark:text-gray-300 dark:hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  // Full toast with title and description
  return (
    <div
      className={`
        ${getBackgroundColor()}
        border-2 rounded-lg p-4 shadow-xl max-w-sm w-full
        animate-in slide-in-from-right-full duration-300
        backdrop-blur-sm
      `}
    >
      <div className="flex items-start space-x-3">
        {getIcon()}
        <div className="flex-1 min-w-0">
          {toast.title && (
            <p className="text-sm font-medium text-foreground dark:text-white">
              {toast.title}
            </p>
          )}
          {toast.description && (
            <p className="text-sm text-muted-foreground dark:text-gray-200 mt-1">
              {toast.description}
            </p>
          )}
        </div>
        <button
          onClick={() => onRemove(toast.id)}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground dark:text-gray-300 dark:hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

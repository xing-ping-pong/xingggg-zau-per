"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, LogOut, Settings, User } from "lucide-react"

export function AdminHeader() {
  return (
    <header className="h-16 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
      <div className="flex h-full items-center justify-between px-8">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-white">Admin Panel</h2>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
            <Bell className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/admin-avatar.png" alt="Admin" />
                  <AvatarFallback className="bg-amber-400 text-black">A</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-gray-900 border-gray-800" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-white">Admin User</p>
                  <p className="text-xs leading-none text-gray-400">admin@rosia.com</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-800" />
              <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gray-800">
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gray-800">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-800" />
              <DropdownMenuItem className="text-red-400 hover:text-red-300 hover:bg-red-900/20">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

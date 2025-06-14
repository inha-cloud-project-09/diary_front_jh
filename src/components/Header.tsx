"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Bell, BookOpen, Home, Users, User, LogOut } from "lucide-react"
import { useUser } from "@/lib/context/UserContext"

interface HeaderProps {
  title?: string
  showBackButton?: boolean
  showMoreButton?: boolean
  onMoreClick?: () => void
}

export default function Header({ showBackButton = false, showMoreButton = false, onMoreClick }: HeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const { user } = useUser()

  const handleBack = () => {
    router.back()
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  const handleLogout = () => {
    // TODO: 로그아웃 로직 구현
    console.log("로그아웃")
  }

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <button
                onClick={handleBack}
                className="mr-2 flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 hover:bg-slate-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
            )}
            <nav className="flex items-center space-x-6">
              <button
                onClick={() => router.push("/dashboard")}
                className={cn(
                  "flex items-center space-x-2",
                  isActive("/dashboard") ? "text-blue-600" : "text-slate-600 hover:text-slate-900"
                )}
              >
                <Home className="h-5 w-5" />
                <span className="font-medium hidden sm:inline">홈</span>
              </button>
              <button
                onClick={() => router.push("/my-diary")}
                className={cn(
                  "flex items-center space-x-2",
                  isActive("/my-diary") ? "text-blue-600" : "text-slate-600 hover:text-slate-900"
                )}
              >
                <BookOpen className="h-5 w-5" />
                <span className="font-medium hidden sm:inline">내 일기</span>
              </button>
              <button
                onClick={() => router.push("/opposite")}
                className={cn(
                  "flex items-center space-x-2",
                  isActive("/my-diary") ? "text-blue-600" : "text-slate-600 hover:text-slate-900"
                )}
              >
                <BookOpen className="h-5 w-5" />
                <span className="font-medium hidden sm:inline">아는 사람 얘기해줄게</span>
              </button>
              <button
                onClick={() => router.push("/ai_recovery")}
                className={cn(
                  "flex items-center space-x-2",
                  isActive("/my-diary") ? "text-blue-600" : "text-slate-600 hover:text-slate-900"
                )}
              >
                <BookOpen className="h-5 w-5" />
                <span className="font-medium hidden sm:inline">나를 돌아볼게</span>
              </button>
              <button
                onClick={() => router.push("/ai_routine")}
                className={cn(
                  "flex items-center space-x-2",
                  isActive("/my-diary") ? "text-blue-600" : "text-slate-600 hover:text-slate-900"
                )}
              >
                <BookOpen className="h-5 w-5" />
                <span className="font-medium hidden sm:inline">루틴</span>
              </button>
              <button
                onClick={() => router.push("/communities")}
                className={cn(
                  "flex items-center space-x-2",
                  isActive("/communities") ? "text-blue-600" : "text-slate-600 hover:text-slate-900"
                )}
              >
                <Users className="h-5 w-5" />
                <span className="font-medium hidden sm:inline">나눔방</span>
              </button>
            </nav>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => router.push("/notifications")}
              className="p-2 rounded-md text-slate-600 hover:bg-slate-100 relative"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex h-4 w-4 rounded-full bg-red-500"></span>
              </span>
            </button>
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="p-2 rounded-md text-slate-600 hover:bg-slate-100"
              >
                <User className="h-5 w-5" />
              </button>
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-slate-200 py-1">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-sm font-medium text-slate-900">{user?.nickname || '사용자'}</p>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-slate-600 hover:bg-slate-50 flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>로그아웃</span>
                  </button>
                </div>
              )}
            </div>
            {showMoreButton && (
              <button
                onClick={onMoreClick}
                className="p-2 rounded-md text-slate-600 hover:bg-slate-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="19" cy="12" r="1" />
                  <circle cx="5" cy="12" r="1" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
} 
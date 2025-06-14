"use client"

import { useState, useEffect } from "react"
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  SkipForward,
  Play,
  Trash2,
  RefreshCw,
  TrendingUp,
  Heart,
  Brain,
  Target,
  Award,
  BarChart3,
  PieChart,
  Activity,
  Star,
  MessageSquare,
  Timer,
  Zap,
  ArrowLeft,
  X,
  AlertTriangle,
  Info,
} from "lucide-react"

interface RoutineDB {
  id: number
  user_id: number
  title: string
  description?: string
  start_time: string
  end_time: string
  target_date: string
  category: string
  emotion?: string
  intensity: number
  priority: string
  difficulty: string
  duration_minutes: number
  generation_type: string
  recommendation_reason?: string
  calendar_event_id?: string
  calendar_html_link?: string
  status: "ACTIVE" | "COMPLETED" | "CANCELLED" | "SKIPPED"
  analyzed_diaries_count: number
  emotion_scores?: any
  gpt_metadata?: any
  created_at: string
  updated_at: string
}

interface RoutineStats {
  period: string
  stats_by_generation_type: any
  category_distribution: Array<{
    category: string
    count: number
    completed_count: number
  }>
  total_created: number
  overall_completion_rate: number
}

const API_BASE = "http://3.236.68.128:8000"

export default function RoutineDashboard() {
  // States
  const [token, setToken] = useState("")
  const [googleToken, setGoogleToken] = useState("")
  const [routines, setRoutines] = useState<RoutineDB[]>([])
  const [stats, setStats] = useState<RoutineStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [currentView, setCurrentView] = useState<"list" | "stats">("list")

  // Modal states
  const [showTokenModal, setShowTokenModal] = useState(false)
  const [showGoogleTokenModal, setShowGoogleTokenModal] = useState(false)
  const [tokenInput, setTokenInput] = useState("")
  const [googleTokenInput, setGoogleTokenInput] = useState("")

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")

  // Load token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("auth-token")
    const savedGoogleToken = localStorage.getItem("google-access-token")
    if (savedToken) {
      setToken(savedToken)
      setTokenInput(savedToken)
    } else {
      setError("JWT 토큰이 설정되지 않았습니다. 먼저 토큰을 설정해주세요.")
    }
    if (savedGoogleToken) {
      setGoogleToken(savedGoogleToken)
      setGoogleTokenInput(savedGoogleToken)
    }
  }, [])

  // Token management
  const handleSaveToken = () => {
    if (!tokenInput.trim()) {
      alert("토큰을 입력해주세요!")
      return
    }

    const newToken = tokenInput.trim()
    setToken(newToken)
    localStorage.setItem("auth-token", newToken)
    setShowTokenModal(false)
    setError("")
    alert("✅ JWT 토큰이 저장되었습니다!")
  }

  const handleSaveGoogleToken = () => {
    if (!googleTokenInput.trim()) {
      alert("Google 토큰을 입력해주세요!")
      return
    }

    if (!googleTokenInput.startsWith("ya29.")) {
      alert("⚠️ 올바른 Google Access Token 형식이 아닙니다.\n(ya29.로 시작해야 함)")
      return
    }

    const newGoogleToken = googleTokenInput.trim()
    setGoogleToken(newGoogleToken)
    localStorage.setItem("google-access-token", newGoogleToken)
    setShowGoogleTokenModal(false)
    alert("✅ Google 토큰이 저장되었습니다! 이제 캘린더 기능을 사용할 수 있습니다.")
  }

  const clearGoogleToken = () => {
    setGoogleToken("")
    setGoogleTokenInput("")
    localStorage.removeItem("google-access-token")
    setShowGoogleTokenModal(false)
    alert("🗑️ Google 토큰이 초기화되었습니다!")
  }

  // API utility
  const apiCall = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
    if (!token) {
      throw new Error("JWT 토큰이 설정되지 않았습니다.")
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Auth-Token": token,
        ...options.headers,
      },
      body: options.body,
      mode: "cors",
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `HTTP ${response.status}`)
    }

    return await response.json()
  }

  // Load routines
  const loadRoutines = async () => {
    try {
      setIsLoading(true)
      setError("")

      const params = new URLSearchParams()
      if (statusFilter !== "all") params.append("status", statusFilter.toUpperCase())
      if (dateFilter !== "all") {
        const today = new Date()
        if (dateFilter === "today") {
          params.append("target_date", today.toISOString().split("T")[0])
        }
      }

      const data = await apiCall(`/api/routine/routines?${params.toString()}`)

      let filteredRoutines = data

      if (categoryFilter !== "all") {
        filteredRoutines = filteredRoutines.filter((r: RoutineDB) => r.category === categoryFilter)
      }

      if (dateFilter === "week") {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        filteredRoutines = filteredRoutines.filter((r: RoutineDB) => new Date(r.target_date) >= weekAgo)
      }

      // Sort routines by target_date and then start_time for timeline effect
      filteredRoutines.sort((a: RoutineDB, b: RoutineDB) => {
        const dateComparison = new Date(a.target_date).getTime() - new Date(b.target_date).getTime()
        if (dateComparison !== 0) {
          return dateComparison
        }
        return new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      })

      setRoutines(filteredRoutines)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Load stats
  const loadStats = async () => {
    try {
      setIsLoading(true)
      const data = await apiCall("/api/routine/routines/stats")
      setStats(data)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Update routine status
  const updateRoutineStatus = async (routineId: number, status: string, feedback?: string) => {
    try {
      const body = {
        status: status.toUpperCase(),
        feedback,
        satisfaction_score: undefined,
        actual_duration_minutes: undefined,
      }

      await apiCall(`/api/routine/routines/${routineId}/status`, {
        method: "PATCH",
        body: JSON.stringify(body),
      })

      const statusMessages = {
        COMPLETED: "✅ 루틴을 완료했습니다!",
        CANCELLED: "❌ 루틴을 취소했습니다.",
        SKIPPED: "⏭️ 루틴을 건너뛰었습니다.",
      }

      alert(statusMessages[status.toUpperCase() as keyof typeof statusMessages] || "상태가 업데이트되었습니다.")

      loadRoutines()
    } catch (error: any) {
      alert(`오류: ${error.message}`)
    }
  }

  // Delete routine
  const deleteRoutine = async (routineId: number) => {
    if (!confirm("정말로 이 루틴을 삭제하시겠습니까?")) return

    try {
      await apiCall(`/api/routine/routines/${routineId}`, {
        method: "DELETE",
      })

      alert("🗑️ 루틴이 삭제되었습니다.")
      loadRoutines()
    } catch (error: any) {
      alert(`삭제 실패: ${error.message}`)
    }
  }

  useEffect(() => {
    if (token) {
      if (currentView === "list") {
        loadRoutines()
      } else if (currentView === "stats") {
        loadStats()
      }
    }
  }, [currentView, statusFilter, categoryFilter, dateFilter, token])

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    })
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      명상: Brain,
      운동: Activity,
      창작: Star,
      소통: MessageSquare,
      휴식: Timer,
      학습: Target,
      자연: Heart,
      음악: Zap,
    }
    return icons[category] || Target
  }

  const getStatusColor = (status: string) => {
    const colors = {
      ACTIVE: "bg-blue-100 text-blue-700 border border-blue-200",
      COMPLETED: "bg-green-100 text-green-700 border border-green-200",
      CANCELLED: "bg-red-100 text-red-700 border border-red-200",
      SKIPPED: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    }
    return colors[status.toUpperCase() as keyof typeof colors] || "bg-gray-100 text-gray-700 border border-gray-200"
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      ACTIVE: Play,
      COMPLETED: CheckCircle2,
      CANCELLED: XCircle,
      SKIPPED: SkipForward,
    }
    return icons[status.toUpperCase() as keyof typeof icons] || Play
  }

  const getCategoryStyling = (category: string) => {
    const styles: Record<string, { bg: string; text: string; iconBg: string; iconText: string; border: string }> = {
      명상: {
        bg: "bg-purple-50",
        text: "text-purple-700",
        iconBg: "bg-purple-100",
        iconText: "text-purple-600",
        border: "border-purple-500",
      },
      운동: {
        bg: "bg-orange-50",
        text: "text-orange-700",
        iconBg: "bg-orange-100",
        iconText: "text-orange-600",
        border: "border-orange-500",
      },
      창작: {
        bg: "bg-yellow-50",
        text: "text-yellow-700",
        iconBg: "bg-yellow-100",
        iconText: "text-yellow-600",
        border: "border-yellow-500",
      },
      소통: {
        bg: "bg-teal-50",
        text: "text-teal-700",
        iconBg: "bg-teal-100",
        iconText: "text-teal-600",
        border: "border-teal-500",
      },
      휴식: {
        bg: "bg-cyan-50",
        text: "text-cyan-700",
        iconBg: "bg-cyan-100",
        iconText: "text-cyan-600",
        border: "border-cyan-500",
      },
      학습: {
        bg: "bg-blue-50",
        text: "text-blue-700",
        iconBg: "bg-blue-100",
        iconText: "text-blue-600",
        border: "border-blue-500",
      },
      자연: {
        bg: "bg-green-50",
        text: "text-green-700",
        iconBg: "bg-green-100",
        iconText: "text-green-600",
        border: "border-green-500",
      },
      음악: {
        bg: "bg-pink-50",
        text: "text-pink-700",
        iconBg: "bg-pink-100",
        iconText: "text-pink-600",
        border: "border-pink-500",
      },
    }
    return (
      styles[category] || {
        bg: "bg-gray-50",
        text: "text-gray-700",
        iconBg: "bg-gray-100",
        iconText: "text-gray-600",
        border: "border-gray-500",
      }
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-100 text-gray-800">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/80 sticky top-0 z-50 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Target className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-800">루틴 대시보드</h1>
              </div>
              <nav className="hidden md:flex space-x-2">
                {[
                  { view: "list", label: "루틴 관리", icon: Target },
                  { view: "stats", label: "통계", icon: BarChart3 },
                ].map((item) => (
                  <button
                    key={item.view}
                    onClick={() => setCurrentView(item.view as "list" | "stats")}
                    className={`px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 ease-in-out flex items-center space-x-2 text-sm
                      ${
                        currentView === item.view
                          ? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/80"
                      }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 text-xs font-medium text-gray-600">
                <div className="flex items-center space-x-1.5">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${token ? "bg-green-500" : "bg-red-500"} ring-2 ring-offset-1 ${token ? "ring-green-200" : "ring-red-200"}`}
                  />
                  <span>JWT</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${googleToken ? "bg-green-500" : "bg-red-500"} ring-2 ring-offset-1 ${googleToken ? "ring-green-200" : "ring-red-200"}`}
                  />
                  <span>Google</span>
                </div>
              </div>

              <button
                onClick={() => setShowTokenModal(true)}
                className="px-3.5 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
              >
                JWT 설정
              </button>
              <button
                onClick={() => setShowGoogleTokenModal(true)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
              >
                Google 설정
              </button>

              <button
                onClick={() => window.history.back()}
                className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors flex items-center space-x-2 text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>돌아가기</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {error && (
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4 shadow-md">
            <div className="flex items-center">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-3 flex-shrink-0" />
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {currentView === "list" && (
          <div>
            <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 mb-8 shadow-lg border border-gray-200/80">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="mb-6 md:mb-0">
                  <h2 className="text-3xl font-extrabold text-gray-800 mb-1">내 루틴 관리</h2>
                  <p className="text-gray-600 text-sm">
                    총 {routines.length}개의 루틴이 있습니다. 드래그 앤 드롭으로 순서를 변경할 수 있습니다.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  {[
                    {
                      value: statusFilter,
                      setter: setStatusFilter,
                      options: [
                        { value: "all", label: "모든 상태" },
                        { value: "active", label: "진행중" },
                        { value: "completed", label: "완료" },
                        { value: "cancelled", label: "취소" },
                        { value: "skipped", label: "건너뜀" },
                      ],
                    },
                    {
                      value: categoryFilter,
                      setter: setCategoryFilter,
                      options: [
                        { value: "all", label: "모든 카테고리" },
                        { value: "명상", label: "명상" },
                        { value: "운동", label: "운동" },
                        { value: "창작", label: "창작" },
                        { value: "소통", label: "소통" },
                        { value: "휴식", label: "휴식" },
                        { value: "학습", label: "학습" },
                        { value: "자연", label: "자연" },
                        { value: "음악", label: "음악" },
                      ],
                    },
                    {
                      value: dateFilter,
                      setter: setDateFilter,
                      options: [
                        { value: "all", label: "모든 날짜" },
                        { value: "today", label: "오늘" },
                        { value: "week", label: "최근 7일" },
                      ],
                    },
                  ].map((filterItem, idx) => (
                    <select
                      key={idx}
                      value={filterItem.value}
                      onChange={(e) => filterItem.setter(e.target.value)}
                      className="px-4 py-2.5 border border-gray-300 bg-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm appearance-none"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 0.5rem center",
                        backgroundSize: "1.5em 1.5em",
                        paddingRight: "2.5rem",
                      }}
                    >
                      {filterItem.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ))}
                  <button
                    onClick={loadRoutines}
                    disabled={isLoading}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 text-sm shadow-md disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                    <span>새로고침</span>
                  </button>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-20">
                <RefreshCw className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-6" />
                <p className="text-xl text-gray-600 font-semibold">루틴을 불러오는 중...</p>
                <p className="text-gray-500">잠시만 기다려주세요.</p>
              </div>
            ) : routines.length === 0 ? (
              <div className="text-center py-20">
                <div className="bg-white/80 backdrop-blur-md rounded-2xl p-12 shadow-xl border border-gray-200/80 max-w-lg mx-auto">
                  <Target className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-gray-700 mb-3">루틴이 없습니다</h3>
                  <p className="text-gray-500 mb-8">일기 뷰어에서 새로운 AI 루틴을 생성해보세요!</p>
                  <button
                    onClick={() => window.history.back()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-lg font-semibold transition-colors text-base shadow-lg hover:shadow-xl"
                  >
                    일기 뷰어로 돌아가기
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {" "}
                {/* Vertical stack for timeline */}
                {routines.map((routine) => {
                  const CategoryIcon = getCategoryIcon(routine.category)
                  const StatusIcon = getStatusIcon(routine.status)
                  const categoryStyle = getCategoryStyling(routine.category)

                  return (
                    <div
                      key={routine.id}
                      className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 ease-in-out hover:shadow-2xl border-l-4 ${categoryStyle.border}`}
                    >
                      <div className="p-6 sm:p-8">
                        <div className="flex flex-col sm:flex-row justify-between items-start mb-4 pb-4 border-b border-gray-200">
                          <div>
                            <p className="text-xl sm:text-2xl font-bold text-gray-800">
                              {formatDate(routine.target_date)}
                            </p>
                            <p className="text-sm text-gray-500 flex items-center space-x-2 mt-1">
                              <Clock className="w-4 h-4" />
                              <span>
                                {formatTime(routine.start_time)} - {formatTime(routine.end_time)} (
                                {routine.duration_minutes}분)
                              </span>
                            </p>
                          </div>
                          <div
                            className={`mt-3 sm:mt-0 px-3.5 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(routine.status)} flex items-center space-x-1.5 shadow-sm`}
                          >
                            <StatusIcon className="w-4 h-4" />
                            <span>{routine.status.charAt(0) + routine.status.slice(1).toLowerCase()}</span>
                          </div>
                        </div>

                        <div className="flex items-start space-x-4 mb-5">
                          <div className={`p-3 rounded-xl ${categoryStyle.iconBg} shadow-sm`}>
                            <CategoryIcon className={`w-7 h-7 ${categoryStyle.iconText}`} />
                          </div>
                          <div>
                            <h3 className="text-2xl font-semibold text-gray-900 leading-tight">{routine.title}</h3>
                            <p className={`text-sm font-medium ${categoryStyle.text}`}>{routine.category}</p>
                          </div>
                        </div>

                        {routine.description && (
                          <p className="text-gray-700 mb-5 text-base leading-relaxed prose prose-sm max-w-none">
                            {routine.description}
                          </p>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600 mb-6">
                          <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <Zap className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                            <div>
                              <strong>난이도:</strong> {routine.difficulty}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <TrendingUp className="w-5 h-5 text-purple-500 flex-shrink-0" />
                            <div>
                              <strong>우선순위:</strong> {routine.priority}
                            </div>
                          </div>
                        </div>

                        {routine.recommendation_reason && (
                          <div
                            className={`p-4 rounded-lg border ${categoryStyle.bg} ${categoryStyle.border.replace("border-", "border-l-4 border-")} mb-6 text-sm flex items-start space-x-3 shadow-sm`}
                          >
                            <Info className={`w-6 h-6 ${categoryStyle.iconText} flex-shrink-0 mt-0.5`} />
                            <div className={`${categoryStyle.text}`}>
                              <strong className="font-semibold">AI 추천:</strong> {routine.recommendation_reason}
                            </div>
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex flex-wrap gap-2">
                            {routine.status.toUpperCase() === "ACTIVE" ? (
                              <>
                                <button
                                  onClick={() => updateRoutineStatus(routine.id, "COMPLETED")}
                                  className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white py-2.5 px-5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>완료</span>
                                </button>
                                <button
                                  onClick={() => updateRoutineStatus(routine.id, "SKIPPED")}
                                  className="flex-1 sm:flex-none bg-yellow-500 hover:bg-yellow-600 text-white py-2.5 px-5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                                >
                                  <SkipForward className="w-4 h-4" />
                                  <span>건너뛰기</span>
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => updateRoutineStatus(routine.id, "ACTIVE")}
                                className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                              >
                                <Play className="w-4 h-4" />
                                <span>다시 활성화</span>
                              </button>
                            )}
                            <button
                              onClick={() => deleteRoutine(routine.id)}
                              className="sm:ml-auto bg-red-600 hover:bg-red-700 text-white py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span className="hidden sm:inline">삭제</span>
                            </button>
                          </div>

                          {routine.calendar_html_link && (
                            <a
                              href={routine.calendar_html_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-3 sm:mt-0 text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium flex items-center space-x-1.5 transition-colors"
                            >
                              <Calendar className="w-4 h-4" />
                              <span>Google Calendar에서 보기</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {currentView === "stats" && (
          <div>
            <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 mb-8 shadow-lg border border-gray-200/80">
              <h2 className="text-3xl font-extrabold text-gray-800 mb-1">루틴 통계</h2>
              <p className="text-gray-600 text-sm">당신의 루틴 수행 현황을 한눈에 확인해보세요.</p>
            </div>

            {isLoading ? (
              <div className="text-center py-20">
                <RefreshCw className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-6" />
                <p className="text-xl text-gray-600 font-semibold">통계를 불러오는 중...</p>
                <p className="text-gray-500">잠시만 기다려주세요.</p>
              </div>
            ) : stats ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { title: "총 루틴", value: stats.total_created, icon: Target, color: "text-blue-600", unit: "개" },
                    {
                      title: "완료율",
                      value: stats.overall_completion_rate.toFixed(1),
                      icon: Award,
                      color: "text-green-600",
                      unit: "%",
                    },
                    { title: "분석 기간", value: stats.period, icon: Calendar, color: "text-purple-600", unit: "" },
                    {
                      title: "카테고리 수",
                      value: stats.category_distribution.length,
                      icon: PieChart,
                      color: "text-orange-600",
                      unit: "종류",
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-200/80"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">{item.title}</h3>
                          <p className={`text-3xl font-bold ${item.color}`}>
                            {item.value}
                            {item.unit}
                          </p>
                        </div>
                        <item.icon className={`w-10 h-10 ${item.color} opacity-80`} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-200/80">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6">카테고리별 현황</h3>
                  <div className="space-y-5">
                    {stats.category_distribution.map((cat, index) => {
                      const CategoryIcon = getCategoryIcon(cat.category)
                      const completionRate = cat.count > 0 ? (cat.completed_count / cat.count) * 100 : 0
                      const categoryStyle = getCategoryStyling(cat.category)

                      return (
                        <div
                          key={index}
                          className={`p-5 rounded-lg border ${categoryStyle.bg} ${categoryStyle.border.replace("border-", "border-l-4 border-")} shadow-sm`}
                        >
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                            <div className="flex items-center space-x-4 mb-3 sm:mb-0">
                              <div className={`p-2.5 rounded-lg ${categoryStyle.iconBg}`}>
                                <CategoryIcon className={`w-6 h-6 ${categoryStyle.iconText}`} />
                              </div>
                              <div>
                                <h4 className={`font-semibold text-lg ${categoryStyle.text}`}>{cat.category}</h4>
                                <p className="text-xs text-gray-500">
                                  {cat.count}개 루틴 • {cat.completed_count}개 완료
                                </p>
                              </div>
                            </div>
                            <div className="text-right w-full sm:w-auto">
                              <p
                                className={`text-2xl font-bold ${completionRate >= 75 ? "text-green-600" : completionRate >= 50 ? "text-yellow-600" : "text-red-600"}`}
                              >
                                {completionRate.toFixed(1)}%
                              </p>
                              <div className="w-full sm:w-28 h-2.5 bg-gray-200 rounded-full mt-1.5">
                                <div
                                  className={`h-full rounded-full ${completionRate >= 75 ? "bg-green-500" : completionRate >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                                  style={{ width: `${completionRate}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="bg-white/80 backdrop-blur-md rounded-2xl p-12 shadow-xl border border-gray-200/80 max-w-lg mx-auto">
                  <BarChart3 className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-gray-700 mb-3">통계 데이터가 없습니다</h3>
                  <p className="text-gray-500">루틴을 생성하고 사용해보세요!</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="bg-white/70 backdrop-blur-sm border-t border-gray-200/80 mt-16">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 text-xs">
            <p>&copy; {new Date().getFullYear()} 루틴 대시보드. 당신의 AI 루틴을 체계적으로 관리하세요.</p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {[
        {
          show: showTokenModal,
          setter: setShowTokenModal,
          title: "🔐 JWT 토큰 설정",
          description: "WithU Diary API에 접근하기 위한 JWT 토큰을 입력해주세요.",
          inputLabel: "JWT 토큰",
          inputValue: tokenInput,
          inputSetter: setTokenInput,
          placeholder: "eyJhbGciOiJIUzI1NiJ9...",
          onSave: handleSaveToken,
          saveText: "저장",
          themeColor: "blue",
        },
        {
          show: showGoogleTokenModal,
          setter: setShowGoogleTokenModal,
          title: "📅 Google Calendar 연동",
          description: "", // Custom content below
          inputLabel: "Google Calendar Access Token",
          inputValue: googleTokenInput,
          inputSetter: setGoogleTokenInput,
          placeholder: "ya29.a0AfH6SMBx...",
          onSave: handleSaveGoogleToken,
          onClear: clearGoogleToken,
          saveText: "저장하고 연동",
          themeColor: "green",
        },
      ].map(
        (modal) =>
          modal.show && (
            <div
              key={modal.title}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
            >
              <div className="bg-white rounded-2xl p-7 sm:p-8 max-w-lg w-full shadow-2xl transform transition-all duration-300 ease-out scale-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-2xl font-bold text-gray-800`}>{modal.title}</h3>
                  <button
                    onClick={() => modal.setter(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {modal.description && <p className="text-gray-600 mb-6 text-sm">{modal.description}</p>}

                {modal.title === "📅 Google Calendar 연동" && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6 text-xs text-green-700 space-y-2 shadow-sm">
                    <h4 className="font-semibold text-green-800 text-sm">🔧 토큰 받는 방법:</h4>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>
                        <a
                          href="https://developers.google.com/oauthplayground/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline font-medium hover:text-green-900"
                        >
                          Google OAuth 2.0 Playground
                        </a>{" "}
                        접속
                      </li>
                      <li>오른쪽 설정 (⚙️ 아이콘) 클릭 후 "Use your own OAuth credentials" 체크</li>
                      <li>
                        Step 1에서 "Google Calendar API v3" 검색 후 선택 (https://www.googleapis.com/auth/calendar)
                      </li>
                      <li>"Authorize APIs" 클릭 후 Google 계정으로 로그인 및 권한 부여</li>
                      <li>Step 2에서 "Exchange authorization code for tokens" 클릭</li>
                      <li>
                        표시된 <strong>Access token</strong>을 복사하여 아래에 붙여넣기 (유효기간 약 1시간)
                      </li>
                    </ol>
                  </div>
                )}

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{modal.inputLabel}</label>
                  <textarea
                    value={modal.inputValue}
                    onChange={(e) => modal.inputSetter(e.target.value)}
                    className={`w-full p-3.5 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-${modal.themeColor}-500 focus:border-${modal.themeColor}-500 outline-none font-mono text-xs shadow-sm`}
                    rows={5}
                    placeholder={modal.placeholder}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  {modal.onClear && (
                    <button
                      onClick={modal.onClear}
                      className={`w-full sm:w-auto flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-5 rounded-lg font-semibold transition-colors text-sm`}
                    >
                      초기화
                    </button>
                  )}
                  <button
                    onClick={() => modal.setter(false)}
                    className={`w-full sm:w-auto ${modal.onClear ? "" : "flex-1"} bg-gray-500 hover:bg-gray-600 text-white py-3 px-5 rounded-lg font-semibold transition-colors text-sm`}
                  >
                    취소
                  </button>
                  <button
                    onClick={modal.onSave}
                    className={`w-full sm:w-auto flex-1 bg-${modal.themeColor}-600 hover:bg-${modal.themeColor}-700 text-white py-3 px-5 rounded-lg font-semibold transition-colors text-sm shadow-md hover:shadow-lg`}
                  >
                    {modal.saveText}
                  </button>
                </div>

                {modal.title === "📅 Google Calendar 연동" && googleToken && (
                  <div className="mt-6 bg-blue-50 p-3.5 rounded-lg border border-blue-200 shadow-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full ring-2 ring-green-200 ring-offset-1"></div>
                      <span className="text-sm font-medium text-blue-800">Google Calendar 연동 완료</span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1.5 truncate">현재 토큰: {googleToken}</p>
                  </div>
                )}
              </div>
            </div>
          ),
      )}
    </div>
  )
}

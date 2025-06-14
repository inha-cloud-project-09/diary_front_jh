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
  Filter,
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
  Plus,
  User,
  Home,
  X
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
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'SKIPPED'
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

const API_BASE = 'http://3.236.68.128:8000'

export default function RoutineDashboard() {
  // States
  const [token, setToken] = useState('')
  const [googleToken, setGoogleToken] = useState('')
  const [routines, setRoutines] = useState<RoutineDB[]>([])
  const [stats, setStats] = useState<RoutineStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentView, setCurrentView] = useState<'list' | 'stats'>('list')

  // Modal states
  const [showTokenModal, setShowTokenModal] = useState(false)
  const [showGoogleTokenModal, setShowGoogleTokenModal] = useState(false)
  const [tokenInput, setTokenInput] = useState('')
  const [googleTokenInput, setGoogleTokenInput] = useState('')

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')

  // Load token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('auth-token')
    const savedGoogleToken = localStorage.getItem('google-access-token')
    if (savedToken) {
      setToken(savedToken)
      setTokenInput(savedToken)
    } else {
      setError('JWT 토큰이 설정되지 않았습니다. 먼저 토큰을 설정해주세요.')
    }
    if (savedGoogleToken) {
      setGoogleToken(savedGoogleToken)
      setGoogleTokenInput(savedGoogleToken)
    }
  }, [])

  // Token management
  const handleSaveToken = () => {
    if (!tokenInput.trim()) {
      alert('토큰을 입력해주세요!')
      return
    }
    
    const newToken = tokenInput.trim()
    setToken(newToken)
    localStorage.setItem('auth-token', newToken)
    setShowTokenModal(false)
    setError('')
    alert('✅ JWT 토큰이 저장되었습니다!')
  }

  const handleSaveGoogleToken = () => {
    if (!googleTokenInput.trim()) {
      alert('Google 토큰을 입력해주세요!')
      return
    }
    
    if (!googleTokenInput.startsWith('ya29.')) {
      alert('⚠️ 올바른 Google Access Token 형식이 아닙니다.\n(ya29.로 시작해야 함)')
      return
    }
    
    const newGoogleToken = googleTokenInput.trim()
    setGoogleToken(newGoogleToken)
    localStorage.setItem('google-access-token', newGoogleToken)
    setShowGoogleTokenModal(false)
    alert('✅ Google 토큰이 저장되었습니다! 이제 캘린더 기능을 사용할 수 있습니다.')
  }

  const clearGoogleToken = () => {
    setGoogleToken('')
    setGoogleTokenInput('')
    localStorage.removeItem('google-access-token')
    setShowGoogleTokenModal(false)
    alert('🗑️ Google 토큰이 초기화되었습니다!')
  }

  // API utility
  const apiCall = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
    if (!token) {
      throw new Error('JWT 토큰이 설정되지 않았습니다.')
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Auth-Token': token,
        ...options.headers
      },
      body: options.body,
      mode: 'cors'
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
      setError('')
      
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter.toUpperCase())
      if (dateFilter !== 'all') {
        const today = new Date()
        if (dateFilter === 'today') {
          params.append('target_date', today.toISOString().split('T')[0])
        }
      }
      
      const data = await apiCall(`/api/routine/routines?${params.toString()}`)
      
      let filteredRoutines = data
      
      // 카테고리 필터링
      if (categoryFilter !== 'all') {
        filteredRoutines = filteredRoutines.filter((r: RoutineDB) => 
          r.category === categoryFilter
        )
      }
      
      // 날짜 필터링 (클라이언트)
      if (dateFilter === 'week') {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        filteredRoutines = filteredRoutines.filter((r: RoutineDB) => 
          new Date(r.target_date) >= weekAgo
        )
      }
      
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
      const data = await apiCall('/api/routine/routines/stats')
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
        actual_duration_minutes: undefined
      }

      await apiCall(`/api/routine/routines/${routineId}/status`, {
        method: 'PATCH',
        body: JSON.stringify(body)
      })

      // 성공 피드백
      const statusMessages = {
        'COMPLETED': '✅ 루틴을 완료했습니다!',
        'CANCELLED': '❌ 루틴을 취소했습니다.',
        'SKIPPED': '⏭️ 루틴을 건너뛰었습니다.'
      }
      
      alert(statusMessages[status as keyof typeof statusMessages] || '상태가 업데이트되었습니다.')
      
      // 목록 새로고침
      loadRoutines()
    } catch (error: any) {
      alert(`오류: ${error.message}`)
    }
  }

  // Delete routine
  const deleteRoutine = async (routineId: number) => {
    if (!confirm('정말로 이 루틴을 삭제하시겠습니까?')) return

    try {
      await apiCall(`/api/routine/routines/${routineId}`, {
        method: 'DELETE'
      })
      
      alert('🗑️ 루틴이 삭제되었습니다.')
      loadRoutines()
    } catch (error: any) {
      alert(`삭제 실패: ${error.message}`)
    }
  }

  // Auto-load data when view changes
  useEffect(() => {
    if (token) {
      if (currentView === 'list') {
        loadRoutines()
      } else if (currentView === 'stats') {
        loadStats()
      }
    }
  }, [currentView, statusFilter, categoryFilter, dateFilter, token])

  // Format functions
  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    })
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      '명상': Brain,
      '운동': Activity,
      '창작': Star,
      '소통': MessageSquare,
      '휴식': Timer,
      '학습': Target,
      '자연': Heart,
      '음악': Zap
    }
    return icons[category] || Target
  }

  const getStatusColor = (status: string) => {
    const colors = {
      'ACTIVE': 'bg-blue-100 text-blue-800',
      'COMPLETED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800',
      'SKIPPED': 'bg-yellow-100 text-yellow-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      'ACTIVE': Play,
      'COMPLETED': CheckCircle2,
      'CANCELLED': XCircle,
      'SKIPPED': SkipForward
    }
    return icons[status as keyof typeof icons] || Play
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-6">
              <h1 className="text-xl font-bold text-gray-800">🎯 루틴 대시보드</h1>
              
              {/* Navigation */}
              <nav className="hidden md:flex space-x-1">
                <button
                  onClick={() => setCurrentView('list')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentView === 'list' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Target className="w-4 h-4 inline mr-2" />
                  루틴 관리
                </button>
                <button
                  onClick={() => setCurrentView('stats')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentView === 'stats' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 inline mr-2" />
                  통계
                </button>
              </nav>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Token Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${token ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-gray-600">JWT</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${googleToken ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-gray-600">Google</span>
              </div>
              
              {/* Token Setting Buttons */}
              <button
                onClick={() => setShowTokenModal(true)}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                JWT 설정
              </button>
              <button
                onClick={() => setShowGoogleTokenModal(true)}
                className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Google 설정
              </button>
              
              {/* Back to Diary */}
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>돌아가기</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Error Display */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'list' && (
          <div>
            {/* Header */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-lg">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="mb-4 lg:mb-0">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">🎯 내 루틴 관리</h2>
                  <p className="text-gray-600">총 {routines.length}개의 루틴이 있습니다</p>
                </div>
                
                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">모든 상태</option>
                    <option value="active">진행중</option>
                    <option value="completed">완료</option>
                    <option value="cancelled">취소</option>
                    <option value="skipped">건너뜀</option>
                  </select>
                  
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">모든 카테고리</option>
                    <option value="명상">명상</option>
                    <option value="운동">운동</option>
                    <option value="창작">창작</option>
                    <option value="소통">소통</option>
                    <option value="휴식">휴식</option>
                    <option value="학습">학습</option>
                    <option value="자연">자연</option>
                    <option value="음악">음악</option>
                  </select>
                  
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">모든 날짜</option>
                    <option value="today">오늘</option>
                    <option value="week">최근 7일</option>
                  </select>
                  
                  <button
                    onClick={loadRoutines}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>새로고침</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Routine Cards */}
            {isLoading ? (
              <div className="text-center py-16">
                <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">루틴을 불러오는 중...</p>
              </div>
            ) : routines.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-lg">
                  <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">루틴이 없습니다</h3>
                  <p className="text-gray-500 mb-6">일기 뷰어에서 새로운 AI 루틴을 생성해보세요!</p>
                  <button
                    onClick={() => window.history.back()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    일기 뷰어로 돌아가기
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {routines.map((routine) => {
                  const CategoryIcon = getCategoryIcon(routine.category)
                  const StatusIcon = getStatusIcon(routine.status)
                  
                  return (
                    <div key={routine.id} className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <CategoryIcon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800 line-clamp-1">{routine.title}</h3>
                            <p className="text-sm text-gray-500">{routine.category}</p>
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(routine.status)}`}>
                          <StatusIcon className="w-3 h-3 inline mr-1" />
                          {routine.status}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="space-y-3 mb-4">
                        <p className="text-sm text-gray-600 line-clamp-2">{routine.description}</p>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>📅 {formatDate(routine.target_date)}</span>
                          <span>⏰ {formatTime(routine.start_time)}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>⏱️ {routine.duration_minutes}분</span>
                          <span>🎯 {routine.difficulty}</span>
                        </div>

                        {routine.recommendation_reason && (
                          <div className="bg-yellow-50 p-2 rounded-lg border border-yellow-200">
                            <p className="text-xs text-yellow-800 line-clamp-2">
                              💡 {routine.recommendation_reason}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        {routine.status === 'ACTIVE' && (
                          <>
                            <button
                              onClick={() => updateRoutineStatus(routine.id, 'COMPLETED')}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>완료</span>
                            </button>
                            <button
                              onClick={() => updateRoutineStatus(routine.id, 'SKIPPED')}
                              className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                            >
                              <SkipForward className="w-4 h-4" />
                              <span>건너뛰기</span>
                            </button>
                          </>
                        )}
                        
                        {routine.status !== 'ACTIVE' && (
                          <button
                            onClick={() => updateRoutineStatus(routine.id, 'ACTIVE')}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                          >
                            <Play className="w-4 h-4" />
                            <span>다시 활성화</span>
                          </button>
                        )}
                        
                        <button
                          onClick={() => deleteRoutine(routine.id)}
                          className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Calendar Link */}
                      {routine.calendar_html_link && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <a
                            href={routine.calendar_html_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                          >
                            <Calendar className="w-3 h-3" />
                            <span>캘린더에서 보기</span>
                          </a>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {currentView === 'stats' && (
          <div>
            {/* Stats Header */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">📊 루틴 통계</h2>
              <p className="text-gray-600">당신의 루틴 수행 현황을 확인해보세요</p>
            </div>

            {isLoading ? (
              <div className="text-center py-16">
                <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">통계를 불러오는 중...</p>
              </div>
            ) : stats ? (
              <div className="space-y-6">
                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-600">총 루틴</h3>
                        <p className="text-2xl font-bold text-gray-800">{stats.total_created}</p>
                      </div>
                      <Target className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>
                  
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-600">완료율</h3>
                        <p className="text-2xl font-bold text-green-600">{stats.overall_completion_rate.toFixed(1)}%</p>
                      </div>
                      <Award className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                  
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-600">기간</h3>
                        <p className="text-sm font-medium text-gray-800">{stats.period}</p>
                      </div>
                      <Calendar className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                  
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-600">카테고리</h3>
                        <p className="text-2xl font-bold text-orange-600">{stats.category_distribution.length}</p>
                      </div>
                      <PieChart className="w-8 h-8 text-orange-600" />
                    </div>
                  </div>
                </div>

                {/* Category Distribution */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">카테고리별 현황</h3>
                  <div className="space-y-4">
                    {stats.category_distribution.map((cat, index) => {
                      const CategoryIcon = getCategoryIcon(cat.category)
                      const completionRate = cat.count > 0 ? (cat.completed_count / cat.count * 100) : 0
                      
                      return (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <CategoryIcon className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-800">{cat.category}</h4>
                              <p className="text-sm text-gray-600">{cat.count}개 루틴 • {cat.completed_count}개 완료</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-green-600">{completionRate.toFixed(1)}%</p>
                            <div className="w-20 h-2 bg-gray-200 rounded-full mt-1">
                              <div 
                                className="h-full bg-green-500 rounded-full"
                                style={{ width: `${completionRate}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">통계 데이터가 없습니다</h3>
                <p className="text-gray-500">루틴을 생성하고 사용해보세요!</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-600 text-sm">
            <p>🎯 루틴 대시보드 • 당신의 AI 루틴을 체계적으로 관리하세요</p>
          </div>
        </div>
      </footer>

      {/* JWT Token Modal */}
      {showTokenModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">🔐 JWT 토큰 설정</h3>
              <button
                onClick={() => setShowTokenModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              WithU Diary API에 접근하기 위한 JWT 토큰을 입력해주세요.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">JWT 토큰</label>
              <textarea
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm"
                rows={4}
                placeholder="eyJhbGciOiJIUzI1NiJ9..."
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowTokenModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSaveToken}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Token Modal */}
      {showGoogleTokenModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">📅 Google Calendar 연동</h3>
              <button
                onClick={() => setShowGoogleTokenModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">🔧 토큰 받는 방법:</h4>
                <ol className="text-sm text-green-700 space-y-1">
                  <li>1. <a href="https://developers.google.com/oauthplayground/" target="_blank" rel="noopener noreferrer" className="underline font-medium">Google OAuth 2.0 Playground</a> 접속</li>
                  <li>2. 오른쪽 설정에서 "Use your own OAuth credentials" 체크</li>
                  <li>3. Step 1에서 "Google Calendar API v3" 선택</li>
                  <li>4. "Authorize APIs" 클릭 후 로그인</li>
                  <li>5. Step 2에서 "Exchange authorization code for tokens" 클릭</li>
                  <li>6. 받은 <strong>Access token</strong>을 아래에 붙여넣기</li>
                </ol>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google Calendar Access Token
                </label>
                <textarea
                  value={googleTokenInput}
                  onChange={(e) => setGoogleTokenInput(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none font-mono text-sm"
                  rows={4}
                  placeholder="ya29.a0AfH6SMBx..."
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={clearGoogleToken}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  초기화
                </button>
                <button
                  onClick={handleSaveGoogleToken}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  저장하고 연동
                </button>
              </div>
              
              {googleToken && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-blue-800">연동 완료</span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    토큰: {googleToken.substring(0, 20)}...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
"use client"

import { useState, useEffect } from "react"
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Tag,
  User,
  Key,
  RefreshCw,
  List,
  X,
  Loader2,
  AlertCircle
} from "lucide-react"

interface DiaryEntry {
  id: string | number
  title?: string
  content?: string
  content_preview?: string  // 백엔드에서 content_preview로 반환
  created_date?: string
  created_at?: string
  date?: string  // 백엔드에서 주로 date 사용
  author?: string
  location?: string
  mood?: string
  emotion?: string
  primary_emotion?: string  // 백엔드에서 primary_emotion으로 반환
  tags?: string[]
  images?: Array<{ url: string } | string>
  likes?: number
  views?: number
  comments?: number
  summary?: string
  feedback?: string
  analysis_status?: string
}

interface ApiResponse {
  diaries: DiaryEntry[]
  total_count?: number
  message?: string
}

const API_BASE = 'http://3.236.68.128:8000'

export default function DiaryViewer() {
  // State management
  const [token, setToken] = useState('')
  const [diaries, setDiaries] = useState<DiaryEntry[]>([])
  const [currentDiary, setCurrentDiary] = useState<DiaryEntry | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [loadingMessage, setLoadingMessage] = useState('')
  
  // Modal states
  const [showTokenModal, setShowTokenModal] = useState(false)
  const [showDiarySelector, setShowDiarySelector] = useState(false)
  const [showGoogleTokenModal, setShowGoogleTokenModal] = useState(false)
  const [tokenInput, setTokenInput] = useState('')
  const [googleTokenInput, setGoogleTokenInput] = useState('')
  const [googleAccessToken, setGoogleAccessToken] = useState('')
  
  // Interaction states
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)

  // Load saved token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('auth-token')
    const savedGoogleToken = localStorage.getItem('google-access-token')
    if (savedToken) {
      setToken(savedToken)
      setTokenInput(savedToken)
    }
    if (savedGoogleToken) {
      setGoogleAccessToken(savedGoogleToken)
      setGoogleTokenInput(savedGoogleToken)
    }
  }, [])

  // API call utility
  const apiCall = async (endpoint: string, options: RequestInit = {}, useToken?: string): Promise<any> => {
    const currentToken = useToken || token
    
    if (!currentToken) {
      throw new Error('토큰이 설정되지 않았습니다. 먼저 토큰을 설정해주세요.')
    }
    
    try {
      // CORS 우회를 위한 다양한 시도
      const requestOptions: RequestInit = {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`,
          'X-Auth-Token': currentToken,
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          ...options.headers
        },
        body: options.body,
        mode: 'cors',
        credentials: 'omit',
        cache: 'no-cache'
      }
      
      // 첫 번째 시도: 일반적인 요청
      let response = await fetch(`${API_BASE}${endpoint}`, requestOptions)
      
      // CORS 에러인 경우 다른 방법들 시도
      if (!response.ok && response.status === 0) {
        console.log('CORS 에러 감지, 다른 방법 시도 중...')
        
        // 두 번째 시도: 간소화된 헤더
        try {
          response = await fetch(`${API_BASE}${endpoint}`, {
            method: options.method || 'GET',
            headers: {
              'X-Auth-Token': currentToken,
            },
            mode: 'no-cors' // no-cors 모드 시도
          })
        } catch (noCorsError) {
          console.log('no-cors 모드도 실패:', noCorsError)
        }
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error: any) {
      console.error('API 호출 오류:', error)
      
      // CORS 에러 상세 분석
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        const corsGuide = `
🚨 CORS (Cross-Origin Resource Sharing) 오류가 발생했습니다.

📋 서버 설정 확인사항:
1. FastAPI CORS 미들웨어 추가 필요:
   
   from fastapi.middleware.cors import CORSMiddleware
   
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["http://localhost:3000", "*"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )

2. 서버 재시작 필요
3. 포트 확인: ${API_BASE}

🔧 임시 해결책:
- 브라우저에서 직접 API 테스트: ${API_BASE}/api/routine/health
- Chrome 확장프로그램: "CORS Unblock" 설치
- 프록시 설정 (next.config.js)
        `
        throw new Error(corsGuide)
      }
      
      throw error
    }
  }

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
    alert('✅ 토큰이 저장되었습니다!')
    
    // 토큰 설정 후 바로 일기 로드 시도
    setTimeout(() => {
      loadRecentDiaries(newToken)
    }, 100)
  }

  const useTestToken = () => {
    const testToken = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJyb2RsZXNvbWFzdGVyMUBnbWFpbC5jb20iLCJ1c2VySWQiOjIsImlhdCI6MTc0OTM5MTI3MSwiZXhwIjoxNzQ5Mzk0ODcxfQ.-p1AL_eH_cFitdCA_5wq1ZRZZP1butJOoJQjrcUqgs0'
    setTokenInput(testToken)
    setToken(testToken)
    localStorage.setItem('auth-token', testToken)
  }

  // Google Token management
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
    setGoogleAccessToken(newGoogleToken)
    localStorage.setItem('google-access-token', newGoogleToken)
    setShowGoogleTokenModal(false)
    alert('✅ Google 토큰이 저장되었습니다! 이제 캘린더 기능을 사용할 수 있습니다.')
  }

  const clearGoogleToken = () => {
    setGoogleAccessToken('')
    setGoogleTokenInput('')
    localStorage.removeItem('google-access-token')
    alert('🗑️ Google 토큰이 초기화되었습니다!')
  }

  // Load recent diaries
  const loadRecentDiaries = async (useToken?: string) => {
    try {
      // 현재 토큰이나 전달받은 토큰 사용
      const currentToken = useToken || token
      
      if (!currentToken) {
        setError('토큰이 설정되지 않았습니다. 먼저 토큰을 설정해주세요.')
        return
      }

      setIsLoading(true)
      setLoadingMessage('서버에 연결 중...')
      setError('')
      
      // 먼저 헬스체크로 서버 연결 확인
      try {
        setLoadingMessage('서버 상태 확인 중...')
        await apiCall('/api/routine/health', {}, currentToken)
      } catch (healthError: any) {
        console.error('헬스체크 실패:', healthError)
        throw new Error(`서버 연결 실패: ${healthError.message}`)
      }
      
      setLoadingMessage('최근 일기를 불러오는 중...')
      const data: ApiResponse = await apiCall('/api/routine/recent-diaries', {}, currentToken)
      
      console.log('📊 API 응답 데이터:', data) // 디버깅용
      
      if (!data.diaries || data.diaries.length === 0) {
        throw new Error('불러올 일기가 없습니다. 먼저 일기를 작성해주세요.')
      }
      
      console.log('📝 첫 번째 일기:', data.diaries[0]) // 디버깅용
      
      setDiaries(data.diaries)
      setCurrentIndex(0)
      displayDiary(data.diaries[0])
      
    } catch (error: any) {
      console.error('일기 로드 실패:', error)
      setError(error.message)
      setCurrentDiary(null)
    } finally {
      setIsLoading(false)
    }
  }

  // 버튼 클릭용 래퍼 함수
  const handleLoadDiaries = () => loadRecentDiaries()

  // Create routine with Google Calendar
  const createCalendarRoutine = async () => {
    if (!googleAccessToken) {
      setShowGoogleTokenModal(true)
      return
    }

    try {
      setIsLoading(true)
      setLoadingMessage('AI 루틴을 분석하고 캘린더에 추가하는 중...')
      setError('')

      // 현재 토큰이나 전달받은 토큰 사용
      if (!token) {
        setError('JWT 토큰이 설정되지 않았습니다. 먼저 토큰을 설정해주세요.')
        return
      }

      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const targetDate = tomorrow.toISOString().split('T')[0]

      const response = await fetch(`${API_BASE}/api/routine/user-calendar/create-routine`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Auth-Token': token,
        },
        body: JSON.stringify({
          access_token: googleAccessToken,
          target_date: targetDate,
          routine_count: 4
        }),
        mode: 'cors'
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      alert(`🎉 성공! ${data.target_date}에 ${data.created_events?.length || 0}개의 AI 루틴이 캘린더에 추가되었습니다!\n\n감정 분석: ${data.dominant_emotion}\n분석된 일기: ${data.analyzed_diaries}개`)

    } catch (error: any) {
      console.error('캘린더 루틴 생성 실패:', error)
      setError(`캘린더 루틴 생성 실패: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Create weekly routine
  // Create weekly routine (수정된 버전)
  const createWeeklyCalendarRoutine = async () => {
    if (!googleAccessToken) {
      setShowGoogleTokenModal(true)
      return
    }

    try {
      setIsLoading(true)
      setLoadingMessage('주간 AI 루틴을 생성하는 중... (최대 2분 소요)')
      setError('')

      if (!token) {
        setError('JWT 토큰이 설정되지 않았습니다.')
        return
      }

      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const startDate = tomorrow.toISOString().split('T')[0]

      // 🔧 수정: 모든 파라미터를 쿼리 파라미터로 전송
      const params = new URLSearchParams({
        access_token: googleAccessToken,
        start_date: startDate,
        days_count: '7'
      })

      const response = await fetch(`${API_BASE}/api/routine/user-calendar/weekly-routine?${params.toString()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Auth-Token': token,
        },
        // body 제거 (모든 데이터가 쿼리 파라미터로 전송됨)
        mode: 'cors'
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      alert(`🗓️ 주간 루틴 생성 완료!\n\n기간: ${data.period}\n총 루틴: ${data.total_routines}개\n분석 기반: ${data.analyzed_diaries}개 일기`)

      // 🆕 성공 후 루틴 관리 페이지로 이동 (선택사항)
      // window.location.href = '/routine-manager'

    } catch (error: any) {
      console.error('주간 루틴 생성 실패:', error)
      setError(`주간 루틴 생성 실패: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Display diary
  const displayDiary = (diary: DiaryEntry) => {
    console.log('📖 디스플레이 일기 데이터:', diary) // 디버깅용
    setCurrentDiary(diary)
    setLikeCount(diary.likes || Math.floor(Math.random() * 50))
    setIsLiked(false)
    setIsBookmarked(false)
    setError('')
  }

  // 일기 제목 가져오기 (다양한 필드명 시도)
  const getDiaryTitle = (diary: DiaryEntry) => {
    // 1. title이 있으면 사용
    if (diary.title) return diary.title
    
    // 2. content나 content_preview의 첫 줄로 제목 생성
    const content = diary.content || diary.content_preview || ''
    if (content) {
      const firstLine = content.split('\n')[0].trim()
      if (firstLine.length > 0) {
        return firstLine.length > 30 ? firstLine.substring(0, 30) + '...' : firstLine
      }
    }
    
    // 3. 날짜로 제목 생성
    const dateStr = getDiaryDate(diary)
    if (dateStr) {
      return `${formatDate(dateStr)}의 일기`
    }
    
    // 4. 기본 제목
    return '제목 없는 일기'
  }

  // 일기 내용 가져오기
  const getDiaryContent = (diary: DiaryEntry) => {
    const content = diary.content || diary.content_preview
    if (!content) {
      return '내용이 없습니다.'
    }
    return content
  }

  // 일기 날짜 가져오기
  const getDiaryDate = (diary: DiaryEntry) => {
    return diary.date || diary.created_date || diary.created_at || ''
  }

  // Parse mood
  const parseMood = (mood?: string) => {
    const moodMap: Record<string, { emoji: string; text: string }> = {
      'happy': { emoji: '😊', text: '행복한 하루' },
      'sad': { emoji: '😢', text: '슬픈 하루' },
      'angry': { emoji: '😠', text: '화난 하루' },
      'excited': { emoji: '🤩', text: '신나는 하루' },
      'tired': { emoji: '😴', text: '피곤한 하루' },
      'grateful': { emoji: '🙏', text: '감사한 하루' },
      'anxious': { emoji: '😰', text: '불안한 하루' },
      'calm': { emoji: '😌', text: '평온한 하루' },
      'love': { emoji: '🥰', text: '사랑스러운 하루' },
      // 백엔드에서 사용하는 한글 감정들 추가
      '우울': { emoji: '😢', text: '우울한 하루' },
      '불안': { emoji: '😰', text: '불안한 하루' },
      '무기력': { emoji: '😴', text: '무기력한 하루' },
      '스트레스': { emoji: '😫', text: '스트레스 받는 하루' },
      '분노': { emoji: '😠', text: '화난 하루' },
      '외로움': { emoji: '😔', text: '외로운 하루' },
      '기쁨': { emoji: '😊', text: '기쁜 하루' },
      '평온': { emoji: '😌', text: '평온한 하루' },
      '흥미': { emoji: '🤔', text: '흥미로운 하루' },
      '기대': { emoji: '✨', text: '기대되는 하루' },  // 새로 추가
      '희망': { emoji: '🌟', text: '희망찬 하루' },
      '만족': { emoji: '😌', text: '만족스러운 하루' }
    }
    
    if (typeof mood === 'string') {
      return moodMap[mood.toLowerCase()] || moodMap[mood] || { emoji: '😊', text: '좋은 하루' }
    }
    
    return { emoji: '😊', text: '좋은 하루' }
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  }

  // Navigation
  const navigateDiary = (direction: 'prev' | 'next') => {
    if (!diaries.length) return
    
    let newIndex = currentIndex
    if (direction === 'prev' && currentIndex > 0) {
      newIndex = currentIndex - 1
    } else if (direction === 'next' && currentIndex < diaries.length - 1) {
      newIndex = currentIndex + 1
    }
    
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex)
      displayDiary(diaries[newIndex])
    }
  }

  // Interactions
  const toggleLike = () => {
    setIsLiked(!isLiked)
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1)
  }

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked)
  }

  const shareDiary = () => {
    if (!currentDiary) return
    
    const shareText = `${currentDiary.title}\n\n${currentDiary.content?.substring(0, 100)}${currentDiary.content && currentDiary.content.length > 100 ? '...' : ''}`
    
    if (navigator.share) {
      navigator.share({
        title: currentDiary.title || '내 일기',
        text: shareText,
        url: window.location.href
      }).catch(console.error)
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        alert('📋 일기 내용이 클립보드에 복사되었습니다!')
      }).catch(() => {
        alert('공유 기능을 사용할 수 없습니다.')
      })
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowTokenModal(false)
        setShowDiarySelector(false)
        setShowGoogleTokenModal(false)
      }
      if (diaries.length > 0) {
        if (e.key === 'ArrowLeft') navigateDiary('prev')
        if (e.key === 'ArrowRight') navigateDiary('next')
      }
      // 빠른 단축키
      if (e.key === 'c' && e.ctrlKey && googleAccessToken) {
        e.preventDefault()
        createCalendarRoutine()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [diaries, currentIndex, googleAccessToken])

  const moodData = parseMood(currentDiary?.mood || currentDiary?.emotion || currentDiary?.primary_emotion)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">일기를 불러오는 중...</h3>
              <p className="text-sm text-gray-600">{loadingMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowTokenModal(true)}
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <Key className="w-5 h-5" />
                <span className="font-medium">토큰 설정</span>
              </button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-bold text-gray-800">📖 WithU Diary</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleLoadDiaries}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>일기 불러오기</span>
              </button>
              <button
                onClick={() => setShowDiarySelector(true)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <List className="w-4 h-4" />
                <span>일기 선택</span>
              </button>
              {/* Google Calendar 기능 버튼들 */}
              <div className="relative">
                <button
                  onClick={() => setShowGoogleTokenModal(true)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    googleAccessToken ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}
                  title="Google Calendar 연동"
                >
                  <Calendar className="w-5 h-5" />
                </button>
                {googleAccessToken && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Screen */}
        {!currentDiary && !error && (
          <div className="text-center py-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 mx-auto max-w-2xl shadow-xl">
              <div className="text-6xl mb-6">📖</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">WithU Diary Viewer</h2>
              <p className="text-gray-600 mb-8 text-lg">
                당신의 소중한 일기를 아름다운 형태로 확인해보세요.<br />
                먼저 토큰을 설정하고 일기를 불러와주세요.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setShowTokenModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <Key className="w-5 h-5" />
                  <span>토큰 설정하기</span>
                </button>
                <button
                  onClick={handleLoadDiaries}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>일기 불러오기</span>
                </button>
                {!googleAccessToken && (
                  <button
                    onClick={() => setShowGoogleTokenModal(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <Calendar className="w-5 h-5" />
                    <span>캘린더 연동하기</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 mx-auto max-w-2xl shadow-xl">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-800 mb-4">연결 문제가 발생했습니다</h2>
              <div className="text-left bg-gray-100 p-4 rounded-lg mb-6">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">{error}</pre>
              </div>
              
              {/* CORS 문제 해결 가이드 */}
              <div className="text-left bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-blue-800 mb-2">💡 해결 방법:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• 서버가 실행 중인지 확인해주세요</li>
                  <li>• 브라우저에서 직접 접속: <a href={`${API_BASE}/api/routine/health`} target="_blank" rel="noopener noreferrer" className="underline">{API_BASE}/api/routine/health</a></li>
                  <li>• 서버의 CORS 설정에서 origins에 현재 도메인이 포함되어 있는지 확인</li>
                  <li>• 개발 환경에서는 프록시 설정을 사용해보세요</li>
                </ul>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setShowTokenModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <Key className="w-5 h-5" />
                  <span>토큰 다시 설정</span>
                </button>
                <button
                  onClick={handleLoadDiaries}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>다시 시도</span>
                </button>
                <button
                  onClick={() => window.open(`${API_BASE}/docs`, '_blank')}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                >
                  API 문서 열기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Diary Content */}
        {currentDiary && (
          <>
            {/* Banner Section */}
            <div className="relative mb-8 rounded-2xl overflow-hidden shadow-2xl">
              <div className="aspect-[16/9] sm:aspect-[21/9] overflow-hidden">
                <div className="grid grid-cols-1 h-full bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400">
                  {currentDiary.images && currentDiary.images.length > 0 ? (
                    <div className={`grid ${currentDiary.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} h-full`}>
                      {currentDiary.images.slice(0, 2).map((image, index) => (
                        <div key={index} className="relative overflow-hidden group">
                          <img
                            src={typeof image === 'string' ? image : image.url}
                            alt={`일기 이미지 ${index + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="text-6xl mb-4">📖</div>
                        <h3 className="text-2xl font-bold">소중한 일기</h3>
                        <p className="text-lg opacity-90">당신의 하루를 기록합니다</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              
              {/* Mood Badge */}
              <div className="absolute top-4 left-4">
                <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center space-x-2">
                  <span className="text-2xl">{moodData.emoji}</span>
                  <span className="font-medium text-gray-800">{moodData.text}</span>
                </div>
              </div>
              
              {/* Navigation Buttons */}
              {diaries.length > 1 && (
                <>
                  {currentIndex > 0 && (
                    <button
                      onClick={() => navigateDiary('prev')}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                    >
                      <ArrowLeft className="w-6 h-6 text-gray-700" />
                    </button>
                  )}
                  {currentIndex < diaries.length - 1 && (
                    <button
                      onClick={() => navigateDiary('next')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                    >
                      <ArrowLeft className="w-6 h-6 text-gray-700 transform rotate-180" />
                    </button>
                  )}
                </>
              )}
              
              {/* Floating Actions */}
              <div className="absolute bottom-4 right-4 flex space-x-3">
                <button
                  onClick={toggleBookmark}
                  className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors ${
                    isBookmarked ? 'bg-yellow-500 text-white' : 'bg-white/90 text-gray-700 hover:bg-white'
                  }`}
                >
                  <Bookmark className="w-6 h-6" fill={isBookmarked ? 'currentColor' : 'none'} />
                </button>
                <button
                  onClick={shareDiary}
                  className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                >
                  <Share2 className="w-6 h-6 text-gray-700" />
                </button>
              </div>
            </div>

            {/* Article */}
            <article className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
              {/* Article Header */}
              <div className="p-6 sm:p-8 border-b border-gray-200">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                  {getDiaryTitle(currentDiary)}
                </h1>

                {/* Meta Information */}
                <div className="flex flex-wrap gap-6 text-sm text-gray-600 mb-6">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <span>{formatDate(getDiaryDate(currentDiary))}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-green-500" />
                    <span>{currentDiary.location || '위치 정보 없음'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-purple-500" />
                    <span>{currentDiary.author || '작성자'}</span>
                  </div>
                </div>

                {/* Tags */}
                {currentDiary.tags && currentDiary.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {currentDiary.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors cursor-pointer"
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Article Content */}
              <div className="p-6 sm:p-8">
                <div className="prose prose-lg max-w-none">
                  <div className="text-gray-700 leading-relaxed">
                    {getDiaryContent(currentDiary).split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-4">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
                
                {/* 디버깅 정보 (개발용) */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-8 p-4 bg-gray-100 rounded-lg">
                    <details>
                      <summary className="cursor-pointer font-medium text-gray-700">🔍 디버깅 정보</summary>
                      <div className="mt-2 text-xs text-gray-600">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <strong>제목:</strong> {getDiaryTitle(currentDiary)}<br/>
                            <strong>날짜:</strong> {getDiaryDate(currentDiary)}<br/>
                            <strong>감정:</strong> {currentDiary.primary_emotion}<br/>
                            <strong>상태:</strong> {currentDiary.analysis_status}
                          </div>
                          <div>
                            <strong>내용 길이:</strong> {getDiaryContent(currentDiary).length}자<br/>
                            <strong>ID:</strong> {currentDiary.id}<br/>
                            <strong>필드:</strong> {Object.keys(currentDiary).join(', ')}
                          </div>
                        </div>
                        <details className="mt-2">
                          <summary className="cursor-pointer">전체 데이터</summary>
                          <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto max-h-40">
                            {JSON.stringify(currentDiary, null, 2)}
                          </pre>
                        </details>
                      </div>
                    </details>
                  </div>
                )}
              </div>

              {/* Interaction Bar */}
              <div className="px-6 sm:px-8 py-4 border-t border-gray-200 bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <button
                      onClick={toggleLike}
                      className={`flex items-center space-x-2 transition-colors ${
                        isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
                      }`}
                    >
                      <Heart className="w-6 h-6" fill={isLiked ? 'currentColor' : 'none'} />
                      <span className="font-medium">{likeCount}</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors">
                      <MessageCircle className="w-6 h-6" />
                      <span className="font-medium">댓글</span>
                    </button>
                    <div className="flex items-center space-x-2 text-gray-500">
                      <User className="w-5 h-5" />
                      <span className="text-sm">{currentDiary.views || Math.floor(Math.random() * 200)} views</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-500">
                      {currentIndex + 1} / {diaries.length}
                    </span>
                    <button
                      onClick={() => setShowDiarySelector(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      다른 일기 보기
                    </button>
                    {/* Calendar 루틴 생성 버튼들 */}
                    {googleAccessToken && (
                      <>
                        <button
                          onClick={createCalendarRoutine}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
                          title="이 일기 기반으로 캘린더 루틴 생성"
                        >
                          <Calendar className="w-4 h-4" />
                          <span>AI 루틴 생성</span>
                        </button>
                        <button
                          onClick={createWeeklyCalendarRoutine}
                          className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                          title="주간 루틴 생성"
                        >
                          🗓️
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </article>
          </>
        )}
      </main>

      {/* Token Modal */}
      {showTokenModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">🔐 인증 토큰 설정</h3>
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
                onClick={useTestToken}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                테스트 토큰 사용
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
              
              {googleAccessToken && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-blue-800">연동 완료</span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    토큰: {googleAccessToken.substring(0, 20)}...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {showDiarySelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">📋 일기 선택</h3>
              <button
                onClick={() => setShowDiarySelector(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-3">
              {diaries.map((diary, index) => (
                <div
                  key={diary.id || index}
                  onClick={() => {
                    setCurrentIndex(index)
                    displayDiary(diary)
                    setShowDiarySelector(false)
                  }}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {getDiaryTitle(diary)}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatDate(getDiaryDate(diary))}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {getDiaryContent(diary).substring(0, 50)}
                        {getDiaryContent(diary).length > 50 ? '...' : ''}
                      </p>
                    </div>
                    <div className="text-2xl">
                      {parseMood(diary.mood || diary.emotion || diary.primary_emotion).emoji}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
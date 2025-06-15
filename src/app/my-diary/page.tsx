"use client"

import { useState, useEffect } from "react"
import Header from "@/components/Header"

const APIURL = "https://withudiary.my"
// Button 컴포넌트를 인라인으로 정의
const Button = ({ children, variant = "default", size = "md", className = "", onClick, ...props }) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
  
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-500",
    outline: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-500"
  }
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  }
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}

import { Plus, Heart, MessageCircle, Calendar, Clock, User, Loader2 } from "lucide-react"

// 임시 일기 데이터
const mockDiaries = [
  {
    id: 1000,
    title: "가족과 조용한 새해를 보내며 느낀 감사함과 목표에 대한 불안, 후배의 자극 속 기대감이 공존한 하루.",
    content: "2019년 1월 1일\n새해 첫날, 가족들과 함께 조용히 집에서 시간을 보냈다. 부모님께선 모두 건강하시길 바라며 \"새해 복 많이 받아라\"고 반복하셨다.",
    createdAt: "2025-06-06T17:21:25",
    likes: 17,
    comments: 3
  },
  {
    id: 1001,
    title: "오늘의 새로운 도전",
    content: "새로운 프로젝트를 시작했다. 처음에는 막막했지만 하나씩 해나가면서 점점 재미를 느끼고 있다.",
    createdAt: "2025-06-07T15:30:00",
    likes: 24,
    comments: 5
  }
]

// UserInfoCard 컴포넌트
const UserInfoCard = ({ user }) => {
  if (!user) return null
  
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-8">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden">
          <img
            src="/basic.jpeg"
            alt={user.nickname}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">{user.nickname}</h2>
          <p className="text-slate-500">{user.email}</p>
          <div className="flex items-center space-x-4 mt-2 text-sm text-slate-600">
            <span>회원 등급: {user.role}</span>
            <span>가입일: {new Date(user.createdAt).toLocaleDateString('ko-KR')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Header 컴포넌트


export default function MyDiaryPage() {
  const [currentUser, setCurrentUser] = useState(null)
  const [diaries, setDiaries] = useState([])
  const [isUserLoading, setIsUserLoading] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // 현재 사용자 정보 가져오기
  const fetchCurrentUser = async () => {
    try {
      setIsUserLoading(true)
      const response = await fetch(APIURL+'/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token') || ''}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`사용자 정보 조회 실패: ${response.status}`)
      }
      
      const userData = await response.json()
      console.log('🔍 원본 사용자 데이터:', userData)
      console.log('✅ 수정된 사용자 데이터:', userData)
      
      setCurrentUser(userData)
      return userData
    } catch (err) {
      console.error("사용자 정보 조회 실패:", err)
      setError("사용자 정보를 불러오는데 실패했습니다.")
      return null
    } finally {
      setIsUserLoading(false)
    }
  }

  // 내 일기 목록 가져오기
  const fetchMyDiaries = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(APIURL+'/api/diaries/my', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token') || ''}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`일기 목록 조회 실패: ${response.status}`)
      }
      
      const result = await response.json()
      console.log('📖 내 일기 데이터:', result)
      
      if (result.success && result.data) {
        // API 데이터를 컴포넌트 형식으로 변환
        const transformedDiaries = result.data.map(diary => ({
          id: diary.id,
          title: diary.summary || "일기",
          content: diary.content,
          createdAt: diary.createdAt,
          likes: Math.floor(Math.random() * 50) + 1, // API에 없으므로 랜덤 값
          comments: Math.floor(Math.random() * 10) + 1
        }))
        setDiaries(transformedDiaries)
      } else {
        // API 실패 시 목 데이터 사용
        console.log("API 응답이 없어서 목 데이터 사용")
        setDiaries(mockDiaries)
      }
    } catch (err) {
      console.error("일기 목록 조회 실패:", err)
      setError("일기 목록을 불러오는데 실패했습니다. 임시 데이터를 표시합니다.")
      setDiaries(mockDiaries) // 에러 시 목 데이터 사용
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const initializeData = async () => {
      const user = await fetchCurrentUser()
      if (user) {
        await fetchMyDiaries()
      }
    }
    initializeData()
  }, [])

  // 유저 정보 로딩 중
  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          <p className="text-slate-600">사용자 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  // 로그인하지 않은 경우
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="max-w-md p-6 bg-white rounded-lg shadow-sm border border-red-200">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-2">🔒</div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">로그인이 필요합니다</h3>
            <p className="text-slate-600 mb-4">일기를 보려면 먼저 로그인해주세요.</p>
            <Button onClick={() => window.location.href = '/login'} className="bg-blue-600 hover:bg-blue-700">
              로그인하러 가기
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <UserInfoCard user={currentUser} />

        {/* 타이틀 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">내 일기</h1>
          <p className="text-slate-500">나만의 소중한 기록을 확인해보세요</p>
        </div>

        {/* 새 일기 작성 버튼 */}
        {/* <div className="mb-8 flex justify-end">
          <Button 
            onClick={() => window.location.href = '/write'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="w-5 h-5 mr-2" />새 일기 작성하기
          </Button>
        </div> */}

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">{error}</p>
          </div>
        )}

        {/* 일기 리스트 */}
        <section>
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <p className="text-slate-600">일기 목록을 불러오는 중...</p>
              </div>
            </div>
          ) : diaries.length === 0 ? (
            <div className="text-center text-slate-500 py-8">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-lg font-medium">아직 작성된 일기가 없습니다.</p>
              <p className="text-sm mt-1">첫 번째 일기를 작성해보세요!</p>
              <Button 
                onClick={() => window.location.href = '/write'}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                첫 일기 작성하기
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {diaries.map((diary) => (
                <div
                  key={diary.id}
                  className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => window.location.href = `/diary/${diary.id}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-500">
                        {new Date(diary.createdAt).toLocaleDateString("ko-KR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="flex items-center space-x-1 text-slate-500 hover:text-red-500 transition-colors">
                        <Heart className="w-4 h-4" />
                        <span className="text-sm">{diary.likes}</span>
                      </span>
                      <span className="flex items-center space-x-1 text-slate-500 hover:text-blue-500 transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm">{diary.comments}</span>
                      </span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">{diary.title}</h3>
                  <p className="text-slate-600 mb-4 line-clamp-3">{diary.content}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-500">
                        {new Date(diary.createdAt).toLocaleTimeString("ko-KR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <span className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                      자세히 보기
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
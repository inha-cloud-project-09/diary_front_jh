"use client"
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Heart, 
  MessageCircle, 
  Calendar, 
  Users, 
  Lightbulb, 
  Compass, 
  Search,
  TrendingUp,
  TrendingDown,
  Sparkles,
  RotateCw,
  Home,
  Plus,
  Bell,
  User,
  Menu,
  X,
  LogIn,
  BookOpen
} from 'lucide-react'

const mylink = "https://withudiary.my"
// API 호출 함수들
const authAPI = {
  getCurrentUser: async () => {
    const response = await fetch(mylink+'/api/auth/me', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth-token') || ''}`
      }
    })
    
    if (!response.ok) {
      throw new Error(`인증 실패: ${response.status}`)
    }
    
    return response.json()
  }
}

// 네비게이션 헤더 컴포넌트
const Header = ({ currentUser }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const menuItems = [
    { href: '/dashboard', icon: Home, label: '홈', active: false },
    { href: '/write', icon: Plus, label: '일기 작성', active: false },
    { href: '/communities', icon: Users, label: '나눔방', active: false },
    { href: '/emotion-recommendation', icon: Compass, label: '감정 탐험', active: true },
  ]

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 hidden sm:block">감정일기</span>
            </Link>
          </div>

          {/* 데스크톱 네비게이션 */}
          <nav className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    item.active
                      ? 'bg-purple-50 text-purple-700 border border-purple-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* 사용자 정보 및 알림 */}
          <div className="flex items-center space-x-4">
            {/* 알림 버튼 */}
            <button className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
            </button>

            {/* 사용자 프로필 */}
            {currentUser ? (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-slate-200 rounded-full overflow-hidden">
                  <img
                    src={`https://www.gravatar.com/avatar/${currentUser.id}?d=identicon`}
                    alt={currentUser.nickname || currentUser.email}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-slate-900">
                    {currentUser.nickname || currentUser.email || `사용자 ${currentUser.id}`}
                  </p>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>로그인</span>
              </Link>
            )}

            {/* 모바일 메뉴 버튼 */}
            <button
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-4">
            <nav className="flex flex-col space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      item.active
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

// 사용자 정보 매핑 함수 (기존과 동일)
const getUserInfoFromId = (userId) => {
  const names = [
    '김하늘', '이바다', '박별님', '최달빛', '정햇살', '장꽃님', '윤구름', '임나무', '한바람', '오새벽',
    '강여름', '송가을', '조겨울', '권봄날', '유행복', '노평화', '도희망', '류사랑', '서지혜', '문예은',
    '신민준', '김태양', '이달님', '박지수', '최수진', '정미래', '장소망', '윤기쁨', '임웃음', '한평온',
    '오자유', '강순수', '송맑음', '조고요', '권따뜻', '유포근', '노은혜', '도감사', '류기적', '서축복',
    '문소중', '신귀한', '김빛나', '이영롱', '박고운', '최아름', '정단아', '장예쁜', '윤사랑', '임기분',
    '한설렘', '오떨림', '강두근', '송신남', '조즐거', '권행복', '유만족', '노충만', '도완전', '류최고'
  ]
  
  const nameIndex = (userId - 1) % names.length
  
  return {
    id: userId,
    nickname: names[nameIndex],
    email: `user${userId}@example.com`,
    profileImage: `https://www.gravatar.com/avatar/${userId}?d=identicon`
  }
}

// 감정 이모지 매핑
const getEmotionEmoji = (summary) => {
  const text = summary.toLowerCase()
  if (text.includes('기쁨') || text.includes('행복') || text.includes('즐거') || text.includes('성공')) return '😊'
  if (text.includes('슬픔') || text.includes('우울') || text.includes('힘들') || text.includes('아쉬')) return '😢'
  if (text.includes('화') || text.includes('분노') || text.includes('짜증') || text.includes('스트레스')) return '😠'
  if (text.includes('불안') || text.includes('걱정') || text.includes('두려')) return '😰'
  if (text.includes('놀람') || text.includes('깜짝') || text.includes('신기')) return '😲'
  return '😐'
}

export default function EmotionRecommendationPage() {
  const [currentUser, setCurrentUser] = useState(null)
  const [isUserLoading, setIsUserLoading] = useState(true)
  const [recommendations, setRecommendations] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [authError, setAuthError] = useState(null)

  // 현재 사용자 정보 가져오기
  const fetchCurrentUser = async () => {
    try {
      setIsUserLoading(true)
      setAuthError(null)
      
      const userData = await authAPI.getCurrentUser()
      console.log('현재 사용자:', userData)
      setCurrentUser(userData)
      
      // 사용자 정보를 가져온 후 자동으로 추천 데이터 로딩
      if (userData?.id) {
        await fetchRecommendations(userData.id)
      }
      
    } catch (err) {
      console.error('사용자 정보 로딩 실패:', err)
      setAuthError(err.message)
      setCurrentUser(null)
    } finally {
      setIsUserLoading(false)
    }
  }

  // API 호출 함수
  const fetchRecommendations = async (targetUserId) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch(
        `https://3s71d8d8je.execute-api.us-east-1.amazonaws.com/prod/api/recommend/${targetUserId}`
      )
      
      if (!response.ok) {
        throw new Error(`API 호출 실패: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('추천 데이터:', data)
      setRecommendations(data)
      
    } catch (err) {
      console.error('추천 데이터 로딩 실패:', err)
      setError(err.message)
      
      // Mock 데이터로 fallback
      setRecommendations({
        similar_users: [
          {
            user_id: 15,
            diary_id: 1001,
            summary: "오늘은 정말 기분 좋은 하루였다. 친구들과 함께한 시간이 너무 즐거웠다.",
            created_at: "2025-06-10T10:30:00"
          },
          {
            user_id: 23,
            diary_id: 1002,  
            summary: "새로운 프로젝트가 성공적으로 끝나서 뿌듯하다. 팀원들과의 협업도 좋았다.",
            created_at: "2025-06-09T14:20:00"
          },
          {
            user_id: 31,
            diary_id: 1003,
            summary: "맛있는 음식을 먹고 좋은 영화를 봤다. 완벽한 주말이었다.",
            created_at: "2025-06-08T18:45:00"
          }
        ],
        opposite_users: [
          {
            user_id: 7,
            diary_id: 2001,
            summary: "오늘은 왠지 우울하고 기분이 좋지 않았다. 모든 게 힘들게 느껴진다.",
            created_at: "2025-06-10T09:15:00"
          },
          {
            user_id: 19,
            diary_id: 2002,
            summary: "일이 잘 안 풀려서 스트레스가 많다. 좀 더 노력해야겠다.",
            created_at: "2025-06-09T16:30:00"
          },
          {
            user_id: 42,
            diary_id: 2003,
            summary: "비가 와서 그런지 마음이 침울하다. 혼자 있는 시간이 외롭다.",
            created_at: "2025-06-08T20:10:00"
          }
        ]
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 페이지 로드시 현재 사용자 정보 및 추천 데이터 불러오기
  useEffect(() => {
    fetchCurrentUser()
  }, [])

  // 새로고침 버튼 처리
  const handleRefresh = () => {
    if (currentUser?.id) {
      fetchRecommendations(currentUser.id)
    }
  }

  // 일기 카드 컴포넌트
  const DiaryCard = ({ diary, type }) => {
    const userInfo = getUserInfoFromId(diary.user_id)
    const emoji = getEmotionEmoji(diary.summary)
    const isOpposite = type === 'opposite'
    
    return (
      <div className={`bg-white rounded-xl p-6 shadow-sm border-2 transition-all duration-300 hover:shadow-lg ${
        isOpposite 
          ? 'border-purple-200 hover:border-purple-300' 
          : 'border-blue-200 hover:border-blue-300'
      }`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-slate-200 rounded-full overflow-hidden">
              <img
                src={userInfo.profileImage}
                alt={userInfo.nickname}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="font-semibold text-slate-900">{userInfo.nickname}</p>
              <p className="text-sm text-slate-500">
                {new Date(diary.created_at).toLocaleDateString('ko-KR', {
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{emoji}</span>
            {isOpposite ? (
              <TrendingDown className="w-5 h-5 text-purple-500" />
            ) : (
              <TrendingUp className="w-5 h-5 text-blue-500" />
            )}
          </div>
        </div>
        
        <p className="text-slate-700 leading-relaxed mb-4">{diary.summary}</p>
        
        <div className="flex items-center justify-between">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            isOpposite 
              ? 'bg-purple-50 text-purple-700' 
              : 'bg-blue-50 text-blue-700'
          }`}>
            {isOpposite ? '반대 감정' : '유사 감정'}
          </span>
          
          <div className="flex items-center space-x-4 text-sm text-slate-500">
            <button className="flex items-center space-x-1 hover:text-red-500 transition-colors">
              <Heart className="w-4 h-4" />
              <span>{Math.floor(Math.random() * 15) + 1}</span>
            </button>
            <button className="flex items-center space-x-1 hover:text-blue-500 transition-colors">
              <MessageCircle className="w-4 h-4" />
              <span>{Math.floor(Math.random() * 8) + 1}</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* 네비게이션 헤더 */}
      <Header currentUser={currentUser} />

      {/* 페이지 헤더 */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center">
                <Compass className="w-8 h-8 mr-3 text-purple-600" />
                감정 탐험
              </h1>
              <p className="text-slate-600 mt-1">AI가 분석한 당신의 감정을 바탕으로 맞춤형 추천을 제공합니다</p>
            </div>
            <Sparkles className="w-12 h-12 text-purple-400" />
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* 로딩 상태 - 사용자 정보 */}
        {isUserLoading && (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">사용자 정보를 확인하고 있습니다...</p>
            </div>
          </div>
        )}

        {/* 인증 에러 - 로그인 필요 */}
        {authError && !isUserLoading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <LogIn className="w-16 h-16 mx-auto mb-4 text-red-400" />
            <h3 className="text-xl font-semibold text-red-800 mb-2">로그인이 필요합니다</h3>
            <p className="text-red-600 mb-4">
              감정 추천 서비스를 이용하려면 먼저 로그인해 주세요.
            </p>
            <Link 
              href="/login"
              className="inline-flex items-center px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogIn className="w-4 h-4 mr-2" />
              로그인하러 가기
            </Link>
          </div>
        )}

        {/* 현재 사용자 정보 표시 */}
        {currentUser && !isUserLoading && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-purple-600" />
              현재 사용자 정보
            </h2>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-slate-200 rounded-full overflow-hidden">
                  <img
                    src={`https://www.gravatar.com/avatar/${currentUser.id}?d=identicon`}
                    alt={currentUser.nickname || currentUser.email}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">
                    {currentUser.nickname || currentUser.email || `사용자 ${currentUser.id}`}
                  </p>
                  <p className="text-sm text-slate-500">ID: {currentUser.id}</p>
                </div>
              </div>
              
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <RotateCw className="w-4 h-4" />
                )}
                <span>{isLoading ? '분석 중...' : '새로고침'}</span>
              </button>
            </div>
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <p className="text-yellow-800">
              API 연결에 실패했습니다. 임시 데이터를 표시합니다. ({error})
            </p>
          </div>
        )}

        {/* 로딩 상태 - 추천 데이터 */}
        {isLoading && currentUser && !recommendations && (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">감정을 분석하고 있습니다...</p>
            </div>
          </div>
        )}

        {/* 추천 결과 */}
        {recommendations && currentUser && (
          <div className="space-y-12">
            {/* 반대 감정 섹션 */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                    <TrendingDown className="w-6 h-6 mr-3 text-purple-600" />
                    반대 감정의 일기
                  </h2>
                  <p className="text-slate-600 mt-1">다른 시각으로 바라보는 경험들</p>
                </div>
                <div className="bg-purple-50 px-4 py-2 rounded-full">
                  <span className="text-purple-700 font-medium">
                    {recommendations.opposite_users?.length || 0}개
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.opposite_users?.map((diary, index) => (
                  <DiaryCard key={`opposite-${index}`} diary={diary} type="opposite" />
                )) || (
                  <div className="col-span-full text-center py-12 text-slate-500">
                    반대 감정의 일기를 찾을 수 없습니다.
                  </div>
                )}
              </div>
            </section>

            {/* 유사 감정 섹션 */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                    <TrendingUp className="w-6 h-6 mr-3 text-blue-600" />
                    유사 감정의 일기
                  </h2>
                  <p className="text-slate-600 mt-1">공감할 수 있는 비슷한 경험들</p>
                </div>
                <div className="bg-blue-50 px-4 py-2 rounded-full">
                  <span className="text-blue-700 font-medium">
                    {recommendations.similar_users?.length || 0}개
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.similar_users?.map((diary, index) => (
                  <DiaryCard key={`similar-${index}`} diary={diary} type="similar" />
                )) || (
                  <div className="col-span-full text-center py-12 text-slate-500">
                    유사 감정의 일기를 찾을 수 없습니다.
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {/* 인사이트 섹션 */}
        {recommendations && currentUser && (
          <section className="mt-12 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-8 border border-purple-200">
            <h3 className="text-xl font-semibold text-slate-900 mb-4 flex items-center">
              <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
              감정 인사이트
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium text-purple-700 mb-2">반대 감정으로부터</h4>
                <p className="text-sm text-slate-600">
                  다른 관점의 경험을 통해 내 감정을 객관적으로 바라볼 수 있어요. 
                  때로는 정반대의 시각이 새로운 통찰을 가져다줍니다.
                </p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium text-blue-700 mb-2">유사 감정으로부터</h4>
                <p className="text-sm text-slate-600">
                  비슷한 감정을 느낀 사람들의 경험을 통해 공감대를 형성하고 
                  혼자가 아니라는 위로를 받을 수 있어요.
                </p>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2 z-40">
        <div className="flex items-center justify-around">
          <Link href="/dashboard" className="flex flex-col items-center space-y-1 p-2 text-slate-400">
            <Home className="w-5 h-5" />
            <span className="text-xs">홈</span>
          </Link>
          <Link href="/write" className="flex flex-col items-center space-y-1 p-2 text-slate-400">
            <Plus className="w-5 h-5" />
            <span className="text-xs">작성</span>
          </Link>
          <Link href="/communities" className="flex flex-col items-center space-y-1 p-2 text-slate-400">
            <Users className="w-5 h-5" />
            <span className="text-xs">나눔방</span>
          </Link>
          <button className="flex flex-col items-center space-y-1 p-2 text-purple-600">
            <Compass className="w-5 h-5" />
            <span className="text-xs font-medium">감정탐험</span>
          </button>
          <button className="flex flex-col items-center space-y-1 p-2 text-slate-400 relative">
            <Bell className="w-5 h-5" />
            <span className="text-xs">알림</span>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
          </button>
        </div>
      </div>

      {/* Mobile Bottom Padding */}
      <div className="md:hidden h-20"></div>
    </div>
  )
}
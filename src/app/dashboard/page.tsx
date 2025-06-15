"use client"

import { useState, useEffect } from "react"
import { Button } from "../components/ui/button"
import Link from 'next/link'
import { Diary } from "../../types/diary"
import { EmotionData, MoodColors, WeeklyTrend, EmotionPercentage } from "../../types/emotion"
import { User } from "../../types/user"
import { diaryAPI, communityAPI, authAPI } from "../../lib/api"
import { toast } from "sonner"
import Header from "../../components/Header"
import UserInfoCard from "../../components/UserInfoCard"
import DiaryWriteModal from "../components/DiaryWriteModal"
import { mockCurrentUserDiaries, mockRecommendedDiaries } from "../../mock/diary"

import {
  Heart,
  MessageCircle,
  TrendingUp,
  Users,
  Calendar,
  Plus,
  ChevronLeft,
  ChevronRight,
  BarChart2,
  Clock,
  BookOpen,
  Home,
  Search,
  Bell,
  Smile,
  Frown,
  Zap,
  Meh
} from "lucide-react"

export default function Component() {
  // 사용자 정보 상태를 직접 관리
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isUserLoading, setIsUserLoading] = useState(true)
  const [userError, setUserError] = useState<string | null>(null)
  
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [groupEntries, setGroupEntries] = useState<Diary[]>([])
  const [recommendedEntries, setRecommendedEntries] = useState<Diary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // 일기 작성 모달 상태 추가
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false)

  // 배열인지 확인하는 헬퍼 함수
  const ensureArray = (data: any): any[] => {
    if (Array.isArray(data)) {
      return data
    }
    if (data && typeof data === 'object' && Array.isArray(data.data)) {
      return data.data
    }
    if (data && typeof data === 'object' && Array.isArray(data.diaries)) {
      return data.diaries
    }
    console.warn('Expected array but got:', typeof data, data)
    return []
  }

  // 사용자 이름 매핑
  const getUserInfoFromId = (userId: number) => {
    const names = [
      '김하늘', '최정혁', '박별님', '최달빛', '정햇살', '장꽃님', '윤구름', '임나무', '한바람', '오새벽',
      '강여름', '송가을', '조겨울', '권봄날', '유행복', '노평화', '도희망', '류사랑', '서지혜', '문예은',
      '신민준', '김태양', '이달님', '박지수', '최수진', '정미래', '장소망', '윤기쁨', '임웃음', '한평온',
      '오자유', '강순수', '송맑음', '조고요', '권따뜻', '유포근', '노은혜', '도감사', '류기적', '서축복',
      '문소중', '신귀한', '김빛나', '이영롱', '박고운', '최아름', '정단아', '장예쁜', '윤사랑', '임기분',
      '한설렘', '오떨림', '강두근', '송신남', '조즐거', '권행복', '유만족', '노충만', '도완전', '류최고'
    ]
    return names[userId - 1] || `사용자 ${userId}`
  }

  // 감정 이모지 매핑
  const getEmotionEmoji = (emotion: string) => {
    const emojiMap: { [key: string]: string } = {
      '기쁨': '😊',
      '행복': '😊',
      '슬픔': '😢',
      '분노': '😠',
      '화남': '😠',
      '신남': '🤩',
      '설렘': '💖',
      '기대': '✨',
      '평온': '😌',
      '불안': '😰',
      '감사': '🙏',
      '사랑': '❤️',
      '만족': '😌',
      '후회': '😞',
      '당황': '😳',
      '놀람': '😲',
      '지루함': '😴',
      '외로움': '😔',
      '실망': '😞',
      '무기력': '😪'
    }
    return emojiMap[emotion] || '😐'
  }

  // 실제 사용자 정보를 가져오는 함수
  const fetchCurrentUser = async () => {
    try {
      setIsUserLoading(true)
      setUserError(null)
      
      console.log('🔐 사용자 인증 정보 조회 중...')
      const userResponse = await authAPI.getCurrentUser()
      
      console.log('✅ 사용자 정보 조회 성공:', userResponse)
      
      // 실제 API 응답에 맞게 사용자 정보 구성
      const userData: User = {
        id: userResponse?.id || 1,
        nickname: userResponse?.nickname || "최정혁",
        email: userResponse?.email || "test@example.com",
        profileImage: userResponse?.profileImage || `https://www.gravatar.com/avatar/${userResponse?.id || 1}?d=identicon`
      }
      
      setCurrentUser(userData)
      console.log('👤 설정된 사용자 정보:', userData)
      
    } catch (err) {
      console.error('❌ 사용자 정보 조회 실패:', err)
      const errorMessage = err instanceof Error ? err.message : '사용자 정보를 가져올 수 없습니다.'
      setUserError(errorMessage)
      
      // 에러 시 기본 사용자 정보 설정
      const defaultUser: User = {
        id: 1,
        nickname: "최정혁",
        email: "test@example.com",
        profileImage: "https://www.gravatar.com/avatar/1?d=identicon"
      }
      setCurrentUser(defaultUser)
      
      toast.error('사용자 정보를 가져오는데 실패했습니다.')
    } finally {
      setIsUserLoading(false)
    }
  }

  // 일기 데이터를 가져오는 함수
  const fetchDiaryData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log('📖 일기 데이터 조회 중...')
      
      // 내 일기 조회 - getMyDiaries 사용
      const myDiariesResponse = await diaryAPI.getMyDiaries()
      console.log('✅ 내 일기 조회 성공:', myDiariesResponse)
      
      // 안전하게 배열로 변환
      const myDiaries = ensureArray(myDiariesResponse)
      setGroupEntries(myDiaries)

      // 추천 일기 조회 - 별도 API가 없으므로 mock 데이터 사용
      try {
        // 임시로 내 일기에서 최신 몇 개를 추천으로 표시
        const allDiariesResponse = await diaryAPI.getMyDiaries()
        console.log('✅ 추천 일기용 데이터 조회 성공:', allDiariesResponse)
        
        const recommendedDiaries = ensureArray(allDiariesResponse)
        setRecommendedEntries(recommendedDiaries.slice(-3))
      } catch (recommendedError) {
        console.warn('⚠️ 추천 일기 조회 실패, mock 데이터 사용:', recommendedError)
        setRecommendedEntries(ensureArray(mockRecommendedDiaries))
      }

    } catch (err) {
      console.error('❌ 일기 데이터 조회 실패:', err)
      const errorMessage = err instanceof Error ? err.message : '일기를 가져오는데 실패했습니다.'
      setError(errorMessage)
      
      // 에러 시 mock 데이터 사용
      console.log('🔄 Mock 데이터로 fallback')
      setGroupEntries(ensureArray(mockCurrentUserDiaries))
      setRecommendedEntries(ensureArray(mockRecommendedDiaries))
      
      toast.error('일기 데이터를 가져오는데 실패했습니다. 임시 데이터를 표시합니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // 페이지 로드 시 데이터 가져오기
  useEffect(() => {
    fetchCurrentUser()
  }, [])

  useEffect(() => {
    if (currentUser) {
      fetchDiaryData()
    }
  }, [currentUser])

  // 일기 저장 완료 후 처리
  const handleDiarySave = (result: any) => {
    console.log('일기 저장 완료:', result)
    toast.success('일기가 성공적으로 저장되었습니다!')
    
    // 대시보드 데이터 새로고침
    fetchDiaryData()
  }

  // 달 변경 함수
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth)
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1)
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1)
    }
    setCurrentMonth(newMonth)
  }

  // 감정별 색상 매핑
  const getEmotionColor = (emotion: string): string => {
    const colorMap: { [key: string]: string } = {
      '기쁨': 'bg-yellow-100 text-yellow-800',
      '행복': 'bg-yellow-100 text-yellow-800',
      '슬픔': 'bg-blue-100 text-blue-800',
      '분노': 'bg-red-100 text-red-800',
      '불안': 'bg-purple-100 text-purple-800',
      '설렘': 'bg-pink-100 text-pink-800',
      '기대': 'bg-orange-100 text-orange-800',
      '지루함': 'bg-gray-100 text-gray-800',
      '외로움': 'bg-indigo-100 text-indigo-800',
      '만족': 'bg-green-100 text-green-800',
      '실망': 'bg-orange-100 text-orange-800',
      '무기력': 'bg-slate-100 text-slate-800',
      '평온': 'bg-emerald-100 text-emerald-800',
    }
    return colorMap[emotion] || 'bg-gray-100 text-gray-800'
  }

  // 감정 요약 생성 - 안전한 배열 처리
  const getEmotionSummary = () => {
    if (!Array.isArray(groupEntries) || groupEntries.length === 0) {
      return null
    }

    const emotionCounts: { [key: string]: number } = {}
    groupEntries.forEach(diary => {
      if (diary && diary.primaryEmotion) {
        const emotion = diary.primaryEmotion
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1
      }
    })

    const emotions = Object.entries(emotionCounts)
    if (emotions.length === 0) {
      return {
        totalEntries: groupEntries.length,
        topEmotion: '알 수 없음',
        topEmotionCount: 0
      }
    }

    const topEmotion = emotions.sort(([,a], [,b]) => b - a)[0]

    return {
      totalEntries: groupEntries.length,
      topEmotion: topEmotion ? topEmotion[0] : '알 수 없음',
      topEmotionCount: topEmotion ? topEmotion[1] : 0
    }
  }

  // 상세 감정 통계 생성
  const getDetailedEmotionStats = () => {
    if (!Array.isArray(groupEntries) || groupEntries.length === 0) {
      return []
    }

    const emotionCounts: { [key: string]: number } = {}
    groupEntries.forEach(diary => {
      if (diary && diary.primaryEmotion && diary.primaryEmotion !== 'string') {
        const emotion = diary.primaryEmotion
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1
      }
    })

    return Object.entries(emotionCounts)
      .map(([emotion, count]) => ({
        emotion,
        count,
        percentage: Math.round((count / groupEntries.length) * 100),
        emoji: getEmotionEmoji(emotion),
        color: getEmotionColor(emotion)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
  }

  // 주간 감정 트렌드 생성
  const getWeeklyEmotionTrend = () => {
    if (!Array.isArray(groupEntries) || groupEntries.length === 0) {
      return []
    }

    // 최근 7일간의 일기 필터링
    const today = new Date()
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    const recentDiaries = groupEntries.filter(diary => {
      const diaryDate = new Date(diary.createdAt)
      return diaryDate >= weekAgo && diaryDate <= today
    })

    // 날짜별로 그룹화
    const dailyEmotions: { [key: string]: string[] } = {}
    recentDiaries.forEach(diary => {
      if (diary.primaryEmotion && diary.primaryEmotion !== 'string') {
        const dateKey = new Date(diary.createdAt).toLocaleDateString('ko-KR')
        if (!dailyEmotions[dateKey]) {
          dailyEmotions[dateKey] = []
        }
        dailyEmotions[dateKey].push(diary.primaryEmotion)
      }
    })

    return Object.entries(dailyEmotions).map(([date, emotions]) => ({
      date,
      emotions,
      mainEmotion: emotions.length > 0 ? emotions[0] : '없음',
      count: emotions.length
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  const emotionSummary = getEmotionSummary()
  const detailedEmotionStats = getDetailedEmotionStats()
  const weeklyTrend = getWeeklyEmotionTrend()

  // 로딩 상태
  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* 사용자 정보 카드 */}
          <div className="mb-6">
            {currentUser ? (
              <UserInfoCard user={currentUser} />
            ) : (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-center text-slate-500">
                  <p>사용자 정보를 불러올 수 없습니다.</p>
                  {userError && <p className="text-sm mt-1 text-red-500">{userError}</p>}
                </div>
              </div>
            )}
          </div>

          {/* 월간 감정 개요 */}
          {emotionSummary && (
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold">
                    {currentMonth.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })} 감정 리포트
                  </h2>
                  <p className="text-blue-100">이번 달 당신의 감정 여정을 확인해보세요</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{emotionSummary.totalEntries}</div>
                  <div className="text-blue-100">총 일기 수</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/20 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/30 rounded-lg">
                      <div className="text-2xl">{getEmotionEmoji(emotionSummary.topEmotion)}</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">가장 많은 감정</div>
                      <div className="text-blue-100">{emotionSummary.topEmotion} ({emotionSummary.topEmotionCount}회)</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/20 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/30 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold">주간 평균</div>
                      <div className="text-blue-100">{Math.round(emotionSummary.totalEntries / 4)}회</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/20 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/30 rounded-lg">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold">연속 작성</div>
                      <div className="text-blue-100">{Math.min(emotionSummary.totalEntries, 7)}일</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 액션 버튼들 */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={() => setIsWriteModalOpen(true)}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="w-5 h-5 mr-2" />
              새 일기 작성하기
            </Button>
            <Link href="/my-diary" className="flex-1">
              <Button variant="outline" className="w-full py-3 text-lg font-semibold border-2 hover:bg-slate-50">
                <BookOpen className="w-5 h-5 mr-2" />
                내 일기 모아보기
              </Button>
            </Link>
          </div>

          {/* 최근 일기 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* 내가 쓴 일기 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">내가 쓴 일기</h3>
                </div>
                <Link href="/my-diary" className="text-blue-600 hover:text-blue-700 font-medium">
                  전체보기
                </Link>
              </div>
              
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex items-center space-x-3 p-4 border border-slate-200 rounded-lg">
                        <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                          <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-8 text-slate-500">
                  <p>일기를 불러오는데 실패했습니다.</p>
                  <p className="text-sm mt-1">임시 데이터를 표시합니다.</p>
                </div>
              ) : !Array.isArray(groupEntries) || groupEntries.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p className="font-medium">아직 작성한 일기가 없습니다</p>
                  <p className="text-sm mt-1">첫 번째 일기를 작성해보세요!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {groupEntries.slice(0, 3).map((diary) => (
                    <Link key={diary.id} href={`/diary/${diary.id}`}>
                      <div className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getEmotionEmoji(diary.primaryEmotion || '알 수 없음')}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEmotionColor(diary.primaryEmotion || '알 수 없음')}`}>
                              {diary.primaryEmotion || '알 수 없음'}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500">
                            {new Date(diary.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="font-medium text-slate-900 mb-1 line-clamp-1">
                          {diary.title || '제목 없음'}
                        </h4>
                        <p className="text-sm text-slate-600 line-clamp-2">
                          {diary.content || '내용 없음'}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* 추천 일기 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">나눔방 일기</h3>
                </div>
                <Link href="/communities" className="text-purple-600 hover:text-purple-700 font-medium">
                  더보기
                </Link>
              </div>
              
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex items-center space-x-3 p-4 border border-slate-200 rounded-lg">
                        <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                          <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : !Array.isArray(recommendedEntries) || recommendedEntries.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Heart className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p className="font-medium">추천할 일기가 없습니다</p>
                  <p className="text-sm mt-1">커뮤니티에 참여해보세요!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recommendedEntries.slice(0, 3).map((diary) => (
                    <Link key={diary.id} href={`/diary2/${diary.id}`}>
                      <div className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-xs font-medium text-white">
                              {diary.userId ? getUserInfoFromId(diary.userId).charAt(0) : 'U'}
                            </div>
                            <span className="text-sm text-slate-600">
                              {diary.userId ? getUserInfoFromId(diary.userId) : (diary.user?.nickname || diary.user?.email?.split('@')[0] || '익명')}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Heart className="w-4 h-4 text-slate-400" />
                            <span className="text-xs text-slate-500">{diary.likes || 0}</span>
                          </div>
                        </div>
                        <h4 className="font-medium text-slate-900 mb-1 line-clamp-1">
                          {diary.title || '제목 없음'}
                        </h4>
                        <p className="text-sm text-slate-600 line-clamp-2">
                          {diary.content || '내용 없음'}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 감정 통계 차트 영역 */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BarChart2 className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">감정 분석</h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-1 bg-slate-100 rounded-lg text-sm font-medium">
                  {currentMonth.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}
                </span>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {detailedEmotionStats.length > 0 ? (
              <div className="space-y-6">
                {/* 감정 분포 차트 */}
                <div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-4">감정 분포</h4>
                  <div className="space-y-3">
                    {detailedEmotionStats.map((stat, index) => (
                      <div key={stat.emotion} className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 w-24">
                          <span className="text-lg">{stat.emoji}</span>
                          <span className="text-sm font-medium text-slate-700">{stat.emotion}</span>
                        </div>
                        <div className="flex-1 relative">
                          <div className="w-full bg-slate-200 rounded-full h-3">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-1000"
                              style={{ width: `${stat.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 w-20 text-right">
                          <span className="text-sm font-semibold text-slate-900">{stat.count}개</span>
                          <span className="text-xs text-slate-500">({stat.percentage}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 주간 감정 트렌드 */}
                {weeklyTrend.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900 mb-4">최근 7일 감정 트렌드</h4>
                    <div className="grid grid-cols-7 gap-2">
                      {weeklyTrend.map((day, index) => (
                        <div key={index} className="text-center">
                          <div className="text-xs text-slate-500 mb-1">
                            {new Date(day.date).toLocaleDateString('ko-KR', { weekday: 'short' })}
                          </div>
                          <div className="w-full h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-1">
                            {day.count > 0 ? (
                              <div className="text-center">
                                <div className="text-lg">{getEmotionEmoji(day.mainEmotion)}</div>
                              </div>
                            ) : (
                              <div className="text-slate-400">-</div>
                            )}
                          </div>
                          <div className="text-xs text-slate-600">{day.count}개</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <BarChart2 className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <p className="font-medium">감정 데이터 부족</p>
                <p className="text-sm mt-1">더 많은 일기를 작성하면 상세한 감정 분석을 제공해드릴게요!</p>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* 일기 작성 모달 */}
      {currentUser && (
        <DiaryWriteModal 
          isOpen={isWriteModalOpen}
          onClose={() => setIsWriteModalOpen(false)}
          onSave={handleDiarySave}
          currentUser={currentUser}
        />
      )}
    </div>
  )
}
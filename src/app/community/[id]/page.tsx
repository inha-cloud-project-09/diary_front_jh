"use client"

import { useState, useEffect } from "react"
import { Button } from "@/app/components/ui/button"
import Link from "next/link"
import { Diary, Community } from "@/types/diary"
import { toast } from "sonner"
import Header from "@/components/Header"
import { 
  Plus, Heart, MessageCircle, Calendar, Clock, Users, ArrowLeft, 
  TrendingUp, Star, Activity, Eye, Share2, Settings, Crown,
  BarChart3, PieChart, Zap, Target, Award, UserPlus, Sparkles,
  BookOpen, Smile, Frown, Meh, ThumbsUp, Filter, ChevronDown
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"

const mylink = "https://withudiary.my" //http://localhost:8080

// 실제 API 호출 함수들 (나눔방 페이지에서 가져옴)
const communityAPIReal = {
  // 커뮤니티 상세 조회
  getCommunity: async (communityId) => {
    const response = await fetch(`${mylink}/api/communities/${communityId}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth-token') || ''}`
      }
    })
    if (!response.ok) throw new Error(`커뮤니티 조회 실패: ${response.status}`)
    return response.json()
  },

  // 커뮤니티 가입
  joinCommunity: async (communityId) => {
    const response = await fetch(`${mylink}/api/communities/${communityId}/join`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth-token') || ''}`
      }
    })
    if (!response.ok) throw new Error(`가입 실패: ${response.status}`)
    return response.json()
  },

  // 커뮤니티 탈퇴
  leaveCommunity: async (communityId) => {
    const response = await fetch(`${mylink}/api/communities/${communityId}/leave`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth-token') || ''}`
      }
    })
    if (!response.ok) throw new Error(`탈퇴 실패: ${response.status}`)
    return response.json()
  },

  // 커뮤니티 내 일기 조회
  getCommunityDiaries: async (communityId) => {
    const response = await fetch(`${mylink}/api/communities/${communityId}/diaries`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth-token') || ''}`
      }
    })
    if (!response.ok) throw new Error(`일기 조회 실패: ${response.status}`)
    return response.json()
  }
}

export default function CommunityPage() {
  const params = useParams()
  const router = useRouter()
  const [community, setCommunity] = useState(null)
  const [diaries, setDiaries] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isJoining, setIsJoining] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const [error, setError] = useState(null)
  const [isJoined, setIsJoined] = useState(false)
  const [emotionFilter, setEmotionFilter] = useState("all")
  const [sortBy, setSortBy] = useState("recent")
  const [showStats, setShowStats] = useState(true)

  // 감정 필터 옵션 (한글 감정에 맞게 수정)
  const emotionFilters = [
    { id: "all", name: "전체", icon: BookOpen, color: "bg-slate-100 text-slate-700" },
    { id: "기쁨", name: "기쁨", icon: Smile, color: "bg-yellow-100 text-yellow-700" },
    { id: "슬픔", name: "슬픔", icon: Frown, color: "bg-blue-100 text-blue-700" },
    { id: "평온", name: "평온", icon: Meh, color: "bg-green-100 text-green-700" },
    { id: "설렘", name: "설렘", icon: Zap, color: "bg-orange-100 text-orange-700" },
    { id: "기대", name: "기대", icon: Star, color: "bg-purple-100 text-purple-700" }
  ]

  // 정렬 옵션
  const sortOptions = [
    { id: "recent", name: "최신순" },
    { id: "popular", name: "인기순" },
    { id: "comments", name: "댓글순" }
  ]

  // 데이터 로드
  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        setIsLoading(true)
        console.log('🏠 커뮤니티 정보 로드 중...', params.id)
        
        // 커뮤니티 정보 조회
        const communityResponse = await communityAPIReal.getCommunity(Number(params.id))
        console.log('✅ 커뮤니티 데이터:', communityResponse)
        
        const communityData = communityResponse.data || communityResponse
        console.log('📊 멤버 수:', communityData.memberCount, '가입 여부:', communityData.isJoined)
        setCommunity(communityData)
        
        // 가입 여부 확인 (API 응답에 포함되어 있을 수 있음)
        setIsJoined(communityData.isJoined || false)

        // 커뮤니티의 일기 목록 조회
        const diariesResponse = await communityAPIReal.getCommunityDiaries(Number(params.id))
        console.log('✅ 일기 데이터:', diariesResponse)
        
        const diariesData = diariesResponse.data || diariesResponse
        setDiaries(Array.isArray(diariesData) ? diariesData : [])
        
      } catch (err) {
        console.error('❌ 커뮤니티 정보 로드 실패:', err)
        setError("커뮤니티 정보를 불러오는데 실패했습니다.")
        toast.error("커뮤니티 정보를 불러오는데 실패했습니다.")
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchCommunityData()
    }
  }, [params.id])

  // 커뮤니티 가입
  const handleJoinCommunity = async () => {
    if (!community) return
    
    try {
      setIsJoining(true)
      console.log('👥 커뮤니티 가입 시도:', community.name)
      
      await communityAPIReal.joinCommunity(community.id)
      
      toast.success(`"${community.name}" 커뮤니티에 가입했습니다!`)
      setIsJoined(true)
      
      // 멤버 수 업데이트
      setCommunity(prev => ({
        ...prev,
        memberCount: (prev.memberCount || 0) + 1
      }))
      
    } catch (err) {
      console.error('❌ 커뮤니티 가입 실패:', err)
      toast.error('커뮤니티 가입에 실패했습니다.')
    } finally {
      setIsJoining(false)
    }
  }

  // 커뮤니티 탈퇴
  const handleLeaveCommunity = async () => {
    if (!community) return
    
    try {
      setIsLeaving(true)
      console.log('👋 커뮤니티 탈퇴 시도:', community.name)
      
      await communityAPIReal.leaveCommunity(community.id)
      
      toast.success(`"${community.name}" 커뮤니티에서 탈퇴했습니다.`)
      setIsJoined(false)
      
      // 멤버 수 업데이트
      setCommunity(prev => ({
        ...prev,
        memberCount: Math.max((prev.memberCount || 1) - 1, 0)
      }))
      
    } catch (err) {
      console.error('❌ 커뮤니티 탈퇴 실패:', err)
      toast.error('커뮤니티 탈퇴에 실패했습니다.')
    } finally {
      setIsLeaving(false)
    }
  }

  // 감정별 통계 계산 (한글 감정 지원)
  const getEmotionStats = () => {
    if (!diaries.length) return []
    
    const emotionCounts = {}
    diaries.forEach(diary => {
      const emotion = diary.primaryEmotion || 'unknown'
      if (emotion && emotion !== 'string') { // 'string' 값 제외
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1
      }
    })
    
    return Object.entries(emotionCounts)
      .map(([emotion, count]) => ({
        emotion,
        count,
        percentage: Math.round((count / diaries.length) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }

  // 일기 필터링 및 정렬
  const getFilteredDiaries = () => {
    let filtered = [...diaries]
    
    // 감정 필터
    if (emotionFilter !== "all") {
      filtered = filtered.filter(diary => diary.primaryEmotion === emotionFilter)
    }
    
    // 정렬
    switch (sortBy) {
      case "recent":
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        break
      case "popular":
        filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0))
        break
      case "comments":
        filtered.sort((a, b) => (b.comments || 0) - (a.comments || 0))
        break
    }
    
    return filtered
  }

  // 사용자 이름 매핑
  const getUserInfoFromId = (userId) => {
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

  // 감정 이모지 매핑 (한글 감정 지원)
  const getEmotionEmoji = (emotion) => {
    const emojiMap = {
      // 영어
      'happy': '😊',
      'sad': '😢',
      'angry': '😠',
      'excited': '🤩',
      'calm': '😌',
      'anxious': '😰',
      'grateful': '🙏',
      'love': '❤️',
      // 한글
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
      '놀람': '😲'
    }
    return emojiMap[emotion] || '😐'
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="max-w-5xl mx-auto px-2 sm:px-4 lg:px-6 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </main>
      </div>
    )
  }

  // 에러 상태
  if (error || !community) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="max-w-5xl mx-auto px-2 sm:px-4 lg:px-6 py-8">
          <div className="text-center py-16">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">커뮤니티를 찾을 수 없습니다</h2>
            <p className="text-slate-500 mb-6">존재하지 않거나 접근할 수 없는 커뮤니티입니다.</p>
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              뒤로 가기
            </Button>
          </div>
        </main>
      </div>
    )
  }

  const emotionStats = getEmotionStats()
  const filteredDiaries = getFilteredDiaries()

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-6 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            className="text-slate-600 hover:text-slate-900"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            뒤로 가기
          </Button>
        </div>

        {/* Community Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8 shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between">
            <div className="flex-1 mb-6 lg:mb-0">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{community.name}</h1>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{community.memberCount || 0}명의 멤버</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(community.createdAt).toLocaleDateString('ko-KR')}</span>
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-lg text-white/90 leading-relaxed">{community.description}</p>
            </div>
            
            <div className="flex flex-col space-y-3">
              {isJoined ? (
                <Button 
                  onClick={handleLeaveCommunity}
                  disabled={isLeaving}
                  variant="outline"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  {isLeaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      탈퇴 중...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      탈퇴하기
                    </>
                  )}
                </Button>
              ) : (
                <Button 
                  onClick={handleJoinCommunity}
                  disabled={isJoining}
                  className="bg-white text-blue-600 hover:bg-white/90"
                >
                  {isJoining ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      가입 중...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      가입하기
                    </>
                  )}
                </Button>
              )}
              
              <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                <Share2 className="w-4 h-4 mr-2" />
                공유하기
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {showStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">총 일기 수</h3>
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-2">{diaries.length}</div>
              <p className="text-sm text-slate-500">
                오늘 {diaries.filter(d => {
                  const today = new Date().toDateString()
                  const diaryDate = new Date(d.createdAt).toDateString()
                  return diaryDate === today
                }).length}개 작성됨
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">활성 멤버</h3>
                <Activity className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-2">
                {community.memberCount ? Math.floor(community.memberCount * 0.7) : Math.max(Math.floor(diaries.length * 1.2), 5)}
              </div>
              <p className="text-sm text-slate-500">
                {community.memberCount ? '전체 멤버의 70%' : '일기 활동 기준'}
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">평균 감정 점수</h3>
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-2">8.2</div>
              <p className="text-sm text-slate-500">매우 긍정적</p>
            </div>
          </div>
        )}

        {/* Emotion Distribution */}
        {emotionStats.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">감정 분포</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {emotionStats.map((stat) => (
                <div key={stat.emotion} className="text-center p-4 bg-slate-50 rounded-lg">
                  <div className="text-2xl mb-2">{getEmotionEmoji(stat.emotion)}</div>
                  <div className="font-medium text-slate-900">{stat.emotion}</div>
                  <div className="text-sm text-slate-500">{stat.count}개 ({stat.percentage}%)</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Write New Diary Button */}
        {isJoined && (
          <div className="mb-8">
            <Link href="/write">
              <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <Plus className="w-5 h-5 mr-2" />
                새 일기 작성하기
              </Button>
            </Link>
          </div>
        )}

        {/* Filters and Sort */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
            {/* Emotion Filter */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Filter className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700">감정별 필터</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {emotionFilters.map((filter) => {
                  const Icon = filter.icon
                  return (
                    <button
                      key={filter.id}
                      onClick={() => setEmotionFilter(filter.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                        emotionFilter === filter.id
                          ? "bg-blue-600 text-white"
                          : `${filter.color} hover:opacity-80`
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{filter.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Sort Options */}
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-slate-700">정렬:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                {sortOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Diary List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">
              커뮤니티 일기 ({filteredDiaries.length})
            </h2>
          </div>

          {filteredDiaries.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
              <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                {emotionFilter !== "all" ? "해당 감정의 일기가 없습니다" : "아직 작성된 일기가 없습니다"}
              </h3>
              <p className="text-slate-500 mb-6">
                {isJoined ? "첫 번째 일기를 작성해보세요!" : "커뮤니티에 가입해서 일기를 확인해보세요!"}
              </p>
              {isJoined && (
                <Link href="/write">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    일기 작성하기
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredDiaries.map((diary) => (
                <div
                  key={diary.id}
                  className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
                >
                  {/* Diary Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white font-medium">
                          {getUserInfoFromId(diary.userId).charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {getUserInfoFromId(diary.userId)}
                        </p>
                        <div className="flex items-center space-x-2 text-sm text-slate-500">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(diary.createdAt).toLocaleDateString('ko-KR')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="text-2xl mb-1">
                        {getEmotionEmoji(diary.primaryEmotion)}
                      </div>
                      <div className="text-xs text-slate-500 font-medium">
                        {diary.primaryEmotion || '기본'}
                      </div>
                    </div>
                  </div>

                  {/* Diary Content */}
                  <h3 className="font-semibold text-slate-900 mb-2 line-clamp-1">
                    {diary.title || `${getUserInfoFromId(diary.userId)}님의 일기`}
                  </h3>
                  <p className="text-slate-600 mb-4 line-clamp-3">
                    {diary.summary || diary.content || "내용이 없습니다."}
                  </p>

                  {/* Tags */}
                  {diary.tags && typeof diary.tags === 'object' && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {Object.entries(diary.tags).slice(0, 3).map(([key, value]) => (
                        <span key={key} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                          #{key}: {value}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Diary Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center space-x-1 text-slate-500 hover:text-red-500 transition-colors">
                        <Heart className="w-4 h-4" />
                        <span className="text-sm">{diary.likes || 0}</span>
                      </button>
                      <button className="flex items-center space-x-1 text-slate-500 hover:text-blue-500 transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm">{diary.comments || 0}</span>
                      </button>
                    </div>
                    <Link
                      href={`/diary2/${diary.id}`}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span>자세히 보기</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
"use client"

import { useState, useEffect } from "react"
import { Button } from "../components/ui/button"
import { useUser } from "@/lib/context/UserContext"
import {
  X,
  Users,
  Plus,
  Star,
  AlertTriangle,
  Search,
  MessageCircle,
  TrendingUp,
  Clock,
  ChevronRight,
  Sparkles,
  Target,
  Heart,
  MoreHorizontal,
  Crown,
  Activity,
  Calendar,
  LogOut,
  Eye,
  Filter,
  Bell,
  CheckCircle,
  XCircle,
  ArrowRight,
  Zap,
  RefreshCw
} from "lucide-react"
import { Community, CreateCommunityRequest } from "@/types/community"
import { User } from "@/types/user"
import Header from "@/components/Header"
import { communityAPI, authAPI } from "@/lib/api"
import UserInfoCard from "@/components/UserInfoCard"
import { mockCommunities } from "@/mock/community"
import { toast } from "sonner"


const mylink = "https://withudiary.my" //http://localhost:8080
// 클러스터 API 함수
const clusterAPI = {
  // 사용자의 현재 클러스터 조회
  getUserCluster: async (userId) => {
    const response = await fetch(`https://3aqgxi9ol3.execute-api.us-east-1.amazonaws.com/prod/api/community/cluster/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    if (!response.ok) throw new Error(`클러스터 조회 실패: ${response.status}`)
    return response.json()
  },

  // 클러스터별 추천 커뮤니티 조회 (실제 API 사용)
  getClusterCommunities: async (clusterId) => {
    const response = await fetch(`${mylink}/api/communities/${clusterId}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth-token') || ''}`
      }
    })
    if (!response.ok) throw new Error(`클러스터 커뮤니티 조회 실패: ${response.status}`)
    return response.json()
  }
}

// 실제 API 호출 함수들
const communityAPIReal = {
  // 내가 참여한 커뮤니티 목록
  getMyCommunities: async () => {
    const response = await fetch(mylink+'/api/communities/my', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth-token') || ''}`
      }
    })
    if (!response.ok) throw new Error(`API 호출 실패: ${response.status}`)
    return response.json()
  },

  // 커뮤니티 검색
  searchCommunities: async (keyword, emotionTheme = null) => {
    const params = new URLSearchParams()
    if (keyword) params.append('keyword', keyword)
    if (emotionTheme) params.append('emotionTheme', emotionTheme)
    
    const response = await fetch(`${mylink}/api/communities/search?${params}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth-token') || ''}`
      }
    })
    if (!response.ok) throw new Error(`검색 실패: ${response.status}`)
    return response.json()
  },

  // 감정 테마별 커뮤니티 조회
  getCommunitiesByEmotion: async (emotionTheme) => {
    const response = await fetch(`${mylink}/api/communities/emotion/${emotionTheme}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth-token') || ''}`
      }
    })
    if (!response.ok) throw new Error(`감정 테마 조회 실패: ${response.status}`)
    return response.json()
  },

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

// Auth API 추가
const authAPIReal = {
  // 현재 사용자 정보 조회
  getCurrentUser: async () => {
    const response = await fetch(mylink+'/api/auth/me', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth-token') || ''}`
      }
    })
    if (!response.ok) throw new Error(`사용자 정보 조회 실패: ${response.status}`)
    const userData = await response.json()
    
    console.log('🔍 원본 사용자 데이터:', userData)

    const updatedUser = userData
    
    // 사용자 정보 오버라이드
    
    console.log('✅ 수정된 사용자 데이터:', updatedUser)
    return updatedUser
  }
}

export default function SharingRoomsPage() {
  const { user: originalUser, isLoading: isUserLoading, setUser } = useUser()
  const [currentUser, setCurrentUser] = useState(null)
  const [isUserDataLoading, setIsUserDataLoading] = useState(true)
  
  // 사용자 정보 직접 로드
  const loadUserData = async () => {
    try {
      setIsUserDataLoading(true)
      console.log('👤 사용자 정보 로드 중...')
      const userData = await authAPIReal.getCurrentUser()
      setCurrentUser(userData)
      console.log('✅ 사용자 정보 로드 완료:', userData)
    } catch (err) {
      console.error('❌ 사용자 정보 로드 실패:', err)
      // fallback으로 originalUser 사용
      if (originalUser) {
        const fallbackUser = {
          ...originalUser,
          nickname: "최정혁",
          email: "choi.junghyuk.dev@gmail.com"
        }
        setCurrentUser(fallbackUser)
      }
    } finally {
      setIsUserDataLoading(false)
    }
  }
  
  // 컴포넌트 마운트 시 사용자 정보 로드
  useEffect(() => {
    loadUserData()
  }, [])
  
  const [activeTab, setActiveTab] = useState("my-rooms")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEmotionTheme, setSelectedEmotionTheme] = useState("all")
  const [showCreateRoom, setShowCreateRoom] = useState(false)
  const [newRoomName, setNewRoomName] = useState("")
  const [newRoomDescription, setNewRoomDescription] = useState("")
  const [newRoomTags, setNewRoomTags] = useState([])
  const [newRoomCategory, setNewRoomCategory] = useState("lifestyle")
  const [showCommunityAlert, setShowCommunityAlert] = useState(false)
  const [pendingCommunity, setPendingCommunity] = useState(null)
  const [communities, setCommunities] = useState([])
  const [allCommunities, setAllCommunities] = useState([])
  const [searchResults, setSearchResults] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [selectedCommunity, setSelectedCommunity] = useState(null)
  const [communityDiaries, setCommunityDiaries] = useState([])

  // 클러스터 관련 상태
  const [currentCluster, setCurrentCluster] = useState(null)
  const [recommendedCluster, setRecommendedCluster] = useState(null)
  const [clusterCommunities, setClusterCommunities] = useState([])
  const [showClusterMigrationModal, setShowClusterMigrationModal] = useState(false)
  const [isClusterLoading, setIsClusterLoading] = useState(false)
  const [lastClusterCheck, setLastClusterCheck] = useState(null)

  // 감정 테마 옵션
  const emotionThemes = [
    { id: "all", name: "전체", icon: Users, color: "bg-slate-100 text-slate-700" },
    { id: "happy", name: "기쁨", icon: Heart, color: "bg-yellow-100 text-yellow-700" },
    { id: "sad", name: "슬픔", icon: Heart, color: "bg-blue-100 text-blue-700" },
    { id: "angry", name: "분노", icon: Heart, color: "bg-red-100 text-red-700" },
    { id: "anxious", name: "불안", icon: Heart, color: "bg-purple-100 text-purple-700" },
    { id: "excited", name: "신남", icon: Heart, color: "bg-orange-100 text-orange-700" },
    { id: "calm", name: "평온", icon: Heart, color: "bg-green-100 text-green-700" }
  ]

  // 클러스터 정보 조회 (수동 확인만)
  // 🔁 기존 fetchUserCluster 함수의 핵심 리팩터링된 버전만 아래에 정리해드릴게요.

const fetchUserCluster = async () => {
  if (!currentUser?.id) return

  try {
    setIsClusterLoading(true)
    const clusterData = await clusterAPI.getUserCluster(currentUser.id)
    console.log('✅ 클러스터 데이터:', clusterData)

    let newClusterId = null
    let currentDetectedCluster = null

    // 모든 형태의 응답 지원
    if (clusterData.result?.recommendation_details) {
      const details = clusterData.result.recommendation_details
      newClusterId = details.recommended_cluster || details.cluster_id || null
      currentDetectedCluster = details.current_cluster || null
    } else if (clusterData.recommended_cluster) {
      newClusterId = clusterData.recommended_cluster
    } else if (clusterData.result?.recommended_cluster) {
      newClusterId = clusterData.result.recommended_cluster
    } else if (Array.isArray(clusterData.data)) {
      const details = clusterData.data[0]?.result?.recommendation_details
      if (details) {
        newClusterId = details.recommended_cluster
        currentDetectedCluster = details.current_cluster
      }
    }

    if (!newClusterId) {
      toast.error('클러스터 추천 결과가 없습니다.')
      return
    }

    if (!currentCluster && currentDetectedCluster !== null) {
      setCurrentCluster(currentDetectedCluster)
    }

    // 1️⃣ 처음 클러스터가 null이면 추천 클러스터 배정 유도
    if (!currentCluster) {
      setRecommendedCluster(newClusterId)

      try {
        const communityRes = await clusterAPI.getClusterCommunities(newClusterId)
        const c = communityRes.data
        if (c) {
          setClusterCommunities([{
            id: c.id,
            name: c.name,
            description: c.description,
            memberCount: c.members?.length || 0,
            tags: ['추천', '클러스터', '감정공유'],
            isJoined: false,
            createdAt: c.createdAt,
          }])
          setShowClusterMigrationModal(true)
        }
      } catch (err) {
        toast.error('추천 커뮤니티 로딩 실패')
      }
      return
    }

    // 2️⃣ 클러스터가 변경되었는지 확인
    if (currentCluster !== newClusterId) {
      console.log(`🚨 클러스터 변경 감지 ${currentCluster} -> ${newClusterId}`)
      setRecommendedCluster(newClusterId)
      const communityRes = await clusterAPI.getClusterCommunities(newClusterId)
      const c = communityRes.data
      if (c) {
        setClusterCommunities([{
          id: c.id,
          name: c.name,
          description: c.description,
          memberCount: c.members?.length || 0,
          tags: ['추천', '클러스터', '감정공유'],
          isJoined: false,
          createdAt: c.createdAt,
        }])
        setShowClusterMigrationModal(true)
      }
    } else {
      toast.success(`변동 없음! 😊\n(유사 클러스터: ${newClusterId})`, { style: { whiteSpace: 'pre-line' } })
    }

    setLastClusterCheck(new Date())
  } catch (err) {
    console.error('❌ 클러스터 조회 실패:', err)
    toast.error('클러스터 정보를 불러오는데 실패했습니다.')
  } finally {
    setIsClusterLoading(false)
  }
}

  // 클러스터 이적 승인
  const handleClusterMigration = async (approve) => {
    if (!approve) {
      toast(currentCluster === null ? '초기 클러스터 설정을 건너뜁니다.' : '현재 클러스터를 유지합니다.')
      setShowClusterMigrationModal(false)
      setRecommendedCluster(null)
      setClusterCommunities([])
      return
    }
    

    try {
      console.log('🚀 클러스터 이적 시작...')
      
      // 추천 커뮤니티들에 자동 가입
      const joinPromises = clusterCommunities.map(async (community) => {
        try {
          await communityAPIReal.joinCommunity(community.id)
          console.log(`✅ ${community.name} 가입 완료`)
          return { success: true, community }
        } catch (err) {
          console.error(`❌ ${community.name} 가입 실패:`, err)
          return { success: false, community, error: err }
        }
      })

      const results = await Promise.all(joinPromises)
      const successCount = results.filter(r => r.success).length
      
      if (successCount > 0) {
        toast.success(`${successCount}개의 새로운 커뮤니티에 가입했습니다!`)
        
        // 현재 클러스터 업데이트
        setCurrentCluster(recommendedCluster)
        
        // 내 커뮤니티 목록 새로고침
        await fetchMyCommunities()
      } else {
        toast.error('커뮤니티 가입에 실패했습니다.')
      }
      
    } catch (err) {
      console.error('❌ 클러스터 이적 실패:', err)
      toast.error('클러스터 이적 중 오류가 발생했습니다.')
    } finally {
      setShowClusterMigrationModal(false)
      setRecommendedCluster(null)
      setClusterCommunities([])
    }
  }

  // 내가 참여한 커뮤니티 목록 가져오기
  const fetchMyCommunities = async () => {
    try {
      setIsLoading(true)
      console.log('🏠 내가 참여한 커뮤니티 목록 조회 중...')
      const data = await communityAPIReal.getMyCommunities()
      console.log('✅ 내 커뮤니티 데이터:', data)
      setCommunities(data.data || data)
    } catch (err) {
      console.error('❌ 내 커뮤니티 목록 조회 실패:', err)
      setCommunities(mockCommunities.filter(c => c.isJoined))
      toast.error('커뮤니티 목록을 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // 커뮤니티 검색
  const handleSearch = async () => {
    try {
      setIsSearching(true)
      console.log('🔍 커뮤니티 검색 중...', { searchQuery, selectedEmotionTheme })
      
      let results = []
      
      if (selectedEmotionTheme !== "all") {
        // 감정 테마별 조회
        const emotionData = await communityAPIReal.getCommunitiesByEmotion(selectedEmotionTheme)
        results = emotionData.data || emotionData
      } else if (searchQuery.trim()) {
        // 키워드 검색
        const searchData = await communityAPIReal.searchCommunities(searchQuery.trim())
        results = searchData.data || searchData
      } else {
        // 전체 조회 (검색 API로 빈 키워드 전송)
        const searchData = await communityAPIReal.searchCommunities("")
        results = searchData.data || searchData
      }
      
      console.log('✅ 검색 결과:', results)
      setSearchResults(results)
      
    } catch (err) {
      console.error('❌ 검색 실패:', err)
      setSearchResults(mockCommunities.slice(0, 6))
      toast.error('검색에 실패했습니다.')
    } finally {
      setIsSearching(false)
    }
  }

  // 커뮤니티 가입
  const handleJoinCommunity = async (community) => {
    if (!currentUser) return
    
    try {
      console.log('👥 커뮤니티 가입 시도:', community.name)
      await communityAPIReal.joinCommunity(community.id)
      
      toast.success(`"${community.name}" 커뮤니티에 가입했습니다!`)
      
      // 상태 업데이트
      setSearchResults(prev => 
        prev.map(c => c.id === community.id ? { ...c, isJoined: true } : c)
      )
      
      // 내 커뮤니티 목록 새로고침
      await fetchMyCommunities()
      
    } catch (err) {
      console.error('❌ 커뮤니티 가입 실패:', err)
      toast.error('커뮤니티 가입에 실패했습니다.')
    }
  }

  // 커뮤니티 탈퇴
  const handleLeaveCommunity = async (community) => {
    if (!currentUser) return
    
    try {
      console.log('👋 커뮤니티 탈퇴 시도:', community.name)
      await communityAPIReal.leaveCommunity(community.id)
      
      toast.success(`"${community.name}" 커뮤니티에서 탈퇴했습니다.`)
      
      // 내 커뮤니티 목록에서 제거
      setCommunities(prev => prev.filter(c => c.id !== community.id))
      
    } catch (err) {
      console.error('❌ 커뮤니티 탈퇴 실패:', err)
      toast.error('커뮤니티 탈퇴에 실패했습니다.')
    }
  }

  // 커뮤니티 일기 조회
  const handleViewCommunityDiaries = async (community) => {
    try {
      console.log('📚 커뮤니티 일기 조회:', community.name)
      const diariesData = await communityAPIReal.getCommunityDiaries(community.id)
      setCommunityDiaries(diariesData.data || diariesData)
      setSelectedCommunity(community)
      console.log('✅ 커뮤니티 일기:', diariesData)
    } catch (err) {
      console.error('❌ 커뮤니티 일기 조회 실패:', err)
      toast.error('일기를 불러오는데 실패했습니다.')
    }
  }

  // 초기 로드
  useEffect(() => {
    if (currentUser) {
      fetchMyCommunities()
      // 초기 클러스터 조회는 하지 않음 (수동으로만)
    }
  }, [currentUser])

  // 검색 트리거
  useEffect(() => {
    if (activeTab === "search") {
      handleSearch()
    }
  }, [activeTab, selectedEmotionTheme])

  // 검색 디바운싱
  useEffect(() => {
    if (activeTab === "search" && searchQuery.length > 0) {
      const timer = setTimeout(() => {
        handleSearch()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [searchQuery])

  if (isUserDataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500 text-lg">로그인이 필요합니다.</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">나눔방</h1>
              <p className="text-slate-500">비슷한 관심사를 가진 사람들과 소통해보세요</p>
            </div>
            
            {/* 클러스터 정보 및 새로고침 버튼 */}
            <div className="flex items-center space-x-3">
              {currentCluster && (
                <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">클러스터 {currentCluster}</span>
                </div>
              )}
              <Button
                onClick={fetchUserCluster}
                disabled={isClusterLoading}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${isClusterLoading ? 'animate-spin' : ''}`} />
                <span>클러스터 확인 (추천)</span>
              </Button>
            </div>
          </div>
          
          {lastClusterCheck && (
            <p className="text-xs text-slate-400 mt-1">
              마지막 클러스터 확인: {lastClusterCheck.toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* 사용자 정보 카드 */}
        <UserInfoCard user={currentUser} />

        {/* 탭 네비게이션 */}
        <div className="flex space-x-1 bg-white rounded-lg border border-slate-200 p-1 mb-8">
          <button
            onClick={() => setActiveTab("my-rooms")}
            className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
              activeTab === "my-rooms"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <Users className="w-4 h-4 mr-2" />내 나눔방
          </button>
          <button
            onClick={() => setActiveTab("search")}
            className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
              activeTab === "search"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <Search className="w-4 h-4 mr-2" />
            검색 & 탐색
          </button>
        </div>

        {/* 검색 및 필터 */}
        {activeTab === "search" && (
          <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
            <div className="space-y-4">
              {/* 검색 입력 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="커뮤니티 이름이나 키워드로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              
              {/* 감정 테마 필터 */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Filter className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">감정 테마별 필터</span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {emotionThemes.map((theme) => {
                    const Icon = theme.icon
                    return (
                      <button
                        key={theme.id}
                        onClick={() => setSelectedEmotionTheme(theme.id)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                          selectedEmotionTheme === theme.id
                            ? "bg-blue-600 text-white"
                            : `${theme.color} hover:opacity-80`
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{theme.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 컨텐츠 */}
        <div className="space-y-8">
          {/* 내 나눔방 */}
          {activeTab === "my-rooms" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-900">참여 중인 나눔방</h2>
                <span className="text-sm text-slate-500">{communities.length}개 참여 중</span>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : communities.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-lg border border-slate-200">
                  <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">아직 참여한 나눔방이 없어요</h3>
                  <p className="text-slate-500 mb-6">관심사에 맞는 나눔방을 찾아 참여해보세요</p>
                  <Button
                    onClick={() => setActiveTab("search")}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    나눔방 찾아보기
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {communities.map((community) => (
                    <div key={community.id} className="bg-white rounded-lg border border-slate-200 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-slate-900">{community.name}</h3>
                            {community.isOwner && <Crown className="w-4 h-4 text-yellow-500" />}
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                              {community.memberCount || 0}명
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 mb-3">{community.description}</p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {community.tags?.slice(0, 3).map((tag) => (
                              <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                                #{tag}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span className="flex items-center">
                              <Activity className="w-3 h-3 mr-1" />
                              활성 멤버 {community.activeMembers || 0}명
                            </span>
                            <span className="flex items-center">
                              <MessageCircle className="w-3 h-3 mr-1" />
                              오늘 {community.todayPosts || 0}개 글
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          onClick={() => handleViewCommunityDiaries(community)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          일기 보기
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleLeaveCommunity(community)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <LogOut className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 검색 결과 */}
          {activeTab === "search" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-900">
                  {selectedEmotionTheme !== "all" 
                    ? `${emotionThemes.find(t => t.id === selectedEmotionTheme)?.name} 테마 나눔방`
                    : searchQuery 
                      ? `"${searchQuery}" 검색 결과`
                      : "모든 나눔방"
                  }
                </h2>
                <span className="text-sm text-slate-500">
                  {isSearching ? "검색 중..." : `${searchResults.length}개 나눔방`}
                </span>
              </div>

              {isSearching ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchResults.map((community) => (
                    <div key={community.id} className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-medium text-slate-900">{community.name}</h3>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                              {community.memberCount || 0}명
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 mb-3">{community.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {community.tags?.slice(0, 3).map((tag) => (
                          <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                            #{tag}
                          </span>
                        ))}
                        {community.tags && community.tags.length > 3 && (
                          <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                            +{community.tags.length - 3}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {community.createdAt ? new Date(community.createdAt).toLocaleDateString() : '최근'}
                        </span>
                        <span className="flex items-center">
                          <Activity className="w-3 h-3 mr-1" />
                          활발한 활동
                        </span>
                      </div>
                      
                      <Button
                        onClick={() => handleJoinCommunity(community)}
                        disabled={community.isJoined}
                        className={`w-full ${
                          community.isJoined
                            ? "bg-slate-100 text-slate-500 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                      >
                        {community.isJoined ? (
                          <>
                            <Users className="w-4 h-4 mr-2" />
                            참여 중
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            참여하기
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                  
                  {searchResults.length === 0 && !isSearching && (
                    <div className="col-span-full text-center py-12 text-slate-500">
                      {searchQuery || selectedEmotionTheme !== "all" 
                        ? "검색 결과가 없습니다." 
                        : "나눔방이 없습니다."
                      }
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* 클러스터 이적 승인 모달 */}
      {showClusterMigrationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                  <h3 className="text-xl font-semibold text-slate-900">
  {currentCluster === null ? "추천 클러스터 안내" : "새로운 클러스터 발견!"}
</h3>
<p className="text-slate-600">
  {currentCluster === null
    ? "아직 클러스터가 설정되지 않았습니다. 아래 클러스터로 참여해보세요."
    : "당신의 감정 패턴이 변화했습니다"}
</p>

                  </div>
                </div>
                <button
                  onClick={() => setShowClusterMigrationModal(false)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center justify-center space-x-4 mb-6">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                      <Target className="w-8 h-8 text-slate-600" />
                    </div>
                    <p className="text-sm font-medium text-slate-900">현재 클러스터</p>
                    <p className="text-2xl font-bold text-slate-600">{currentCluster || '?'}</p>
                  </div>
                  
                  <ArrowRight className="w-8 h-8 text-slate-400" />
                  
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-2">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-sm font-medium text-slate-900">추천 클러스터</p>
                    <p className="text-2xl font-bold text-blue-600">{recommendedCluster}</p>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <Bell className="w-5 h-5 text-blue-600" />
                    <h4 className="font-medium text-blue-900">
  {currentCluster === null ? "이 클러스터에 참여하시겠습니까?" : "클러스터 이동하시겠습니까?"}
</h4>

                  </div>
                  <p className="text-sm text-blue-800">
                    최근 작성하신 일기들을 분석한 결과, 감정 패턴이 변화하여 더 적합한 커뮤니티 그룹을 찾았습니다. 
                    비슷한 감정을 가진 사용자들과 소통할 수 있는 기회입니다.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-slate-900 mb-4">추천 커뮤니티</h4>
                  <div className="space-y-3">
                    {clusterCommunities.map((community) => (
                      <div key={community.id} className="bg-slate-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-slate-900">{community.name}</h5>
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                            {community.memberCount}명
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{community.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {community.tags?.map((tag) => (
                            <span key={tag} className="px-2 py-1 bg-white text-slate-600 rounded text-xs">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button
                  onClick={() => handleClusterMigration(false)}
                  variant="outline"
                  className="flex-1"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  나중에 하기
                </Button>
                <Button
                  onClick={() => handleClusterMigration(true)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  클러스터 이적하기
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 커뮤니티 일기 모달 */}
      {selectedCommunity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">{selectedCommunity.name}</h3>
                  <p className="text-slate-600">{selectedCommunity.description}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedCommunity(null)
                    setCommunityDiaries([])
                  }}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <h4 className="text-lg font-medium text-slate-900 mb-4">최근 일기들</h4>
              </div>
              
              {communityDiaries.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>아직 작성된 일기가 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {communityDiaries.map((diary) => (
                    <div key={diary.id} className="bg-slate-50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
                          <div>
                            <p className="font-medium text-slate-900">
                              {diary.user?.nickname || `사용자 ${diary.userId}`}
                            </p>
                            <p className="text-xs text-slate-500">
                              {new Date(diary.createdAt).toLocaleDateString('ko-KR')}
                            </p>
                          </div>
                        </div>
                        <span className="text-lg">
                          {diary.primaryEmotion === 'happy' ? '😊' : 
                           diary.primaryEmotion === 'sad' ? '😢' : 
                           diary.primaryEmotion === 'angry' ? '😠' : '😐'}
                        </span>
                      </div>
                      <p className="text-slate-700 mb-2">{diary.summary}</p>
                      <div className="flex items-center space-x-4 text-sm text-slate-500">
                        <span className="flex items-center">
                          <Heart className="w-4 h-4 mr-1" />
                          {diary.likes || 0}
                        </span>
                        <span className="flex items-center">
                          <MessageCircle className="w-4 h-4 mr-1" />
                          {diary.comments || 0}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
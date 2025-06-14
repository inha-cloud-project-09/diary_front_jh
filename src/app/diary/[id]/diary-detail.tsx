"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"

const APIURL = "https://withudiary.my"
const APIURL2 = "https://backend.withudiary.my"

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
  Loader2,
  Search,
  TrendingUp,
  Clock,
  Sparkles
} from "lucide-react"

// 감정을 이모지로 매핑하는 함수
const getEmotionEmoji = (emotion) => {
  const emotionMap = {
    "기쁨": "😊",
    "행복": "😄", 
    "슬픔": "😢",
    "화남": "😠",
    "불안": "😰",
    "평온": "😌",
    "기대": "😊",
    "감사": "🙏",
    "사랑": "❤️",
    "외로움": "😔"
  }
  return emotionMap[emotion] || "😊"
}

// 날짜 포맷팅 함수
const formatDate = (dateString) => {
  const date = new Date(dateString)
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
  return date.toLocaleDateString('ko-KR', options)
}

// 상대적 날짜 포맷팅 함수
const formatRelativeDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return "오늘"
  if (diffInDays === 1) return "어제"
  if (diffInDays < 7) return `${diffInDays}일 전`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}주 전`
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)}개월 전`
  return `${Math.floor(diffInDays / 365)}년 전`
}

// 유사도 점수에 따른 색상 반환
const getSimilarityColor = (similarity) => {
  if (similarity >= 0.8) return "text-green-600 bg-green-50"
  if (similarity >= 0.6) return "text-yellow-600 bg-yellow-50"
  return "text-blue-600 bg-blue-50"
}

export default function Component() {
  const params = useParams()
  const diaryId = params.id
  
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [diaryData, setDiaryData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // 유사 일기 관련 상태
  const [similarDiaries, setSimilarDiaries] = useState([])
  const [similarLoading, setSimilarLoading] = useState(false)
  const [similarError, setSimilarError] = useState(null)
  const [showSimilar, setShowSimilar] = useState(false)

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1)
  }

  // API에서 일기 데이터 가져오기
  const fetchDiaryData = async () => {
    try {
      setLoading(true)
      console.log('조회할 일기 ID:', diaryId)
      const response = await fetch(`${APIURL2}/api/diaries/${diaryId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token') || ''}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      console.log('API 응답:', result)
      
      if (result.success && result.data) {
        const apiData = result.data
        console.log('API 데이터:', apiData)
        
        const transformedData = {
          id: apiData.id,
          title: apiData.summary || "일기",
          author: {
            name: apiData.userName || "익명",
            avatar: "/basic.jpeg?height=40&width=40",
          },
          date: formatDate(apiData.createdAt),
          location: "위치 정보 없음",
          mood: getEmotionEmoji(apiData.primaryEmotion),
          tags: apiData.tags || [],
          bannerImages: apiData.imageUrl ? [apiData.imageUrl, apiData.imageUrl] : ["/basic.jpeg", "/basic2.jpeg?height=400&width=600"],
          content: apiData.content || "",
          additionalImages: apiData.imageUrl ? [apiData.imageUrl] : ["/basic3.jpeg?height=300&width=400", "/basic4.jpeg?height=300&width=400"],
          feedback: apiData.feedback,
          primaryEmotion: apiData.primaryEmotion,
          stats: {
            likes: Math.floor(Math.random() * 50) + 1,
            comments: Math.floor(Math.random() * 10) + 1,
            views: Math.floor(Math.random() * 200) + 50,
          },
        }
        
        console.log('변환된 데이터:', transformedData)
        setDiaryData(transformedData)
        setLikeCount(transformedData.stats.likes)
      } else {
        throw new Error(result.message || "데이터를 가져오는데 실패했습니다.")
      }
    } catch (err) {
      setError(err.message)
      console.error("일기 데이터 조회 실패:", err)
    } finally {
      setLoading(false)
    }
  }

  // 유사 일기 조회 함수
  const fetchSimilarDiaries = async () => {
    try {
      setSimilarLoading(true)
      setSimilarError(null)
      
      const response = await fetch(`${APIURL2}/api/diaries/${diaryId}/similar?limit=5&min_similarity=0.3`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token') || ''}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      console.log('유사 일기 API 응답:', result)
      
      if (result.success && result.data) {
        setSimilarDiaries(result.data.similarDiaries || [])
        setShowSimilar(true)
      } else {
        throw new Error(result.message || "유사 일기를 가져오는데 실패했습니다.")
      }
    } catch (err) {
      setSimilarError(err.message)
      console.error("유사 일기 조회 실패:", err)
    } finally {
      setSimilarLoading(false)
    }
  }

  // 유사 일기 카드 클릭 핸들러
  const handleSimilarDiaryClick = (similarDiaryId) => {
    window.location.href = `/diary/${similarDiaryId}`
  }

  useEffect(() => {
    if (diaryId) {
      fetchDiaryData()
    }
  }, [diaryId])

  if (loading || !diaryId) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-slate-600">일기를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="max-w-md p-6 bg-white rounded-lg shadow-sm border border-red-200">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-2">⚠️</div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">오류가 발생했습니다</h3>
            <p className="text-slate-600 mb-4">{error}</p>
            <Button onClick={fetchDiaryData} className="bg-blue-600 hover:bg-blue-700">
              다시 시도
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!diaryData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">일기를 찾을 수 없습니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <img
                    src={diaryData.author.avatar || "/placeholder.svg"}
                    alt={diaryData.author.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-medium text-slate-900">{diaryData.author.name}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-purple-600 border-purple-200 hover:bg-purple-50"
                onClick={fetchSimilarDiaries}
                disabled={similarLoading}
              >
                {similarLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    검색중...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    유사 일기
                  </>
                )}
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <Share2 className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Banner Images */}
      <div className="relative">
      <div className="relative w-screen h-[400px] overflow-hidden">
  <img
    src={diaryData.bannerImages[0] || "/placeholder.svg"}
    alt="배너 이미지"
    className="w-full h-full object-cover scale-110"
  />
  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
</div>


        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

        <div className="absolute bottom-4 right-4 flex space-x-2">
          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors ${
              isBookmarked ? "bg-yellow-500 text-white" : "bg-white/80 text-slate-700 hover:bg-white"
            }`}
          >
            <Bookmark className="w-5 h-5" fill={isBookmarked ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Article Header */}
          <div className="p-6 sm:p-8 border-b border-slate-200">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">{diaryData.title}</h1>

            {/* Meta Information */}
            <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{diaryData.date}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>{diaryData.location}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg">{diaryData.mood}</span>
                <span>{diaryData.primaryEmotion}</span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {diaryData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Article Content */}
          <div className="p-6 sm:p-8">
            <div className="prose prose-slate max-w-none">
              {diaryData.content.split("\n").map((paragraph, index) => (
                <p key={index} className="mb-4 leading-relaxed text-slate-700">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* AI Feedback */}
            {diaryData.feedback && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">💡 AI 피드백</h4>
                <p className="text-blue-800 text-sm">{diaryData.feedback}</p>
              </div>
            )}

            {/* Additional Images */}
            {diaryData.additionalImages.length > 0 && (
              <div className="mt-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {diaryData.additionalImages.map((image, index) => (
                    <div key={index} className="relative group overflow-hidden rounded-lg">
                      <img
                        src={image || "/basic.jpeg"}
                        alt={`추가 이미지 ${index + 1}`}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Interaction Bar */}
          <div className="px-6 sm:px-8 py-4 border-t border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-2 transition-colors ${
                    isLiked ? "text-red-500" : "text-slate-600 hover:text-red-500"
                  }`}
                >
                  <Heart className="w-5 h-5" fill={isLiked ? "currentColor" : "none"} />
                  <span className="font-medium">{likeCount}</span>
                </button>
                <button className="flex items-center space-x-2 text-slate-600 hover:text-blue-500 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-medium">{diaryData.stats.comments}</span>
                </button>
                <div className="flex items-center space-x-2 text-slate-500">
                  <User className="w-4 h-4" />
                  <span className="text-sm">{diaryData.stats.views} views</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </article>

        {/* Similar Diaries Section */}
        <section className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Sparkles className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-slate-900">
                비슷한 감정의 일기들
              </h3>
              {showSimilar && (
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                  {similarDiaries.length}개 발견
                </span>
              )}
            </div>
            {!showSimilar && (
              <Button 
                onClick={fetchSimilarDiaries}
                disabled={similarLoading}
                size="md"
                className="bg-purple-600 hover:bg-purple-700"
              >
                {similarLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    검색중...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    유사 일기 찾기
                  </>
                )}
              </Button>
            )}
          </div>

          {similarError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">⚠️ {similarError}</p>
              <Button 
                onClick={fetchSimilarDiaries}
                size="sm"
                className="mt-2 bg-red-600 hover:bg-red-700"
              >
                다시 시도
              </Button>
            </div>
          )}

          {!showSimilar && !similarLoading && !similarError && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-purple-400" />
              </div>
              <p className="text-slate-600 mb-2">이 일기와 비슷한 감정의 일기들을 찾아보세요</p>
              <p className="text-slate-500 text-sm mb-4">감정 패턴과 상황을 분석하여 관련 일기들을 추천해드려요</p>
              <Button 
                onClick={fetchSimilarDiaries}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Search className="w-4 h-4 mr-2" />
                유사 일기 찾기
              </Button>
            </div>
          )}

          {similarLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center space-y-3">
                <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                <p className="text-slate-600 text-sm">비슷한 일기를 찾고 있어요...</p>
              </div>
            </div>
          )}

          {showSimilar && similarDiaries.length > 0 && (
            <div className="space-y-4">
              {similarDiaries.map((diary, index) => (
                <div 
                  key={diary.id}
                  className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer hover:border-purple-300"
                  onClick={() => handleSimilarDiaryClick(diary.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-lg">{getEmotionEmoji(diary.primaryEmotion)}</span>
                        <h4 className="font-medium text-slate-900 line-clamp-1">
                          {diary.summary || "일기"}
                        </h4>
                        <div className="flex items-center space-x-2 text-xs text-slate-500">
                          <Clock className="w-3 h-3" />
                          <span>{formatRelativeDate(diary.createdAt)}</span>
                        </div>
                      </div>
                      
                      <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                        {diary.content}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {diary.tags.slice(0, 3).map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="inline-flex items-center px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                          {diary.tags.length > 3 && (
                            <span className="text-xs text-slate-500">
                              +{diary.tags.length - 3}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="w-4 h-4 text-purple-500" />
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSimilarityColor(diary.combinedSimilarity)}`}>
                            {Math.round(diary.combinedSimilarity * 100)}% 유사
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-2 text-xs text-slate-500">
                        감정 유사도: {Math.round(diary.emotionSimilarity * 100)}% | 
                        태그 유사도: {Math.round(diary.tagSimilarity * 100)}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showSimilar && similarDiaries.length === 0 && !similarLoading && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-600 mb-2">비슷한 일기를 찾지 못했어요</p>
              <p className="text-slate-500 text-sm">다른 키워드나 감정으로 작성된 일기가 더 생기면 추천해드릴게요!</p>
            </div>
          )}
        </section>

        {/* Comments Section */}
        <section className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">댓글 {diaryData.stats.comments}개</h3>

          {/* Comment Input */}
          <div className="mb-6">
            <div className="flex space-x-3">
              <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-slate-600" />
              </div>
              <div className="flex-1">
                <textarea
                  placeholder="댓글을 작성해보세요..."
                  className="w-full p-3 border border-slate-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  rows={3}
                />
                <div className="flex justify-end mt-2">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                    댓글 작성
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Sample Comments */}
          <div className="space-y-4">
            <div className="flex space-x-3">
              <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-slate-600" />
              </div>
              <div className="flex-1">
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-slate-900">김민수</span>
                    <span className="text-xs text-slate-500">2시간 전</span>
                  </div>
                  <p className="text-slate-700">
                    정말 의미깊은 하루를 보내신 것 같네요! 새해 첫날의 감정들이 잘 표현되어 있어요 ✨
                  </p>
                </div>
                <div className="flex items-center space-x-4 mt-2 text-sm text-slate-500">
                  <button className="hover:text-red-500 transition-colors">좋아요</button>
                  <button className="hover:text-blue-500 transition-colors">답글</button>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-slate-600" />
              </div>
              <div className="flex-1">
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-slate-900">이지은</span>
                    <span className="text-xs text-slate-500">1시간 전</span>
                  </div>
                  <p className="text-slate-700">새해 계획 세우실 때 작은 것부터 시작하시는 게 좋다는 피드백이 정말 도움이 될 것 같아요! 🎯</p>
                </div>
                <div className="flex items-center space-x-4 mt-2 text-sm text-slate-500">
                  <button className="hover:text-red-500 transition-colors">좋아요</button>
                  <button className="hover:text-blue-500 transition-colors">답글</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
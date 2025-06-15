
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import Header from "@/components/Header"
import { Calendar, TrendingUp, Heart, Lightbulb, RefreshCw, Filter, ChevronDown, ChevronUp } from "lucide-react"

const API_BASE = "https://backend.withudiary.my"

// 타입 정의localhost
interface EmotionTimelinePoint {
  date: string
  primary_emotion: string
  emotion_scores: Record<string, number>
  content_summary: string
  diary_id: number
}

interface RecoverySegment {
  start_date: string
  end_date: string
  start_emotion: string
  end_emotion: string
  duration_days: number
  diary_ids: number[]
}

interface RecoveryData {
  timeline: EmotionTimelinePoint[]
  recovery_segments: RecoverySegment[]
  insights: string[]
  effective_strategies: string[]
  recovery_triggers: string[]
  summary: string
  total_recovery_instances: number
  average_recovery_days: number
}

interface RecoveryInsights {
  total_recovery_instances: number
  average_recovery_time: number
  fastest_recovery: number
  common_patterns: string[]
  recommendations: string[]
  emotion_type?: string
  message?: string
  suggestions?: string[]
}

interface ChartDataPoint {
  date: string
  fullDate: string
  emotion: string
  score: number
  summary: string
}

const RecoveryRouteFrontend: React.FC = () => {
  const [recoveryData, setRecoveryData] = useState<RecoveryData | null>(null)
  const [insights, setInsights] = useState<RecoveryInsights | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedDays, setSelectedDays] = useState<number>(30)
  const [selectedEmotion, setSelectedEmotion] = useState<string>("")
  const [expandedSegment, setExpandedSegment] = useState<number | null>(null)
  const [userId] = useState<number>(2) // 실제로는 로그인된 사용자 ID

  // API 호출 함수들
  const fetchRecoveryRoute = async (days = 30): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE}/api/recovery/recovery-route/${userId}?days=${days}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data: RecoveryData = await response.json()
      console.log(data)
      setRecoveryData(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
      setError(`회복 루트 분석을 가져오는데 실패했습니다: ${errorMessage}`)
      console.error("Recovery route fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecoveryInsights = async (emotionType = ""): Promise<void> => {
    try {
      const url = emotionType
        ? `${API_BASE}/api/recovery/recovery-insights/${userId}?emotion_type=${encodeURIComponent(emotionType)}`
        : `${API_BASE}/api/recovery/recovery-insights/${userId}`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data: RecoveryInsights = await response.json()
      setInsights(data)
    } catch (err) {
      console.error("Recovery insights fetch error:", err)
    }
  }

  // 초기 데이터 로드
  useEffect(() => {
    fetchRecoveryRoute(selectedDays)
    fetchRecoveryInsights()
  }, [])

  // 기간 변경 핸들러
  const handleDaysChange = (days: number): void => {
    setSelectedDays(days)
    fetchRecoveryRoute(days)
  }

  // 감정별 인사이트 조회
  const handleEmotionFilter = (emotion: string): void => {
    setSelectedEmotion(emotion)
    fetchRecoveryInsights(emotion)
  }

  // 새로고침
  const handleRefresh = (): void => {
    fetchRecoveryRoute(selectedDays)
    fetchRecoveryInsights(selectedEmotion)
  }

  // 감정별 색상 반환
  const getEmotionColor = (emotion: string): string => {
    const colors: Record<string, string> = {
      우울: "#1f2937",
      무기력: "#374151",
      불안: "#dc2626",
      스트레스: "#ea580c",
      피로: "#d97706",
      걱정: "#ca8a04",
      평온: "#059669",
      만족: "#0891b2",
      기쁨: "#7c3aed",
      희망: "#c026d3",
      활력: "#e11d48",
      행복: "#10b981",
      슬픔: "#64748b",
      지루함: "#9ca3af",
      실망: "#6b7280",
      설렘: "#f97316",
      분노: "#ef4444",
      외로움: "#475569",
      기대: "#3b82f6",
    }
    return colors[emotion] || "#6b7280"
  }

  // 감정 점수 변환 (차트용)
  const convertToScore = (emotion: string): number => {
    const negativeEmotions = ["우울", "무기력", "불안", "스트레스", "피로", "걱정", "슬픔", "지루함", "실망", "분노", "외로움"]
    const positiveEmotions = ["평온", "만족", "기쁨", "희망", "활력", "행복", "설렘", "기대"]

    if (negativeEmotions.includes(emotion)) {
      return negativeEmotions.indexOf(emotion) * -1 - 1 // -1 to -11
    } else if (positiveEmotions.includes(emotion)) {
      return positiveEmotions.indexOf(emotion) + 1 // 1 to 8
    }
    return 0
  }

  // 차트 데이터 변환
  const chartData: ChartDataPoint[] =
    recoveryData?.timeline?.map((point: EmotionTimelinePoint) => ({
      date: new Date(point.date).toLocaleDateString("ko-KR", { month: "short", day: "numeric" }),
      fullDate: point.date,
      emotion: point.primary_emotion,
      score: convertToScore(point.primary_emotion),
      summary: point.content_summary,
    })) || []

  if (loading && !recoveryData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-slate-600 text-lg font-medium">회복 루트를 분석하고 있습니다...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-sm border border-red-100">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">분석 오류</h3>
            <p className="text-slate-600 mb-6">{error}</p>
            <button
              onClick={handleRefresh}
              className="w-full bg-slate-900 text-white py-3 px-4 rounded-xl hover:bg-slate-800 transition-colors font-medium"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!recoveryData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-sm border border-amber-100">
          <div className="text-center">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">데이터 부족</h3>
            <p className="text-slate-600">회복 루트 분석을 위해서는 더 많은 일기 데이터가 필요합니다.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
       <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">회복 루트 분석</h1>
                <p className="text-slate-600 mt-1">감정 변화의 흐름을 추적하고 나만의 회복 패턴을 발견해보세요</p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 text-slate-600 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* 컨트롤 바 */}
        <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm border border-slate-200">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">분석 기간</span>
              <div className="flex gap-2">
                {[7, 14, 30, 60, 90].map((days) => (
                  <button
                    key={days}
                    onClick={() => handleDaysChange(days)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedDays === days
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {days}일
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">감정 필터</span>
              <select
                value={selectedEmotion}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleEmotionFilter(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              >
                <option value="">전체</option>
                <option value="우울">우울</option>
                <option value="불안">불안</option>
                <option value="스트레스">스트레스</option>
                <option value="기쁨">기쁨</option>
                <option value="만족">만족</option>
                <option value="평온">평온</option>
              </select>
            </div>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                <Heart className="w-5 h-5 text-red-500" />
              </div>
              <span className="text-2xl font-bold text-slate-900">{recoveryData?.total_recovery_instances || 0}</span>
            </div>
            <h3 className="font-semibold text-slate-900">회복 횟수</h3>
            <p className="text-sm text-slate-500 mt-1">총 회복한 횟수</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-2xl font-bold text-slate-900">
                {recoveryData?.average_recovery_days?.toFixed(1) || 0}
              </span>
            </div>
            <h3 className="font-semibold text-slate-900">평균 회복 기간</h3>
            <p className="text-sm text-slate-500 mt-1">일 단위</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-2xl font-bold text-slate-900">
                {recoveryData?.recovery_segments
                  ? Math.min(...recoveryData.recovery_segments.map((s: RecoverySegment) => s.duration_days))
                  : 0}
              </span>
            </div>
            <h3 className="font-semibold text-slate-900">최단 회복</h3>
            <p className="text-sm text-slate-500 mt-1">일 단위</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-amber-500" />
              </div>
              <span className="text-2xl font-bold text-slate-900">{recoveryData?.timeline?.length || 0}</span>
            </div>
            <h3 className="font-semibold text-slate-900">분석 일기</h3>
            <p className="text-sm text-slate-500 mt-1">개</p>
          </div>
        </div>

        {/* 감정 타임라인 차트 */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">감정 변화 타임라인</h2>
          {chartData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    axisLine={{ stroke: "#e2e8f0" }}
                    tickLine={{ stroke: "#e2e8f0" }}
                  />
                  <YAxis
                    domain={[-11, 8]}
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    axisLine={{ stroke: "#e2e8f0" }}
                    tickLine={{ stroke: "#e2e8f0" }}
                  />
                  <Tooltip
                    content={({ active, payload, label }: any) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-200 max-w-xs">
                            <p className="font-semibold text-slate-900 mb-2">{label}</p>
                            <div className="flex items-center gap-2 mb-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: getEmotionColor(data.emotion) }}
                              ></div>
                              <span className="font-medium text-slate-700">{data.emotion}</span>
                            </div>
                            <p className="text-sm text-slate-600">{data.summary}</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#0f172a"
                    strokeWidth={2}
                    dot={{ fill: "#0f172a", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: "#0f172a", strokeWidth: 2 }}
                  />
                  <ReferenceLine y={0} stroke="#cbd5e1" strokeDasharray="2 2" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-slate-400" />
              </div>
              <p>차트를 표시할 데이터가 부족합니다.</p>
            </div>
          )}
        </div>

        {/* 회복 구간 상세 */}
        {recoveryData?.recovery_segments && recoveryData.recovery_segments.length > 0 && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">회복 과정 상세 분석</h2>
            <div className="space-y-4">
              {recoveryData.recovery_segments.map((segment: RecoverySegment, index: number) => (
                <div key={index} className="border border-slate-200 rounded-xl overflow-hidden">
                  <div
                    className="p-6 cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => setExpandedSegment(expandedSegment === index ? null : index)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-sm font-semibold text-slate-700">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">회복 과정 {index + 1}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: getEmotionColor(segment.start_emotion) }}
                              ></div>
                              <span className="text-sm text-slate-600">{segment.start_emotion}</span>
                            </div>
                            <span className="text-slate-400">→</span>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: getEmotionColor(segment.end_emotion) }}
                              ></div>
                              <span className="text-sm text-slate-600">{segment.end_emotion}</span>
                            </div>
                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                              {segment.duration_days}일
                            </span>
                          </div>
                        </div>
                      </div>
                      {expandedSegment === index ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {expandedSegment === index && (
                    <div className="px-6 pb-6 border-t border-slate-100">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-3">기간 정보</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-500">시작일</span>
                              <span className="text-slate-900">
                                {new Date(segment.start_date).toLocaleDateString("ko-KR")}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">종료일</span>
                              <span className="text-slate-900">
                                {new Date(segment.end_date).toLocaleDateString("ko-KR")}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">소요 기간</span>
                              <span className="text-slate-900">{segment.duration_days}일</span>
                            </div>
                          </div>
                        </div>
                        <div className="lg:col-span-2">
                          <h4 className="font-semibold text-slate-900 mb-3">
                            관련 일기 ({segment.diary_ids?.length || 0}개)
                          </h4>
                          <div className="space-y-3 max-h-64 overflow-y-auto">
                            {segment.diary_ids?.map((diaryId: number) => {
                              const diary = recoveryData.timeline.find(
                                (point: EmotionTimelinePoint) => point.diary_id === diaryId
                              )
                              if (!diary) return null

                              return (
                                <a
                                  key={diaryId}
                                  href={`/diary2/${diaryId}`}
                                  className="block p-4 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors group"
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-2">
                                        <div
                                          className="w-3 h-3 rounded-full flex-shrink-0"
                                          style={{ backgroundColor: getEmotionColor(diary.primary_emotion) }}
                                        ></div>
                                        <span className="text-sm font-medium text-slate-900">
                                          {diary.primary_emotion}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                          {new Date(diary.date).toLocaleDateString("ko-KR", {
                                            month: "short",
                                            day: "numeric"
                                          })}
                                        </span>
                                      </div>
                                      <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                                        {diary.content_summary}
                                      </p>
                                    </div>
                                    <div className="text-slate-400 group-hover:text-slate-600 transition-colors">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                      </svg>
                                    </div>
                                  </div>
                                </a>
                              )
                            })}
                          </div>
                          {segment.diary_ids && segment.diary_ids.length === 0 && (
                            <p className="text-sm text-slate-500 italic">관련 일기가 없습니다.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 회복 인사이트 */}
        {recoveryData?.insights && recoveryData.insights.length > 0 && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-amber-500" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">나만의 회복 인사이트</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recoveryData.insights.map((insight: string, index: number) => (
                <div key={index} className="p-6 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-slate-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-slate-700 leading-relaxed">{insight}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 효과적인 전략들 */}
        {recoveryData?.effective_strategies && recoveryData.effective_strategies.length > 0 && (
          <div className="bg-slate-900 rounded-2xl p-8 text-white mb-8">
            <h2 className="text-xl font-semibold mb-2">나만의 회복 레시피</h2>
            <p className="text-slate-300 mb-6">
              당신의 회복 패턴을 분석한 결과, 다음과 같은 방법들이 가장 효과적이었습니다
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recoveryData.effective_strategies.slice(0, 3).map((strategy: string, index: number) => (
                <div key={index} className="p-6 bg-white/10 rounded-xl border border-white/10">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-sm font-semibold">{index + 1}</span>
                  </div>
                  <h3 className="font-semibold mb-2">{strategy}</h3>
                  <p className="text-sm text-slate-300">효과적인 회복 전략으로 확인되었습니다</p>
                </div>
              ))}
            </div>

            {recoveryData.summary && (
              <div className="mt-8 p-6 bg-white/10 rounded-xl border border-white/10">
                <h3 className="font-semibold mb-3">분석 요약</h3>
                {(() => {
                  try {
                    // 마크다운 코드블록에서 JSON 추출
                    let jsonString = recoveryData.summary
                    
                    // ```json 또는 ```으로 감싸진 경우 제거
                    jsonString = jsonString.replace(/```json\s*/, '').replace(/```\s*$/, '')
                    
                    // 남은 JSON 부분만 추출
                    const jsonMatch = jsonString.match(/\{[\s\S]*\}/)
                    if (jsonMatch) {
                      const parsed = JSON.parse(jsonMatch[0])
                      if (parsed.insights && Array.isArray(parsed.insights)) {
                        return (
                          <div className="space-y-4">
                            <h4 className="font-medium text-white/90 text-sm">핵심 분석 내용</h4>
                            <div className="space-y-3">
                              {parsed.insights.map((insight: string, index: number) => (
                                <div key={index} className="flex items-start gap-3">
                                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                                    <span className="text-xs font-semibold text-white">{index + 1}</span>
                                  </div>
                                  <p className="text-slate-300 leading-relaxed text-sm">{insight}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      }
                    }
                    
                    // JSON 파싱에 실패하면 원본 텍스트를 정리해서 표시
                    const cleanText = recoveryData.summary
                      .replace(/```json\s*/, '')
                      .replace(/```\s*$/, '')
                    
                    return <p className="text-slate-300 leading-relaxed">{cleanText}</p>
                  } catch (error) {
                    console.log('Summary 파싱 에러:', error)
                    // 에러가 발생하면 원본 텍스트 표시
                    return <p className="text-slate-300 leading-relaxed">{recoveryData.summary}</p>
                  }
                })()}
              </div>
            )}
          </div>
        )}

        {/* 개별 감정 인사이트 */}
        {insights && insights.total_recovery_instances > 0 && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">
              {selectedEmotion ? `${selectedEmotion} 감정` : "전체"} 회복 통계
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-6 bg-blue-50 rounded-xl">
                <div className="text-3xl font-bold text-blue-600 mb-2">{insights.total_recovery_instances}</div>
                <h3 className="font-semibold text-slate-900">총 회복 횟수</h3>
                <p className="text-sm text-slate-500 mt-1">회</p>
              </div>
              <div className="text-center p-6 bg-green-50 rounded-xl">
                <div className="text-3xl font-bold text-green-600 mb-2">{insights.average_recovery_time}</div>
                <h3 className="font-semibold text-slate-900">평균 회복 시간</h3>
                <p className="text-sm text-slate-500 mt-1">일</p>
              </div>
              <div className="text-center p-6 bg-amber-50 rounded-xl">
                <div className="text-3xl font-bold text-amber-600 mb-2">{insights.fastest_recovery}</div>
                <h3 className="font-semibold text-slate-900">최단 회복</h3>
                <p className="text-sm text-slate-500 mt-1">일</p>
              </div>
            </div>

            {insights.recommendations && (
              <div>
                <h3 className="font-semibold text-slate-900 mb-4">개인화된 추천</h3>
                <div className="space-y-3">
                  {insights.recommendations.map((rec: string, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                      <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-semibold text-slate-600">{index + 1}</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default RecoveryRouteFrontend
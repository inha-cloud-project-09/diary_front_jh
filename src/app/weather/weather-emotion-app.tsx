"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  Wind,
  Droplets,
  Zap,
  Smile,
  Frown,
  Meh,
  AlertTriangle,
  Info,
  Brain,
  BedDouble,
  BarChartHorizontalBig,
} from "lucide-react"
import Header from "@/components/Header"

// Types
interface WeatherData {
  temperature: number
  humidity: number
  wind_speed: number
  sky_condition: number // 1: 맑음, 3: 구름많음, 4: 흐림
  precipitation_type: number // 0: 없음, 1: 비, 2: 비/눈, 3: 눈
}

interface EmotionData {
  [emotion: string]: number
}

interface CityResponse {
  cities: string[]
  total_count: number
}

interface WeatherResponse {
  success: boolean
  weather_data: WeatherData
  emotion_prediction: EmotionData
  message: string
}

const API_BASE = "https://backend.withudiary.my/api"

const WeatherEmotionApp: React.FC = () => {
  const [cities, setCities] = useState<string[]>([])
  const [selectedCity, setSelectedCity] = useState<string>("서울")
  const [sleepHours, setSleepHours] = useState<number>(8)
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [emotionData, setEmotionData] = useState<EmotionData | null>(null)
  const [loading, setLoading] = useState({
    cities: false,
    weather: false,
    emotion: false,
  })
  const [error, setError] = useState<string>("")
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    loadCities()
  }, [])

  useEffect(() => {
    if (selectedCity && isMounted) {
      loadWeatherData(selectedCity)
    }
  }, [selectedCity, isMounted])

  const loadCities = async () => {
    setLoading((prev) => ({ ...prev, cities: true }))
    try {
      const response = await fetch(`${API_BASE}/emotion/cities`)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data: CityResponse = await response.json()
      setCities(data.cities)
      if (data.cities.length > 0 && !data.cities.includes(selectedCity)) {
        setSelectedCity(data.cities[0])
      }
    } catch (err) {
      console.error("Error loading cities:", err)
      setError("도시 목록을 불러오는 데 실패했습니다. 네트워크 연결을 확인해주세요.")
    } finally {
      setLoading((prev) => ({ ...prev, cities: false }))
    }
  }

  const loadWeatherData = async (city: string) => {
    setLoading((prev) => ({ ...prev, weather: true, emotion: false })) // Reset emotion loading
    setWeatherData(null) // Clear previous weather data
    setEmotionData(null) // Clear previous emotion data
    setError("")
    try {
      const response = await fetch(`${API_BASE}/emotion/weather/${city}`)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data: WeatherResponse = await response.json()

      if (data.success) {
        setWeatherData(data.weather_data)
        // Automatically set emotion data if available from weather call
        if (data.emotion_prediction) {
          setEmotionData(data.emotion_prediction)
        }
      } else {
        setError(data.message || "날씨 데이터를 불러올 수 없습니다.")
      }
    } catch (err) {
      console.error("Error loading weather data:", err)
      setError("날씨 데이터를 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.")
    } finally {
      setLoading((prev) => ({ ...prev, weather: false }))
    }
  }

  const analyzeEmotion = async () => {
    if (!selectedCity || !weatherData) {
      setError("먼저 도시를 선택하고 날씨 정보를 로드해주세요.")
      return
    }

    setLoading((prev) => ({ ...prev, emotion: true }))
    setError("")
    try {
      // Assuming the same endpoint provides emotion prediction based on current weather + sleep
      // If it's a different endpoint or needs sleepHours in payload, adjust here.
      // For now, re-using the weather endpoint as per original logic.
      const response = await fetch(`${API_BASE}/emotion/weather/${selectedCity}?sleep_hours=${sleepHours}`)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data: WeatherResponse = await response.json()

      if (data.success && data.emotion_prediction) {
        setEmotionData(data.emotion_prediction)
      } else {
        setError(data.message || "감정 분석에 실패했습니다.")
        setEmotionData(null)
      }
    } catch (err) {
      console.error("Error analyzing emotion:", err)
      setError("감정 분석 중 오류가 발생했습니다.")
      setEmotionData(null)
    } finally {
      setLoading((prev) => ({ ...prev, emotion: false }))
    }
  }

  const getWeatherIcon = (sky: number, precip: number) => {
    if (precip === 1) return <CloudRain className="w-12 h-12 text-blue-400 animate-pulse" />
    if (precip === 2) return <CloudSnow className="w-12 h-12 text-blue-300 animate-pulse" />
    if (precip === 3) return <CloudSnow className="w-12 h-12 text-white animate-pulse" />
    if (sky === 1) return <Sun className="w-12 h-12 text-yellow-400 animate-spin-slow" />
    if (sky === 3) return <Cloud className="w-12 h-12 text-gray-400 animate-bounce-slow" />
    if (sky === 4) return <Cloud className="w-12 h-12 text-gray-500" />
    return <Meh className="w-12 h-12 text-gray-400" />
  }

  const getSkyConditionText = (condition: number): string => {
    const conditions: { [key: number]: string } = { 1: "맑음", 3: "구름많음", 4: "흐림" }
    return conditions[condition] || "정보없음"
  }

  const getPrecipitationText = (precipType: number): string => {
    const types: { [key: number]: string } = { 0: "없음", 1: "비", 2: "비/눈", 3: "눈" }
    return types[precipType] || "정보없음"
  }

  const getSleepStatus = (hours: number) => {
    if (hours >= 7 && hours <= 9) {
      return {
        status: "good",
        text: "충분한 수면",
        color: "text-emerald-500 bg-emerald-50 border-emerald-200",
        icon: <Smile className="w-6 h-6 text-emerald-500" />,
      }
    } else if ((hours >= 6 && hours < 7) || (hours > 9 && hours <= 10)) {
      return {
        status: "ok",
        text: "보통 수면",
        color: "text-amber-500 bg-amber-50 border-amber-200",
        icon: <Meh className="w-6 h-6 text-amber-500" />,
      }
    } else {
      return {
        status: "bad",
        text: "부족한 수면",
        color: "text-red-500 bg-red-50 border-red-200",
        icon: <Frown className="w-6 h-6 text-red-500" />,
      }
    }
  }

  const getEmotionColor = (emotion: string): string => {
    const colors: { [key: string]: string } = {
      기쁨: "bg-yellow-400",
      만족: "bg-emerald-400",
      설렘: "bg-pink-400",
      슬픔: "bg-sky-400",
      불안: "bg-rose-500",
      외로움: "bg-purple-400",
      분노: "bg-red-600",
      지루함: "bg-slate-400",
      실망: "bg-orange-400",
      무기력: "bg-gray-500",
    }
    return colors[emotion] || "bg-gray-400"
  }

  const getEmotionEmoji = (emotion: string): string => {
    const emojis: { [key: string]: string } = {
      기쁨: "🥳",
      만족: "😌",
      설렘: "💖",
      슬픔: "😢",
      불안: "😟",
      외로움: "😔",
      분노: "😠",
      지루함: "😑",
      실망: "😞",
      무기력: "😵‍💫",
    }
    return emojis[emotion] || "🤔"
  }

  const adjustEmotionWithSleep = (emotions: EmotionData, sleepHours: number): EmotionData => {
    const adjusted = { ...emotions }
    if (sleepHours < 6) {
      if (adjusted["무기력"]) adjusted["무기력"] = Math.min(1, adjusted["무기력"] * 1.3)
      if (adjusted["불안"]) adjusted["불안"] = Math.min(1, adjusted["불안"] * 1.2)
      if (adjusted["기쁨"]) adjusted["기쁨"] *= 0.7
    } else if (sleepHours >= 7 && sleepHours <= 9) {
      if (adjusted["기쁨"]) adjusted["기쁨"] = Math.min(1, adjusted["기쁨"] * 1.2)
      if (adjusted["만족"]) adjusted["만족"] = Math.min(1, adjusted["만족"] * 1.1)
      if (adjusted["무기력"]) adjusted["무기력"] *= 0.8
    }
    return adjusted
  }

  const sleepStatus = getSleepStatus(sleepHours)
  const finalEmotions = emotionData ? adjustEmotionWithSleep(emotionData, sleepHours) : null
  const sortedEmotions = finalEmotions ? Object.entries(finalEmotions).sort((a, b) => b[1] - a[1]) : []

  const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div
      className={`bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 p-6 sm:p-8 hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 ${className}`}
    >
      {children}
    </div>
  )

  const CardTitle: React.FC<{ children: React.ReactNode; icon: React.ReactNode; iconBgColor?: string }> = ({
    children,
    icon,
    iconBgColor = "bg-sky-100",
  }) => (
    <div className="flex items-center mb-6 pb-4 border-b border-gray-200/70">
      <div className={`w-12 h-12 ${iconBgColor} rounded-xl flex items-center justify-center mr-4 shadow-sm`}>
        {icon}
      </div>
      <h2 className="text-2xl font-bold text-gray-800">{children}</h2>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-indigo-50 to-purple-100 text-gray-700 font-sans selection:bg-purple-500 selection:text-white">
      <Header />
      <div className="container mx-auto px-4 py-10 sm:py-16 max-w-7xl">
        <header className="text-center mb-12 sm:mb-16 animate-fade-in-down">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4 pb-2">
            오늘의 감정 날씨
          </h1>
          <p className="text-lg sm:text-xl text-gray-600">날씨와 수면 패턴으로 예측하는 당신의 하루 감정 지도</p>
        </header>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700 shadow-md flex items-center animate-shake">
            <AlertTriangle className="w-6 h-6 mr-3 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8 mb-10">
          {/* Weather Card */}
          <Card className="lg:col-span-1 animate-slide-in-left">
            <CardTitle icon={<Sun className="w-7 h-7 text-yellow-500" />} iconBgColor="bg-yellow-100">
              실시간 날씨
            </CardTitle>
            <div className="mb-6">
              <label htmlFor="city-select" className="block text-sm font-semibold text-gray-600 mb-2">
                도시 선택
              </label>
              <select
                id="city-select"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all shadow-sm appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 0.75rem center",
                  backgroundSize: "1.25em 1.25em",
                  paddingRight: "2.5rem",
                }}
                disabled={loading.cities || loading.weather}
              >
                {loading.cities ? (
                  <option>로딩중...</option>
                ) : (
                  cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))
                )}
              </select>
            </div>

            {loading.weather ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-sky-500 mb-3"></div>
                <p>날씨 정보 로딩중...</p>
              </div>
            ) : weatherData ? (
              <div className="space-y-5">
                <div className="flex items-center justify-center p-6 bg-gradient-to-br from-sky-400 to-blue-500 rounded-xl shadow-lg text-white relative overflow-hidden">
                  <div className="absolute -top-4 -left-4 w-24 h-24 opacity-20">
                    {getWeatherIcon(weatherData.sky_condition, weatherData.precipitation_type)}
                  </div>
                  <div className="text-center z-10">
                    <div className="text-5xl font-bold mb-1">{weatherData.temperature.toFixed(1)}°C</div>
                    <div className="text-lg font-medium">{getSkyConditionText(weatherData.sky_condition)}</div>
                    {weatherData.precipitation_type !== 0 && (
                      <div className="text-sm opacity-80">
                        강수: {getPrecipitationText(weatherData.precipitation_type)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {[
                    {
                      label: "습도",
                      value: `${weatherData.humidity}%`,
                      icon: <Droplets className="w-5 h-5 text-blue-500" />,
                    },
                    {
                      label: "풍속",
                      value: `${weatherData.wind_speed}m/s`,
                      icon: <Wind className="w-5 h-5 text-gray-500" />,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="bg-gray-100/70 rounded-lg p-3 flex items-center space-x-2 shadow-sm hover:bg-gray-200/70 transition-colors"
                    >
                      {item.icon}
                      <div>
                        <div className="font-semibold text-gray-700">{item.value}</div>
                        <div className="text-xs text-gray-500">{item.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-10">도시를 선택해주세요.</p>
            )}
          </Card>

          {/* Sleep & Analysis Card */}
          <Card className="lg:col-span-1 animate-slide-in-right delay-100">
            <CardTitle icon={<BedDouble className="w-7 h-7 text-purple-500" />} iconBgColor="bg-purple-100">
              수면 & 분석
            </CardTitle>
            <div className="mb-6">
              <label htmlFor="sleep-hours" className="block text-sm font-semibold text-gray-600 mb-2">
                어젯밤 수면 시간 (시간)
              </label>
              <input
                id="sleep-hours"
                type="number"
                value={sleepHours}
                onChange={(e) => setSleepHours(Math.max(0, Math.min(24, Number(e.target.value))))}
                min="0"
                max="24"
                step="0.5"
                className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all shadow-sm"
              />
            </div>
            <div className={`p-4 rounded-lg border ${sleepStatus.color} flex items-center space-x-3 mb-6 shadow-sm`}>
              {sleepStatus.icon}
              <div>
                <div className="font-semibold">{sleepStatus.text}</div>
                <div className="text-sm opacity-80">{sleepHours}시간 수면</div>
              </div>
            </div>
            <button
              onClick={analyzeEmotion}
              disabled={loading.emotion || !weatherData || loading.weather}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3.5 px-6 rounded-lg font-semibold hover:shadow-lg hover:from-purple-700 hover:to-pink-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 transform active:scale-95 flex items-center justify-center space-x-2 text-lg"
            >
              {loading.emotion ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>분석중...</span>
                </>
              ) : (
                <>
                  <Brain className="w-6 h-6" />
                  <span>감정 분석하기</span>
                </>
              )}
            </button>
          </Card>

          {/* Emotion Results Card */}
          <Card className="lg:col-span-1 animate-slide-in-right delay-200">
            <CardTitle
              icon={<BarChartHorizontalBig className="w-7 h-7 text-emerald-500" />}
              iconBgColor="bg-emerald-100"
            >
              예상 감정 분포
            </CardTitle>
            {loading.emotion ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500 mb-3"></div>
                <p>감정 분석중...</p>
              </div>
            ) : sortedEmotions.length > 0 ? (
              <div className="space-y-4">
                {sortedEmotions.slice(0, 5).map(([emotion, probability], index) => (
                  <div key={emotion} className={`animate-fade-in-up delay-${index * 100}`}>
                    <div className="flex justify-between items-center mb-1.5">
                      <div className="flex items-center">
                        <span className="text-2xl mr-2.5">{getEmotionEmoji(emotion)}</span>
                        <span className="font-medium text-gray-700 text-md">{emotion}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-600">{(probability * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200/80 rounded-full h-2.5 overflow-hidden shadow-inner">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${getEmotionColor(emotion)}`}
                        style={{ width: `${isMounted ? probability * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 flex flex-col items-center">
                <Zap className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-lg">감정 분석 결과가 여기에 표시됩니다.</p>
                <p className="text-sm">날씨 정보 확인 후 '감정 분석하기'를 눌러주세요.</p>
              </div>
            )}
          </Card>
        </div>

        {/* Insights Card */}
        {isMounted && sortedEmotions.length > 0 && !loading.emotion && (
          <div className="bg-gradient-to-tr from-blue-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl text-white p-8 sm:p-10 animate-zoom-in">
            <h3 className="text-3xl font-bold mb-8 flex items-center">
              <Info className="w-9 h-9 mr-3 opacity-90" />
              오늘의 맞춤 인사이트
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  title: "주요 예상 감정",
                  content: `${getEmotionEmoji(sortedEmotions[0][0])} ${sortedEmotions[0][0]} (${(sortedEmotions[0][1] * 100).toFixed(1)}%)`,
                },
                {
                  title: "추천 활동",
                  content:
                    sortedEmotions[0][0] === "기쁨"
                      ? "새로운 도전이나 즐거운 사람들과의 만남이 좋은 날입니다! 🚀"
                      : sortedEmotions[0][0] === "만족"
                        ? "현재의 평온함을 즐기며 차분한 활동을 이어가세요. ☕"
                        : sortedEmotions[0][0] === "무기력"
                          ? "가벼운 스트레칭이나 산책으로 몸과 마음에 활력을 불어넣어 보세요. 🌿"
                          : sortedEmotions[0][0] === "불안"
                            ? "따뜻한 차 한 잔과 함께 깊은 호흡, 명상으로 마음을 다독여주세요. 🙏"
                            : "오늘 하루, 당신의 감정에 귀 기울이며 의미있는 시간을 보내세요! ✨",
                },
                {
                  title: "날씨 기반 조언",
                  content: weatherData
                    ? weatherData.temperature < 10
                      ? "쌀쌀한 날씨! 따뜻한 옷차림과 온기를 챙기세요. 🧣"
                      : weatherData.temperature > 28
                        ? "더위 조심! 시원한 물 충분히 마시고 자외선 차단도 잊지마세요. ☀️💧"
                        : "활동하기 좋은 쾌적한 날씨입니다. 야외 활동도 고려해보세요! 😊"
                    : "날씨 정보 로딩중...",
                },
                {
                  title: "컨디션 관리 팁",
                  content:
                    sleepStatus.status === "good"
                      ? "최상의 컨디션! 오늘 하루 에너지 넘치게 보내세요! 💪"
                      : sleepStatus.status === "ok"
                        ? "괜찮은 컨디션이지만, 중간중간 휴식을 취하며 페이스 조절하세요. 🧘"
                        : "수면 부족으로 피로할 수 있어요. 오늘은 무리하지 말고 충분한 휴식을 우선하세요. 🛌",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-colors duration-300 shadow-lg"
                >
                  <h4 className="font-semibold text-lg mb-3 text-pink-200">{item.title}</h4>
                  <p className="text-sm opacity-95 leading-relaxed">{item.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <footer className="text-center py-8 mt-10 border-t border-gray-300/50">
        <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} 오늘의 감정 날씨. AI 감정 분석.</p>
      </footer>
    </div>
  )
}

export default WeatherEmotionApp

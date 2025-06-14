// "use client"

// import { useState, useEffect } from "react"
// import { Button } from "@/app/components/ui/button"
// import Link from 'next/link'
// import { Diary } from "@/types/diary"
// import { EmotionData, MoodColors, WeeklyTrend, EmotionPercentage } from "@/types/emotion"
// import { diaryAPI, communityAPI } from "@/lib/api"
// import { toast } from "sonner"
// import Header from "@/components/Header"
// import UserInfoCard from "@/components/UserInfoCard"
// import { useUser } from "@/lib/context/UserContext"
// import { mockCurrentUserDiaries, mockRecommendedDiaries } from "@/mock/diary"

// import {
//   Heart,
//   MessageCircle,
//   TrendingUp,
//   Users,
//   Calendar,
//   Plus,
//   ChevronLeft,
//   ChevronRight,
//   BarChart2,
//   Clock,
//   BookOpen,
//   Home,
//   Search,
//   Bell
// } from "lucide-react"

// export default function Component() {
//   const { user: currentUser, isLoading: isUserLoading } = useUser()
//   const [currentMonth, setCurrentMonth] = useState(new Date())
//   const [groupEntries, setGroupEntries] = useState<Diary[]>([])
//   const [recommendedEntries, setRecommendedEntries] = useState<Diary[]>([])
//   const [isLoading, setIsLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)

//   // 대시보드 컴포넌트 상단에 이 함수를 추가하세요 (import 아래, Component 함수 위에)

// // userId를 기반으로 고정된 사용자 정보 생성
// const getUserInfoFromId = (userId: number) => {
//   const names = [
//     '김하늘', '이바다', '박별님', '최달빛', '정햇살', '장꽃님', '윤구름', '임나무', '한바람', '오새벽',
//     '강여름', '송가을', '조겨울', '권봄날', '유행복', '노평화', '도희망', '류사랑', '서지혜', '문예은',
//     '신민준', '김태양', '이달님', '박지수', '최수진', '정미래', '장소망', '윤기쁨', '임웃음', '한평온',
//     '오자유', '강순수', '송맑음', '조고요', '권따뜻', '유포근', '노은혜', '도감사', '류기적', '서축복',
//     '문소중', '신귀한', '김빛나', '이영롱', '박고운', '최아름', '정단아', '장예쁜', '윤사랑', '임기분',
//     '한설렘', '오떨림', '강두근', '송신남', '조즐거', '권행복', '유만족', '노충만', '도완전', '류최고'
//   ]
  
//   const adjectives = ['활발한', '조용한', '친근한', '신중한', '유쾌한', '차분한', '밝은', '따뜻한', '시원한', '멋진']
  
//   // userId를 기반으로 고정된 인덱스 계산
//   const nameIndex = (userId - 1) % names.length
//   const adjIndex = (userId - 1) % adjectives.length
  
//   return {
//     id: userId,
//     nickname: names[nameIndex],
//     email: `user${userId}@example.com`,
//     profileImage: `https://www.gravatar.com/avatar/${userId}?d=identicon`,
//     description: `${adjectives[adjIndex]} 사용자`
//   }
// }
//   // 감정 데이터 (실제 앱에서는 API에서 가져올 것)
//   const emotionData: Record<string, EmotionData> = {
//     "2025-06-01": { mood: "happy", intensity: 0.8 },
//     "2025-06-02": { mood: "happy", intensity: 0.9 },
//     "2025-06-03": { mood: "neutral", intensity: 0.5 },
//     "2025-06-04": { mood: "sad", intensity: 0.6 },
//     "2025-06-05": { mood: "happy", intensity: 0.7 },
//     "2025-06-06": { mood: "angry", intensity: 0.8 },
//     "2025-06-07": { mood: "happy", intensity: 0.9 },
//     "2025-06-08": { mood: "neutral", intensity: 0.4 },
//     "2025-06-09": { mood: "happy", intensity: 0.7 },
//     "2025-06-10": { mood: "sad", intensity: 0.5 },
//     "2025-06-11": { mood: "neutral", intensity: 0.6 },
//     "2025-06-12": { mood: "happy", intensity: 0.8 },
//     "2025-06-13": { mood: "happy", intensity: 0.9 },
//     "2025-06-14": { mood: "neutral", intensity: 0.5 },
//     "2025-06-15": { mood: "sad", intensity: 0.4 },
//     "2025-06-16": { mood: "angry", intensity: 0.7 },
//     "2025-06-17": { mood: "happy", intensity: 0.8 },
//     "2025-06-18": { mood: "happy", intensity: 0.9 },
//     "2025-06-19": { mood: "neutral", intensity: 0.6 },
//     "2025-06-20": { mood: "sad", intensity: 0.5 },
//     "2025-06-21": { mood: "happy", intensity: 0.7 },
//     "2025-06-22": { mood: "happy", intensity: 0.8 },
//     "2025-06-23": { mood: "neutral", intensity: 0.5 },
//     "2025-06-24": { mood: "sad", intensity: 0.6 },
//     "2025-06-25": { mood: "happy", intensity: 0.9 },
//     "2025-06-26": { mood: "angry", intensity: 0.7 },
//     "2025-06-27": { mood: "happy", intensity: 0.8 },
//     "2025-06-28": { mood: "neutral", intensity: 0.6 },
//     "2025-06-29": { mood: "happy", intensity: 0.7 },
//     "2025-06-30": { mood: "sad", intensity: 0.5 },
//   }

//   // 감정별 색상 및 이모지
//   const moodColors: Record<string, MoodColors> = {
//     happy: { bg: "bg-yellow-400", text: "text-yellow-500", emoji: "😊" },
//     sad: { bg: "bg-blue-400", text: "text-blue-500", emoji: "😢" },
//     angry: { bg: "bg-red-400", text: "text-red-500", emoji: "😠" },
//     neutral: { bg: "bg-gray-400", text: "text-gray-500", emoji: "😐" },
//   }

//   // 감정 통계 계산
//   const emotionStats = Object.values(emotionData).reduce(
//     (acc, { mood }) => {
//       acc[mood] = (acc[mood] || 0) + 1
//       return acc
//     },
//     {} as Record<string, number>,
//   )

//   // 감정 분포 퍼센트 계산
//   const totalDays = Object.keys(emotionData).length
//   const emotionPercentages: EmotionPercentage[] = Object.entries(emotionStats).map(([mood, count]) => ({
//     mood,
//     count,
//     percentage: Math.round((count / totalDays) * 100),
//   }))

//   // 주간 감정 추세 데이터
//   const weeklyTrend: WeeklyTrend[] = [
//     { day: "월", value: 0.8, mood: "happy" },
//     { day: "화", value: 0.6, mood: "neutral" },
//     { day: "수", value: 0.4, mood: "sad" },
//     { day: "목", value: 0.5, mood: "neutral" },
//     { day: "금", value: 0.7, mood: "happy" },
//     { day: "토", value: 0.9, mood: "happy" },
//     { day: "일", value: 0.8, mood: "happy" },
//   ]

//   // 캘린더 관련 함수들
//   const getDaysInMonth = (year: number, month: number) => {
//     return new Date(year, month + 1, 0).getDate()
//   }

//   const getFirstDayOfMonth = (year: number, month: number) => {
//     return new Date(year, month, 1).getDay()
//   }

//   const renderCalendar = () => {
//     const year = currentMonth.getFullYear()
//     const month = currentMonth.getMonth()
//     const daysInMonth = getDaysInMonth(year, month)
//     const firstDayOfMonth = getFirstDayOfMonth(year, month)
//     const days = []

//     // 요일 헤더
//     const weekdays = ["일", "월", "화", "수", "목", "금", "토"]
//     const weekdayHeader = weekdays.map((day) => (
//       <div key={`header-${day}`} className="text-center text-xs font-medium text-slate-500 py-2">
//         {day}
//       </div>
//     ))

//     // 이전 달의 날짜들 (비어있는 셀)
//     for (let i = 0; i < firstDayOfMonth; i++) {
//       days.push(
//         <div key={`empty-${i}`} className="p-1 border border-transparent">
//           <div className="h-8 w-8"></div>
//         </div>,
//       )
//     }

//     // 현재 달의 날짜들
//     for (let day = 1; day <= daysInMonth; day++) {
//       const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
//       const emotion = emotionData[date]
//       const isToday = new Date().toDateString() === new Date(year, month, day).toDateString()

//       days.push(
//         <div key={`day-${day}`} className={`p-1 relative ${isToday ? "bg-blue-50 rounded-lg" : ""}`}>
//           <div
//             className={`flex items-center justify-center h-8 w-8 rounded-full text-xs font-medium 
//             ${isToday ? "bg-blue-100 text-blue-800" : "text-slate-700"}`}
//           >
//             {day}
//           </div>
//           {emotion && (
//             <div
//               className={`absolute bottom-1 right-1 w-3 h-3 rounded-full ${
//                 moodColors[emotion.mood as keyof typeof moodColors].bg
//               }`}
//               style={{ opacity: emotion.intensity }}
//             ></div>
//           )}
//         </div>,
//       )
//     }

//     return (
//       <div className="grid grid-cols-7 gap-1">
//         {weekdayHeader}
//         {days}
//       </div>
//     )
//   }

//   const formatMonth = (date: Date) => {
//     return date.toLocaleDateString("ko-KR", { year: "numeric", month: "long" })
//   }

//   const prevMonth = () => {
//     setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
//   }

//   const nextMonth = () => {
//     setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
//   }

//   // useEffect 부분을 이렇게 교체하세요
// // useEffect 부분을 이렇게 교체하세요
// // useEffect 부분을 이렇게 수정하세요
// useEffect(() => {
//   const fetchDashboardData = async () => {
//     try {
//       setIsLoading(true)
//       setError(null)

//       console.log('=== 대시보드 커뮤니티 일기 로딩 시작 ===')

//       // 1. 내가 참여한 커뮤니티 목록 가져오기
//       console.log('🏠 내 커뮤니티 목록 조회 중...')
//       const communitiesResponse = await communityAPI.getMyCommunities()
//       const communities = communitiesResponse.data

//       console.log('📋 커뮤니티 응답:', communities)

//       if (!communities || communities.length === 0) {
//         console.log('❌ 참여한 커뮤니티가 없음')
//         setGroupEntries([])
//       } else {
//         console.log(`✅ ${communities.length}개의 커뮤니티 발견`)
        
//         // 2. 각 커뮤니티의 일기 목록을 병렬로 가져오기
//         console.log('📖 각 커뮤니티의 일기 목록 조회 중...')
//         const diaryPromises = communities.map(async (community) => {
//           try {
//             console.log(`📚 커뮤니티 "${community.name}" (ID: ${community.id}) 일기 조회`)
//             const diariesResponse = await communityAPI.getCommunityDiaries(community.id)
//             console.log(`📝 커뮤니티 "${community.name}": ${diariesResponse.data?.length || 0}개 일기`)
            
//             // 🔄 userId를 user 객체로 변환
//             const diariesWithUser = diariesResponse.data?.map(diary => ({
//               ...diary,
//               title: diary.summary, // summary를 title로 사용
//               content: diary.summary, // summary를 content로도 사용
//               user: getUserInfoFromId(diary.userId), // userId를 user 객체로 변환
//               likes: Math.floor(Math.random() * 20), // 랜덤 좋아요 수
//               comments: Math.floor(Math.random() * 10) // 랜덤 댓글 수
//             })) || []
            
//             console.log('✅ 변환된 일기 데이터:', diariesWithUser.slice(0, 1)) // 첫 번째만 로그
            
//             return diariesWithUser
//           } catch (error) {
//             console.error(`❌ 커뮤니티 "${community.name}" 일기 조회 실패:`, error)
//             return [] // 실패한 커뮤니티는 빈 배열 반환
//           }
//         })

//         // 3. 모든 커뮤니티의 일기를 기다리고 합치기
//         const allDiariesArrays = await Promise.all(diaryPromises)
//         const allDiaries = allDiariesArrays.flat() // 2차원 배열을 1차원으로 평탄화
        
//         console.log(`📊 전체 일기 개수: ${allDiaries.length}개`)

//         if (allDiaries.length === 0) {
//           console.log('📭 커뮤니티에 일기가 없음')
//           setGroupEntries([])
//         } else {
//           // 4. 날짜순으로 정렬하고 최신 5개 선택
//           const sortedEntries = allDiaries
//             .filter(diary => diary != null) // null 체크
//             .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
//             .slice(0, 5) // 최신 5개

//           console.log(`🎯 선택된 최신 일기 ${sortedEntries.length}개:`, sortedEntries.map(d => ({
//             id: d.id,
//             title: d.title,
//             date: d.createdAt,
//             author: d.user?.nickname,
//             emotion: d.primaryEmotion
//           })))
          
//           setGroupEntries(sortedEntries)
//         }
//       }

//       // 5. 추천 일기 설정 (현재는 mock 데이터 사용)
//       console.log('🌟 추천 일기 설정')
//       setRecommendedEntries(mockRecommendedDiaries)
      
//       console.log('✅ 대시보드 데이터 로딩 완료')

//     } catch (err) {
//       console.error('❌ 대시보드 데이터를 불러오는데 실패했습니다:', err)
      
//       if (err.response?.status === 404) {
//         setError('커뮤니티 API가 구현되지 않았습니다. 백엔드 엔드포인트를 확인하세요.')
//       } else if (err.response?.status === 401) {
//         setError('로그인이 필요합니다.')
//       } else {
//         setError(`데이터 로딩 실패: ${err.message || '알 수 없는 오류'}`)
//       }
      
//       // 에러 발생 시 mock 데이터 사용
//       console.log('🔄 에러로 인해 mock 데이터 사용')
//       setGroupEntries(mockCurrentUserDiaries)
//       setRecommendedEntries(mockRecommendedDiaries)
      
//       toast.error('데이터를 불러오는데 실패했습니다.')
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   if (currentUser) {
//     fetchDashboardData()
//   }
// }, [currentUser])

//   // 랜더링 방식 변경: 유저 정보 로딩 및 미로그인 처리
//   if (isUserLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-slate-50">
//         <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
//       </div>
//     )
//   }

//   if (!currentUser) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-slate-50">
//         <div className="text-slate-500 text-lg">로그인이 필요합니다.</div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-slate-50">
//       <Header />
//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <UserInfoCard user={currentUser} />
        
//         {/* Page Title */}
//         <div className="mb-6 sm:mb-8">
//           <h1 className="text-2xl font-bold text-slate-900">대시보드</h1>
//           <p className="text-slate-500">오늘의 감정과 활동을 확인해보세요</p>
//         </div>

//         {/* Quick Actions */}
//         <div className="mb-6 sm:mb-8">
//           <Link href="/write">
//             <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
//               <Plus className="w-5 h-5 mr-2" />새 일기 작성하기
//             </Button>
//           </Link>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
//           {/* Main Content Area */}
//           <div className="lg:col-span-2 space-y-6 sm:space-y-8">
//             {/* 오늘의 한 줄 */}
//             <section className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 sm:p-6 border border-blue-100">
//               <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 flex items-center">
//                 <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
//                 오늘의 한 줄
//               </h3>
//               <div className="bg-white rounded-lg p-4 border border-blue-200">
//                 <textarea
//                   placeholder="오늘 하루를 한 줄로 표현해보세요..."
//                   className="w-full text-sm text-slate-600 placeholder-slate-400 border-none outline-none resize-none"
//                   rows={3}
//                 />
//                 <div className="flex justify-end mt-2">
//                   <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-sm">
//                     저장
//                   </Button>
//                 </div>
//               </div>
//             </section>

//             {/* 내 나눔방 최신 일기 */}
//             <section>
//   <div className="flex items-center justify-between mb-4 sm:mb-6">
//     <h2 className="text-lg sm:text-xl font-semibold text-slate-900 flex items-center">
//       <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
//       <span className="hidden sm:inline">내 나눔방 최신 일기</span>
//       <span className="sm:hidden">나눔방</span>
//     </h2>
    
//     {/* 더보기 버튼 추가 */}
//     <Link href="/communities">
//       <Button 
//         variant="outline" 
//         size="sm" 
//         className="text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-colors"
//       >
//         <span className="hidden sm:inline">더보기</span>
//         <span className="sm:hidden">더보기</span>
//         <ChevronRight className="w-4 h-4 ml-1" />
//       </Button>
//     </Link>
//   </div>

//               {error && (
//                 <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
//                   {error}
//                 </div>
//               )}
//               {isLoading ? (
//                 <div className="flex justify-center items-center h-32">
//                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//                 </div>
//               ) : (
//                 // 나눔방 일기 렌더링 부분을 이렇게 교체하세요
// <div className="space-y-4">
//   {groupEntries.length === 0 ? (
//     <div className="p-4 text-center text-slate-500">
//       나눔방 일기가 없습니다.
//     </div>
//   ) : (
//     groupEntries.map((entry) => {
//       // 안전한 사용자 정보 추출
//       const userInfo = entry.user || getUserInfoFromId(entry.userId || 1)
      
//       return (
//         <div
//           key={entry.id}
//           className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
//         >
//           <div className="flex items-start justify-between mb-3">
//             <div className="flex items-center space-x-3">
//               <div className="w-8 h-8 bg-slate-200 rounded-full overflow-hidden">
//                 <img
//                   src={userInfo.profileImage || `https://www.gravatar.com/avatar/${userInfo.id}?d=identicon`}
//                   alt={userInfo.nickname || userInfo.email || '익명'}
//                   className="w-full h-full object-cover"
//                 />
//               </div>
//               <div>
//                 <p className="font-medium text-slate-900 text-sm sm:text-base">
//                   {userInfo.nickname || userInfo.email || '익명 사용자'}
//                 </p>
//                 <p className="text-xs sm:text-sm text-slate-500">
//                   {new Date(entry.createdAt).toLocaleDateString('ko-KR', {
//                     year: 'numeric',
//                     month: 'long',
//                     day: 'numeric'
//                   })}
//                 </p>
//               </div>
//             </div>
//             <span className="text-lg">
//               {moodColors[entry.primaryEmotion as keyof typeof moodColors]?.emoji || "😊"}
//             </span>
//           </div>
//           <h3 className="font-semibold text-slate-900 mb-2 text-sm sm:text-base">
//             {entry.title || entry.summary || '제목 없음'}
//           </h3>
//           <p className="text-slate-600 mb-4 line-clamp-2 text-sm sm:text-base">
//             {entry.content || entry.summary || '내용 없음'}
//           </p>
//           <div className="flex items-center space-x-4 text-sm text-slate-500">
//             <button className="flex items-center space-x-1 hover:text-red-500 transition-colors">
//               <Heart className="w-4 h-4" />
//               <span>{entry.likes || 0}</span>
//             </button>
//             <button className="flex items-center space-x-1 hover:text-blue-500 transition-colors">
//               <MessageCircle className="w-4 h-4" />
//               <span>{entry.comments || 0}</span>
//             </button>
//           </div>
//         </div>
//       )
//     })
//   )}
// </div>
//               )}
//             </section>

//             {/* 추천 일기 */}
//             <section>
//               <div className="flex items-center justify-between mb-4 sm:mb-6">
//                 <h2 className="text-lg sm:text-xl font-semibold text-slate-900 flex items-center">
//                   <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600" />
//                   추천 일기
//                 </h2>
//               </div>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 {recommendedEntries.length === 0 && (
//                   <div className="col-span-1 sm:col-span-2 p-4 text-center text-slate-500">
//                     추천 일기가 없습니다.
//                   </div>
//                 )}
//                 {recommendedEntries.map((entry) => (
//                   <div
//                     key={entry.id}
//                     className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
//                   >
//                     <div className="flex items-center justify-between mb-3">
//                       <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
//                         {new Date(entry.createdAt).toLocaleDateString('ko-KR', {
//                           year: 'numeric',
//                           month: 'long',
//                           day: 'numeric'
//                         })}
//                       </span>
//                       <span className="text-lg">
//                         {moodColors[entry.primaryEmotion as keyof typeof moodColors]?.emoji || "😊"}
//                       </span>
//                     </div>
//                     <h3 className="font-semibold text-slate-900 mb-2 text-sm sm:text-base">{entry.title}</h3>
//                     <p className="text-slate-600 text-sm mb-4 line-clamp-3">{entry.content}</p>
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center space-x-2">
//                         <div className="w-6 h-6 bg-slate-200 rounded-full overflow-hidden">
//                           <img
//                             src={entry.user.profileImage || `https://www.gravatar.com/avatar/${entry.user.id}?d=identicon`}
//                             alt={entry.user.nickname || entry.user.email}
//                             className="w-full h-full object-cover"
//                           />
//                         </div>
//                         <span className="text-sm text-slate-600">{entry.user.nickname || entry.user.email}</span>
//                       </div>
//                       <div className="flex items-center space-x-3 text-sm text-slate-500">
//                         <span className="flex items-center space-x-1">
//                           <Heart className="w-3 h-3" />
//                           <span>{entry.likes}</span>
//                         </span>
//                         <span className="flex items-center space-x-1">
//                           <MessageCircle className="w-3 h-3" />
//                           <span>{entry.comments}</span>
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </section>
//           </div>

//           {/* Sidebar */}
//           <div className="space-y-6">
//             {/* 감정 캘린더 */}
//             <section className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-base sm:text-lg font-semibold text-slate-900 flex items-center">
//                   <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600" />
//                   감정 캘린더
//                 </h3>
//                 <div className="flex items-center space-x-2">
//                   <button
//                     onClick={prevMonth}
//                     className="p-1 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
//                   >
//                     <ChevronLeft className="w-4 h-4" />
//                   </button>
//                   <span className="text-sm font-medium text-slate-700">{formatMonth(currentMonth)}</span>
//                   <button
//                     onClick={nextMonth}
//                     className="p-1 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
//                   >
//                     <ChevronRight className="w-4 h-4" />
//                   </button>
//                 </div>
//               </div>
//               {renderCalendar()}
//               <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
//                 <div className="flex items-center space-x-1">
//                   <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
//                   <span className="text-xs text-slate-600">행복</span>
//                 </div>
//                 <div className="flex items-center space-x-1">
//                   <div className="w-3 h-3 rounded-full bg-blue-400"></div>
//                   <span className="text-xs text-slate-600">슬픔</span>
//                 </div>
//                 <div className="flex items-center space-x-1">
//                   <div className="w-3 h-3 rounded-full bg-red-400"></div>
//                   <span className="text-xs text-slate-600">화남</span>
//                 </div>
//                 <div className="flex items-center space-x-1">
//                   <div className="w-3 h-3 rounded-full bg-gray-400"></div>
//                   <span className="text-xs text-slate-600">중립</span>
//                 </div>
//               </div>
//             </section>

//             {/* 감정 통계 */}
//             <section className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200">
//               <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 flex items-center">
//                 <BarChart2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
//                 감정 통계
//               </h3>
//               <div className="space-y-4">
//                 {/* 감정 분포 */}
//                 <div>
//                   <div className="flex justify-between items-center mb-2">
//                     <h4 className="text-sm font-medium text-slate-700">감정 분포</h4>
//                     <span className="text-xs text-slate-500">지난 30일</span>
//                   </div>
//                   <div className="h-4 bg-slate-100 rounded-full overflow-hidden flex">
//                     {emotionPercentages.map((item, index) => (
//                       <div
//                         key={index}
//                         className={`${moodColors[item.mood as keyof typeof moodColors].bg}`}
//                         style={{ width: `${item.percentage}%` }}
//                         title={`${item.mood}: ${item.percentage}%`}
//                       ></div>
//                     ))}
//                   </div>
//                   <div className="flex justify-between mt-2">
//                     {emotionPercentages.map((item, index) => (
//                       <div key={index} className="flex items-center space-x-1">
//                         <div
//                           className={`w-2 h-2 rounded-full ${moodColors[item.mood as keyof typeof moodColors].bg}`}
//                         ></div>
//                         <span className="text-xs text-slate-600">{item.percentage}%</span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 {/* 주간 감정 추세 */}
//                 <div>
//                   <div className="flex justify-between items-center mb-2">
//                     <h4 className="text-sm font-medium text-slate-700">주간 감정 추세</h4>
//                     <span className="text-xs text-slate-500">이번 주</span>
//                   </div>
//                   <div className="flex items-end justify-between h-24 px-2">
//                     {weeklyTrend.map((day, index) => (
//                       <div key={index} className="flex flex-col items-center">
//                         <div
//                           className={`w-1.5 rounded-t-sm ${moodColors[day.mood as keyof typeof moodColors].bg}`}
//                           style={{ height: `${day.value * 100}%`, opacity: 0.8 }}
//                         ></div>
//                         <span className="text-xs text-slate-500 mt-1">{day.day}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 {/* 최근 감정 기록 */}
//                 <div>
//                   <div className="flex justify-between items-center mb-2">
//                     <h4 className="text-sm font-medium text-slate-700">최근 감정 기록</h4>
//                   </div>
//                   <div className="space-y-2">
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center space-x-2">
//                         <span className="text-lg">😊</span>
//                         <span className="text-xs text-slate-700">행복했어요</span>
//                       </div>
//                       <div className="flex items-center space-x-1 text-xs text-slate-500">
//                         <Clock className="w-3 h-3" />
//                         <span>오늘</span>
//                       </div>
//                     </div>
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center space-x-2">
//                         <span className="text-lg">😌</span>
//                         <span className="text-xs text-slate-700">평온했어요</span>
//                       </div>
//                       <div className="flex items-center space-x-1 text-xs text-slate-500">
//                         <Clock className="w-3 h-3" />
//                         <span>어제</span>
//                       </div>
//                     </div>
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center space-x-2">
//                         <span className="text-lg">😢</span>
//                         <span className="text-xs text-slate-700">슬펐어요</span>
//                       </div>
//                       <div className="flex items-center space-x-1 text-xs text-slate-500">
//                         <Clock className="w-3 h-3" />
//                         <span>2일 전</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </section>
//           </div>
//         </div>
//       </main>

//       {/* Mobile Bottom Navigation */}
//       <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2 z-40">
//         <div className="flex items-center justify-around">
//           <button className="flex flex-col items-center space-y-1 p-2 text-blue-600">
//             <Home className="w-5 h-5" />
//             <span className="text-xs font-medium">홈</span>
//           </button>
//           <button className="flex flex-col items-center space-y-1 p-2 text-slate-400">
//             <Search className="w-5 h-5" />
//             <span className="text-xs">검색</span>
//           </button>
//           <button className="flex flex-col items-center space-y-1 p-2 text-slate-400">
//             <Plus className="w-5 h-5" />
//             <span className="text-xs">작성</span>
//           </button>
//           <button className="flex flex-col items-center space-y-1 p-2 text-slate-400">
//             <Users className="w-5 h-5" />
//             <span className="text-xs">나눔방</span>
//           </button>
//           <button className="flex flex-col items-center space-y-1 p-2 text-slate-400 relative">
//             <Bell className="w-5 h-5" />
//             <span className="text-xs">알림</span>
//             <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
//           </button>
//         </div>
//       </div>

//       {/* Mobile Bottom Padding */}
//       <div className="md:hidden h-20"></div>
//     </div>
//   )
// }
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/app/components/ui/button"
import Link from 'next/link'
import { Diary } from "@/types/diary"
import { EmotionData, MoodColors, WeeklyTrend, EmotionPercentage } from "@/types/emotion"
import { diaryAPI, communityAPI, authAPI } from "@/lib/api"
import { toast } from "sonner"
import Header from "@/components/Header"
import UserInfoCard from "@/components/UserInfoCard"
import { mockCurrentUserDiaries, mockRecommendedDiaries } from "@/mock/diary"

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
  Bell
} from "lucide-react"

export default function Component() {
  // 사용자 정보 상태를 직접 관리
  const [currentUser, setCurrentUser] = useState(null)
  const [isUserLoading, setIsUserLoading] = useState(true)
  const [userError, setUserError] = useState(null)
  
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [groupEntries, setGroupEntries] = useState<Diary[]>([])
  const [recommendedEntries, setRecommendedEntries] = useState<Diary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 실제 사용자 정보를 가져오는 함수
  const fetchCurrentUser = async () => {
    try {
      setIsUserLoading(true)
      setUserError(null)
      
      console.log('🔐 사용자 인증 정보 조회 중...')
      const userResponse = await authAPI.getCurrentUser()
      
      console.log('✅ 사용자 정보 조회 성공:', userResponse)
      
      // 실제 API 응답에 맞게 사용자 정보 구성
      const userData = {
        id: userResponse.id || 1,
        nickname: userResponse.nickname || "최정혁", // 기본값으로 "최정혁" 설정
        email: userResponse.email || "test@example.com", // 실제 이메일 사용
        profileImage: userResponse.profileImage || `https://www.gravatar.com/avatar/${userResponse.id || 1}?d=identicon`,
        description: userResponse.description || "활발한 사용자"
      }
      
      setCurrentUser(userData)
      console.log('👤 설정된 사용자 정보:', userData)
      
    } catch (err) {
      console.error('❌ 사용자 정보 조회 실패:', err)
      setUserError(err.message || '사용자 정보를 가져올 수 없습니다.')
      
      // 에러 시 기본 사용자 정보 설정
      const defaultUser = {
        id: 1,
        nickname: "최정혁",
        email: "test@example.com",
        profileImage: "https://www.gravatar.com/avatar/1?d=identicon",
        description: "활발한 사용자"
      }
      setCurrentUser(defaultUser)
      
      toast.error('사용자 정보를 가져오는데 실패했습니다.')
    } finally {
      setIsUserLoading(false)
    }
  }

  // 컴포넌트 마운트 시 사용자 정보 가져오기
  useEffect(() => {
    fetchCurrentUser()
  }, [])

  // userId를 기반으로 고정된 사용자 정보 생성
  const getUserInfoFromId = (userId: number) => {
    const names = [
      '김하늘', '이바다', '박별님', '최달빛', '정햇살', '장꽃님', '윤구름', '임나무', '한바람', '오새벽',
      '강여름', '송가을', '조겨울', '권봄날', '유행복', '노평화', '도희망', '류사랑', '서지혜', '문예은',
      '신민준', '김태양', '이달님', '박지수', '최수진', '정미래', '장소망', '윤기쁨', '임웃음', '한평온',
      '오자유', '강순수', '송맑음', '조고요', '권따뜻', '유포근', '노은혜', '도감사', '류기적', '서축복',
      '문소중', '신귀한', '김빛나', '이영롱', '박고운', '최아름', '정단아', '장예쁜', '윤사랑', '임기분',
      '한설렘', '오떨림', '강두근', '송신남', '조즐거', '권행복', '유만족', '노충만', '도완전', '류최고'
    ]
    
    const adjectives = ['활발한', '조용한', '친근한', '신중한', '유쾌한', '차분한', '밝은', '따뜻한', '시원한', '멋진']
    
    // userId를 기반으로 고정된 인덱스 계산
    const nameIndex = (userId - 1) % names.length
    const adjIndex = (userId - 1) % adjectives.length
    
    return {
      id: userId,
      nickname: names[nameIndex],
      email: `user${userId}@example.com`,
      profileImage: `https://www.gravatar.com/avatar/${userId}?d=identicon`,
      description: `${adjectives[adjIndex]} 사용자`
    }
  }

  // 감정 데이터 (실제 앱에서는 API에서 가져올 것)
  const emotionData: Record<string, EmotionData> = {
    "2025-06-01": { mood: "happy", intensity: 0.8 },
    "2025-06-02": { mood: "happy", intensity: 0.9 },
    "2025-06-03": { mood: "neutral", intensity: 0.5 },
    "2025-06-04": { mood: "sad", intensity: 0.6 },
    "2025-06-05": { mood: "happy", intensity: 0.7 },
    "2025-06-06": { mood: "angry", intensity: 0.8 },
    "2025-06-07": { mood: "happy", intensity: 0.9 },
    "2025-06-08": { mood: "neutral", intensity: 0.4 },
    "2025-06-09": { mood: "happy", intensity: 0.7 },
    "2025-06-10": { mood: "sad", intensity: 0.5 },
    "2025-06-11": { mood: "neutral", intensity: 0.6 },
    "2025-06-12": { mood: "happy", intensity: 0.8 },
    "2025-06-13": { mood: "happy", intensity: 0.9 },
    "2025-06-14": { mood: "neutral", intensity: 0.5 },
    "2025-06-15": { mood: "sad", intensity: 0.4 },
    "2025-06-16": { mood: "angry", intensity: 0.7 },
    "2025-06-17": { mood: "happy", intensity: 0.8 },
    "2025-06-18": { mood: "happy", intensity: 0.9 },
    "2025-06-19": { mood: "neutral", intensity: 0.6 },
    "2025-06-20": { mood: "sad", intensity: 0.5 },
    "2025-06-21": { mood: "happy", intensity: 0.7 },
    "2025-06-22": { mood: "happy", intensity: 0.8 },
    "2025-06-23": { mood: "neutral", intensity: 0.5 },
    "2025-06-24": { mood: "sad", intensity: 0.6 },
    "2025-06-25": { mood: "happy", intensity: 0.9 },
    "2025-06-26": { mood: "angry", intensity: 0.7 },
    "2025-06-27": { mood: "happy", intensity: 0.8 },
    "2025-06-28": { mood: "neutral", intensity: 0.6 },
    "2025-06-29": { mood: "happy", intensity: 0.7 },
    "2025-06-30": { mood: "sad", intensity: 0.5 },
  }

  // 감정별 색상 및 이모지
  const moodColors: Record<string, MoodColors> = {
    happy: { bg: "bg-yellow-400", text: "text-yellow-500", emoji: "😊" },
    sad: { bg: "bg-blue-400", text: "text-blue-500", emoji: "😢" },
    angry: { bg: "bg-red-400", text: "text-red-500", emoji: "😠" },
    neutral: { bg: "bg-gray-400", text: "text-gray-500", emoji: "😐" },
  }

  // 감정 통계 계산
  const emotionStats = Object.values(emotionData).reduce(
    (acc, { mood }) => {
      acc[mood] = (acc[mood] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // 감정 분포 퍼센트 계산
  const totalDays = Object.keys(emotionData).length
  const emotionPercentages: EmotionPercentage[] = Object.entries(emotionStats).map(([mood, count]) => ({
    mood,
    count,
    percentage: Math.round((count / totalDays) * 100),
  }))

  // 주간 감정 추세 데이터
  const weeklyTrend: WeeklyTrend[] = [
    { day: "월", value: 0.8, mood: "happy" },
    { day: "화", value: 0.6, mood: "neutral" },
    { day: "수", value: 0.4, mood: "sad" },
    { day: "목", value: 0.5, mood: "neutral" },
    { day: "금", value: 0.7, mood: "happy" },
    { day: "토", value: 0.9, mood: "happy" },
    { day: "일", value: 0.8, mood: "happy" },
  ]

  // 캘린더 관련 함수들
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const renderCalendar = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDayOfMonth = getFirstDayOfMonth(year, month)
    const days = []

    // 요일 헤더
    const weekdays = ["일", "월", "화", "수", "목", "금", "토"]
    const weekdayHeader = weekdays.map((day) => (
      <div key={`header-${day}`} className="text-center text-xs font-medium text-slate-500 py-2">
        {day}
      </div>
    ))

    // 이전 달의 날짜들 (비어있는 셀)
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div key={`empty-${i}`} className="p-1 border border-transparent">
          <div className="h-8 w-8"></div>
        </div>,
      )
    }

    // 현재 달의 날짜들
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      const emotion = emotionData[date]
      const isToday = new Date().toDateString() === new Date(year, month, day).toDateString()

      days.push(
        <div key={`day-${day}`} className={`p-1 relative ${isToday ? "bg-blue-50 rounded-lg" : ""}`}>
          <div
            className={`flex items-center justify-center h-8 w-8 rounded-full text-xs font-medium 
            ${isToday ? "bg-blue-100 text-blue-800" : "text-slate-700"}`}
          >
            {day}
          </div>
          {emotion && (
            <div
              className={`absolute bottom-1 right-1 w-3 h-3 rounded-full ${
                moodColors[emotion.mood as keyof typeof moodColors].bg
              }`}
              style={{ opacity: emotion.intensity }}
            ></div>
          )}
        </div>,
      )
    }

    return (
      <div className="grid grid-cols-7 gap-1">
        {weekdayHeader}
        {days}
      </div>
    )
  }

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString("ko-KR", { year: "numeric", month: "long" })
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  // 대시보드 데이터 가져오기
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        console.log('=== 대시보드 커뮤니티 일기 로딩 시작 ===')

        // 1. 내가 참여한 커뮤니티 목록 가져오기
        console.log('🏠 내 커뮤니티 목록 조회 중...')
        const communitiesResponse = await communityAPI.getMyCommunities()
        const communities = communitiesResponse.data

        console.log('📋 커뮤니티 응답:', communities)

        if (!communities || communities.length === 0) {
          console.log('❌ 참여한 커뮤니티가 없음')
          setGroupEntries([])
        } else {
          console.log(`✅ ${communities.length}개의 커뮤니티 발견`)
          
          // 2. 각 커뮤니티의 일기 목록을 병렬로 가져오기
          console.log('📖 각 커뮤니티의 일기 목록 조회 중...')
          const diaryPromises = communities.map(async (community) => {
            try {
              console.log(`📚 커뮤니티 "${community.name}" (ID: ${community.id}) 일기 조회`)
              const diariesResponse = await communityAPI.getCommunityDiaries(community.id)
              console.log(`📝 커뮤니티 "${community.name}": ${diariesResponse.data?.length || 0}개 일기`)
              
              // 🔄 userId를 user 객체로 변환
              const diariesWithUser = diariesResponse.data?.map(diary => ({
                ...diary,
                title: diary.summary, // summary를 title로 사용
                content: diary.summary, // summary를 content로도 사용
                user: getUserInfoFromId(diary.userId), // userId를 user 객체로 변환
                likes: Math.floor(Math.random() * 20), // 랜덤 좋아요 수
                comments: Math.floor(Math.random() * 10) // 랜덤 댓글 수
              })) || []
              
              console.log('✅ 변환된 일기 데이터:', diariesWithUser.slice(0, 1)) // 첫 번째만 로그
              
              return diariesWithUser
            } catch (error) {
              console.error(`❌ 커뮤니티 "${community.name}" 일기 조회 실패:`, error)
              return [] // 실패한 커뮤니티는 빈 배열 반환
            }
          })

          // 3. 모든 커뮤니티의 일기를 기다리고 합치기
          const allDiariesArrays = await Promise.all(diaryPromises)
          const allDiaries = allDiariesArrays.flat() // 2차원 배열을 1차원으로 평탄화
          
          console.log(`📊 전체 일기 개수: ${allDiaries.length}개`)

          if (allDiaries.length === 0) {
            console.log('📭 커뮤니티에 일기가 없음')
            setGroupEntries([])
          } else {
            // 4. 날짜순으로 정렬하고 최신 5개 선택
            const sortedEntries = allDiaries
              .filter(diary => diary != null) // null 체크
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 5) // 최신 5개

            console.log(`🎯 선택된 최신 일기 ${sortedEntries.length}개:`, sortedEntries.map(d => ({
              id: d.id,
              title: d.title,
              date: d.createdAt,
              author: d.user?.nickname,
              emotion: d.primaryEmotion
            })))
            
            setGroupEntries(sortedEntries)
          }
        }

        // 5. 추천 일기 설정 (현재는 mock 데이터 사용)
        console.log('🌟 추천 일기 설정')
        setRecommendedEntries(mockRecommendedDiaries)
        
        console.log('✅ 대시보드 데이터 로딩 완료')

      } catch (err) {
        console.error('❌ 대시보드 데이터를 불러오는데 실패했습니다:', err)
        
        if (err.response?.status === 404) {
          setError('커뮤니티 API가 구현되지 않았습니다. 백엔드 엔드포인트를 확인하세요.')
        } else if (err.response?.status === 401) {
          setError('로그인이 필요합니다.')
        } else {
          setError(`데이터 로딩 실패: ${err.message || '알 수 없는 오류'}`)
        }
        
        // 에러 발생 시 mock 데이터 사용
        console.log('🔄 에러로 인해 mock 데이터 사용')
        setGroupEntries(mockCurrentUserDiaries)
        setRecommendedEntries(mockRecommendedDiaries)
        
        toast.error('데이터를 불러오는데 실패했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    // 사용자 정보가 로드된 후에 대시보드 데이터 가져오기
    if (currentUser && !isUserLoading) {
      fetchDashboardData()
    }
  }, [currentUser, isUserLoading])

  // 랜더링 방식 변경: 유저 정보 로딩 및 미로그인 처리
  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="text-slate-500 text-lg mb-4">로그인이 필요합니다.</div>
          {userError && (
            <div className="text-red-500 text-sm mb-4">{userError}</div>
          )}
          <Button onClick={fetchCurrentUser} className="bg-blue-600 hover:bg-blue-700 text-white">
            다시 시도
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <UserInfoCard user={currentUser} />
        
        {/* Page Title */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl font-bold text-slate-900">대시보드</h1>
          <p className="text-slate-500">오늘의 감정과 활동을 확인해보세요</p>
        </div>

        {/* Quick Actions */}
        <div className="mb-6 sm:mb-8">
          <Link href="/write">
            <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <Plus className="w-5 h-5 mr-2" />새 일기 작성하기
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* 오늘의 한 줄 */}
            <section className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 sm:p-6 border border-blue-100">
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 flex items-center">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                오늘의 한 줄
              </h3>
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <textarea
                  placeholder="오늘 하루를 한 줄로 표현해보세요..."
                  className="w-full text-sm text-slate-600 placeholder-slate-400 border-none outline-none resize-none"
                  rows={3}
                />
                <div className="flex justify-end mt-2">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-sm">
                    저장
                  </Button>
                </div>
              </div>
            </section>

            {/* 내 나눔방 최신 일기 */}
            <section>
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900 flex items-center">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                  <span className="hidden sm:inline">내 나눔방 최신 일기</span>
                  <span className="sm:hidden">나눔방</span>
                </h2>
                
                {/* 더보기 버튼 추가 */}
                <Link href="/communities">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-colors"
                  >
                    <span className="hidden sm:inline">더보기</span>
                    <span className="sm:hidden">더보기</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
                  {error}
                </div>
              )}
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {groupEntries.length === 0 ? (
                    <div className="p-4 text-center text-slate-500">
                      나눔방 일기가 없습니다.
                    </div>
                  ) : (
                    groupEntries.map((entry) => {
                      // 안전한 사용자 정보 추출
                      const userInfo = entry.user || getUserInfoFromId(entry.userId || 1)
                      
                      return (
                        <div
                          key={entry.id}
                          className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-slate-200 rounded-full overflow-hidden">
                                <img
                                  src={userInfo.profileImage || `https://www.gravatar.com/avatar/${userInfo.id}?d=identicon`}
                                  alt={userInfo.nickname || userInfo.email || '익명'}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <p className="font-medium text-slate-900 text-sm sm:text-base">
                                  {userInfo.nickname || userInfo.email || '익명 사용자'}
                                </p>
                                <p className="text-xs sm:text-sm text-slate-500">
                                  {new Date(entry.createdAt).toLocaleDateString('ko-KR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </p>
                              </div>
                            </div>
                            <span className="text-lg">
                              {moodColors[entry.primaryEmotion as keyof typeof moodColors]?.emoji || "😊"}
                            </span>
                          </div>
                          <h3 className="font-semibold text-slate-900 mb-2 text-sm sm:text-base">
                            {entry.title || entry.summary || '제목 없음'}
                          </h3>
                          <p className="text-slate-600 mb-4 line-clamp-2 text-sm sm:text-base">
                            {entry.content || entry.summary || '내용 없음'}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-slate-500">
                            <button className="flex items-center space-x-1 hover:text-red-500 transition-colors">
                              <Heart className="w-4 h-4" />
                              <span>{entry.likes || 0}</span>
                            </button>
                            <button className="flex items-center space-x-1 hover:text-blue-500 transition-colors">
                              <MessageCircle className="w-4 h-4" />
                              <span>{entry.comments || 0}</span>
                            </button>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              )}
            </section>

            {/* 추천 일기 */}
            <section>
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900 flex items-center">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600" />
                  추천 일기
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recommendedEntries.length === 0 && (
                  <div className="col-span-1 sm:col-span-2 p-4 text-center text-slate-500">
                    추천 일기가 없습니다.
                  </div>
                )}
                {recommendedEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        {new Date(entry.createdAt).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                      <span className="text-lg">
                        {moodColors[entry.primaryEmotion as keyof typeof moodColors]?.emoji || "😊"}
                      </span>
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2 text-sm sm:text-base">{entry.title}</h3>
                    <p className="text-slate-600 text-sm mb-4 line-clamp-3">{entry.content}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-slate-200 rounded-full overflow-hidden">
                          <img
                            src={entry.user.profileImage || `https://www.gravatar.com/avatar/${entry.user.id}?d=identicon`}
                            alt={entry.user.nickname || entry.user.email}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-sm text-slate-600">{entry.user.nickname || entry.user.email}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-slate-500">
                        <span className="flex items-center space-x-1">
                          <Heart className="w-3 h-3" />
                          <span>{entry.likes}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <MessageCircle className="w-3 h-3" />
                          <span>{entry.comments}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* 감정 캘린더 */}
            <section className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 flex items-center">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600" />
                  감정 캘린더
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={prevMonth}
                    className="p-1 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-medium text-slate-700">{formatMonth(currentMonth)}</span>
                  <button
                    onClick={nextMonth}
                    className="p-1 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {renderCalendar()}
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <span className="text-xs text-slate-600">행복</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                  <span className="text-xs text-slate-600">슬픔</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <span className="text-xs text-slate-600">화남</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                  <span className="text-xs text-slate-600">중립</span>
                </div>
              </div>
            </section>

            {/* 감정 통계 */}
            <section className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200">
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <BarChart2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                감정 통계
              </h3>
              <div className="space-y-4">
                {/* 감정 분포 */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium text-slate-700">감정 분포</h4>
                    <span className="text-xs text-slate-500">지난 30일</span>
                  </div>
                  <div className="h-4 bg-slate-100 rounded-full overflow-hidden flex">
                    {emotionPercentages.map((item, index) => (
                      <div
                        key={index}
                        className={`${moodColors[item.mood as keyof typeof moodColors].bg}`}
                        style={{ width: `${item.percentage}%` }}
                        title={`${item.mood}: ${item.percentage}%`}
                      ></div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-2">
                    {emotionPercentages.map((item, index) => (
                      <div key={index} className="flex items-center space-x-1">
                        <div
                          className={`w-2 h-2 rounded-full ${moodColors[item.mood as keyof typeof moodColors].bg}`}
                        ></div>
                        <span className="text-xs text-slate-600">{item.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 주간 감정 추세 */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium text-slate-700">주간 감정 추세</h4>
                    <span className="text-xs text-slate-500">이번 주</span>
                  </div>
                  <div className="flex items-end justify-between h-24 px-2">
                    {weeklyTrend.map((day, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div
                          className={`w-1.5 rounded-t-sm ${moodColors[day.mood as keyof typeof moodColors].bg}`}
                          style={{ height: `${day.value * 100}%`, opacity: 0.8 }}
                        ></div>
                        <span className="text-xs text-slate-500 mt-1">{day.day}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 최근 감정 기록 */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium text-slate-700">최근 감정 기록</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">😊</span>
                        <span className="text-xs text-slate-700">행복했어요</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        <span>오늘</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">😌</span>
                        <span className="text-xs text-slate-700">평온했어요</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        <span>어제</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">😢</span>
                        <span className="text-xs text-slate-700">슬펐어요</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        <span>2일 전</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2 z-40">
        <div className="flex items-center justify-around">
          <button className="flex flex-col items-center space-y-1 p-2 text-blue-600">
            <Home className="w-5 h-5" />
            <span className="text-xs font-medium">홈</span>
          </button>
          <button className="flex flex-col items-center space-y-1 p-2 text-slate-400">
            <Search className="w-5 h-5" />
            <span className="text-xs">검색</span>
          </button>
          <button className="flex flex-col items-center space-y-1 p-2 text-slate-400">
            <Plus className="w-5 h-5" />
            <span className="text-xs">작성</span>
          </button>
          <button className="flex flex-col items-center space-y-1 p-2 text-slate-400">
            <Users className="w-5 h-5" />
            <span className="text-xs">나눔방</span>
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
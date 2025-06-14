// // "use client"

// // import React, { useState, useEffect } from 'react';
// // import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
// // import { Calendar, TrendingUp, Heart, Lightbulb, RefreshCw, Filter, ChevronDown, ChevronUp } from 'lucide-react';

// // const API_BASE = 'http://3.236.68.128:8000'

// // // 타입 정의
// // interface EmotionTimelinePoint {
// //   date: string;
// //   primary_emotion: string;
// //   emotion_scores: Record<string, number>;
// //   content_summary: string;
// //   diary_id: number;
// // }

// // interface RecoverySegment {
// //   start_date: string;
// //   end_date: string;
// //   start_emotion: string;
// //   end_emotion: string;
// //   duration_days: number;
// //   diary_ids: number[];
// // }

// // interface RecoveryData {
// //   timeline: EmotionTimelinePoint[];
// //   recovery_segments: RecoverySegment[];
// //   insights: string[];
// //   effective_strategies: string[];
// //   recovery_triggers: string[];
// //   summary: string;
// //   total_recovery_instances: number;
// //   average_recovery_days: number;
// // }

// // interface RecoveryInsights {
// //   total_recovery_instances: number;
// //   average_recovery_time: number;
// //   fastest_recovery: number;
// //   common_patterns: string[];
// //   recommendations: string[];
// //   emotion_type?: string;
// //   message?: string;
// //   suggestions?: string[];
// // }

// // interface ChartDataPoint {
// //   date: string;
// //   fullDate: string;
// //   emotion: string;
// //   score: number;
// //   summary: string;
// // }

// // const RecoveryRouteFrontend: React.FC = () => {
// //   const [recoveryData, setRecoveryData] = useState<RecoveryData | null>(null);
// //   const [insights, setInsights] = useState<RecoveryInsights | null>(null);
// //   const [loading, setLoading] = useState<boolean>(false);
// //   const [error, setError] = useState<string | null>(null);
// //   const [selectedDays, setSelectedDays] = useState<number>(30);
// //   const [selectedEmotion, setSelectedEmotion] = useState<string>('');
// //   const [expandedSegment, setExpandedSegment] = useState<number | null>(null);
// //   const [userId] = useState<number>(2); // 실제로는 로그인된 사용자 ID

// //   // API 호출 함수들
// //   const fetchRecoveryRoute = async (days: number = 30): Promise<void> => {
// //     setLoading(true);
// //     setError(null);
    
// //     try {
// //       const response = await fetch(`${API_BASE}/api/recovery/recovery-route/${userId}?days=${days}`);
// //       if (!response.ok) {
// //         throw new Error(`HTTP error! status: ${response.status}`);
// //       }
// //       const data: RecoveryData = await response.json();
// //       setRecoveryData(data);
// //     } catch (err) {
// //       const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
// //       setError(`회복 루트 분석을 가져오는데 실패했습니다: ${errorMessage}`);
// //       console.error('Recovery route fetch error:', err);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const fetchRecoveryInsights = async (emotionType: string = ''): Promise<void> => {
// //     try {
// //       const url = emotionType 
// //         ? `${API_BASE}/api/recovery/recovery-insights/${userId}?emotion_type=${encodeURIComponent(emotionType)}`
// //         : `${API_BASE}/api/recovery/recovery-insights/${userId}`;
      
// //       const response = await fetch(url);
// //       if (!response.ok) {
// //         throw new Error(`HTTP error! status: ${response.status}`);
// //       }
// //       const data: RecoveryInsights = await response.json();
// //       setInsights(data);
// //     } catch (err) {
// //       console.error('Recovery insights fetch error:', err);
// //     }
// //   };

// //   // 초기 데이터 로드
// //   useEffect(() => {
// //     fetchRecoveryRoute(selectedDays);
// //     fetchRecoveryInsights();
// //   }, []);

// //   // 기간 변경 핸들러
// //   const handleDaysChange = (days: number): void => {
// //     setSelectedDays(days);
// //     fetchRecoveryRoute(days);
// //   };

// //   // 감정별 인사이트 조회
// //   const handleEmotionFilter = (emotion: string): void => {
// //     setSelectedEmotion(emotion);
// //     fetchRecoveryInsights(emotion);
// //   };

// //   // 새로고침
// //   const handleRefresh = (): void => {
// //     fetchRecoveryRoute(selectedDays);
// //     fetchRecoveryInsights(selectedEmotion);
// //   };

// //   // 감정별 색상 반환
// //   const getEmotionColor = (emotion: string): string => {
// //     const colors: Record<string, string> = {
// //       '우울': '#374151', '무기력': '#4B5563', '불안': '#DC2626',
// //       '스트레스': '#EA580C', '피로': '#D97706', '걱정': '#CA8A04',
// //       '평온': '#059669', '만족': '#0891B2', '기쁨': '#7C3AED',
// //       '희망': '#C026D3', '활력': '#E11D48', '행복': '#10B981'
// //     };
// //     return colors[emotion] || '#6B7280';
// //   };

// //   // 감정 점수 변환 (차트용)
// //   const convertToScore = (emotion: string): number => {
// //     const negativeEmotions = ['우울', '무기력', '불안', '스트레스', '피로', '걱정'];
// //     const positiveEmotions = ['평온', '만족', '기쁨', '희망', '활력', '행복'];
    
// //     if (negativeEmotions.includes(emotion)) {
// //       return negativeEmotions.indexOf(emotion) * -1 - 1; // -1 to -6
// //     } else if (positiveEmotions.includes(emotion)) {
// //       return positiveEmotions.indexOf(emotion) + 1; // 1 to 6
// //     }
// //     return 0;
// //   };

// //   // 차트 데이터 변환
// //   const chartData: ChartDataPoint[] = recoveryData?.timeline?.map((point: EmotionTimelinePoint) => ({
// //     date: new Date(point.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
// //     fullDate: point.date,
// //     emotion: point.primary_emotion,
// //     score: convertToScore(point.primary_emotion),
// //     summary: point.content_summary
// //   })) || [];

// //   if (loading && !recoveryData) {
// //     return (
// //       <div className="flex items-center justify-center h-64 bg-gradient-to-br from-purple-50 to-pink-50">
// //         <div className="text-center">
// //           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
// //           <p className="text-gray-600">회복 루트를 분석하고 있습니다...</p>
// //         </div>
// //       </div>
// //     );
// //   }

// //   if (error) {
// //     return (
// //       <div className="max-w-4xl mx-auto p-6">
// //         <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
// //           <div className="text-red-600 mb-4">
// //             <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
// //             </svg>
// //           </div>
// //           <h3 className="text-lg font-semibold text-red-800 mb-2">분석 오류</h3>
// //           <p className="text-red-700 mb-4">{error}</p>
// //           <button 
// //             onClick={handleRefresh}
// //             className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
// //           >
// //             다시 시도
// //           </button>
// //         </div>
// //       </div>
// //     );
// //   }

// //   if (!recoveryData) {
// //     return (
// //       <div className="max-w-4xl mx-auto p-6">
// //         <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
// //           <div className="text-yellow-600 mb-4">
// //             <Calendar className="w-12 h-12 mx-auto" />
// //           </div>
// //           <h3 className="text-lg font-semibold text-yellow-800 mb-2">데이터 부족</h3>
// //           <p className="text-yellow-700">회복 루트 분석을 위해서는 더 많은 일기 데이터가 필요합니다.</p>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="max-w-7xl mx-auto p-6 bg-gradient-to-br from-purple-50 to-pink-50 min-h-screen">
// //       {/* 헤더 */}
// //       <div className="text-center mb-8">
// //         <div className="flex items-center justify-center gap-3 mb-4">
// //           <TrendingUp className="w-8 h-8 text-purple-600" />
// //           <h1 className="text-3xl font-bold text-gray-800">나의 회복 루트</h1>
// //           <button 
// //             onClick={handleRefresh}
// //             disabled={loading}
// //             className="ml-4 p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors disabled:opacity-50"
// //           >
// //             <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
// //           </button>
// //         </div>
// //         <p className="text-gray-600">감정 변화의 흐름을 추적하고 나만의 회복 패턴을 발견해보세요</p>
// //       </div>

// //       {/* 컨트롤 바 */}
// //       <div className="bg-white rounded-lg p-4 mb-6 shadow-lg">
// //         <div className="flex flex-wrap items-center gap-4">
// //           <div className="flex items-center gap-2">
// //             <Calendar className="w-5 h-5 text-gray-500" />
// //             <span className="text-sm font-medium text-gray-700">분석 기간:</span>
// //             {[7, 14, 30, 60, 90].map(days => (
// //               <button
// //                 key={days}
// //                 onClick={() => handleDaysChange(days)}
// //                 className={`px-3 py-1 rounded-full text-sm transition-colors ${
// //                   selectedDays === days 
// //                     ? 'bg-purple-600 text-white' 
// //                     : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
// //                 }`}
// //               >
// //                 {days}일
// //               </button>
// //             ))}
// //           </div>
          
// //           <div className="flex items-center gap-2">
// //             <Filter className="w-5 h-5 text-gray-500" />
// //             <span className="text-sm font-medium text-gray-700">감정 필터:</span>
// //             <select 
// //               value={selectedEmotion}
// //               onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleEmotionFilter(e.target.value)}
// //               className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
// //             >
// //               <option value="">전체</option>
// //               <option value="우울">우울</option>
// //               <option value="불안">불안</option>
// //               <option value="스트레스">스트레스</option>
// //               <option value="기쁨">기쁨</option>
// //               <option value="만족">만족</option>
// //               <option value="평온">평온</option>
// //             </select>
// //           </div>
// //         </div>
// //       </div>

// //       {/* 통계 카드 */}
// //       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
// //         <div className="bg-white rounded-lg p-6 shadow-lg">
// //           <div className="flex items-center gap-3">
// //             <Heart className="w-6 h-6 text-red-500" />
// //             <div>
// //               <h3 className="font-semibold text-gray-800">회복 횟수</h3>
// //               <p className="text-2xl font-bold text-purple-600">
// //                 {recoveryData?.total_recovery_instances || 0}회
// //               </p>
// //             </div>
// //           </div>
// //         </div>
        
// //         <div className="bg-white rounded-lg p-6 shadow-lg">
// //           <div className="flex items-center gap-3">
// //             <Calendar className="w-6 h-6 text-blue-500" />
// //             <div>
// //               <h3 className="font-semibold text-gray-800">평균 회복 기간</h3>
// //               <p className="text-2xl font-bold text-purple-600">
// //                 {recoveryData?.average_recovery_days?.toFixed(1) || 0}일
// //               </p>
// //             </div>
// //           </div>
// //         </div>
        
// //         <div className="bg-white rounded-lg p-6 shadow-lg">
// //           <div className="flex items-center gap-3">
// //             <TrendingUp className="w-6 h-6 text-green-500" />
// //             <div>
// //               <h3 className="font-semibold text-gray-800">최단 회복</h3>
// //               <p className="text-2xl font-bold text-purple-600">
// //                 {recoveryData?.recovery_segments ? Math.min(...recoveryData.recovery_segments.map((s: RecoverySegment) => s.duration_days)) : 0}일
// //               </p>
// //             </div>
// //           </div>
// //         </div>
        
// //         <div className="bg-white rounded-lg p-6 shadow-lg">
// //           <div className="flex items-center gap-3">
// //             <Lightbulb className="w-6 h-6 text-yellow-500" />
// //             <div>
// //               <h3 className="font-semibold text-gray-800">분석 일기</h3>
// //               <p className="text-2xl font-bold text-purple-600">
// //                 {recoveryData?.timeline?.length || 0}개
// //               </p>
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       {/* 감정 타임라인 차트 */}
// //       <div className="bg-white rounded-lg p-6 shadow-lg mb-8">
// //         <h2 className="text-xl font-bold text-gray-800 mb-4">감정 변화 타임라인</h2>
// //         {chartData.length > 0 ? (
// //           <ResponsiveContainer width="100%" height={350}>
// //             <LineChart data={chartData}>
// //               <XAxis 
// //                 dataKey="date" 
// //                 tick={{ fontSize: 12 }}
// //                 angle={-45}
// //                 textAnchor="end"
// //                 height={60}
// //               />
// //               <YAxis domain={[-6, 6]} />
// //               <Tooltip 
// //                 content={({ active, payload, label }: any) => {
// //                   if (active && payload && payload.length) {
// //                     const data = payload[0].payload;
// //                     return (
// //                       <div className="bg-white p-4 border rounded-lg shadow-lg max-w-xs">
// //                         <p className="font-semibold mb-2">{label}</p>
// //                         <div className="flex items-center gap-2 mb-2">
// //                           <div 
// //                             className="w-3 h-3 rounded-full"
// //                             style={{ backgroundColor: getEmotionColor(data.emotion) }}
// //                           ></div>
// //                           <span className="font-medium">{data.emotion}</span>
// //                         </div>
// //                         <p className="text-sm text-gray-600">{data.summary}</p>
// //                       </div>
// //                     );
// //                   }
// //                   return null;
// //                 }}
// //               />
// //               <Line 
// //                 type="monotone" 
// //                 dataKey="score" 
// //                 stroke="#8B5CF6" 
// //                 strokeWidth={3}
// //                 dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 5 }}
// //                 activeDot={{ r: 7, fill: '#7C3AED' }}
// //               />
// //               <ReferenceLine y={0} stroke="#6B7280" strokeDasharray="5 5" />
// //             </LineChart>
// //           </ResponsiveContainer>
// //         ) : (
// //           <div className="text-center py-8 text-gray-500">
// //             차트를 표시할 데이터가 부족합니다.
// //           </div>
// //         )}
// //       </div>

// //       {/* 회복 구간 상세 */}
// //       {recoveryData?.recovery_segments && recoveryData.recovery_segments.length > 0 && (
// //         <div className="bg-white rounded-lg p-6 shadow-lg mb-8">
// //           <h2 className="text-xl font-bold text-gray-800 mb-6">회복 과정 상세 분석</h2>
// //           <div className="space-y-4">
// //             {recoveryData.recovery_segments.map((segment: RecoverySegment, index: number) => (
// //               <div 
// //                 key={index}
// //                 className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
// //               >
// //                 <div 
// //                   className="flex items-center justify-between cursor-pointer"
// //                   onClick={() => setExpandedSegment(expandedSegment === index ? null : index)}
// //                 >
// //                   <div className="flex items-center gap-4">
// //                     <h3 className="text-lg font-semibold text-gray-800">
// //                       회복 과정 {index + 1}
// //                     </h3>
// //                     <div className="flex items-center gap-2">
// //                       <div 
// //                         className="w-4 h-4 rounded-full"
// //                         style={{ backgroundColor: getEmotionColor(segment.start_emotion) }}
// //                       ></div>
// //                       <span className="text-sm font-medium">{segment.start_emotion}</span>
// //                       <span className="text-gray-400">→</span>
// //                       <div 
// //                         className="w-4 h-4 rounded-full"
// //                         style={{ backgroundColor: getEmotionColor(segment.end_emotion) }}
// //                       ></div>
// //                       <span className="text-sm font-medium">{segment.end_emotion}</span>
// //                     </div>
// //                     <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
// //                       {segment.duration_days}일
// //                     </span>
// //                   </div>
// //                   {expandedSegment === index ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
// //                 </div>
                
// //                 {expandedSegment === index && (
// //                   <div className="mt-4 pt-4 border-t border-gray-200">
// //                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //                       <div>
// //                         <h4 className="font-semibold text-gray-800 mb-2">기간 정보</h4>
// //                         <p className="text-sm text-gray-600">시작: {new Date(segment.start_date).toLocaleDateString('ko-KR')}</p>
// //                         <p className="text-sm text-gray-600">종료: {new Date(segment.end_date).toLocaleDateString('ko-KR')}</p>
// //                         <p className="text-sm text-gray-600">소요 기간: {segment.duration_days}일</p>
// //                       </div>
// //                       <div>
// //                         <h4 className="font-semibold text-gray-800 mb-2">관련 일기</h4>
// //                         <p className="text-sm text-gray-600">{segment.diary_ids?.length || 0}개의 일기가 이 회복 과정에 포함되었습니다.</p>
// //                       </div>
// //                     </div>
// //                   </div>
// //                 )}
// //               </div>
// //             ))}
// //           </div>
// //         </div>
// //       )}

// //       {/* 회복 인사이트 */}
// //       {recoveryData?.insights && recoveryData.insights.length > 0 && (
// //         <div className="bg-white rounded-lg p-6 shadow-lg mb-8">
// //           <div className="flex items-center gap-2 mb-6">
// //             <Lightbulb className="w-6 h-6 text-yellow-500" />
// //             <h2 className="text-xl font-bold text-gray-800">나만의 회복 인사이트</h2>
// //           </div>
// //           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //             {recoveryData.insights.map((insight: string, index: number) => (
// //               <div key={index} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
// //                 <div className="flex items-start gap-3">
// //                   <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
// //                   <p className="text-gray-700">{insight}</p>
// //                 </div>
// //               </div>
// //             ))}
// //           </div>
// //         </div>
// //       )}

// //       {/* 효과적인 전략들 */}
// //       {recoveryData?.effective_strategies && recoveryData.effective_strategies.length > 0 && (
// //         <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 text-white">
// //           <h2 className="text-xl font-bold mb-4">💡 나만의 회복 레시피</h2>
// //           <p className="mb-4 opacity-90">당신의 회복 패턴을 분석한 결과, 다음과 같은 방법들이 가장 효과적이었습니다:</p>
// //           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
// //             {recoveryData.effective_strategies.slice(0, 3).map((strategy: string, index: number) => (
// //               <div key={index} className="bg-white bg-opacity-20 rounded-lg p-4">
// //                 <h3 className="font-semibold mb-2">✨ {strategy}</h3>
// //                 <p className="text-sm opacity-90">효과적인 회복 전략으로 확인되었습니다</p>
// //               </div>
// //             ))}
// //           </div>
          
// //           {recoveryData.summary && (
// //             <div className="mt-6 p-4 bg-white bg-opacity-20 rounded-lg">
// //               <h3 className="font-semibold mb-2">📊 분석 요약</h3>
// //               <p className="text-sm opacity-90">{recoveryData.summary}</p>
// //             </div>
// //           )}
// //         </div>
// //       )}

// //       {/* 개별 감정 인사이트 */}
// //       {insights && insights.total_recovery_instances > 0 && (
// //         <div className="mt-8 bg-white rounded-lg p-6 shadow-lg">
// //           <h2 className="text-xl font-bold text-gray-800 mb-4">
// //             {selectedEmotion ? `${selectedEmotion} 감정` : '전체'} 회복 통계
// //           </h2>
// //           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
// //             <div className="text-center p-4 bg-blue-50 rounded-lg">
// //               <h3 className="font-semibold text-blue-800 mb-2">총 회복 횟수</h3>
// //               <p className="text-2xl font-bold text-blue-600">{insights.total_recovery_instances}회</p>
// //             </div>
// //             <div className="text-center p-4 bg-green-50 rounded-lg">
// //               <h3 className="font-semibold text-green-800 mb-2">평균 회복 시간</h3>
// //               <p className="text-2xl font-bold text-green-600">{insights.average_recovery_time}일</p>
// //             </div>
// //             <div className="text-center p-4 bg-purple-50 rounded-lg">
// //               <h3 className="font-semibold text-purple-800 mb-2">최단 회복</h3>
// //               <p className="text-2xl font-bold text-purple-600">{insights.fastest_recovery}일</p>
// //             </div>
// //           </div>
          
// //           {insights.recommendations && (
// //             <div className="mt-4">
// //               <h3 className="font-semibold text-gray-800 mb-2">개인화된 추천</h3>
// //               <ul className="space-y-2">
// //                 {insights.recommendations.map((rec: string, index: number) => (
// //                   <li key={index} className="flex items-start gap-2">
// //                     <span className="text-purple-600 mt-1">•</span>
// //                     <span className="text-gray-700">{rec}</span>
// //                   </li>
// //                 ))}
// //               </ul>
// //             </div>
// //           )}
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default RecoveryRouteFrontend;
// "use client"

// import type React from "react"
// import { useState, useEffect } from "react"
// import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
// import { Calendar, TrendingUp, Heart, Lightbulb, RefreshCw, Filter, ChevronDown, ChevronUp } from "lucide-react"

// const API_BASE = "http://3.236.68.128:8000"

// // 타입 정의
// interface EmotionTimelinePoint {
//   date: string
//   primary_emotion: string
//   emotion_scores: Record<string, number>
//   content_summary: string
//   diary_id: number
// }

// interface RecoverySegment {
//   start_date: string
//   end_date: string
//   start_emotion: string
//   end_emotion: string
//   duration_days: number
//   diary_ids: number[]
// }

// interface RecoveryData {
//   timeline: EmotionTimelinePoint[]
//   recovery_segments: RecoverySegment[]
//   insights: string[]
//   effective_strategies: string[]
//   recovery_triggers: string[]
//   summary: string
//   total_recovery_instances: number
//   average_recovery_days: number
// }

// interface RecoveryInsights {
//   total_recovery_instances: number
//   average_recovery_time: number
//   fastest_recovery: number
//   common_patterns: string[]
//   recommendations: string[]
//   emotion_type?: string
//   message?: string
//   suggestions?: string[]
// }

// interface ChartDataPoint {
//   date: string
//   fullDate: string
//   emotion: string
//   score: number
//   summary: string
// }

// const RecoveryRouteFrontend: React.FC = () => {
//   const [recoveryData, setRecoveryData] = useState<RecoveryData | null>(null)
//   const [insights, setInsights] = useState<RecoveryInsights | null>(null)
//   const [loading, setLoading] = useState<boolean>(false)
//   const [error, setError] = useState<string | null>(null)
//   const [selectedDays, setSelectedDays] = useState<number>(30)
//   const [selectedEmotion, setSelectedEmotion] = useState<string>("")
//   const [expandedSegment, setExpandedSegment] = useState<number | null>(null)
//   const [userId] = useState<number>(2) // 실제로는 로그인된 사용자 ID

//   // API 호출 함수들
//   const fetchRecoveryRoute = async (days = 30): Promise<void> => {
//     setLoading(true)
//     setError(null)

//     try {
//       const response = await fetch(`${API_BASE}/api/recovery/recovery-route/${userId}?days=${days}`)
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`)
//       }
//       const data: RecoveryData = await response.json()
//       setRecoveryData(data)
//     } catch (err) {
//       const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
//       setError(`회복 루트 분석을 가져오는데 실패했습니다: ${errorMessage}`)
//       console.error("Recovery route fetch error:", err)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const fetchRecoveryInsights = async (emotionType = ""): Promise<void> => {
//     try {
//       const url = emotionType
//         ? `${API_BASE}/api/recovery/recovery-insights/${userId}?emotion_type=${encodeURIComponent(emotionType)}`
//         : `${API_BASE}/api/recovery/recovery-insights/${userId}`

//       const response = await fetch(url)
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`)
//       }
//       const data: RecoveryInsights = await response.json()
//       setInsights(data)
//     } catch (err) {
//       console.error("Recovery insights fetch error:", err)
//     }
//   }

//   // 초기 데이터 로드
//   useEffect(() => {
//     fetchRecoveryRoute(selectedDays)
//     fetchRecoveryInsights()
//   }, [])

//   // 기간 변경 핸들러
//   const handleDaysChange = (days: number): void => {
//     setSelectedDays(days)
//     fetchRecoveryRoute(days)
//   }

//   // 감정별 인사이트 조회
//   const handleEmotionFilter = (emotion: string): void => {
//     setSelectedEmotion(emotion)
//     fetchRecoveryInsights(emotion)
//   }

//   // 새로고침
//   const handleRefresh = (): void => {
//     fetchRecoveryRoute(selectedDays)
//     fetchRecoveryInsights(selectedEmotion)
//   }

//   // 감정별 색상 반환
//   const getEmotionColor = (emotion: string): string => {
//     const colors: Record<string, string> = {
//       우울: "#374151",
//       무기력: "#4B5563",
//       불안: "#DC2626",
//       스트레스: "#EA580C",
//       피로: "#D97706",
//       걱정: "#CA8A04",
//       평온: "#059669",
//       만족: "#0891B2",
//       기쁨: "#7C3AED",
//       희망: "#C026D3",
//       활력: "#E11D48",
//       행복: "#10B981",
//     }
//     return colors[emotion] || "#6B7280"
//   }

//   // 감정 점수 변환 (차트용)
//   const convertToScore = (emotion: string): number => {
//     const negativeEmotions = ["우울", "무기력", "불안", "스트레스", "피로", "걱정"]
//     const positiveEmotions = ["평온", "만족", "기쁨", "희망", "활력", "행복"]

//     if (negativeEmotions.includes(emotion)) {
//       return negativeEmotions.indexOf(emotion) * -1 - 1 // -1 to -6
//     } else if (positiveEmotions.includes(emotion)) {
//       return positiveEmotions.indexOf(emotion) + 1 // 1 to 6
//     }
//     return 0
//   }

//   // 차트 데이터 변환
//   const chartData: ChartDataPoint[] =
//     recoveryData?.timeline?.map((point: EmotionTimelinePoint) => ({
//       date: new Date(point.date).toLocaleDateString("ko-KR", { month: "short", day: "numeric" }),
//       fullDate: point.date,
//       emotion: point.primary_emotion,
//       score: convertToScore(point.primary_emotion),
//       summary: point.content_summary,
//     })) || []

//   if (loading && !recoveryData) {
//     return (
//       <div className="flex items-center justify-center h-64 bg-gradient-to-br from-purple-50 to-pink-50">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">회복 루트를 분석하고 있습니다...</p>
//         </div>
//       </div>
//     )
//   }

//   if (error) {
//     return (
//       <div className="max-w-4xl mx-auto p-6">
//         <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
//           <div className="text-red-600 mb-4">
//             <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//               />
//             </svg>
//           </div>
//           <h3 className="text-lg font-semibold text-red-800 mb-2">분석 오류</h3>
//           <p className="text-red-700 mb-4">{error}</p>
//           <button
//             onClick={handleRefresh}
//             className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
//           >
//             다시 시도
//           </button>
//         </div>
//       </div>
//     )
//   }

//   if (!recoveryData) {
//     return (
//       <div className="max-w-4xl mx-auto p-6">
//         <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
//           <div className="text-yellow-600 mb-4">
//             <Calendar className="w-12 h-12 mx-auto" />
//           </div>
//           <h3 className="text-lg font-semibold text-yellow-800 mb-2">데이터 부족</h3>
//           <p className="text-yellow-700">회복 루트 분석을 위해서는 더 많은 일기 데이터가 필요합니다.</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="max-w-7xl mx-auto p-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 min-h-screen">
//       {/* 헤더 */}
//       <div className="text-center mb-8">
//         <div className="flex items-center justify-center gap-3 mb-4">
//           <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg">
//             <TrendingUp className="w-8 h-8 text-white" />
//           </div>
//           <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
//             나의 회복 루트
//           </h1>
//           <button
//             onClick={handleRefresh}
//             disabled={loading}
//             className="ml-4 p-3 text-purple-600 hover:bg-purple-100 rounded-xl transition-all duration-300 disabled:opacity-50 hover:scale-105 shadow-md"
//           >
//             <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
//           </button>
//         </div>
//         <p className="text-gray-600">감정 변화의 흐름을 추적하고 나만의 회복 패턴을 발견해보세요</p>
//       </div>

//       {/* 컨트롤 바 */}
//       <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-xl border border-white/20">
//         <div className="flex flex-wrap items-center gap-4">
//           <div className="flex items-center gap-2">
//             <Calendar className="w-5 h-5 text-gray-500" />
//             <span className="text-sm font-medium text-gray-700">분석 기간:</span>
//             {[7, 14, 30, 60, 90].map((days) => (
//               <button
//                 key={days}
//                 onClick={() => handleDaysChange(days)}
//                 className={`px-3 py-1 rounded-full text-sm transition-colors ${
//                   selectedDays === days ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
//                 }`}
//               >
//                 {days}일
//               </button>
//             ))}
//           </div>

//           <div className="flex items-center gap-2">
//             <Filter className="w-5 h-5 text-gray-500" />
//             <span className="text-sm font-medium text-gray-700">감정 필터:</span>
//             <select
//               value={selectedEmotion}
//               onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleEmotionFilter(e.target.value)}
//               className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
//             >
//               <option value="">전체</option>
//               <option value="우울">우울</option>
//               <option value="불안">불안</option>
//               <option value="스트레스">스트레스</option>
//               <option value="기쁨">기쁨</option>
//               <option value="만족">만족</option>
//               <option value="평온">평온</option>
//             </select>
//           </div>
//         </div>
//       </div>

//       {/* 통계 카드 */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
//         <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105">
//           <div className="flex items-center gap-3">
//             <Heart className="w-6 h-6 text-red-500" />
//             <div>
//               <h3 className="font-semibold text-gray-800">회복 횟수</h3>
//               <p className="text-2xl font-bold text-purple-600">{recoveryData?.total_recovery_instances || 0}회</p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105">
//           <div className="flex items-center gap-3">
//             <Calendar className="w-6 h-6 text-blue-500" />
//             <div>
//               <h3 className="font-semibold text-gray-800">평균 회복 기간</h3>
//               <p className="text-2xl font-bold text-purple-600">
//                 {recoveryData?.average_recovery_days?.toFixed(1) || 0}일
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105">
//           <div className="flex items-center gap-3">
//             <TrendingUp className="w-6 h-6 text-green-500" />
//             <div>
//               <h3 className="font-semibold text-gray-800">최단 회복</h3>
//               <p className="text-2xl font-bold text-purple-600">
//                 {recoveryData?.recovery_segments
//                   ? Math.min(...recoveryData.recovery_segments.map((s: RecoverySegment) => s.duration_days))
//                   : 0}
//                 일
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105">
//           <div className="flex items-center gap-3">
//             <Lightbulb className="w-6 h-6 text-yellow-500" />
//             <div>
//               <h3 className="font-semibold text-gray-800">분석 일기</h3>
//               <p className="text-2xl font-bold text-purple-600">{recoveryData?.timeline?.length || 0}개</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* 감정 타임라인 차트 */}
//       <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl mb-8 border border-white/20">
//         <h2 className="text-xl font-bold text-gray-800 mb-4">감정 변화 타임라인</h2>
//         {chartData.length > 0 ? (
//           <ResponsiveContainer width="100%" height={350}>
//             <LineChart data={chartData}>
//               <XAxis dataKey="date" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={60} />
//               <YAxis domain={[-6, 6]} />
//               <Tooltip
//                 content={({ active, payload, label }: any) => {
//                   if (active && payload && payload.length) {
//                     const data = payload[0].payload
//                     return (
//                       <div className="bg-white p-4 border rounded-lg shadow-lg max-w-xs">
//                         <p className="font-semibold mb-2">{label}</p>
//                         <div className="flex items-center gap-2 mb-2">
//                           <div
//                             className="w-3 h-3 rounded-full"
//                             style={{ backgroundColor: getEmotionColor(data.emotion) }}
//                           ></div>
//                           <span className="font-medium">{data.emotion}</span>
//                         </div>
//                         <p className="text-sm text-gray-600">{data.summary}</p>
//                       </div>
//                     )
//                   }
//                   return null
//                 }}
//               />
//               <Line
//                 type="monotone"
//                 dataKey="score"
//                 stroke="#8B5CF6"
//                 strokeWidth={3}
//                 dot={{ fill: "#8B5CF6", strokeWidth: 2, r: 5 }}
//                 activeDot={{ r: 7, fill: "#7C3AED" }}
//               />
//               <ReferenceLine y={0} stroke="#6B7280" strokeDasharray="5 5" />
//             </LineChart>
//           </ResponsiveContainer>
//         ) : (
//           <div className="text-center py-8 text-gray-500">차트를 표시할 데이터가 부족합니다.</div>
//         )}
//       </div>

//       {/* 회복 구간 상세 */}
//       {recoveryData?.recovery_segments && recoveryData.recovery_segments.length > 0 && (
//         <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl mb-8 border border-white/20">
//           <h2 className="text-xl font-bold text-gray-800 mb-6">회복 과정 상세 분석</h2>
//           <div className="space-y-4">
//             {recoveryData.recovery_segments.map((segment: RecoverySegment, index: number) => (
//               <div
//                 key={index}
//                 className="border border-gray-200/50 rounded-xl p-6 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-gray-50/50 to-white/50 backdrop-blur-sm"
//               >
//                 <div
//                   className="flex items-center justify-between cursor-pointer"
//                   onClick={() => setExpandedSegment(expandedSegment === index ? null : index)}
//                 >
//                   <div className="flex items-center gap-4">
//                     <h3 className="text-lg font-semibold text-gray-800">회복 과정 {index + 1}</h3>
//                     <div className="flex items-center gap-2">
//                       <div
//                         className="w-4 h-4 rounded-full"
//                         style={{ backgroundColor: getEmotionColor(segment.start_emotion) }}
//                       ></div>
//                       <span className="text-sm font-medium">{segment.start_emotion}</span>
//                       <span className="text-gray-400">→</span>
//                       <div
//                         className="w-4 h-4 rounded-full"
//                         style={{ backgroundColor: getEmotionColor(segment.end_emotion) }}
//                       ></div>
//                       <span className="text-sm font-medium">{segment.end_emotion}</span>
//                     </div>
//                     <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
//                       {segment.duration_days}일
//                     </span>
//                   </div>
//                   {expandedSegment === index ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
//                 </div>

//                 {expandedSegment === index && (
//                   <div className="mt-4 pt-4 border-t border-gray-200">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       <div>
//                         <h4 className="font-semibold text-gray-800 mb-2">기간 정보</h4>
//                         <p className="text-sm text-gray-600">
//                           시작: {new Date(segment.start_date).toLocaleDateString("ko-KR")}
//                         </p>
//                         <p className="text-sm text-gray-600">
//                           종료: {new Date(segment.end_date).toLocaleDateString("ko-KR")}
//                         </p>
//                         <p className="text-sm text-gray-600">소요 기간: {segment.duration_days}일</p>
//                       </div>
//                       <div>
//                         <h4 className="font-semibold text-gray-800 mb-2">관련 일기</h4>
//                         <p className="text-sm text-gray-600">
//                           {segment.diary_ids?.length || 0}개의 일기가 이 회복 과정에 포함되었습니다.
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* 회복 인사이트 */}
//       {recoveryData?.insights && recoveryData.insights.length > 0 && (
//         <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl mb-8 border border-white/20">
//           <div className="flex items-center gap-2 mb-6">
//             <Lightbulb className="w-6 h-6 text-yellow-500" />
//             <h2 className="text-xl font-bold text-gray-800">나만의 회복 인사이트</h2>
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {recoveryData.insights.map((insight: string, index: number) => (
//               <div
//                 key={index}
//                 className="bg-gradient-to-r from-purple-50/80 to-pink-50/80 rounded-xl p-6 backdrop-blur-sm border border-purple-100/50 hover:shadow-md transition-all duration-300"
//               >
//                 <div className="flex items-start gap-3">
//                   <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
//                   <p className="text-gray-700">{insight}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* 효과적인 전략들 */}
//       {recoveryData?.effective_strategies && recoveryData.effective_strategies.length > 0 && (
//         <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 rounded-2xl p-8 text-white shadow-2xl border border-purple-400/20">
//           <h2 className="text-xl font-bold mb-4">💡 나만의 회복 레시피</h2>
//           <p className="mb-4 opacity-90">당신의 회복 패턴을 분석한 결과, 다음과 같은 방법들이 가장 효과적이었습니다:</p>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             {recoveryData.effective_strategies.slice(0, 3).map((strategy: string, index: number) => (
//               <div
//                 key={index}
//                 className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/30 transition-all duration-300"
//               >
//                 <h3 className="font-semibold mb-2">✨ {strategy}</h3>
//                 <p className="text-sm opacity-90">효과적인 회복 전략으로 확인되었습니다</p>
//               </div>
//             ))}
//           </div>

//           {recoveryData.summary && (
//             <div className="mt-6 p-4 bg-white bg-opacity-20 rounded-lg">
//               <h3 className="font-semibold mb-2">📊 분석 요약</h3>
//               <p className="text-sm opacity-90">{recoveryData.summary}</p>
//             </div>
//           )}
//         </div>
//       )}

//       {/* 개별 감정 인사이트 */}
//       {insights && insights.total_recovery_instances > 0 && (
//         <div className="mt-8 bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
//           <h2 className="text-xl font-bold text-gray-800 mb-4">
//             {selectedEmotion ? `${selectedEmotion} 감정` : "전체"} 회복 통계
//           </h2>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div className="text-center p-6 bg-blue-50/80 backdrop-blur-sm rounded-xl border border-blue-100/50 hover:shadow-md transition-all duration-300">
//               <h3 className="font-semibold text-blue-800 mb-2">총 회복 횟수</h3>
//               <p className="text-2xl font-bold text-blue-600">{insights.total_recovery_instances}회</p>
//             </div>
//             <div className="text-center p-6 bg-green-50/80 backdrop-blur-sm rounded-xl border border-green-100/50 hover:shadow-md transition-all duration-300">
//               <h3 className="font-semibold text-green-800 mb-2">평균 회복 시간</h3>
//               <p className="text-2xl font-bold text-green-600">{insights.average_recovery_time}일</p>
//             </div>
//             <div className="text-center p-6 bg-purple-50/80 backdrop-blur-sm rounded-xl border border-purple-100/50 hover:shadow-md transition-all duration-300">
//               <h3 className="font-semibold text-purple-800 mb-2">최단 회복</h3>
//               <p className="text-2xl font-bold text-purple-600">{insights.fastest_recovery}일</p>
//             </div>
//           </div>

//           {insights.recommendations && (
//             <div className="mt-4">
//               <h3 className="font-semibold text-gray-800 mb-2">개인화된 추천</h3>
//               <ul className="space-y-2">
//                 {insights.recommendations.map((rec: string, index: number) => (
//                   <li key={index} className="flex items-start gap-2">
//                     <span className="text-purple-600 mt-1">•</span>
//                     <span className="text-gray-700">{rec}</span>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   )
// }

// export default RecoveryRouteFrontend
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import { Calendar, TrendingUp, Heart, Lightbulb, RefreshCw, Filter, ChevronDown, ChevronUp } from "lucide-react"

const API_BASE = "http://3.236.68.128:8000"

// 타입 정의
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
    }
    return colors[emotion] || "#6b7280"
  }

  // 감정 점수 변환 (차트용)
  const convertToScore = (emotion: string): number => {
    const negativeEmotions = ["우울", "무기력", "불안", "스트레스", "피로", "걱정"]
    const positiveEmotions = ["평온", "만족", "기쁨", "희망", "활력", "행복"]

    if (negativeEmotions.includes(emotion)) {
      return negativeEmotions.indexOf(emotion) * -1 - 1 // -1 to -6
    } else if (positiveEmotions.includes(emotion)) {
      return positiveEmotions.indexOf(emotion) + 1 // 1 to 6
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
                    domain={[-6, 6]}
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
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
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-3">관련 일기</h4>
                          <p className="text-sm text-slate-600">
                            {segment.diary_ids?.length || 0}개의 일기가 이 회복 과정에 포함되었습니다.
                          </p>
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
                <p className="text-slate-300 leading-relaxed">{recoveryData.summary}</p>
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


// import React, { useState, useEffect, useRef } from 'react';
// import { X, MapPin, Cloud, Sparkles, Save, Eye, EyeOff, Hash, Calendar, Clock, Lightbulb, Brain } from 'lucide-react';

// // Props 타입 정의
// interface DiaryWriteModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSave?: (result: any) => void;
//   currentUser?: {
//     id: number;
//     nickname?: string;
//     email?: string;
//   };
// }

// // 감정 회고 응답 타입
// interface EmotionRecallResponse {
//   recallSummary: string;
// }

// const DiaryWriteModal: React.FC<DiaryWriteModalProps> = ({ 
//   isOpen, 
//   onClose, 
//   onSave,
//   currentUser 
// }) => {
//   const [content, setContent] = useState('');
//   const [isPublic, setIsPublic] = useState(false);
//   const [isPreview, setIsPreview] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
  
//   // 감정 회고 관련 상태
//   const [emotionRecall, setEmotionRecall] = useState<string | null>(null);
//   const [isRecallLoading, setIsRecallLoading] = useState(false);
//   const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
//   const [showRecallOverlay, setShowRecallOverlay] = useState(false);
  
//   const textareaRef = useRef<HTMLTextAreaElement>(null);
//   const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
//   const lastContentRef = useRef<string>('');

//   // 현재 날짜와 시간
//   const getCurrentDateTime = () => {
//     const now = new Date();
//     return {
//       date: now.toLocaleDateString("ko-KR", {
//         year: "numeric",
//         month: "long",
//         day: "numeric",
//         weekday: "long",
//       }),
//       time: now.toLocaleTimeString("ko-KR", {
//         hour: "2-digit",
//         minute: "2-digit",
//       }),
//     };
//   };

//   const { date, time } = getCurrentDateTime();

//   // 마우스 위치 추적
//   useEffect(() => {
//     const handleMouseMove = (e: MouseEvent) => {
//       setMousePosition({ x: e.clientX, y: e.clientY });
//     };

//     document.addEventListener('mousemove', handleMouseMove);
//     return () => {
//       document.removeEventListener('mousemove', handleMouseMove);
//     };
//   }, []);

//   // 감정 회고 API 호출
//   const fetchEmotionRecall = async (text: string) => {
//     // 개발 환경에서 임시 사용자 ID 사용
//     const userId = currentUser?.id || 
//                    (process.env.NEXT_PUBLIC_DEV_MODE === 'true' ? 
//                     Number(process.env.NEXT_PUBLIC_DEV_USER_ID) : null);
    
//     if (!userId) {
//       console.log('⚠️ 사용자 정보가 없어 감정 회고를 요청할 수 없습니다');
//       return;
//     }
    
//     if (!text.trim() || text.length < 10) {
//       console.log('⚠️ 감정 회고 요청 스킵:', { 
//         userId: userId,
//         textLength: text.length,
//         reason: text.length < 10 ? '텍스트 너무 짧음' : '알 수 없음'
//       });
//       return;
//     }

//     setIsRecallLoading(true);
//     console.log('🧠 감정 회고 API 요청 시작...', { 
//       userId: userId,
//       textLength: text.length,
//       textPreview: text.substring(0, 50) + '...',
//       isDevMode: process.env.NEXT_PUBLIC_DEV_MODE === 'true'
//     });

//     try {
//       const requestData = {
//         userId: userId,
//         text: text.trim(),
//       };
      
//       console.log('📤 요청 데이터:', requestData);
      
//       // 환경별 API URL 설정 (Lambda API Gateway)
//       const apiUrl = process.env.NEXT_PUBLIC_EMOTION_RECALL_API || 
//                      'https://3s71d8d8je.execute-api.us-east-1.amazonaws.com/prod/api/diary/emotion-recall';
      
//       console.log('🌐 API URL:', apiUrl);
      
//       const headers: HeadersInit = {
//         'Content-Type': 'application/json',
//         'Accept': 'application/json',
//       };

//       // JWT 토큰이 있다면 추가
//       const authToken = localStorage.getItem('auth-token');
//       if (authToken) {
//         headers['Authorization'] = `Bearer ${authToken}`;
//         console.log('🔐 인증 토큰 사용 중');
//       }
      
//       const response = await fetch(apiUrl, {
//         method: 'POST',
//         headers,
//         body: JSON.stringify(requestData),
//       });

//       console.log('📥 응답 상태:', {
//         status: response.status,
//         statusText: response.statusText,
//         url: response.url
//       });

//       if (response.ok) {
//         const result: EmotionRecallResponse = await response.json();
//         console.log('✅ 감정 회고 응답 성공:', result);
        
//         if (result.recallSummary) {
//           setEmotionRecall(result.recallSummary);
//           setShowRecallOverlay(true);
          
//           // 8초 후 자동으로 오버레이 숨김 (좀 더 길게)
//           setTimeout(() => {
//             setShowRecallOverlay(false);
//           }, 8000);
//         } else {
//           console.warn('⚠️ 응답에 recallSummary가 없음:', result);
//         }
//       } else {
//         const errorText = await response.text().catch(() => '응답을 읽을 수 없습니다');
//         console.error('❌ 감정 회고 API 응답 실패:', {
//           status: response.status,
//           statusText: response.statusText,
//           errorBody: errorText
//         });
        
//         // 에러 상태별 처리 (사용자에게는 조용히)
//         if (response.status === 401) {
//           console.error('🔐 인증 오류 - 로그인이 필요합니다');
//         } else if (response.status === 403) {
//           console.error('🚫 접근 권한 없음');
//         } else if (response.status >= 500) {
//           console.error('🚨 서버 오류 - 감정 회고 서비스 일시 중단');
//         } else {
//           console.error('❓ 알 수 없는 오류:', response.status);
//         }
//       }
//     } catch (error) {
//       console.error('❌ 감정 회고 API 네트워크 오류:', error);
      
//       // 네트워크 오류 시에도 조용히 처리 (사용자 경험 방해하지 않음)
//       if (error instanceof TypeError && error.message.includes('fetch')) {
//         console.error('🌐 네트워크 연결 문제로 감정 회고를 사용할 수 없습니다');
//       }
//     } finally {
//       setIsRecallLoading(false);
//     }
//   };

//   // 텍스트 변경 감지 및 3초 타이머
//   useEffect(() => {
//     if (content !== lastContentRef.current) {
//       lastContentRef.current = content;
      
//       // 기존 타이머 취소
//       if (typingTimeoutRef.current) {
//         clearTimeout(typingTimeoutRef.current);
//       }

//       // 오버레이 숨김
//       setShowRecallOverlay(false);

//       // 3초 후 감정 회고 요청
//       if (content.trim().length > 10) {
//         typingTimeoutRef.current = setTimeout(() => {
//           fetchEmotionRecall(content);
//         }, 300);
//       }
//     }

//     return () => {
//       if (typingTimeoutRef.current) {
//         clearTimeout(typingTimeoutRef.current);
//       }
//     };
//   }, [content, currentUser]);

//   // 컴포넌트 언마운트 시 타이머 정리
//   useEffect(() => {
//     return () => {
//       if (typingTimeoutRef.current) {
//         clearTimeout(typingTimeoutRef.current);
//       }
//     };
//   }, []);

//   // 저장 처리 (실제 사용자 ID 사용)
//   const handleSave = async () => {
//     if (!content.trim()) {
//       alert('일기 내용을 입력해주세요.');
//       return;
//     }

//     // 개발 환경에서 임시 사용자 ID 사용
//     const userId = currentUser?.id || 
//                    (process.env.NEXT_PUBLIC_DEV_MODE === 'true' ? 
//                     Number(process.env.NEXT_PUBLIC_DEV_USER_ID) : null);

//     if (!userId) {
//       alert('사용자 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
//       return;
//     }

//     setIsLoading(true);
//     try {
//       // API URL도 환경변수 사용 (Lambda API Gateway)
//       const apiUrl = process.env.NEXT_PUBLIC_DIARY_SAVE_API || 
//                      'https://3s71d8d8je.execute-api.us-east-1.amazonaws.com/prod/api/diary/lambda-post';

//       console.log('💾 일기 저장 API 호출:', { userId, apiUrl, isDevMode: process.env.NEXT_PUBLIC_DEV_MODE });

//       const response = await fetch(apiUrl, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           content: content.trim(),
//           isPublic: isPublic,
//           userId: userId,
//         }),
//       });

//       if (response.ok) {
//         const result = await response.json();
//         console.log('일기 저장 성공:', result);
        
//         // 성공 알림
//         alert(`✨ 일기가 성공적으로 저장되었습니다!\n사용자 ID: ${userId}\n감정 분석이 완료되면 결과를 확인할 수 있습니다.`);
        
//         // 부모 컴포넌트에 저장 완료 알림
//         onSave?.(result);
        
//         // 모달 닫기
//         onClose();
        
//         // 폼 초기화
//         setContent('');
//         setIsPublic(false);
//         setEmotionRecall(null);
//         setShowRecallOverlay(false);
//       } else {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(errorData.message || `HTTP ${response.status}: 일기 저장에 실패했습니다.`);
//       }
//     } catch (error) {
//       console.error('일기 저장 오류:', error);
//       const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
//       alert(`일기 저장 중 오류가 발생했습니다:\n${errorMessage}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 overflow-y-auto">
//       {/* 배경 오버레이 */}
//       <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300" onClick={onClose} />
      
//       {/* 감정 회고 오버레이 */}
//       {showRecallOverlay && emotionRecall && (
//         <div 
//           className="fixed z-[60] max-w-sm bg-gradient-to-br from-purple-600 to-blue-600 text-white p-4 rounded-xl shadow-2xl transform transition-all duration-300 pointer-events-none"
//           style={{
//             left: Math.min(mousePosition.x + 10, window.innerWidth - 400),
//             top: Math.max(mousePosition.y - 10, 10),
//           }}
//         >
//           <div className="flex items-start space-x-3">
//             <div className="p-2 bg-white/20 rounded-lg flex-shrink-0">
//               <Brain className="w-5 h-5 text-white" />
//             </div>
//             <div className="flex-1">
//               <h4 className="font-semibold text-sm mb-2 flex items-center">
//                 <Sparkles className="w-4 h-4 mr-1" />
//                 과거의 나를 되돌아보며...
//               </h4>
//               <p className="text-sm leading-relaxed text-white/90">
//                 {emotionRecall}
//               </p>
//             </div>
//             <button
//               onClick={() => setShowRecallOverlay(false)}
//               className="text-white/70 hover:text-white transition-colors pointer-events-auto"
//             >
//               <X className="w-4 h-4" />
//             </button>
//           </div>
          
//           {/* 화살표 */}
//           <div className="absolute -bottom-2 left-6 w-4 h-4 bg-gradient-to-br from-purple-600 to-blue-600 transform rotate-45"></div>
//         </div>
//       )}

//       {/* 로딩 인디케이터 */}
//       {isRecallLoading && (
//         <div 
//           className="fixed z-[60] bg-white p-3 rounded-lg shadow-lg border-2 border-purple-200 pointer-events-none"
//           style={{
//             left: Math.min(mousePosition.x + 10, window.innerWidth - 200),
//             top: Math.max(mousePosition.y - 10, 10),
//           }}
//         >
//           <div className="flex items-center space-x-2 text-purple-600">
//             <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
//             <span className="text-sm font-medium">과거 기억 탐색 중...</span>
//           </div>
//         </div>
//       )}
      
//       {/* 모달 컨테이너 */}
//       <div className="flex min-h-full items-center justify-center p-4">
//         <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl transform transition-all duration-300">
          
//           {/* 헤더 */}
//           <div className="flex items-center justify-between p-6 border-b border-slate-200">
//             <div className="flex items-center space-x-4">
//               <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
//                 <Sparkles className="w-6 h-6 text-white" />
//               </div>
//               <div>
//                 <h2 className="text-xl font-bold text-slate-900">새로운 이야기</h2>
//                 <p className="text-sm text-slate-500 flex items-center space-x-2">
//                   <Calendar className="w-4 h-4" />
//                   <span>{date}</span>
//                   <Clock className="w-4 h-4 ml-2" />
//                   <span>{time}</span>
//                 </p>
//               </div>
//             </div>
            
//             <div className="flex items-center space-x-3">
//               <button
//                 onClick={() => setIsPreview(!isPreview)}
//                 className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
//                 title={isPreview ? "편집 모드" : "미리보기"}
//               >
//                 {isPreview ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//               </button>
//               <button
//                 onClick={onClose}
//                 className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>
//           </div>

//           {/* 메인 컨텐츠 */}
//           <div className="p-6 max-h-[70vh] overflow-y-auto">
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
//               {/* 작성 영역 */}
//               <div className="lg:col-span-2 space-y-6">
                
//                 {/* 텍스트 입력 영역 */}
//                 <div className="space-y-4">
//                   {isPreview ? (
//                     <div className="min-h-[300px] p-6 bg-slate-50 rounded-xl border border-slate-200">
//                       <div className="prose max-w-none">
//                         {content ? (
//                           <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
//                             {content}
//                           </div>
//                         ) : (
//                           <p className="text-slate-400 italic">미리볼 내용이 없습니다.</p>
//                         )}
//                       </div>
//                     </div>
//                   ) : (
//                     <div className="relative">
//                       <textarea
//                         ref={textareaRef}
//                         value={content}
//                         onChange={(e) => setContent(e.target.value)}
//                         placeholder="오늘은 어떤 하루였나요? 마음속 이야기를 자유롭게 적어보세요..."
//                         className="w-full h-96 p-6 border border-slate-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-700 leading-relaxed placeholder:text-slate-400"
//                       />
//                       <div className="absolute bottom-3 right-3 flex items-center space-x-2">
//                         {isRecallLoading && (
//                           <div className="flex items-center space-x-1 text-purple-500">
//                             <Brain className="w-3 h-3 animate-pulse" />
//                             <span className="text-xs">분석 중...</span>
//                           </div>
//                         )}
//                         <span className="text-xs text-slate-400">
//                           {content.length} 글자
//                         </span>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* 사이드바 */}
//               <div className="space-y-6">
                
//                 {/* 공개 설정 */}
//                 <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
//                   <div className="mb-4">
//                     <h3 className="font-semibold text-slate-800 mb-2">공개 설정</h3>
//                     <p className="text-sm text-slate-600">다른 사용자와 감정을 나눠보세요</p>
//                   </div>
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center space-x-3">
//                       <span className="text-sm text-slate-600">비공개</span>
//                       <button
//                         onClick={() => setIsPublic(!isPublic)}
//                         className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
//                           isPublic ? 'bg-blue-600' : 'bg-slate-300'
//                         }`}
//                       >
//                         <span
//                           className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
//                             isPublic ? 'translate-x-6' : 'translate-x-1'
//                           }`}
//                         />
//                       </button>
//                       <span className="text-sm text-slate-600">공개</span>
//                     </div>
//                   </div>
//                   <div className="mt-4 text-xs text-slate-500">
//                     {isPublic ? (
//                       <div className="flex items-center space-x-1 text-blue-600">
//                         <span>✨</span>
//                         <span>다른 사용자들이 회원님의 일기를 볼 수 있습니다</span>
//                       </div>
//                     ) : (
//                       <div className="flex items-center space-x-1 text-slate-500">
//                         <span>🔒</span>
//                         <span>오직 회원님만 볼 수 있는 개인 일기입니다</span>
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 {/* 작성 팁 */}
//                 <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-200">
//                   <div className="flex items-center space-x-3 mb-4">
//                     <div className="p-2 bg-amber-600 rounded-lg">
//                       <Lightbulb className="w-4 h-4 text-white" />
//                     </div>
//                     <h3 className="font-semibold text-slate-800">작성 팁</h3>
//                   </div>
//                   <div className="space-y-3 text-sm text-slate-600">
//                     <div className="flex items-start space-x-2">
//                       <span className="text-amber-500 font-medium">💭</span>
//                       <span>솔직한 감정을 표현해보세요</span>
//                     </div>
//                     <div className="flex items-start space-x-2">
//                       <span className="text-amber-500 font-medium">📝</span>
//                       <span>구체적인 상황을 적으면 더 좋아요</span>
//                     </div>
//                     <div className="flex items-start space-x-2">
//                       <span className="text-amber-500 font-medium">🧠</span>
//                       <span>작성 중 잠시 멈추면 AI가 도움을 드려요</span>
//                     </div>
//                   </div>
//                 </div>

//                 {/* 저장 안내 */}
//                 <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
//                   <div className="flex items-center space-x-3 mb-4">
//                     <div className="p-2 bg-green-600 rounded-lg">
//                       <Save className="w-4 h-4 text-white" />
//                     </div>
//                     <h3 className="font-semibold text-slate-800">자동 분석</h3>
//                   </div>
//                   <div className="space-y-3 text-sm text-slate-600">
//                     <div className="flex items-start space-x-2">
//                       <span className="text-green-500 font-medium">🎯</span>
//                       <span>저장하면 AI가 감정을 자동 분석해요</span>
//                     </div>
//                     <div className="flex items-start space-x-2">
//                       <span className="text-green-500 font-medium">📊</span>
//                       <span>감정 패턴과 통계를 확인할 수 있어요</span>
//                     </div>
//                     <div className="flex items-start space-x-2">
//                       <span className="text-green-500 font-medium">🏷️</span>
//                       <span>관련 태그가 자동으로 생성됩니다</span>
//                     </div>
//                   </div>
//                 </div>

//                 {/* 오늘의 날씨 */}
//                 <div className="bg-gradient-to-br from-sky-50 to-blue-50 p-6 rounded-xl border border-sky-200">
//                   <div className="flex items-center space-x-3 mb-4">
//                     <div className="p-2 bg-sky-600 rounded-lg">
//                       <Cloud className="w-4 h-4 text-white" />
//                     </div>
//                     <h3 className="font-semibold text-slate-800">오늘의 기록</h3>
//                   </div>
//                   <div className="space-y-3 text-sm text-slate-600">
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center space-x-2">
//                         <Cloud className="w-4 h-4 text-sky-500" />
//                         <span>날씨</span>
//                       </div>
//                       <span className="font-medium">맑음 22°C</span>
//                     </div>
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center space-x-2">
//                         <MapPin className="w-4 h-4 text-green-500" />
//                         <span>위치</span>
//                       </div>
//                       <span className="font-medium">인천</span>
//                     </div>
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center space-x-2">
//                         <Clock className="w-4 h-4 text-purple-500" />
//                         <span>시간</span>
//                       </div>
//                       <span className="font-medium">{time}</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* 푸터 */}
//           <div className="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
//             <div className="text-sm text-slate-500">
//               자동 저장이 활성화되어 있습니다
//             </div>
//             <div className="flex space-x-3">
//               <button
//                 onClick={onClose}
//                 className="px-6 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
//               >
//                 취소
//               </button>
//               <button
//                 onClick={handleSave}
//                 disabled={isLoading || !content.trim()}
//                 className="px-8 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
//               >
//                 {isLoading ? (
//                   <>
//                     <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                     <span>저장 중...</span>
//                   </>
//                 ) : (
//                   <>
//                     <Save className="w-4 h-4" />
//                     <span>일기 저장</span>
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DiaryWriteModal;
import React, { useState, useEffect, useRef } from 'react';
import { X, MapPin, Cloud, Sparkles, Save, Eye, EyeOff, Hash, Calendar, Clock, Lightbulb, Brain } from 'lucide-react';

// Props 타입 정의
interface DiaryWriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (result: any) => void;
  currentUser?: {
    id: number;
    nickname?: string;
    email?: string;
  };
}

// 감정 회고 응답 타입
interface EmotionRecallResponse {
  recallSummary: string;
}

const DiaryWriteModal: React.FC<DiaryWriteModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave,
  currentUser 
}) => {
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // 감정 회고 관련 상태
  const [emotionRecall, setEmotionRecall] = useState<string | null>(null);
  const [isRecallLoading, setIsRecallLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showRecallOverlay, setShowRecallOverlay] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastContentRef = useRef<string>('');

  // 현재 날짜와 시간
  const getCurrentDateTime = () => {
    const now = new Date();
    return {
      date: now.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
      }),
      time: now.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const { date, time } = getCurrentDateTime();

  // 마우스 위치 추적
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // 감정 회고 API 호출
  const fetchEmotionRecall = async (text: string) => {
    // 개발 환경에서 임시 사용자 ID 사용
    const userId = currentUser?.id || 
                   (process.env.NEXT_PUBLIC_DEV_MODE === 'true' ? 
                    Number(process.env.NEXT_PUBLIC_DEV_USER_ID) : null);
    
    if (!userId) {
      console.log('⚠️ 사용자 정보가 없어 감정 회고를 요청할 수 없습니다');
      return;
    }
    
    if (!text.trim() || text.length < 10) {
      console.log('⚠️ 감정 회고 요청 스킵:', { 
        userId: userId,
        textLength: text.length,
        reason: text.length < 10 ? '텍스트 너무 짧음' : '알 수 없음'
      });
      return;
    }

    setIsRecallLoading(true);
    console.log('🧠 감정 회고 API 요청 시작...', { 
      userId: userId,
      textLength: text.length,
      textPreview: text.substring(0, 50) + '...',
      isDevMode: process.env.NEXT_PUBLIC_DEV_MODE === 'true'
    });

    try {
      const requestData = {
        userId: userId,
        text: text.trim(),
      };
      
      console.log('📤 요청 데이터:', requestData);
      
      // 환경별 API URL 설정 (Lambda API Gateway)
      const apiUrl = process.env.NEXT_PUBLIC_EMOTION_RECALL_API || 
                     'https://3s71d8d8je.execute-api.us-east-1.amazonaws.com/prod/api/diary/emotion-recall';
      
      console.log('🌐 API URL:', apiUrl);
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      // JWT 토큰이 있다면 추가
      const authToken = localStorage.getItem('auth-token');
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
        console.log('🔐 인증 토큰 사용 중');
      }
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestData),
      });

      console.log('📥 응답 상태:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });

      if (response.ok) {
        const result: EmotionRecallResponse = await response.json();
        console.log('✅ 감정 회고 응답 성공:', result);
        
        if (result.recallSummary) {
          setEmotionRecall(result.recallSummary);
          setShowRecallOverlay(true);
          
          // 8초 후 자동으로 오버레이 숨김 (좀 더 길게)
          setTimeout(() => {
            setShowRecallOverlay(false);
          }, 8000);
        } else {
          console.warn('⚠️ 응답에 recallSummary가 없음:', result);
        }
      } else {
        const errorText = await response.text().catch(() => '응답을 읽을 수 없습니다');
        console.error('❌ 감정 회고 API 응답 실패:', {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText
        });
        
        // 에러 상태별 처리 (사용자에게는 조용히)
        if (response.status === 401) {
          console.error('🔐 인증 오류 - 로그인이 필요합니다');
        } else if (response.status === 403) {
          console.error('🚫 접근 권한 없음');
        } else if (response.status >= 500) {
          console.error('🚨 서버 오류 - 감정 회고 서비스 일시 중단');
        } else {
          console.error('❓ 알 수 없는 오류:', response.status);
        }
      }
    } catch (error) {
      console.error('❌ 감정 회고 API 네트워크 오류:', error);
      
      // 네트워크 오류 시에도 조용히 처리 (사용자 경험 방해하지 않음)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('🌐 네트워크 연결 문제로 감정 회고를 사용할 수 없습니다');
      }
    } finally {
      setIsRecallLoading(false);
    }
  };

  // 텍스트 변경 감지 및 3초 타이머
  useEffect(() => {
    if (content !== lastContentRef.current) {
      lastContentRef.current = content;
      
      // 기존 타이머 취소
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // 오버레이 숨김
      setShowRecallOverlay(false);

      // 3초 후 감정 회고 요청
      if (content.trim().length > 10) {
        typingTimeoutRef.current = setTimeout(() => {
          fetchEmotionRecall(content);
        }, 300);
      }
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [content, currentUser]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // 저장 처리 (실제 사용자 ID 사용)
  const handleSave = async () => {
    if (!content.trim()) {
      alert('일기 내용을 입력해주세요.');
      return;
    }

    // 개발 환경에서 임시 사용자 ID 사용
    const userId = currentUser?.id || 
                   (process.env.NEXT_PUBLIC_DEV_MODE === 'true' ? 
                    Number(process.env.NEXT_PUBLIC_DEV_USER_ID) : null);

    if (!userId) {
      alert('사용자 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      // API URL도 환경변수 사용 (Lambda API Gateway)
      const apiUrl = process.env.NEXT_PUBLIC_DIARY_SAVE_API || 
                     'https://3s71d8d8je.execute-api.us-east-1.amazonaws.com/prod/api/diary/lambda-post';

      console.log('💾 일기 저장 API 호출:', { userId, apiUrl, isDevMode: process.env.NEXT_PUBLIC_DEV_MODE });

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
          isPublic: isPublic,
          userId: userId,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('일기 저장 성공:', result);
        
        // 성공 알림
        alert(`✨ 일기가 성공적으로 저장되었습니다!\n사용자 ID: ${userId}\n감정 분석이 완료되면 결과를 확인할 수 있습니다.`);
        
        // 부모 컴포넌트에 저장 완료 알림
        onSave?.(result);
        
        // 모달 닫기
        onClose();
        
        // 폼 초기화
        setContent('');
        setIsPublic(false);
        setEmotionRecall(null);
        setShowRecallOverlay(false);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: 일기 저장에 실패했습니다.`);
      }
    } catch (error) {
      console.error('일기 저장 오류:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      alert(`일기 저장 중 오류가 발생했습니다:\n${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 배경 오버레이 */}
      <div className="fixed inset-0 z-[9990] overflow-y-auto">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300" onClick={onClose} />
        
        {/* 모달 컨테이너 */}
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl transform transition-all duration-300 z-[9991]">
            
            {/* 헤더 */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">새로운 이야기</h2>
                  <p className="text-sm text-slate-500 flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{date}</span>
                    <Clock className="w-4 h-4 ml-2" />
                    <span>{time}</span>
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsPreview(!isPreview)}
                  className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  title={isPreview ? "편집 모드" : "미리보기"}
                >
                  {isPreview ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 메인 컨텐츠 */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 작성 영역 */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* 텍스트 입력 영역 */}
                  <div className="space-y-4">
                    {isPreview ? (
                      <div className="min-h-[300px] p-6 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="prose max-w-none">
                          {content ? (
                            <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                              {content}
                            </div>
                          ) : (
                            <p className="text-slate-400 italic">미리볼 내용이 없습니다.</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <textarea
                          ref={textareaRef}
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          placeholder="오늘은 어떤 하루였나요? 마음속 이야기를 자유롭게 적어보세요..."
                          className="w-full h-96 p-6 border border-slate-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-700 leading-relaxed placeholder:text-slate-400"
                        />
                        <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                          {isRecallLoading && (
                            <div className="flex items-center space-x-1 text-purple-500">
                              <Brain className="w-3 h-3 animate-pulse" />
                              <span className="text-xs">분석 중...</span>
                            </div>
                          )}
                          <span className="text-xs text-slate-400">
                            {content.length} 글자
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 사이드바 */}
                <div className="space-y-6">
                  
                  {/* 공개 설정 */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
                    <div className="mb-4">
                      <h3 className="font-semibold text-slate-800 mb-2">공개 설정</h3>
                      <p className="text-sm text-slate-600">다른 사용자와 감정을 나눠보세요</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-slate-600">비공개</span>
                        <button
                          onClick={() => setIsPublic(!isPublic)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            isPublic ? 'bg-blue-600' : 'bg-slate-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              isPublic ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <span className="text-sm text-slate-600">공개</span>
                      </div>
                    </div>
                    <div className="mt-4 text-xs text-slate-500">
                      {isPublic ? (
                        <div className="flex items-center space-x-1 text-blue-600">
                          <span>✨</span>
                          <span>다른 사용자들이 회원님의 일기를 볼 수 있습니다</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 text-slate-500">
                          <span>🔒</span>
                          <span>오직 회원님만 볼 수 있는 개인 일기입니다</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 작성 팁 */}
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-amber-600 rounded-lg">
                        <Lightbulb className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="font-semibold text-slate-800">작성 팁</h3>
                    </div>
                    <div className="space-y-3 text-sm text-slate-600">
                      <div className="flex items-start space-x-2">
                        <span className="text-amber-500 font-medium">💭</span>
                        <span>솔직한 감정을 표현해보세요</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-amber-500 font-medium">📝</span>
                        <span>구체적인 상황을 적으면 더 좋아요</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-amber-500 font-medium">🧠</span>
                        <span>작성 중 잠시 멈추면 AI가 도움을 드려요</span>
                      </div>
                    </div>
                  </div>

                  {/* 저장 안내 */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-green-600 rounded-lg">
                        <Save className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="font-semibold text-slate-800">자동 분석</h3>
                    </div>
                    <div className="space-y-3 text-sm text-slate-600">
                      <div className="flex items-start space-x-2">
                        <span className="text-green-500 font-medium">🎯</span>
                        <span>저장하면 AI가 감정을 자동 분석해요</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-green-500 font-medium">📊</span>
                        <span>감정 패턴과 통계를 확인할 수 있어요</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-green-500 font-medium">🏷️</span>
                        <span>관련 태그가 자동으로 생성됩니다</span>
                      </div>
                    </div>
                  </div>

                  {/* 오늘의 날씨 */}
                  <div className="bg-gradient-to-br from-sky-50 to-blue-50 p-6 rounded-xl border border-sky-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-sky-600 rounded-lg">
                        <Cloud className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="font-semibold text-slate-800">오늘의 기록</h3>
                    </div>
                    <div className="space-y-3 text-sm text-slate-600">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Cloud className="w-4 h-4 text-sky-500" />
                          <span>날씨</span>
                        </div>
                        <span className="font-medium">맑음 22°C</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-green-500" />
                          <span>위치</span>
                        </div>
                        <span className="font-medium">인천</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-purple-500" />
                          <span>시간</span>
                        </div>
                        <span className="font-medium">{time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 푸터 */}
            <div className="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
              <div className="text-sm text-slate-500">
                자동 저장이 활성화되어 있습니다
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors font-medium"
                >
                  취소
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading || !content.trim()}
                  className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2 font-medium"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>저장 중...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>일기 저장</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 감정 회고 오버레이 - 최상위 레이어 */}
      {showRecallOverlay && emotionRecall && (
        <div 
          className="fixed z-[9999] max-w-sm bg-gradient-to-br from-purple-600 to-blue-600 text-white p-5 rounded-xl shadow-2xl transform transition-all duration-300 pointer-events-none border-2 border-purple-400"
          style={{
            left: Math.min(mousePosition.x + 15, window.innerWidth - 400),
            top: Math.max(mousePosition.y - 15, 20),
          }}
        >
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-white/20 rounded-lg flex-shrink-0">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-2 flex items-center">
                <Sparkles className="w-4 h-4 mr-1" />
                과거의 나를 되돌아보며...
              </h4>
              <p className="text-sm leading-relaxed text-white/90">
                {emotionRecall}
              </p>
            </div>
            <button
              onClick={() => setShowRecallOverlay(false)}
              className="text-white/70 hover:text-white transition-colors pointer-events-auto p-1 rounded hover:bg-white/10 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* 화살표 */}
          <div className="absolute -bottom-2 left-8 w-4 h-4 bg-gradient-to-br from-purple-600 to-blue-600 transform rotate-45 border-r border-b border-purple-400"></div>
        </div>
      )}

      {/* 로딩 인디케이터 - 최상위 레이어 */}
      {isRecallLoading && (
        <div 
          className="fixed z-[9998] bg-white p-4 rounded-xl shadow-xl border-2 border-purple-200 pointer-events-none"
          style={{
            left: Math.min(mousePosition.x + 15, window.innerWidth - 220),
            top: Math.max(mousePosition.y - 15, 20),
          }}
        >
          <div className="flex items-center space-x-3 text-purple-600">
            <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium">과거 기억 탐색 중...</span>
          </div>
        </div>
      )}
    </>
  );
};

export default DiaryWriteModal;
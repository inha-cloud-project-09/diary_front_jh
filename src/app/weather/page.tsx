// "use client"

// import React, { useState, useEffect } from 'react';
// import Header from "@/components/Header"

// // Types
// interface WeatherData {
//   temperature: number;
//   humidity: number;
//   wind_speed: number;
//   sky_condition: number;
//   precipitation_type: number;
// }

// interface EmotionData {
//   [emotion: string]: number;
// }

// interface CityResponse {
//   cities: string[];
//   total_count: number;
// }

// interface WeatherResponse {
//   success: boolean;
//   weather_data: WeatherData;
//   emotion_prediction: EmotionData;
//   message: string;
// }

// const API_BASE = 'https://backend.withudiary.my/api';

// const WeatherEmotionApp: React.FC = () => {
//   // States
//   const [cities, setCities] = useState<string[]>([]);
//   const [selectedCity, setSelectedCity] = useState<string>('서울');
//   const [sleepHours, setSleepHours] = useState<number>(8);
//   const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
//   const [emotionData, setEmotionData] = useState<EmotionData | null>(null);
//   const [loading, setLoading] = useState({
//     cities: false,
//     weather: false,
//     emotion: false
//   });
//   const [error, setError] = useState<string>('');

//   // Load cities on mount
//   useEffect(() => {
//     loadCities();
//   }, []);

//   // Load weather when city changes
//   useEffect(() => {
//     if (selectedCity) {
//       loadWeatherData(selectedCity);
//     }
//   }, [selectedCity]);

//   const loadCities = async () => {
//     setLoading(prev => ({ ...prev, cities: true }));
//     try {
//       const response = await fetch(`${API_BASE}/emotion/cities`);
//       const data: CityResponse = await response.json();
//       setCities(data.cities);
//     } catch (err) {
//       setError('도시 목록을 불러올 수 없습니다.');
//     } finally {
//       setLoading(prev => ({ ...prev, cities: false }));
//     }
//   };

//   const loadWeatherData = async (city: string) => {
//     setLoading(prev => ({ ...prev, weather: true }));
//     setError('');
//     try {
//       const response = await fetch(`${API_BASE}/emotion/weather/${city}`);
//       const data: WeatherResponse = await response.json();
      
//       if (data.success) {
//         setWeatherData(data.weather_data);
//         setEmotionData(data.emotion_prediction);
//       } else {
//         setError(data.message || '날씨 데이터를 불러올 수 없습니다.');
//       }
//     } catch (err) {
//       setError('네트워크 오류가 발생했습니다.');
//     } finally {
//       setLoading(prev => ({ ...prev, weather: false }));
//     }
//   };

//   const analyzeEmotion = async () => {
//     if (!selectedCity) return;
    
//     setLoading(prev => ({ ...prev, emotion: true }));
//     try {
//       const response = await fetch(`${API_BASE}/emotion/weather/${selectedCity}`);
//       const data: WeatherResponse = await response.json();
      
//       if (data.success) {
//         setEmotionData(data.emotion_prediction);
//       }
//     } catch (err) {
//       setError('감정 분석에 실패했습니다.');
//     } finally {
//       setLoading(prev => ({ ...prev, emotion: false }));
//     }
//   };

//   const getSkyConditionText = (condition: number): string => {
//     const conditions: { [key: number]: string } = {
//       1: '맑음',
//       3: '구름많음',
//       4: '흐림'
//     };
//     return conditions[condition] || '정보없음';
//   };

//   const getSleepStatus = (hours: number) => {
//     if (hours >= 7 && hours <= 9) {
//       return { status: 'good', text: '충분한 수면', color: 'text-emerald-600 bg-emerald-50' };
//     } else if ((hours >= 6 && hours < 7) || (hours > 9 && hours <= 10)) {
//       return { status: 'ok', text: '보통 수면', color: 'text-amber-600 bg-amber-50' };
//     } else {
//       return { status: 'bad', text: '부족한 수면', color: 'text-red-600 bg-red-50' };
//     }
//   };

//   const getEmotionColor = (emotion: string): string => {
//     const colors: { [key: string]: string } = {
//       '기쁨': 'bg-yellow-400',
//       '만족': 'bg-emerald-400',
//       '설렘': 'bg-pink-400',
//       '슬픔': 'bg-blue-400',
//       '불안': 'bg-red-400',
//       '외로움': 'bg-purple-400',
//       '분노': 'bg-red-500',
//       '지루함': 'bg-gray-400',
//       '실망': 'bg-orange-400',
//       '무기력': 'bg-gray-500'
//     };
//     return colors[emotion] || 'bg-gray-400';
//   };

//   const getEmotionEmoji = (emotion: string): string => {
//     const emojis: { [key: string]: string } = {
//       '기쁨': '😊',
//       '만족': '😌',
//       '설렘': '💫',
//       '슬픔': '😢',
//       '불안': '😰',
//       '외로움': '😔',
//       '분노': '😠',
//       '지루함': '😑',
//       '실망': '😞',
//       '무기력': '😴'
//     };
//     return emojis[emotion] || '🤔';
//   };

//   const adjustEmotionWithSleep = (emotions: EmotionData, sleepHours: number): EmotionData => {
//     const adjusted = { ...emotions };
    
//     if (sleepHours < 6) {
//       if (adjusted['무기력']) adjusted['무기력'] *= 1.3;
//       if (adjusted['불안']) adjusted['불안'] *= 1.2;
//       if (adjusted['기쁨']) adjusted['기쁨'] *= 0.7;
//     } else if (sleepHours >= 7 && sleepHours <= 9) {
//       if (adjusted['기쁨']) adjusted['기쁨'] *= 1.2;
//       if (adjusted['만족']) adjusted['만족'] *= 1.1;
//       if (adjusted['무기력']) adjusted['무기력'] *= 0.8;
//     }
    
//     return adjusted;
//   };

//   const sleepStatus = getSleepStatus(sleepHours);
//   const adjustedEmotions = emotionData ? adjustEmotionWithSleep(emotionData, sleepHours) : null;
//   const sortedEmotions = adjustedEmotions 
//     ? Object.entries(adjustedEmotions).sort((a, b) => b[1] - a[1]) 
//     : [];

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
//       <Header />
//       <div className="container mx-auto px-4 py-8 max-w-6xl">
//         {/* Header */}
//         <div className="text-center mb-12">
//           <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
//             오늘의 감정 예보
//           </h1>
//           <p className="text-gray-600 text-lg">날씨와 수면으로 예측하는 당신의 하루</p>
//         </div>

//         {/* Error Display */}
//         {error && (
//           <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
//             {error}
//           </div>
//         )}

//         {/* Main Grid */}
//         <div className="grid lg:grid-cols-3 gap-8 mb-8">
//           {/* Weather Card */}
//           <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
//             <div className="flex items-center mb-6">
//               <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
//                 <span className="text-blue-600 text-xl">🌤️</span>
//               </div>
//               <h2 className="text-xl font-semibold text-gray-800">실시간 날씨 정보</h2>
//             </div>

//             {/* City Selector */}
//             <div className="mb-6">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 도시 선택
//               </label>
//               <select
//                 value={selectedCity}
//                 onChange={(e) => setSelectedCity(e.target.value)}
//                 className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                 disabled={loading.cities}
//               >
//                 {cities.map(city => (
//                   <option key={city} value={city}>{city}</option>
//                 ))}
//               </select>
//             </div>

//             {/* Weather Data */}
//             {loading.weather ? (
//               <div className="flex items-center justify-center py-8">
//                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//                 <span className="ml-3 text-gray-600">날씨 정보 로딩중...</span>
//               </div>
//             ) : weatherData ? (
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="bg-gray-50 rounded-lg p-4 text-center">
//                   <div className="text-2xl font-bold text-gray-800 mb-1">
//                     {weatherData.temperature}°C
//                   </div>
//                   <div className="text-sm text-gray-600">기온</div>
//                 </div>
//                 <div className="bg-gray-50 rounded-lg p-4 text-center">
//                   <div className="text-2xl font-bold text-gray-800 mb-1">
//                     {weatherData.humidity}%
//                   </div>
//                   <div className="text-sm text-gray-600">습도</div>
//                 </div>
//                 <div className="bg-gray-50 rounded-lg p-4 text-center">
//                   <div className="text-2xl font-bold text-gray-800 mb-1">
//                     {weatherData.wind_speed}m/s
//                   </div>
//                   <div className="text-sm text-gray-600">풍속</div>
//                 </div>
//                 <div className="bg-gray-50 rounded-lg p-4 text-center">
//                   <div className="text-2xl font-bold text-gray-800 mb-1">
//                     {getSkyConditionText(weatherData.sky_condition)}
//                   </div>
//                   <div className="text-sm text-gray-600">하늘상태</div>
//                 </div>
//               </div>
//             ) : null}
//           </div>

//           {/* Sleep Card */}
//           <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
//             <div className="flex items-center mb-6">
//               <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
//                 <span className="text-purple-600 text-xl">😴</span>
//               </div>
//               <h2 className="text-xl font-semibold text-gray-800">수면 정보</h2>
//             </div>

//             <div className="mb-6">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 수면시간 (시간)
//               </label>
//               <input
//                 type="number"
//                 value={sleepHours}
//                 onChange={(e) => setSleepHours(Number(e.target.value))}
//                 min="0"
//                 max="24"
//                 step="0.5"
//                 className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
//               />
//             </div>

//             {/* Sleep Status */}
//             <div className={`p-4 rounded-lg border ${sleepStatus.color}`}>
//               <div className="flex items-center">
//                 <span className="text-lg mr-2">
//                   {sleepStatus.status === 'good' ? '😴' : sleepStatus.status === 'ok' ? '😪' : '😵'}
//                 </span>
//                 <div>
//                   <div className="font-semibold">{sleepStatus.text}</div>
//                   <div className="text-sm opacity-80">
//                     {sleepHours}시간 수면
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <button
//               onClick={analyzeEmotion}
//               disabled={loading.emotion || !weatherData}
//               className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
//             >
//               {loading.emotion ? (
//                 <div className="flex items-center justify-center">
//                   <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
//                   분석중...
//                 </div>
//               ) : (
//                 '🧠 감정 분석하기'
//               )}
//             </button>
//           </div>

//           {/* Emotion Results Card */}
//           <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
//             <div className="flex items-center mb-6">
//               <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
//                 <span className="text-green-600 text-xl">🎭</span>
//               </div>
//               <h2 className="text-xl font-semibold text-gray-800">감정 분석</h2>
//             </div>

//             {sortedEmotions.length > 0 ? (
//               <div className="space-y-4">
//                 {sortedEmotions.slice(0, 5).map(([emotion, probability]) => (
//                   <div key={emotion}>
//                     <div className="flex justify-between items-center mb-2">
//                       <div className="flex items-center">
//                         <span className="text-lg mr-2">{getEmotionEmoji(emotion)}</span>
//                         <span className="font-medium text-gray-700">{emotion}</span>
//                       </div>
//                       <span className="text-sm font-semibold text-gray-600">
//                         {(probability * 100).toFixed(1)}%
//                       </span>
//                     </div>
//                     <div className="w-full bg-gray-200 rounded-full h-2">
//                       <div
//                         className={`h-2 rounded-full transition-all duration-700 ${getEmotionColor(emotion)}`}
//                         style={{ width: `${probability * 100}%` }}
//                       />
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-8 text-gray-500">
//                 <div className="text-4xl mb-4">🤔</div>
//                 <p>감정 분석을 위해<br />분석 버튼을 눌러주세요</p>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Insights Card */}
//         {sortedEmotions.length > 0 && (
//           <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl text-white p-8">
//             <h3 className="text-2xl font-bold mb-6 flex items-center">
//               <span className="text-3xl mr-3">💡</span>
//               오늘의 인사이트
//             </h3>
            
//             <div className="grid md:grid-cols-2 gap-6">
//               <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
//                 <h4 className="font-semibold mb-3">주요 감정</h4>
//                 <div className="flex items-center text-xl">
//                   <span className="mr-3">{getEmotionEmoji(sortedEmotions[0][0])}</span>
//                   <span>{sortedEmotions[0][0]} ({(sortedEmotions[0][1] * 100).toFixed(1)}%)</span>
//                 </div>
//               </div>

//               <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
//                 <h4 className="font-semibold mb-3">추천 활동</h4>
//                 <p className="text-sm opacity-90">
//                   {sortedEmotions[0][0] === '기쁨' && '새로운 도전이나 사람들과의 만남이 좋은 날입니다.'}
//                   {sortedEmotions[0][0] === '만족' && '현재 상태를 유지하며 차분한 활동을 즐기세요.'}
//                   {sortedEmotions[0][0] === '무기력' && '가벼운 운동이나 산책으로 기분 전환을 해보세요.'}
//                   {sortedEmotions[0][0] === '불안' && '깊은 호흡과 명상으로 마음을 진정시키세요.'}
//                   {!['기쁨', '만족', '무기력', '불안'].includes(sortedEmotions[0][0]) && '오늘도 좋은 하루 되세요!'}
//                 </p>
//               </div>

//               <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
//                 <h4 className="font-semibold mb-3">날씨 조언</h4>
//                 <p className="text-sm opacity-90">
//                   {weatherData && weatherData.temperature < 10 && '추운 날씨입니다. 따뜻하게 입으세요.'}
//                   {weatherData && weatherData.temperature > 28 && '더운 날씨입니다. 수분 섭취를 충분히 하세요.'}
//                   {weatherData && weatherData.temperature >= 10 && weatherData.temperature <= 28 && '쾌적한 날씨입니다.'}
//                 </p>
//               </div>

//               <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
//                 <h4 className="font-semibold mb-3">컨디션 체크</h4>
//                 <p className="text-sm opacity-90">
//                   {sleepStatus.status === 'good' && '충분한 수면으로 좋은 컨디션입니다!'}
//                   {sleepStatus.status === 'ok' && '적당한 수면이지만 컨디션 관리에 주의하세요.'}
//                   {sleepStatus.status === 'bad' && '수면 부족으로 오늘은 무리하지 마세요.'}
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default WeatherEmotionApp;
import WeatherEmotionApp from "./weather-emotion-app"

export default function Page() {
  return <WeatherEmotionApp />
}

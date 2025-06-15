"use client"
import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Mic, MicOff, Volume2, MessageCircle, FileText, Loader2, Play, Pause, Sparkles, User, ArrowLeft, Headphones, Waves, Bot, Send } from 'lucide-react';
import Header from "../../../components/Header"

const mylink = "https://backend.withudiary.my"

const VoiceChatInterface = () => {
  // URL에서 일기 ID 자동 추출
  const params = useParams();
  const diaryId = params?.id ? parseInt(params.id) : null;
  
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [lastDialogId, setLastDialogId] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // [추가] 녹음 시작 시간을 추적하기 위한 state
  const recordingStartTimeRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);

  // ✅ WAV 변환 함수 (기존 코드와 동일, 안정적)
  const convertToWav = (audioBlob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result;
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        audioContext.decodeAudioData(arrayBuffer).then(audioBuffer => {
          const length = audioBuffer.length * audioBuffer.numberOfChannels * 2;
          const buffer = new ArrayBuffer(44 + length);
          const view = new DataView(buffer);
          
          const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
              view.setUint8(offset + i, string.charCodeAt(i));
            }
          };
          
          writeString(0, 'RIFF');
          view.setUint32(4, 36 + length, true);
          writeString(8, 'WAVE');
          writeString(12, 'fmt ');
          view.setUint32(16, 16, true);
          view.setUint16(20, 1, true);
          view.setUint16(22, audioBuffer.numberOfChannels, true);
          view.setUint32(24, audioBuffer.sampleRate, true);
          view.setUint32(28, audioBuffer.sampleRate * audioBuffer.numberOfChannels * 2, true);
          view.setUint16(32, audioBuffer.numberOfChannels * 2, true);
          view.setUint16(34, 16, true);
          writeString(36, 'data');
          view.setUint32(40, length, true);
          
          const channelData = audioBuffer.getChannelData(0);
          let offset = 44;
          for (let i = 0; i < channelData.length; i++) {
            const sample = Math.max(-1, Math.min(1, channelData[i]));
            view.setInt16(offset, sample * 0x7FFF, true);
            offset += 2;
          }
          
          const wavBlob = new Blob([buffer], { type: 'audio/wav' });
          console.log('✅ WAV 변환 완료:', wavBlob.size, 'bytes');
          resolve(wavBlob);
        }).catch(error => {
          console.error('❌ 오디오 데이터 디코딩/WAV 변환 실패:', error);
          reject(new Error('오디오 데이터를 WAV로 변환하는 데 실패했습니다.'));
        });
      };
      reader.onerror = (error) => {
        console.error('❌ Blob 파일 읽기 실패:', error);
        reject(new Error('오디오 Blob을 읽는 데 실패했습니다.'));
      };
      reader.readAsArrayBuffer(audioBlob);
    });
  };

  // 사용자 정보 자동 가져오기 (기존 코드와 동일)
  const fetchUserInfo = async () => {
    try {
      setAuthLoading(true);
      const authApiUrl = 'https://withudiary.my/api/auth/me';
      console.log('🔍 사용자 정보 요청 URL:', authApiUrl);
      
      const response = await fetch(authApiUrl, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token') || ''}`
        }
      });

      console.log('📡 인증 응답 상태:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error('사용자 정보 조회 실패');
      }
      
      const userData = await response.json();
      console.log('✅ 사용자 정보:', userData);
      
      setUserInfo(userData);
      setUserId(userData.id);
    } catch (error) {
      console.error('❌ 사용자 정보 조회 실패:', error);
      console.log('🔄 개발용 fallback 사용자로 설정');
      setUserId(2);
      setUserInfo({ id: 2, nickname: '개발자', email: 'dev@example.com' });
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    fetchUserInfo();
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      // [개선] 컴포넌트 언마운트 시 미디어 스트림 정리
      if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // [개선] 음성 녹음 시작
  const startRecording = async () => {
    // 이미 녹음 중이거나 처리 중이면 중복 실행 방지
    if (isRecording || isProcessing) return;
    
    console.log('🎤 녹음 절차 시작...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });
      
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'audio/webm';
      
      console.log('🎤 사용할 MIME Type:', mimeType);
      
      const options = { mimeType, audioBitsPerSecond: 128000 };
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      audioChunksRef.current = []; // 청크 배열 초기화

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log('📦 데이터 청크 수신:', event.data.size, 'bytes');
          audioChunksRef.current.push(event.data);
        } else {
          console.warn('⚠️ 0바이트 크기의 데이터 청크 수신됨. 무시합니다.');
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        console.log('🎙️ 녹음이 공식적으로 중지되었습니다. (onstop 이벤트 발생)');
        
        // [개선] 스트림 트랙 여기서 확실히 중지
        stream.getTracks().forEach(track => track.stop());
        
        if (audioChunksRef.current.length === 0) {
          console.error('❌ 수집된 오디오 청크가 없습니다.');
          alert('음성 데이터가 감지되지 않았습니다. 마이크를 확인하고 다시 시도해주세요.');
          setIsProcessing(false); // 처리 상태 해제
          return;
        }

        console.log('🔄 수집된 청크로 Blob 생성 및 업로드 절차 시작...');
        setIsProcessing(true); // 이제 처리 상태로 전환

        try {
          const recordedBlob = new Blob(audioChunksRef.current, { type: mimeType });
          console.log('🎵 원본 Blob 생성 완료 - 크기:', recordedBlob.size, 'bytes, 타입:', recordedBlob.type);
          
          if (recordedBlob.size < 1000) { // 1KB 미만 데이터는 너무 짧다고 판단
             console.warn('⚠️ 녹음 데이터가 너무 작습니다:', recordedBlob.size);
             alert('녹음이 너무 짧습니다. 1초 이상 말씀해주세요.');
             setIsProcessing(false);
             return;
          }
          
          console.log('🔄 WAV 변환 시작...');
          const wavBlob = await convertToWav(recordedBlob);
          console.log('✅ 최종 WAV Blob 생성 완료 - 크기:', wavBlob.size, 'bytes');
          
          await uploadAudio(wavBlob);

        } catch (error) {
          console.error('❌ 녹음 후 처리 과정(Blob 생성, WAV 변환, 업로드) 에러:', error);
          alert(`녹음 데이터 처리 중 오류가 발생했습니다: ${error.message}`);
          setIsProcessing(false);
        }
      };

      mediaRecorderRef.current.onerror = (event) => {
        console.error('❌ MediaRecorder 에러:', event.error);
        alert('녹음 중 오류가 발생했습니다. 브라우저를 새로고침하거나 마이크 권한을 확인해주세요.');
        setIsRecording(false);
        setIsProcessing(false);
      };
      
      // [핵심 수정] timeslice 제거. stop() 호출 시 ondataavailable가 한 번만 호출되도록 함.
      mediaRecorderRef.current.start(); 
      setIsRecording(true);
      recordingStartTimeRef.current = Date.now(); // 녹음 시작 시간 기록
      console.log('✅ 녹음이 성공적으로 시작되었습니다.');
      
    } catch (error) {
      console.error('❌ 녹음 시작 실패 (마이크 권한 등):', error);
      alert('마이크 사용 권한이 필요합니다. 브라우저 설정에서 마이크 접근을 허용해주세요.');
    }
  };

  // [개선] 음성 녹음 중지
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      // [추가] 최소 녹음 시간 확인
      const recordingTime = Date.now() - recordingStartTimeRef.current;
      if (recordingTime < 500) { // 0.5초 미만 녹음 방지
        console.warn(`⚠️ 녹음 시간이 너무 짧습니다. (${recordingTime}ms)`);
        // MediaRecorder를 중지시키되, onstop 이벤트에서 처리하지 않도록 트랙만 정리
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        mediaRecorderRef.current.onstop = null; // onstop 핸들러를 임시로 제거하여 업로드 방지
        mediaRecorderRef.current.stop();
        
        setIsRecording(false);
        alert('녹음이 너무 짧습니다. 버튼을 1초 이상 누른 후 말씀해주세요.');
        return;
      }

      console.log('🛑 녹음 중지 요청. MediaRecorder.stop() 호출합니다.');
      mediaRecorderRef.current.stop();
      setIsRecording(false); 
      // isProcessing은 onstop 핸들러에서 제어하므로 여기서는 false로 만들지 않음
    }
  };


  // 음성 파일 업로드 & STT (기존 코드와 동일)
  const uploadAudio = async (audioBlob) => {
    try {
      console.log('📦 업로드 시작 - Blob 정보:', { size: audioBlob.size, type: audioBlob.type });
      if (audioBlob.size === 0) throw new Error('업로드할 음성 파일이 비어있습니다.');

      const fileName = `recording_${Date.now()}.wav`;
      const formData = new FormData();
      formData.append('file', audioBlob, fileName);
      formData.append('user_id', userId.toString());

      console.log('📤 FormData 생성 완료, 서버로 전송합니다...');
      const response = await fetch(mylink+'/api/upload-audio', {
        method: 'POST',
        body: formData,
        credentials: 'include',
        mode: 'cors',
      });

      console.log('📡 서버 응답 상태:', response.status, response.statusText);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ STT 결과:', data);
      await startChat(data.id, data.transcribed_text);
      
    } catch (error) {
      console.error('❌ 음성 업로드/STT 실패:', error);
      alert(`음성 처리 중 오류가 발생했습니다: ${error.message}`);
      setIsProcessing(false); // 에러 발생 시 처리 상태 해제
    }
    // 성공 시에는 startChat이 끝나고 나서 isProcessing이 해제됨 (아래 startChat 함수 참고)
  };


  // GPT 대화 & TTS
  const startChat = async (voiceId, userText) => {
    try {
      const requestBody = {
        previous_log_id: lastDialogId,
        diary_id: diaryId
      };
      console.log('💬 대화 요청:', { voiceId, requestBody, userText });

      const response = await fetch(`${mylink}/api/chat/${voiceId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) throw new Error('Chat API 호출 실패');
      
      const data = await response.json();
      console.log('🤖 AI 응답 수신:', data);
      
      const newConversation = {
        id: Date.now(),
        userText: userText,
        aiText: data.response,
        aiAudioUrl: data.audio_url,
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        dialogId: data.dialog_log_id
      };

      setConversations(prev => [...prev, newConversation]);
      setLastDialogId(data.dialog_log_id);
      playAIResponse(data.audio_url);
      
    } catch (error) {
      console.error('❌ 대화/TTS 실패:', error);
      alert('AI와의 대화 중 오류가 발생했습니다.');
    } finally {
      // [개선] AI 응답까지 모든 과정이 끝나면 처리 상태 해제
      setIsProcessing(false);
      console.log('✅ 모든 처리 완료. 사용자 입력 대기 상태로 전환.');
    }
  };

  const playAIResponse = (audioUrl) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    audioRef.current = new Audio(audioUrl);
    audioRef.current.onplay = () => setIsPlaying(true);
    audioRef.current.onended = () => setIsPlaying(false);
    audioRef.current.onerror = (e) => {
      setIsPlaying(false);
      console.error('오디오 재생 실패:', e);
      alert('AI 음성을 재생하는 데 실패했습니다.');
    };
    audioRef.current.play().catch(error => {
      console.error('자동 재생이 브라우저 정책에 의해 차단되었을 수 있습니다:', error);
      setIsPlaying(false);
      // 사용자 상호작용이 필요하다는 메시지를 표시할 수 있음
    });
  };

  const toggleAudioPlayback = (audioUrl) => {
    if (isPlaying && audioRef.current && audioRef.current.src === audioUrl) {
      audioRef.current.pause();
    } else {
      playAIResponse(audioUrl);
    }
  };

  const startNewConversation = () => {
    setConversations([]);
    setLastDialogId(null);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  };

  // 로딩 화면 (기존과 동일)
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full animate-pulse"></div>
            <Loader2 className="absolute inset-0 w-10 h-10 m-auto text-white animate-spin" />
          </div>
          <div className="text-white">
            <h2 className="text-2xl font-bold mb-3">🎙️ AI 어시스턴트 준비 중</h2>
            <p className="text-purple-200">사용자 인증을 확인하고 있어요...</p>
          </div>
        </div>
      </div>
    );
  }

  // --- JSX 부분은 수정사항이 없으므로 생략하고 기존 코드 그대로 사용하시면 됩니다. ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      <Header />
      {/* 배경 애니메이션 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-r from-pink-500/10 to-violet-500/10 rounded-full animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-l from-blue-500/10 to-purple-500/10 rounded-full animate-pulse delay-1000"></div>
        
        {/* 떠다니는 점들 */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/20 rounded-full animate-bounce delay-300"></div>
        <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-purple-300/30 rounded-full animate-bounce delay-700"></div>
        <div className="absolute bottom-1/4 left-3/4 w-1 h-1 bg-pink-300/40 rounded-full animate-bounce delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6">
        {/* 상단 헤더 */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 mb-8 shadow-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <button className="p-3 bg-white/20 rounded-2xl hover:bg-white/30 transition-all duration-300 group">
                <ArrowLeft className="text-white w-6 h-6 group-hover:scale-110 transition-transform" />
              </button>
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full flex items-center justify-center shadow-lg">
                    <Bot className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-400 rounded-full border-3 border-white animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white flex items-center gap-4">
                    <Sparkles className="text-yellow-400 animate-pulse" />
                    AI 음성 어시스턴트
                  </h1>
                  <p className="text-purple-200 text-lg mt-1">
                    {userInfo?.nickname || '게스트'}님, 안녕하세요! 🎵
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={startNewConversation}
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold text-lg"
            >
              ✨ 새 대화 시작
            </button>
          </div>

          {/* 일기 연동 정보 */}
          {diaryId ? (
            <div className="mt-8 p-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl border border-blue-400/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/30 rounded-xl flex items-center justify-center">
                  <FileText className="text-blue-300 w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-lg">📖 일기 #{diaryId} 연동됨</h3>
                  <p className="text-blue-200">이 일기의 내용과 감정을 바탕으로 맞춤형 대화를 제공해요</p>
                </div>
                <div className="px-4 py-2 bg-green-500/30 text-green-200 rounded-full text-sm font-medium">
                  ✓ 활성화
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-8 p-6 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl border border-amber-400/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-500/30 rounded-xl flex items-center justify-center">
                  <MessageCircle className="text-amber-300 w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">💬 일반 대화 모드</h3>
                  <p className="text-amber-200">자유롭게 대화를 나누어보세요</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid xl:grid-cols-3 gap-8">
          {/* 대화 기록 */}
          <div className="xl:col-span-2">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl h-[700px] flex flex-col">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <MessageCircle className="text-white w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-white">대화 기록</h2>
                {conversations.length > 0 && (
                  <span className="px-4 py-2 bg-purple-500/30 text-purple-200 rounded-full text-sm font-medium">
                    {conversations.length}개 대화
                  </span>
                )}
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-6 pr-3">
                {conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-32 h-32 bg-gradient-to-r from-pink-500/20 to-violet-500/20 rounded-full flex items-center justify-center mb-8 animate-pulse">
                      <Headphones className="w-16 h-16 text-purple-300" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">🎙️ 대화를 시작해보세요!</h3>
                    <p className="text-purple-200 text-lg mb-8 max-w-md">
                      마이크 버튼을 길게 눌러 음성으로 자연스럽게 대화해보세요
                    </p>
                    <div className="flex items-center gap-3 text-purple-300">
                      <Waves className="w-5 h-5 animate-pulse" />
                      <span className="text-sm">실시간 음성 인식 · AI 응답 · 자동 TTS</span>
                    </div>
                  </div>
                ) : (
                  <>
                    {conversations.map((conv, index) => (
                      <div key={conv.id} className="space-y-4">
                        {/* 사용자 메시지 */}
                        <div className="flex justify-end">
                          <div className="max-w-lg">
                            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-3xl rounded-br-lg px-6 py-4 shadow-lg">
                              <p className="leading-relaxed">{conv.userText}</p>
                            </div>
                            <p className="text-purple-200 text-xs mt-2 text-right flex items-center justify-end gap-1">
                              <User className="w-3 h-3" />
                              {conv.timestamp}
                            </p>
                          </div>
                        </div>
                        
                        {/* AI 응답 */}
                        <div className="flex justify-start">
                          <div className="max-w-lg">
                            <div className="bg-white/20 backdrop-blur-sm text-white rounded-3xl rounded-bl-lg px-6 py-4 shadow-lg border border-white/10">
                              <p className="leading-relaxed mb-4">{conv.aiText}</p>
                              <button
                                onClick={() => toggleAudioPlayback(conv.aiAudioUrl)}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500/30 to-violet-500/30 rounded-full hover:from-pink-500/40 hover:to-violet-500/40 transition-all duration-300 text-sm font-medium group"
                              >
                                {isPlaying && audioRef.current?.src === conv.aiAudioUrl ? (
                                  <Pause className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                ) : (
                                  <Play className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                )}
                                음성 재생
                                <Volume2 className="w-4 h-4 opacity-70" />
                              </button>
                            </div>
                            <p className="text-purple-200 text-xs mt-2 flex items-center gap-1">
                              <Bot className="w-3 h-3" />
                              AI Assistant
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 음성 컨트롤 */}
          <div className="xl:col-span-1">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl h-[700px] flex flex-col">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-red-600 rounded-xl flex items-center justify-center">
                  <Mic className="text-white w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-white">음성 입력</h2>
              </div>

              <div className="flex-1 flex flex-col justify-center">
                {isProcessing ? (
                  <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                      <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
                      <Loader2 className="absolute inset-0 w-12 h-12 m-auto text-white animate-spin" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-semibold text-white mb-2">🎵 처리 중...</h3>
                      <p className="text-purple-200">음성을 텍스트로 변환하고 AI가 답변을 준비하고 있어요</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-8">
                    <button
                      onMouseDown={startRecording}
                      onMouseUp={stopRecording}
                      onTouchStart={startRecording}
                      onTouchEnd={stopRecording}
                      className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
                        isRecording
                          ? 'bg-gradient-to-r from-red-500 to-pink-600 scale-110 animate-pulse'
                          : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:scale-105 hover:shadow-3xl'
                      } text-white`}
                      disabled={isProcessing}
                    >
                      {isRecording ? (
                        <MicOff size={40} className="animate-pulse" />
                      ) : (
                        <Mic size={40} />
                      )}
                    </button>
                    
                    <div className="text-center">
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {isRecording ? '🎙️ 녹음 중...' : '🎤 길게 눌러서 말하기'}
                      </h3>
                      <p className="text-purple-200 text-sm max-w-xs">
                        {isRecording 
                          ? '버튼을 놓으면 AI가 바로 답변해드려요' 
                          : '버튼을 누르고 있는 동안 음성을 녹음합니다'
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* 상태 표시 */}
              <div className="space-y-4">
                <div className="flex justify-center gap-3">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                    isRecording 
                      ? 'bg-red-500/30 text-red-200 animate-pulse' 
                      : 'bg-white/20 text-white/70'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-400' : 'bg-white/50'}`}></div>
                    {isRecording ? '🔴 녹음 중' : '⚪ 대기 중'}
                  </div>
                  
                  {isPlaying && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm bg-green-500/30 text-green-200 animate-pulse">
                      <Volume2 size={14} />
                      🎵 재생 중
                    </div>
                  )}
                </div>

                {/* 안내 정보 */}
                <div className="text-center">
                  <p className="text-white/60 text-xs">
                    🌟 자연스럽게 말씀해 주세요
                  </p>
                  {diaryId && (
                    <p className="text-blue-300 text-xs mt-1">
                      📖 일기 내용이 대화에 반영됩니다
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceChatInterface;
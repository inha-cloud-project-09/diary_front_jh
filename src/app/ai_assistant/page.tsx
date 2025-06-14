"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  MessageCircle, 
  Loader2, 
  Play, 
  Pause,
  RotateCcw,
  Send,
  Headphones
} from 'lucide-react';

const VoiceChatAssistant = () => {
  // 상태 관리
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [currentDialogId, setCurrentDialogId] = useState(null);
  const [processingStep, setProcessingStep] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingStatus, setRecordingStatus] = useState('idle'); // idle, recording, stopping
  
  // Refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioPlayerRef = useRef(null);
  const recordedAudioRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  
  // API 호출 함수들
  const uploadToS3 = async (audioBlob) => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.wav');
    
    // S3 업로드 API 호출 (실제 구현에 맞게 수정)
    const response = await fetch('/api/upload-audio', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) throw new Error('Upload failed');
    const data = await response.json();
    return data.s3_url;
  };
  
  const transcribeAudio = async (s3Url) => {
    const response = await fetch('/api/stt-direct/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ s3_url: s3Url })
    });
    
    if (!response.ok) throw new Error('STT failed');
    const data = await response.json();
    return data.transcript;
  };
  
  const chatWithGPT = async (voiceId, previousLogId = null) => {
    const url = `/api/chat/${voiceId}${previousLogId ? `?previous_log_id=${previousLogId}` : ''}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) throw new Error('Chat failed');
    return response.json();
  };
  
  // 타이머 시작
  const startTimer = () => {
    setRecordingTime(0);
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => {
        const newTime = prev + 1;
        // 5분(300초) 제한
        if (newTime >= 300) {
          console.log('⏰ 최대 녹음 시간 도달');
          stopRecording();
          return 300;
        }
        return newTime;
      });
    }, 1000);
  };
  
  // 타이머 중지
  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };
  
  // 시간 포맷팅 (초 -> MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // 스트림 정리
  const cleanupStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('Track stopped:', track.kind);
      });
      streamRef.current = null;
    }
  };

  // 녹음 정리 함수
  const handleRecordingCleanup = useCallback(() => {
    console.log('🧹 녹음 리소스 정리');
    setIsRecording(false);
    setRecordingStatus('idle');
    stopTimer();
    cleanupStream();
  }, []);
  
  // 음성 녹음 시작
  const startRecording = async () => {
    try {
      console.log('🎙️ 녹음 시작 시도...');
      setRecordingStatus('recording');
      
      // 이전 스트림 정리
      cleanupStream();
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });
      
      streamRef.current = stream;
      console.log('📡 스트림 획득 성공');
      
      // MediaRecorder 설정
      const options = {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000
      };
      
      // 지원되는 MIME 타입 확인
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'audio/webm';
      }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'audio/mp4';
      }
      
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      audioChunksRef.current = [];
      
      // 이벤트 리스너 설정
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log('📊 데이터 청크 수신:', event.data.size);
        }
      };
      
      // 수정된 onstop 이벤트 핸들러
      mediaRecorderRef.current.onstop = async () => {
        console.log('⏹️ MediaRecorder onstop 이벤트');
        
        // 정리 작업 (상태 업데이트만)
        handleRecordingCleanup();
        
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        console.log('🎵 오디오 blob 생성:', audioBlob.size, 'bytes');
        recordedAudioRef.current = audioBlob;
        
        // 녹음된 오디오 처리
        if (audioBlob.size > 0) {
          await processAudio(audioBlob);
        } else {
          console.error('❌ 빈 오디오 파일');
          alert('녹음된 오디오가 없습니다. 다시 시도해주세요.');
        }
      };
      
      mediaRecorderRef.current.onerror = (event) => {
        console.error('❌ MediaRecorder 오류:', event.error);
        handleRecordingCleanup();
      };
      
      // 녹음 시작
      mediaRecorderRef.current.start(1000); // 1초마다 데이터 청크 생성
      setIsRecording(true);
      startTimer();
      console.log('✅ 녹음 시작 완료');
      
    } catch (error) {
      console.error('❌ 녹음 시작 실패:', error);
      setRecordingStatus('idle');
      setIsRecording(false);
      cleanupStream();
      
      if (error.name === 'NotAllowedError') {
        alert('마이크 접근 권한이 필요합니다. 브라우저 설정에서 마이크 사용을 허용해주세요.');
      } else if (error.name === 'NotFoundError') {
        alert('마이크를 찾을 수 없습니다. 마이크가 연결되어 있는지 확인해주세요.');
      } else {
        alert('녹음 시작에 실패했습니다: ' + error.message);
      }
    }
  };
  
  // 음성 녹음 중지 (수정된 버전)
  const stopRecording = useCallback(() => {
    console.log('🛑 녹음 중지 시도...', { 
      isRecording, 
      mediaRecorderState: mediaRecorderRef.current?.state,
      recordingStatus 
    });

    // 이미 중지 중이거나 녹음 중이 아니면 무시
    if (recordingStatus === 'stopping' || !isRecording) {
      console.log('⚠️ 이미 중지 중이거나 녹음 중이 아님');
      return;
    }

    try {
      // 먼저 상태를 'stopping'으로 변경
      setRecordingStatus('stopping');
      
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        console.log('✅ MediaRecorder.stop() 호출');
        mediaRecorderRef.current.stop();
      } else {
        console.warn('⚠️ MediaRecorder가 녹음 상태가 아님:', mediaRecorderRef.current?.state);
        // MediaRecorder가 이미 정지되어 있다면 수동으로 정리
        handleRecordingCleanup();
      }
    } catch (error) {
      console.error('❌ MediaRecorder stop 실패:', error);
      // 오류 발생 시 강제로 정리
      handleRecordingCleanup();
    }
  }, [isRecording, recordingStatus, handleRecordingCleanup]);
  
  // 녹음된 오디오 처리
  const processAudio = async (audioBlob) => {
    try {
      setIsProcessing(true);
      setProcessingStep('오디오 업로드 중...');
      
      // 1. S3 업로드
      const s3Url = await uploadToS3(audioBlob);
      
      setProcessingStep('음성을 텍스트로 변환 중...');
      
      // 2. STT (Speech-to-Text)
      const transcriptText = await transcribeAudio(s3Url);
      setTranscript(transcriptText);
      
      setProcessingStep('AI 응답 생성 중...');
      
      // 3. Chat with GPT (임시로 voice_id 1 사용)
      const chatResult = await chatWithGPT(1, currentDialogId);
      setResponse(chatResult.response);
      setAudioUrl(chatResult.audio_url);
      setCurrentDialogId(chatResult.dialog_log_id);
      
      // 4. 채팅 히스토리 업데이트
      const newChatEntry = {
        id: Date.now(),
        user: transcriptText,
        assistant: chatResult.response,
        audioUrl: chatResult.audio_url,
        timestamp: new Date()
      };
      
      setChatHistory(prev => [...prev, newChatEntry]);
      
      setProcessingStep('');
      
      // 5. 자동으로 응답 음성 재생
      setTimeout(() => {
        playResponse(chatResult.audio_url);
      }, 500);
      
    } catch (error) {
      console.error('Processing failed:', error);
      alert('처리 중 오류가 발생했습니다: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // 응답 음성 재생
  const playResponse = (url) => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.src = url || audioUrl;
      audioPlayerRef.current.play();
      setIsPlaying(true);
    }
  };
  
  // 음성 재생 중지
  const stopPlaying = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };
  
  // 대화 초기화
  const resetChat = () => {
    setChatHistory([]);
    setCurrentDialogId(null);
    setTranscript('');
    setResponse('');
    setAudioUrl('');
    setRecordingTime(0);
  };

  // 상태 디버깅용 (개발 시에만 사용)
  useEffect(() => {
    console.log('상태 변화:', { 
      isRecording, 
      recordingStatus, 
      mediaRecorderState: mediaRecorderRef.current?.state 
    });
  }, [isRecording, recordingStatus]);
  
  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      console.log('🧹 컴포넌트 언마운트 - 리소스 정리');
      stopTimer();
      cleanupStream();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);
  
  // 오디오 이벤트 리스너
  useEffect(() => {
    const audio = audioPlayerRef.current;
    if (audio) {
      const handleEnded = () => setIsPlaying(false);
      audio.addEventListener('ended', handleEnded);
      return () => audio.removeEventListener('ended', handleEnded);
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <Headphones className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">음성 AI 도우미</h1>
        <p className="text-gray-600">마이크 버튼을 눌러 대화를 시작하세요</p>
      </div>

      {/* 메인 컨트롤 */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
        <div className="flex flex-col items-center space-y-6">
          {/* 녹음 버튼 */}
          <div className="relative">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing || recordingStatus === 'stopping'}
              className={`w-24 h-24 rounded-full flex items-center justify-center text-white transition-all duration-300 ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : isProcessing || recordingStatus === 'stopping'
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 hover:scale-105'
              }`}
            >
              {isProcessing ? (
                <Loader2 className="w-10 h-10 animate-spin" />
              ) : recordingStatus === 'stopping' ? (
                <Loader2 className="w-10 h-10 animate-spin" />
              ) : isRecording ? (
                <MicOff className="w-10 h-10" />
              ) : (
                <Mic className="w-10 h-10" />
              )}
            </button>
            
            {isRecording && (
              <>
                <div className="absolute -inset-4 border-4 border-red-400 rounded-full animate-ping"></div>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                  <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-mono">
                    {formatTime(recordingTime)}
                  </div>
                </div>
              </>
            )}
          </div>
          
          {/* 상태 텍스트 */}
          <div className="text-center min-h-[2rem]">
            {isRecording && (
              <div className="space-y-1">
                <p className="text-red-600 font-medium animate-pulse">🎙️ 녹음 중... 말씀하세요</p>
                <p className="text-sm text-gray-500">버튼을 다시 누르면 녹음이 중지됩니다</p>
              </div>
            )}
            {recordingStatus === 'stopping' && (
              <p className="text-orange-600 font-medium">🛑 녹음 중지 중...</p>
            )}
            {isProcessing && (
              <div className="space-y-1">
                <p className="text-blue-600 font-medium">{processingStep}</p>
                <div className="w-48 bg-gray-200 rounded-full h-2 mx-auto">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                </div>
              </div>
            )}
            {!isRecording && !isProcessing && recordingStatus === 'idle' && (
              <div className="space-y-1">
                <p className="text-gray-600">마이크 버튼을 눌러 음성 입력 시작</p>
                <p className="text-xs text-gray-400">최대 5분까지 녹음 가능합니다</p>
              </div>
            )}
          </div>
          
          {/* 제어 버튼들 */}
          <div className="flex space-x-4">
            {audioUrl && (
              <button
                onClick={isPlaying ? stopPlaying : () => playResponse()}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>중지</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>재생</span>
                  </>
                )}
              </button>
            )}
            
            {chatHistory.length > 0 && (
              <button
                onClick={resetChat}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>초기화</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 현재 대화 */}
      {(transcript || response) && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <MessageCircle className="w-5 h-5 mr-2" />
            현재 대화
          </h3>
          
          {transcript && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 font-medium mb-1">당신</p>
              <p className="text-gray-800">{transcript}</p>
            </div>
          )}
          
          {response && (
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-600 font-medium mb-1">AI 도우미</p>
              <p className="text-gray-800">{response}</p>
            </div>
          )}
        </div>
      )}

      {/* 대화 히스토리 */}
      {chatHistory.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">대화 기록</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {chatHistory.map((chat) => (
              <div key={chat.id} className="border-l-4 border-blue-400 pl-4">
                <div className="text-xs text-gray-500 mb-2">
                  {chat.timestamp.toLocaleString()}
                </div>
                
                <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium mb-1">당신</p>
                  <p className="text-gray-800">{chat.user}</p>
                </div>
                
                <div className="mb-3 p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm text-purple-600 font-medium">AI 도우미</p>
                    <button
                      onClick={() => playResponse(chat.audioUrl)}
                      className="text-purple-500 hover:text-purple-700 transition-colors"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-gray-800">{chat.assistant}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 숨겨진 오디오 플레이어 */}
      <audio ref={audioPlayerRef} style={{ display: 'none' }} />
      
      {/* 사용법 안내 */}
      {chatHistory.length === 0 && !isRecording && !isProcessing && (
        <div className="mt-8 text-center text-gray-500">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h4 className="font-semibold mb-3">사용법</h4>
            <div className="text-sm space-y-2">
              <p>1. 🎙️ 마이크 버튼을 눌러 음성 녹음 시작</p>
              <p>2. 💬 원하는 내용을 말씀하세요</p>
              <p>3. 🛑 다시 버튼을 눌러 녹음 중지</p>
              <p>4. 🤖 AI가 답변을 음성으로 들려드립니다</p>
              <p>5. 🔄 계속해서 대화할 수 있습니다</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceChatAssistant;
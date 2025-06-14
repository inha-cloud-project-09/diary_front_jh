"use client"

import { useState, useEffect } from "react"
import { Button } from "../components/ui/button"
import {
  ArrowLeft, Tag, Save, Eye, EyeOff, Calendar, Filter, Download, Hash, Wand2
} from 'lucide-react'
import { RichTextEditor } from "../components/ui/rich-text-editor"
import { mockOneLinerDiaries } from "@/mock/diary"
import { oneLineDiaryAPI, diaryAPI } from "@/lib/api"
import { useRouter } from "next/navigation"

export default function Component() {
  // 상태 정의
  const [oneLineDiaries, setOneLineDiaries] = useState<any[]>([])
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [isPreview, setIsPreview] = useState(false)
  const [isPublic, setIsPublic] = useState(false)
  const [showPrivacyFilter, setShowPrivacyFilter] = useState(false)
  const [filteredContent, setFilteredContent] = useState("")
  const [showAIHelp, setShowAIHelp] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState("")
  const [lastCursorActivity, setLastCursorActivity] = useState(Date.now())

  const router = useRouter()

  const moods = [
    { emoji: "😊", label: "행복", value: "happy", color: "bg-yellow-100 text-yellow-800" },
    { emoji: "😢", label: "슬픔", value: "sad", color: "bg-blue-100 text-blue-800" },
    { emoji: "😠", label: "화남", value: "angry", color: "bg-red-100 text-red-800" },
    { emoji: "😌", label: "평온", value: "peaceful", color: "bg-green-100 text-green-800" },
    { emoji: "😴", label: "피곤", value: "tired", color: "bg-gray-100 text-gray-800" },
    { emoji: "🤗", label: "감사", value: "grateful", color: "bg-purple-100 text-purple-800" },
    { emoji: "😰", label: "불안", value: "anxious", color: "bg-orange-100 text-orange-800" },
    { emoji: "🤔", label: "생각", value: "thoughtful", color: "bg-indigo-100 text-indigo-800" },
  ]

  const emotionTags = ["기쁨", "슬픔", "분노", "불안", "설렘", "지루함", "외로움", "만족", "실망"]
  const situationTags = ["직장", "학교", "가족", "친구", "연인", "여행", "운동", "취미", "휴식"]
  const healthTags = ["두통", "피로", "긴장", "식욕 감소", "불면"]

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const getCurrentDateTime = () => {
    const now = new Date()
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
    }
  }

  const { date, time } = getCurrentDateTime()

  useEffect(() => {
    const fetchOneLineDiaries = async () => {
      try {
        const res = await oneLineDiaryAPI.getMyOneLineDiaries()
        setOneLineDiaries(
          res.data.map((d: any) => ({
            id: d.id.toString(),
            text: d.content,
            timestamp: new Date(d.createdAt),
            mood: d.primaryEmotion,
            tags: d.tags,
            isPublic: d.isPublic
          }))
        )
      } catch {
        setOneLineDiaries(
          mockOneLinerDiaries.map((d) => ({
            id: d.id.toString(),
            text: d.content,
            timestamp: new Date(d.createdAt),
            mood: d.primaryEmotion,
            tags: d.tags,
            isPublic: d.isPublic
          }))
        )
      }
    }
    fetchOneLineDiaries()
  }, [])

  // Button, event, state 등 기존 코드 유지

  // map 콜백 파라미터에 타입 명시
  const handleSave = async () => {
    try {
      await diaryAPI.createDiary({
        title,
        content,
        primaryEmotion: "",
        secondaryEmotions: [],
        tags: tags,
        isPublic,
      })
      router.push("/dashboard")
    } catch (e) {
      alert("저장에 실패했습니다.")
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="p-2 cursor-pointer"
                onClick={() => router.back()}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-slate-900">새 일기 작성</h1>
                <p className="text-sm text-slate-500">
                  {date} {time}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={() => setIsPreview(!isPreview)} className="hidden sm:flex">
                {isPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {isPreview ? "편집" : "미리보기"}
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleSave}
              >
                <Save className="w-4 h-4 mr-2" />
                저장
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 한 줄 일기 목록 */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">오늘의 한 줄 일기</h2>
          <div className="space-y-3 max-h-60 overflow-y-auto mt-4">
            {oneLineDiaries.map((diary) => (
              <div key={diary.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-slate-800">{diary.text}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-slate-500">
                      {diary.timestamp.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {diary.mood && <span className="text-sm">{moods.find((m) => m.value === diary.mood)?.emoji}</span>}
                    <div className="flex space-x-1">
                      {(diary.tags ?? []).map((tag: string) => (
                        <span key={tag} className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-700">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${diary.isPublic ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
                    >
                      {diary.isPublic ? "공개" : "비공개"}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setContent(content + "\n\n" + diary.text)
                  }}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
        {!isPreview ? (
          <div className="space-y-6">
            {/* 제목 입력 */}
            <div>
              <input
                type="text"
                placeholder="일기 제목을 입력하세요..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-2xl font-bold text-slate-900 placeholder-slate-400 border-none outline-none bg-transparent"
              />
            </div>

            {/* 메타 정보 */}
            <div className="flex flex-wrap gap-4 text-sm text-slate-600">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{date}</span>
              </div>
            </div>

            {/* 리치 텍스트 에디터 */}
            <div className="space-y-4">
              <RichTextEditor
                content={content}
                onChange={(newContent) => {
                  setContent(newContent)
                  setLastCursorActivity(Date.now())
                  setTimeout(() => {
                    if (Date.now() - lastCursorActivity >= 4900 && newContent.length > 10 && !showAIHelp) {
                      setShowAIHelp(true)
                      setAiSuggestion("이런 일이 있었다고 적었는데 그때 기분은 어땠나요?")
                    }
                  }, 5000)
                }}
                placeholder="오늘 하루는 어떠셨나요? 자유롭게 작성해보세요..."
              />

              {/* AI 도움 제안 */}
              {showAIHelp && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Wand2 className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-purple-800 mb-1">AI 도움</h4>
                      <p className="text-sm text-purple-700 mb-3">{aiSuggestion}</p>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setContent(content + "\n\n" + aiSuggestion)
                            setShowAIHelp(false)
                          }}
                        >
                          질문 추가
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setAiSuggestion("오늘 가장 기억에 남는 순간은 언제였나요?")
                          }}
                        >
                          다른 질문
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setShowAIHelp(false)}>
                          닫기
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 태그 입력 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-slate-900 flex items-center">
                <Tag className="w-5 h-5 mr-2 text-green-500" />
                태그
              </h3>
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="태그를 입력하세요..."
                    value={newTag}
                    style= {{ color: "#111827" }}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTag(newTag)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  <Hash className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
                <Button
                  onClick={() => addTag(newTag)}
                  disabled={!newTag}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  추가
                </Button>
              </div>
              {/* 추천 태그 */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">감정:</p>
                  <div className="flex flex-wrap gap-2">
                    {emotionTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => addTag(tag)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors"
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">상황:</p>
                  <div className="flex flex-wrap gap-2">
                    {situationTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => addTag(tag)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">건강:</p>
                  <div className="flex flex-wrap gap-2">
                    {healthTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => addTag(tag)}
                        className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {/* 선택된 태그 */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      #{tag}
                      <button onClick={() => removeTag(tag)} className="ml-2 w-4 h-4 text-blue-600 hover:text-blue-800">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            {/* 공개/비공개 설정 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-slate-900 flex items-center">
                <Eye className="w-5 h-5 mr-2 text-purple-500" />
                공개 설정
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="privacy"
                      checked={!isPublic}
                      onChange={() => setIsPublic(false)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm font-medium text-slate-700">비공개</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="privacy"
                      checked={isPublic}
                      onChange={() => setIsPublic(true)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm font-medium text-slate-700">공개</span>
                  </label>
                </div>
                <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                  {isPublic ? (
                    <div>
                      <p className="font-medium text-slate-700 mb-1">공개 일기:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>비슷한 관심사를 가진 사람들에게 추천될 수 있습니다</li>
                        <li>다른 사용자가 댓글을 달 수 있습니다</li>
                        <li>개인정보 필터링이 자동으로 적용됩니다</li>
                      </ul>
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium text-slate-700 mb-1">비공개 일기:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>오직 본인만 볼 수 있습니다</li>
                        <li>검색되지 않으며 추천되지 않습니다</li>
                        <li>개인정보 필터링 없이 자유롭게 작성 가능합니다</li>
                      </ul>
                    </div>
                  )}
                </div>
                {isPublic && (
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setFilteredContent(content) // 개인정보 필터링 함수는 필요시 추가
                        setShowPrivacyFilter(true)
                      }}
                      className="w-full"
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      개인정보 필터링 미리보기
                    </Button>
                    {showPrivacyFilter && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h4 className="font-medium text-yellow-800 mb-2">필터링된 내용:</h4>
                        <div className="bg-white p-3 rounded border text-sm text-slate-700 mb-3">
                          {filteredContent || "내용이 없습니다."}
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" onClick={() => setContent(filteredContent)}>
                            필터링된 내용으로 교체
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setShowPrivacyFilter(false)}>
                            닫기
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-slate-200 p-8 space-y-6">
            <div className="border-b border-slate-200 pb-6">
              <h1 className="text-3xl font-bold text-slate-900 mb-4">{title || "제목 없음"}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                <span>{date}</span>
                <span>{time}</span>
                {/* 위치 출력 제거됨 */}
              </div>
            </div>
            <div className="prose prose-slate max-w-none">
              <div dangerouslySetInnerHTML={{ __html: content || "내용이 없습니다." }} />
            </div>
            {tags.length > 0 && (
              <div className="pt-4 border-t border-slate-200">
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
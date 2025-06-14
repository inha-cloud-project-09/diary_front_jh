import api from './axios'
import { 
  ApiResponse, 
  Diary, 
  OneLineDiary, 
  Community,
  CreateDiaryRequest,
  UpdateDiaryRequest,
  CreateOneLineDiaryRequest,
  UpdateOneLineDiaryRequest,
  CreateCommunityRequest,
  JoinCommunityRequest,
  AuthUser,
} from '@/types/diary';

// Diary API
export const diaryAPI = {
  // 새로운 일기 생성
  createDiary: async (data: CreateDiaryRequest): Promise<ApiResponse<Diary>> => {
    const response = await api.post<ApiResponse<Diary>>('/diaries', data)
    return response.data
  },

  // ID로 일기 조회
  getDiary: async (id: number): Promise<ApiResponse<Diary>> => {
    const response = await api.get<ApiResponse<Diary>>(`/diaries/${id}`)
    return response.data
  },

  // 기존 일기 수정정
  updateDiary: async (id: number, data: UpdateDiaryRequest): Promise<ApiResponse<Diary>> => {
    const response = await api.put<ApiResponse<Diary>>(`/diaries/${id}`, data)
    return response.data
  },

  // 일기 삭제
  deleteDiary: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/diaries/${id}`)
    return response.data
  },

  // 로그인한 사용자의 모든 일기 조회회
  getMyDiaries: async (): Promise<ApiResponse<Diary[]>> => {
    const response = await api.get<ApiResponse<Diary[]>>('/diaries/my')
    return response.data
  },

  
  getDiariesByPeriod: async (startDate: string, endDate: string): Promise<ApiResponse<Diary[]>> => {
    const response = await api.get<ApiResponse<Diary[]>>('/diaries/period', {
      params: { start: startDate, end: endDate }
    })
    return response.data
  },
}

// One Line Diary API
export const oneLineDiaryAPI = {
  createOneLineDiary: async (data: CreateOneLineDiaryRequest): Promise<ApiResponse<OneLineDiary>> => {
    const response = await api.post<ApiResponse<OneLineDiary>>('/one-line-diaries', data)
    return response.data
  },

  getOneLineDiary: async (id: number): Promise<ApiResponse<OneLineDiary>> => {
    const response = await api.get<ApiResponse<OneLineDiary>>(`/one-line-diaries/${id}`)
    return response.data
  },

  updateOneLineDiary: async (id: number, data: UpdateOneLineDiaryRequest): Promise<ApiResponse<OneLineDiary>> => {
    const response = await api.put<ApiResponse<OneLineDiary>>(`/one-line-diaries/${id}`, data)
    return response.data
  },

  deleteOneLineDiary: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/one-line-diaries/${id}`)
    return response.data
  },

  getMyOneLineDiaries: async (): Promise<ApiResponse<OneLineDiary[]>> => {
    const response = await api.get<ApiResponse<OneLineDiary[]>>('/one-line-diaries/user')
    return response.data
  },

  getOneLineDiariesByPeriod: async (startDate: string, endDate: string): Promise<ApiResponse<OneLineDiary[]>> => {
    const response = await api.get<ApiResponse<OneLineDiary[]>>('/one-line-diaries/period', {
      params: { start: startDate, end: endDate }
    })
    return response.data
  },
}

// Community API
export const communityAPI = {
  createCommunity: async (data: CreateCommunityRequest): Promise<ApiResponse<Community>> => {
    const response = await api.post<ApiResponse<Community>>('/communities', data)
    return response.data
  },

  getCommunity: async (id: number): Promise<ApiResponse<Community>> => {
    const response = await api.get<ApiResponse<Community>>(`/communities/${id}`)
    return response.data
  },

  getDefaultCommunities: async (): Promise<ApiResponse<Community[]>> => {
    const response = await api.get<ApiResponse<Community[]>>('/communities/default')
    return response.data
  },

  getMyCommunities: async (): Promise<ApiResponse<Community[]>> => {
    const response = await api.get<ApiResponse<Community[]>>('/communities/my')
    return response.data
  },

  getCommunityDiaries: async (id: number, limit?: number): Promise<ApiResponse<Diary[]>> => {
    const response = await api.get<ApiResponse<Diary[]>>(`/communities/${id}/diaries`, {
      params: limit ? { limit } : {}
    })
    return response.data
  },

  joinCommunity: async (id: number, data: JoinCommunityRequest): Promise<ApiResponse<void>> => {
    const response = await api.post<ApiResponse<void>>(`/communities/${id}/join`, data)
    return response.data
  },

  leaveCommunity: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.post<ApiResponse<void>>(`/communities/${id}/leave`)
    return response.data
  },
}

// 인증 관련 API
export const authAPI = {
  // 구글 로그인 리다이렉트
  googleLogin: () => {
    window.location.href = `https://withudiary.my/api/auth/google`;
  },

  // 현재 로그인된 사용자 정보 조회
  getCurrentUser: async (): Promise<AuthUser> => {
    const response = await api.get<AuthUser>('/auth/me');
    return response.data;
  }
};
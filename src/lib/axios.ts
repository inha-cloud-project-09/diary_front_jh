import axios from 'axios';

const api = axios.create({
  baseURL: 'https://withudiary.my/api' || '/api',
  withCredentials: true,
  timeout: 100000,
  headers: {
    'Content-Type': 'application/json',
  },
});



// Token management utilities
// Token management utilities
//필수수정
const getToken = () => {
  if (typeof window !== 'undefined') {
    const cookies = document.cookie.split('; ').reduce((acc, cookie) => {
      const [key, value] = cookie.split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    return cookies['auth-token'] || null;
  }
  return null;
};


const removeToken = () => {
  if (typeof window !== 'undefined') {
    document.cookie = 'auth-token=; Max-Age=0; path=/';
  }
};


// 요청 시간 추적을 위한 Map (TypeScript 친화적)
const requestTimings = new Map<string, number>();

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 요청 시작 시간을 Map에 저장 (고유 키 생성)
    const requestKey = `${config.method?.toUpperCase()}_${config.url}_${Date.now()}`;
    requestTimings.set(requestKey, Date.now());
    
    // 나중에 찾을 수 있도록 헤더에 키 저장
    config.headers['X-Request-ID'] = requestKey;
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // 요청 시간 계산
    const requestKey = response.config.headers['X-Request-ID'] as string;
    if (requestKey && requestTimings.has(requestKey)) {
      const startTime = requestTimings.get(requestKey)!;
      const duration = Date.now() - startTime;
      console.log(`API call to ${response.config.url} took ${duration}ms`);
      
      // 메모리 정리
      requestTimings.delete(requestKey);
    }
    
    return response;
  },
  (error) => {
    // 에러 발생 시에도 타이밍 정보 정리
    if (error.config?.headers?.['X-Request-ID']) {
      const requestKey = error.config.headers['X-Request-ID'] as string;
      requestTimings.delete(requestKey);
    }
    
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          console.warn('Authentication failed, redirecting to login');
          removeToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/';
          }
          break;
          
        case 403:
          console.error('Access forbidden');
          break;
          
        case 404:
          console.error('Resource not found');
          break;
          
        case 500:
          console.error('Server error');
          break;
          
        default:
          console.error(`API Error (${status}):`, data?.message || error.message);
      }
    } else if (error.request) {
      console.error('Network error:', error.message);
    } else {
      console.error('Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;  
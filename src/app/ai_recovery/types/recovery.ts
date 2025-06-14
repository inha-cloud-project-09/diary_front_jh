// types/recovery.ts
export interface EmotionTimelinePoint {
  date: string;
  primary_emotion: string;
  emotion_scores: Record<string, number>;
  content_summary: string;
  diary_id: number;
}

export interface RecoverySegment {
  start_date: string;
  end_date: string;
  start_emotion: string;
  end_emotion: string;
  duration_days: number;
  diary_ids: number[];
}

export interface RecoveryData {
  timeline: EmotionTimelinePoint[];
  recovery_segments: RecoverySegment[];
  insights: string[];
  effective_strategies: string[];
  recovery_triggers: string[];
  summary: string;
  total_recovery_instances: number;
  average_recovery_days: number;
}

export interface RecoveryInsights {
  total_recovery_instances: number;
  average_recovery_time: number;
  fastest_recovery: number;
  common_patterns: string[];
  recommendations: string[];
  emotion_type?: string;
  message?: string;
  suggestions?: string[];
}

export interface ChartDataPoint {
  date: string;
  fullDate: string;
  emotion: string;
  score: number;
  summary: string;
}

export interface APIError {
  message: string;
  status?: number;
}

// API 응답 타입
export interface APIResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// 감정 컬러 매핑 타입
export type EmotionColorMap = {
  [emotion: string]: string;
};

// 차트 툴팁 데이터 타입
export interface TooltipData {
  active?: boolean;
  payload?: Array<{
    payload: ChartDataPoint;
  }>;
  label?: string;
}
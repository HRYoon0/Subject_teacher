// 기본 타입 정의

// 학년 타입 (1~6학년)
export type Grade = 1 | 2 | 3 | 4 | 5 | 6;

// 요일 타입
export type Day = '월' | '화' | '수' | '목' | '금';

// 교시 타입 (1~6교시)
export type Period = 1 | 2 | 3 | 4 | 5 | 6;

// 과목 인터페이스
export interface Subject {
  id: string;
  name: string;
  color: string;  // HEX 색상 코드
}

// 학년별 반 설정
export interface GradeSettings {
  grade: Grade;
  enabled: boolean;  // 해당 학년 활성화 여부
  classCount: number;  // 반 수 (1~10)
}

// 전담교사 담당 정보
export interface TeacherAssignment {
  grade: Grade;
  subjectId: string;
}

// 전담교사 인터페이스
export interface Teacher {
  id: string;
  name: string;
  assignments: TeacherAssignment[];  // 담당 학년/과목 조합
}

// 시간표 항목
export interface ScheduleEntry {
  id: string;
  teacherId: string;
  grade: Grade;
  classNumber: number;  // 반 번호
  day: Day;
  period: Period;
  subjectId: string;
}

// 충돌 타입
export type ConflictType =
  | 'same-class-same-time'     // 같은 반 같은 시간 (빨간색)
  | 'same-teacher-same-time';  // 같은 교사 같은 시간 다른 반 (주황색)

// 충돌 정보
export interface Conflict {
  type: ConflictType;
  entries: ScheduleEntry[];
  message: string;
}

// 전체 설정 상태
export interface Settings {
  grades: GradeSettings[];
  subjects: Subject[];
}

// 앱 전체 상태
export interface AppState {
  settings: Settings;
  teachers: Teacher[];
  schedule: ScheduleEntry[];
}

// Google Sheets 데이터 구조
export interface SheetData {
  settings: GradeSettings[];
  subjects: Subject[];
  teachers: Teacher[];
  schedule: ScheduleEntry[];
}

// 기본값 상수
export const DEFAULT_SUBJECTS: Subject[] = [
  { id: 'science', name: '과학', color: '#10B981' },
  { id: 'pe', name: '체육', color: '#F97316' },
  { id: 'english', name: '영어', color: '#3B82F6' },
];

export const DEFAULT_GRADES: GradeSettings[] = [
  { grade: 1, enabled: false, classCount: 3 },
  { grade: 2, enabled: false, classCount: 3 },
  { grade: 3, enabled: true, classCount: 3 },
  { grade: 4, enabled: true, classCount: 3 },
  { grade: 5, enabled: true, classCount: 3 },
  { grade: 6, enabled: true, classCount: 3 },
];

export const DAYS: Day[] = ['월', '화', '수', '목', '금'];
export const PERIODS: Period[] = [1, 2, 3, 4, 5, 6];
export const GRADES: Grade[] = [1, 2, 3, 4, 5, 6];

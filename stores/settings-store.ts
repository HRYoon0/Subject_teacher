import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Settings,
  GradeSettings,
  Subject,
  Grade,
  DEFAULT_GRADES,
  DEFAULT_SUBJECTS,
} from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface SettingsState extends Settings {
  // 학년 설정 액션
  toggleGrade: (grade: Grade) => void;
  setClassCount: (grade: Grade, count: number) => void;

  // 과목 설정 액션
  addSubject: (name: string, color: string) => void;
  updateSubject: (id: string, name: string, color: string) => void;
  removeSubject: (id: string) => void;

  // 전체 설정 관련
  resetSettings: () => void;
  loadSettings: (settings: Settings) => void;
  getEnabledGrades: () => GradeSettings[];
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      grades: DEFAULT_GRADES,
      subjects: DEFAULT_SUBJECTS,

      // 학년 활성화/비활성화 토글
      toggleGrade: (grade) =>
        set((state) => ({
          grades: state.grades.map((g) =>
            g.grade === grade ? { ...g, enabled: !g.enabled } : g
          ),
        })),

      // 학년별 반 수 설정
      setClassCount: (grade, count) =>
        set((state) => ({
          grades: state.grades.map((g) =>
            g.grade === grade ? { ...g, classCount: Math.max(1, Math.min(10, count)) } : g
          ),
        })),

      // 과목 추가
      addSubject: (name, color) =>
        set((state) => ({
          subjects: [...state.subjects, { id: uuidv4(), name, color }],
        })),

      // 과목 수정
      updateSubject: (id, name, color) =>
        set((state) => ({
          subjects: state.subjects.map((s) =>
            s.id === id ? { ...s, name, color } : s
          ),
        })),

      // 과목 삭제
      removeSubject: (id) =>
        set((state) => ({
          subjects: state.subjects.filter((s) => s.id !== id),
        })),

      // 설정 초기화
      resetSettings: () =>
        set({
          grades: DEFAULT_GRADES,
          subjects: DEFAULT_SUBJECTS,
        }),

      // 외부에서 설정 로드 (Google Sheets 등)
      loadSettings: (settings) =>
        set({
          grades: settings.grades,
          subjects: settings.subjects,
        }),

      // 활성화된 학년만 반환
      getEnabledGrades: () => get().grades.filter((g) => g.enabled),
    }),
    {
      name: 'subject-teacher-settings',
    }
  )
);

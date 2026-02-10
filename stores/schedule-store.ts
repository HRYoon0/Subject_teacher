import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  ScheduleEntry,
  Conflict,
  Grade,
  Day,
  Period,
  ConflictType,
} from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface ScheduleState {
  schedule: ScheduleEntry[];
  conflicts: Conflict[];

  // 시간표 CRUD
  addEntry: (entry: Omit<ScheduleEntry, 'id'>) => string;
  removeEntry: (id: string) => void;
  updateEntry: (id: string, updates: Partial<ScheduleEntry>) => void;
  removeEntriesByTeacher: (teacherId: string) => void;
  clearSchedule: () => void;

  // 조회
  getEntriesByTeacher: (teacherId: string) => ScheduleEntry[];
  getEntriesByGrade: (grade: Grade) => ScheduleEntry[];
  getEntriesByClass: (grade: Grade, classNumber: number) => ScheduleEntry[];
  getEntryAt: (grade: Grade, classNumber: number, day: Day, period: Period) => ScheduleEntry | undefined;

  // 충돌 검사
  checkConflicts: () => Conflict[];
  getConflictsForEntry: (entry: ScheduleEntry) => Conflict[];

  // 데이터 로드
  loadSchedule: (schedule: ScheduleEntry[]) => void;
}

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set, get) => ({
      schedule: [],
      conflicts: [],

      // 시간표 항목 추가
      addEntry: (entry) => {
        const id = uuidv4();
        const newEntry = { ...entry, id };

        set((state) => {
          const newSchedule = [...state.schedule, newEntry];
          const conflicts = calculateConflicts(newSchedule);
          return { schedule: newSchedule, conflicts };
        });

        return id;
      },

      // 시간표 항목 삭제
      removeEntry: (id) =>
        set((state) => {
          const newSchedule = state.schedule.filter((e) => e.id !== id);
          const conflicts = calculateConflicts(newSchedule);
          return { schedule: newSchedule, conflicts };
        }),

      // 시간표 항목 수정
      updateEntry: (id, updates) =>
        set((state) => {
          const newSchedule = state.schedule.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          );
          const conflicts = calculateConflicts(newSchedule);
          return { schedule: newSchedule, conflicts };
        }),

      // 특정 교사의 모든 시간표 삭제
      removeEntriesByTeacher: (teacherId) =>
        set((state) => {
          const newSchedule = state.schedule.filter((e) => e.teacherId !== teacherId);
          const conflicts = calculateConflicts(newSchedule);
          return { schedule: newSchedule, conflicts };
        }),

      // 전체 시간표 삭제
      clearSchedule: () => set({ schedule: [], conflicts: [] }),

      // 교사별 시간표 조회
      getEntriesByTeacher: (teacherId) =>
        get().schedule.filter((e) => e.teacherId === teacherId),

      // 학년별 시간표 조회
      getEntriesByGrade: (grade) =>
        get().schedule.filter((e) => e.grade === grade),

      // 반별 시간표 조회
      getEntriesByClass: (grade, classNumber) =>
        get().schedule.filter(
          (e) => e.grade === grade && e.classNumber === classNumber
        ),

      // 특정 시간 조회
      getEntryAt: (grade, classNumber, day, period) =>
        get().schedule.find(
          (e) =>
            e.grade === grade &&
            e.classNumber === classNumber &&
            e.day === day &&
            e.period === period
        ),

      // 전체 충돌 검사
      checkConflicts: () => {
        const conflicts = calculateConflicts(get().schedule);
        set({ conflicts });
        return conflicts;
      },

      // 특정 항목 관련 충돌 조회
      getConflictsForEntry: (entry) =>
        get().conflicts.filter((c) =>
          c.entries.some((e) => e.id === entry.id)
        ),

      // 외부 데이터 로드
      loadSchedule: (schedule) => {
        const conflicts = calculateConflicts(schedule);
        set({ schedule, conflicts });
      },
    }),
    {
      name: 'subject-teacher-schedule',
    }
  )
);

// 충돌 계산 함수
function calculateConflicts(schedule: ScheduleEntry[]): Conflict[] {
  const conflicts: Conflict[] = [];

  // 같은 반, 같은 시간에 여러 수업이 있는지 확인
  const byClassTime = new Map<string, ScheduleEntry[]>();

  for (const entry of schedule) {
    const key = `${entry.grade}-${entry.classNumber}-${entry.day}-${entry.period}`;
    const existing = byClassTime.get(key) || [];
    existing.push(entry);
    byClassTime.set(key, existing);
  }

  for (const [, entries] of byClassTime) {
    if (entries.length > 1) {
      conflicts.push({
        type: 'same-class-same-time',
        entries,
        message: `${entries[0].grade}학년 ${entries[0].classNumber}반 ${entries[0].day}요일 ${entries[0].period}교시에 ${entries.length}개의 수업이 중복됩니다`,
      });
    }
  }

  // 같은 교사가 같은 시간에 다른 반에 배정되어 있는지 확인
  const byTeacherTime = new Map<string, ScheduleEntry[]>();

  for (const entry of schedule) {
    const key = `${entry.teacherId}-${entry.day}-${entry.period}`;
    const existing = byTeacherTime.get(key) || [];
    existing.push(entry);
    byTeacherTime.set(key, existing);
  }

  for (const [, entries] of byTeacherTime) {
    if (entries.length > 1) {
      // 다른 반에 배정된 경우만 충돌
      const uniqueClasses = new Set(
        entries.map((e) => `${e.grade}-${e.classNumber}`)
      );
      if (uniqueClasses.size > 1) {
        conflicts.push({
          type: 'same-teacher-same-time',
          entries,
          message: `교사가 ${entries[0].day}요일 ${entries[0].period}교시에 ${entries.length}개 반에 동시 배정됨`,
        });
      }
    }
  }

  return conflicts;
}

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Teacher, TeacherAssignment, Grade } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface TeachersState {
  teachers: Teacher[];

  // 교사 CRUD 액션
  addTeacher: (name: string) => string;
  updateTeacherName: (id: string, name: string) => void;
  removeTeacher: (id: string) => void;

  // 담당 과목/학년 관리
  addAssignment: (teacherId: string, grade: Grade, subjectId: string) => void;
  removeAssignment: (teacherId: string, grade: Grade, subjectId: string) => void;
  clearAssignments: (teacherId: string) => void;

  // 조회
  getTeacherById: (id: string) => Teacher | undefined;
  getTeachersByGrade: (grade: Grade) => Teacher[];
  getTeachersBySubject: (subjectId: string) => Teacher[];

  // 전체 데이터
  loadTeachers: (teachers: Teacher[]) => void;
  resetTeachers: () => void;
}

export const useTeachersStore = create<TeachersState>()(
  persist(
    (set, get) => ({
      teachers: [],

      // 교사 추가 (ID 반환)
      addTeacher: (name) => {
        const id = uuidv4();
        set((state) => ({
          teachers: [...state.teachers, { id, name, assignments: [] }],
        }));
        return id;
      },

      // 교사 이름 수정
      updateTeacherName: (id, name) =>
        set((state) => ({
          teachers: state.teachers.map((t) =>
            t.id === id ? { ...t, name } : t
          ),
        })),

      // 교사 삭제
      removeTeacher: (id) =>
        set((state) => ({
          teachers: state.teachers.filter((t) => t.id !== id),
        })),

      // 담당 학년/과목 추가
      addAssignment: (teacherId, grade, subjectId) =>
        set((state) => ({
          teachers: state.teachers.map((t) => {
            if (t.id !== teacherId) return t;
            // 이미 있는지 확인
            const exists = t.assignments.some(
              (a) => a.grade === grade && a.subjectId === subjectId
            );
            if (exists) return t;
            return {
              ...t,
              assignments: [...t.assignments, { grade, subjectId }],
            };
          }),
        })),

      // 담당 학년/과목 삭제
      removeAssignment: (teacherId, grade, subjectId) =>
        set((state) => ({
          teachers: state.teachers.map((t) => {
            if (t.id !== teacherId) return t;
            return {
              ...t,
              assignments: t.assignments.filter(
                (a) => !(a.grade === grade && a.subjectId === subjectId)
              ),
            };
          }),
        })),

      // 모든 담당 삭제
      clearAssignments: (teacherId) =>
        set((state) => ({
          teachers: state.teachers.map((t) =>
            t.id === teacherId ? { ...t, assignments: [] } : t
          ),
        })),

      // ID로 교사 조회
      getTeacherById: (id) => get().teachers.find((t) => t.id === id),

      // 학년으로 교사 조회
      getTeachersByGrade: (grade) =>
        get().teachers.filter((t) =>
          t.assignments.some((a) => a.grade === grade)
        ),

      // 과목으로 교사 조회
      getTeachersBySubject: (subjectId) =>
        get().teachers.filter((t) =>
          t.assignments.some((a) => a.subjectId === subjectId)
        ),

      // 외부 데이터 로드
      loadTeachers: (teachers) => set({ teachers }),

      // 초기화
      resetTeachers: () => set({ teachers: [] }),
    }),
    {
      name: 'subject-teacher-teachers',
    }
  )
);

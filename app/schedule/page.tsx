'use client';

import { useState, useMemo } from 'react';
import { Button, Card, Modal, Select } from '@/components/ui';
import { ClassScheduleGrid, TeacherScheduleGrid } from '@/components/schedule';
import { useSettingsStore } from '@/stores/settings-store';
import { useTeachersStore } from '@/stores/teachers-store';
import { useScheduleStore } from '@/stores/schedule-store';
import { Day, Period, Grade, ScheduleEntry } from '@/types';

export default function SchedulePage() {
  const { grades, subjects } = useSettingsStore();
  const { teachers } = useTeachersStore();
  const { schedule, conflicts, addEntry, removeEntry } = useScheduleStore();

  const enabledGrades = grades.filter((g) => g.enabled);

  // 선택된 교사
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const selectedTeacher = teachers.find((t) => t.id === selectedTeacherId);

  // 새 배정 모달 (전담교사 시간표에서 빈 슬롯 클릭)
  const [newEntryModal, setNewEntryModal] = useState<{
    isOpen: boolean;
    day: Day;
    period: Period;
  } | null>(null);

  // 기존 배정 수정/삭제 모달
  const [editEntryModal, setEditEntryModal] = useState<{
    isOpen: boolean;
    entry: ScheduleEntry;
  } | null>(null);

  // 선택된 교사의 담당 학년 목록
  const teacherGrades = useMemo(() => {
    if (!selectedTeacher) return [];
    const gradeSet = new Set(selectedTeacher.assignments.map((a) => a.grade));
    return enabledGrades.filter((g) => gradeSet.has(g.grade));
  }, [selectedTeacher, enabledGrades]);

  // 선택된 교사의 시간표
  const teacherSchedule = useMemo(() => {
    if (!selectedTeacher) return [];
    return schedule.filter((e) => e.teacherId === selectedTeacher.id);
  }, [schedule, selectedTeacher]);

  // 새 배정 모달에서 사용할 상태
  const [selectedGrade, setSelectedGrade] = useState<Grade | ''>('');
  const [selectedClass, setSelectedClass] = useState<number | ''>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');

  // 담당 학년-반 조합 목록 (바로 선택 가능)
  const gradeClassOptions = useMemo(() => {
    if (!selectedTeacher) return [];
    const options: { grade: Grade; classNumber: number; label: string }[] = [];

    teacherGrades.forEach((gradeSettings) => {
      for (let c = 1; c <= gradeSettings.classCount; c++) {
        options.push({
          grade: gradeSettings.grade,
          classNumber: c,
          label: `${gradeSettings.grade}-${c}`,
        });
      }
    });

    return options;
  }, [selectedTeacher, teacherGrades]);

  // 선택된 학년의 담당 과목 목록
  const availableSubjects = useMemo(() => {
    if (!selectedTeacher || !selectedGrade) return [];
    const subjectIds = selectedTeacher.assignments
      .filter((a) => a.grade === selectedGrade)
      .map((a) => a.subjectId);
    return subjects.filter((s) => subjectIds.includes(s.id));
  }, [selectedTeacher, selectedGrade, subjects]);

  // 빈 슬롯 클릭 핸들러
  const handleSlotClick = (day: Day, period: Period) => {
    setSelectedGrade('');
    setSelectedClass('');
    setSelectedSubject('');
    setNewEntryModal({ isOpen: true, day, period });
  };

  // 기존 배정 클릭 핸들러
  const handleEntryClick = (entry: ScheduleEntry) => {
    setEditEntryModal({ isOpen: true, entry });
  };

  // 새 배정 추가
  const handleAddEntry = () => {
    if (!newEntryModal || !selectedTeacher || !selectedGrade || !selectedClass || !selectedSubject) return;

    // 해당 시간에 이미 다른 교사의 수업이 있는지 확인
    const existingEntries = schedule.filter(
      (e) =>
        e.grade === selectedGrade &&
        e.classNumber === selectedClass &&
        e.day === newEntryModal.day &&
        e.period === newEntryModal.period
    );

    if (existingEntries.length > 0) {
      const existingTeacherNames = existingEntries
        .map((e) => teachers.find((t) => t.id === e.teacherId)?.name || '알 수 없음')
        .join(', ');

      const confirmed = window.confirm(
        `${selectedGrade}학년 ${selectedClass}반 ${newEntryModal.day}요일 ${newEntryModal.period}교시에 이미 ${existingTeacherNames} 선생님의 수업이 있습니다.\n\n협력수업으로 추가하시겠습니까?`
      );

      if (!confirmed) return;
    }

    addEntry({
      teacherId: selectedTeacher.id,
      grade: selectedGrade,
      classNumber: selectedClass,
      day: newEntryModal.day,
      period: newEntryModal.period,
      subjectId: selectedSubject,
    });

    setNewEntryModal(null);
  };

  // 배정 삭제
  const handleDeleteEntry = () => {
    if (!editEntryModal) return;
    removeEntry(editEntryModal.entry.id);
    setEditEntryModal(null);
  };

  // 교사별 충돌 필터
  const teacherConflicts = useMemo(() => {
    if (!selectedTeacher) return [];
    return conflicts.filter((c) =>
      c.entries.some((e) => e.teacherId === selectedTeacher.id)
    );
  }, [conflicts, selectedTeacher]);

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">시간표 작성</h1>
        <p className="mt-1 text-gray-500">
          전담교사를 선택하고 시간표를 작성하세요
        </p>
      </div>

      {/* 교사 선택 */}
      <Card>
        <div className="flex flex-wrap items-center gap-4">
          <div className="w-64">
            <Select
              label="전담교사 선택"
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              options={[
                { value: '', label: '교사를 선택하세요' },
                ...teachers.map((t) => ({
                  value: t.id,
                  label: `${t.name} (${t.assignments.length}개 담당)`,
                })),
              ]}
            />
          </div>

          {selectedTeacher && (
            <div className="flex flex-wrap gap-2">
              {selectedTeacher.assignments.map((assignment) => {
                const subject = subjects.find(
                  (s) => s.id === assignment.subjectId
                );
                return (
                  <span
                    key={`${assignment.grade}-${assignment.subjectId}`}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm text-white"
                    style={{ backgroundColor: subject?.color || '#6B7280' }}
                  >
                    {assignment.grade}학년 {subject?.name}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {/* 충돌 경고 */}
      {teacherConflicts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <svg
              className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-red-800">
                {teacherConflicts.length}개의 충돌이 발견되었습니다
              </h3>
              <ul className="mt-2 text-sm text-red-700 space-y-1">
                {teacherConflicts.map((conflict, idx) => (
                  <li key={idx}>• {conflict.message}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 전담교사 시간표 */}
      {selectedTeacher ? (
        teacherGrades.length > 0 ? (
          <div className="space-y-8">
            {/* 전담교사 개인 시간표 */}
            <TeacherScheduleGrid
              teacher={selectedTeacher}
              entries={teacherSchedule}
              subjects={subjects}
              grades={enabledGrades}
              conflicts={conflicts}
              onSlotClick={handleSlotClick}
              onEntryClick={handleEntryClick}
            />

            {/* 각 반 시간표 (참고용) */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                반별 시간표 확인
              </h2>
              {teacherGrades.map((gradeSettings) => (
                <div key={gradeSettings.grade} className="mb-6">
                  <h3 className="text-md font-medium text-gray-700 mb-3">
                    {gradeSettings.grade}학년
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {Array.from(
                      { length: gradeSettings.classCount },
                      (_, i) => i + 1
                    ).map((classNumber) => (
                      <ClassScheduleGrid
                        key={`${gradeSettings.grade}-${classNumber}`}
                        grade={gradeSettings.grade}
                        classNumber={classNumber}
                        entries={schedule.filter(
                          (e) =>
                            e.grade === gradeSettings.grade &&
                            e.classNumber === classNumber
                        )}
                        subjects={subjects}
                        conflicts={conflicts}
                        onSlotClick={() => {}}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-500">
                선택한 교사에게 담당 학년/과목이 설정되어 있지 않습니다.
              </p>
              <p className="text-gray-500 mt-1">
                전담교사 관리 페이지에서 담당 학년/과목을 설정해주세요.
              </p>
            </div>
          </Card>
        )
      ) : (
        <Card>
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              전담교사를 선택하세요
            </h3>
            <p className="mt-2 text-gray-500">
              시간표를 작성할 전담교사를 먼저 선택해주세요
            </p>
          </div>
        </Card>
      )}

      {/* 새 배정 모달 */}
      <Modal
        isOpen={newEntryModal?.isOpen ?? false}
        onClose={() => setNewEntryModal(null)}
        title={newEntryModal ? `${newEntryModal.day}요일 ${newEntryModal.period}교시 배정` : ''}
        size="2xl"
      >
        {newEntryModal && selectedTeacher && (
          <div className="space-y-4">
            {/* 학년-반 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                학년-반
              </label>
              <div className="space-y-2">
                {teacherGrades.map((gradeSettings) => (
                  <div key={gradeSettings.grade} className="flex items-center gap-2">
                    <span className="w-16 text-sm font-medium text-gray-500">
                      {gradeSettings.grade}학년
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {Array.from({ length: gradeSettings.classCount }, (_, i) => i + 1).map((classNum) => (
                        <button
                          key={`${gradeSettings.grade}-${classNum}`}
                          onClick={() => {
                            setSelectedGrade(gradeSettings.grade);
                            setSelectedClass(classNum);
                            setSelectedSubject('');
                          }}
                          className={`px-4 py-2 rounded-lg border-2 transition-all text-base font-semibold ${
                            selectedGrade === gradeSettings.grade && selectedClass === classNum
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700'
                          }`}
                        >
                          {gradeSettings.grade}-{classNum}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 과목 선택 */}
            {selectedGrade && selectedClass && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  과목
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {availableSubjects.map((subject) => (
                    <button
                      key={subject.id}
                      onClick={() => setSelectedSubject(subject.id)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedSubject === subject.id
                          ? 'ring-2 ring-offset-2'
                          : ''
                      }`}
                      style={{
                        borderColor: subject.color,
                        backgroundColor: selectedSubject === subject.id ? subject.color + '20' : 'transparent',
                      }}
                    >
                      <span className="font-semibold" style={{ color: subject.color }}>
                        {subject.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="secondary" onClick={() => setNewEntryModal(null)}>
                취소
              </Button>
              <Button
                onClick={handleAddEntry}
                disabled={!selectedGrade || !selectedClass || !selectedSubject}
              >
                배정
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* 배정 수정/삭제 모달 */}
      <Modal
        isOpen={editEntryModal?.isOpen ?? false}
        onClose={() => setEditEntryModal(null)}
        title="배정 관리"
      >
        {editEntryModal && (
          <div className="space-y-4">
            {(() => {
              const entry = editEntryModal.entry;
              const subject = subjects.find((s) => s.id === entry.subjectId);
              return (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-lg font-semibold text-gray-900">
                    {entry.grade}학년 {entry.classNumber}반
                  </p>
                  <p className="text-gray-600">
                    {entry.day}요일 {entry.period}교시
                  </p>
                  <span
                    className="inline-block mt-2 px-3 py-1 rounded-full text-sm text-white"
                    style={{ backgroundColor: subject?.color || '#6B7280' }}
                  >
                    {subject?.name}
                  </span>
                </div>
              );
            })()}

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="secondary" onClick={() => setEditEntryModal(null)}>
                닫기
              </Button>
              <Button variant="danger" onClick={handleDeleteEntry}>
                배정 삭제
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

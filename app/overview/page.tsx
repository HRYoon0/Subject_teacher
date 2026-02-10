'use client';

import { useState, useMemo } from 'react';
import { Button, Card, Select, Badge } from '@/components/ui';
import { useSettingsStore } from '@/stores/settings-store';
import { useTeachersStore } from '@/stores/teachers-store';
import { useScheduleStore } from '@/stores/schedule-store';
import { DAYS, PERIODS, Grade, Day, Period } from '@/types';

type ViewMode = 'by-teacher' | 'by-grade' | 'by-class';

export default function OverviewPage() {
  const { grades, subjects } = useSettingsStore();
  const { teachers } = useTeachersStore();
  const { schedule, conflicts } = useScheduleStore();

  const enabledGrades = grades.filter((g) => g.enabled);

  const [viewMode, setViewMode] = useState<ViewMode>('by-teacher');
  const [selectedGrade, setSelectedGrade] = useState<Grade | ''>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);

  // 특정 시간대의 수업 정보 가져오기
  const getScheduleInfo = (
    teacherId: string | null,
    grade: Grade | null,
    classNumber: number | null,
    day: Day,
    period: Period
  ) => {
    return schedule.filter((entry) => {
      if (teacherId && entry.teacherId !== teacherId) return false;
      if (grade && entry.grade !== grade) return false;
      if (classNumber && entry.classNumber !== classNumber) return false;
      return entry.day === day && entry.period === period;
    });
  };

  // 엑셀 다운로드
  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/export/excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schedule,
          teachers,
          subjects,
          grades: enabledGrades,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = '전담교사_시간표.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('엑셀 다운로드 실패:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // DOCX 다운로드
  const handleExportDocx = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/export/docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schedule,
          teachers,
          subjects,
          grades: enabledGrades,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = '전담교사_시간표.docx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('DOCX 다운로드 실패:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">전체 시간표 보기</h1>
          <p className="mt-1 text-gray-500">
            전체 시간표를 확인하고 다운로드하세요
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handleExportExcel} disabled={isExporting}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            엑셀 다운로드
          </Button>
          <Button variant="secondary" onClick={handleExportDocx} disabled={isExporting}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Word 다운로드
          </Button>
        </div>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500">전체 배정</p>
          <p className="text-2xl font-bold text-gray-900">{schedule.length}개</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500">전담교사</p>
          <p className="text-2xl font-bold text-gray-900">{teachers.length}명</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500">충돌</p>
          <p className={`text-2xl font-bold ${conflicts.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {conflicts.length}개
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500">과목</p>
          <p className="text-2xl font-bold text-gray-900">{subjects.length}개</p>
        </div>
      </div>

      {/* 보기 모드 선택 */}
      <Card>
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              보기 모드
            </label>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => setViewMode('by-teacher')}
                className={`px-4 py-2 text-sm font-medium ${
                  viewMode === 'by-teacher'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                교사별
              </button>
              <button
                onClick={() => setViewMode('by-class')}
                className={`px-4 py-2 text-sm font-medium border-l border-gray-200 ${
                  viewMode === 'by-class'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                학급별
              </button>
              <button
                onClick={() => setViewMode('by-grade')}
                className={`px-4 py-2 text-sm font-medium border-l border-gray-200 ${
                  viewMode === 'by-grade'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                학년별
              </button>
            </div>
          </div>

          {(viewMode === 'by-grade' || viewMode === 'by-class') && (
            <div className="w-40">
              <Select
                label="학년 선택"
                value={selectedGrade}
                onChange={(e) =>
                  setSelectedGrade(e.target.value ? (parseInt(e.target.value) as Grade) : '')
                }
                options={[
                  { value: '', label: '전체' },
                  ...enabledGrades.map((g) => ({
                    value: g.grade,
                    label: `${g.grade}학년`,
                  })),
                ]}
              />
            </div>
          )}

          {viewMode === 'by-grade' && (
            <div className="w-40">
              <Select
                label="과목 선택"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                options={[
                  { value: '', label: '과목을 선택하세요' },
                  ...subjects.map((s) => ({
                    value: s.id,
                    label: s.name,
                  })),
                ]}
              />
            </div>
          )}
        </div>
      </Card>

      {/* 시간표 보기 */}
      {viewMode === 'by-teacher' && (
        <div className="space-y-6">
          {teachers.map((teacher) => {
            const teacherSchedule = schedule.filter(
              (e) => e.teacherId === teacher.id
            );
            if (teacherSchedule.length === 0) return null;

            return (
              <Card key={teacher.id} title={teacher.name}>
                <div className="overflow-x-auto">
                  <table className="w-full table-fixed">
                    <thead>
                      <tr>
                        <th className="w-[60px] py-2 text-center text-sm font-medium text-gray-500">
                          교시
                        </th>
                        {DAYS.map((day) => (
                          <th
                            key={day}
                            className="py-2 text-center text-sm font-medium text-gray-500"
                          >
                            {day}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {PERIODS.map((period) => (
                        <tr key={period}>
                          <td className="py-1 text-center text-sm font-medium text-gray-600">
                            {period}
                          </td>
                          {DAYS.map((day) => {
                            const entries = getScheduleInfo(
                              teacher.id,
                              null,
                              null,
                              day,
                              period
                            );
                            return (
                              <td key={day} className="p-1">
                                <div
                                  className="h-10 rounded-lg flex items-center justify-center border"
                                  style={
                                    entries.length > 0
                                      ? {
                                          backgroundColor: subjects.find(
                                            (s) => s.id === entries[0].subjectId
                                          )?.color || '#6B7280',
                                          borderColor: 'transparent',
                                        }
                                      : { borderColor: '#E5E7EB' }
                                  }
                                >
                                  {entries.length > 0 ? (
                                    <span className="text-sm font-semibold text-white">
                                      {entries.map((e) => `${e.grade}-${e.classNumber}`).join(', ')}
                                    </span>
                                  ) : (
                                    <span className="text-gray-300">-</span>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {viewMode === 'by-grade' && !selectedSubject && (
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              과목을 선택하세요
            </h3>
            <p className="mt-2 text-gray-500">
              학년별 시간표를 보려면 과목을 먼저 선택해주세요
            </p>
          </div>
        </Card>
      )}

      {viewMode === 'by-grade' && selectedSubject && (
        <div className="space-y-6">
          {enabledGrades
            .filter((g) => !selectedGrade || g.grade === selectedGrade)
            .map((gradeSettings) => {
              // 과목 필터링
              const filteredSchedule = schedule.filter(
                (e) =>
                  e.grade === gradeSettings.grade &&
                  e.subjectId === selectedSubject
              );

              return (
                <Card
                  key={gradeSettings.grade}
                  title={`${gradeSettings.grade}학년 - ${subjects.find(s => s.id === selectedSubject)?.name}`}
                >
                  <div className="overflow-x-auto">
                    <table className="w-full table-fixed">
                      <thead>
                        <tr>
                          <th className="w-[60px] py-2 text-center text-sm font-medium text-gray-500">
                            교시
                          </th>
                          {DAYS.map((day) => (
                            <th
                              key={day}
                              className="py-2 text-center text-sm font-medium text-gray-500"
                            >
                              {day}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {PERIODS.map((period) => (
                          <tr key={period}>
                            <td className="py-1 text-center text-sm font-medium text-gray-600">
                              {period}
                            </td>
                            {DAYS.map((day) => {
                              const entries = filteredSchedule.filter(
                                (e) => e.day === day && e.period === period
                              );
                              return (
                                <td key={day} className="p-1">
                                  <div
                                    className="h-10 rounded-lg flex items-center justify-center border"
                                    style={
                                      entries.length > 0
                                        ? {
                                            backgroundColor: subjects.find(
                                              (s) => s.id === entries[0].subjectId
                                            )?.color || '#6B7280',
                                            borderColor: 'transparent',
                                          }
                                        : { borderColor: '#E5E7EB' }
                                    }
                                  >
                                    {entries.length > 0 ? (
                                      <span className="text-sm font-semibold text-white">
                                        {entries.map((e) => `${e.grade}-${e.classNumber}`).join(', ')}
                                      </span>
                                    ) : (
                                      <span className="text-gray-300">-</span>
                                    )}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              );
            })}
        </div>
      )}

      {viewMode === 'by-class' && (
        <div className="space-y-6">
          {enabledGrades
            .filter((g) => !selectedGrade || g.grade === selectedGrade)
            .map((gradeSettings) => (
              <div key={gradeSettings.grade} className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {gradeSettings.grade}학년
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {Array.from(
                    { length: gradeSettings.classCount },
                    (_, i) => i + 1
                  ).map((classNumber) => (
                    <Card
                      key={`${gradeSettings.grade}-${classNumber}`}
                      title={`${gradeSettings.grade}학년 ${classNumber}반`}
                    >
                      <div className="overflow-x-auto">
                        <table className="w-full table-fixed">
                          <thead>
                            <tr>
                              <th className="w-[40px] py-2 text-center text-sm font-medium text-gray-500">
                                교시
                              </th>
                              {DAYS.map((day) => (
                                <th
                                  key={day}
                                  className="py-2 text-center text-sm font-medium text-gray-500"
                                >
                                  {day}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {PERIODS.map((period) => (
                              <tr key={period}>
                                <td className="py-1 text-center text-sm font-medium text-gray-600">
                                  {period}
                                </td>
                                {DAYS.map((day) => {
                                  const entries = getScheduleInfo(
                                    null,
                                    gradeSettings.grade,
                                    classNumber,
                                    day,
                                    period
                                  );
                                  const entry = entries[0];
                                  const subject = entry
                                    ? subjects.find((s) => s.id === entry.subjectId)
                                    : null;
                                  return (
                                    <td key={day} className="p-1">
                                      <div
                                        className="h-10 rounded-lg flex items-center justify-center border"
                                        style={
                                          entry
                                            ? {
                                                backgroundColor: subject?.color || '#6B7280',
                                                borderColor: 'transparent',
                                              }
                                            : { borderColor: '#E5E7EB' }
                                        }
                                      >
                                        {entry ? (
                                          <span className="text-sm font-semibold text-white">
                                            {subject?.name}
                                          </span>
                                        ) : (
                                          <span className="text-gray-300">-</span>
                                        )}
                                      </div>
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* 데이터 없음 */}
      {schedule.length === 0 && (
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              배정된 시간표가 없습니다
            </h3>
            <p className="mt-2 text-gray-500">
              시간표 작성 페이지에서 시간표를 작성해주세요
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

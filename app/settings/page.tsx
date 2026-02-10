'use client';

import { useState } from 'react';
import { Button, Card, Input, Modal } from '@/components/ui';
import { useSettingsStore } from '@/stores/settings-store';
import { useTeachersStore } from '@/stores/teachers-store';
import { useScheduleStore } from '@/stores/schedule-store';
import { GRADES, Grade } from '@/types';

// 기본 색상 팔레트
const COLOR_PALETTE = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // yellow
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
];

export default function SettingsPage() {
  const {
    grades,
    subjects,
    toggleGrade,
    setClassCount,
    addSubject,
    updateSubject,
    removeSubject,
    resetSettings,
  } = useSettingsStore();

  const { resetTeachers } = useTeachersStore();
  const { clearSchedule } = useScheduleStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<{
    id: string;
    name: string;
    color: string;
  } | null>(null);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectColor, setNewSubjectColor] = useState(COLOR_PALETTE[0]);

  const handleAddSubject = () => {
    if (newSubjectName.trim()) {
      addSubject(newSubjectName.trim(), newSubjectColor);
      setNewSubjectName('');
      setNewSubjectColor(COLOR_PALETTE[0]);
      setIsAddModalOpen(false);
    }
  };

  const handleUpdateSubject = () => {
    if (editingSubject && editingSubject.name.trim()) {
      updateSubject(editingSubject.id, editingSubject.name.trim(), editingSubject.color);
      setEditingSubject(null);
    }
  };

  // 전체 초기화 (설정 + 교사 + 시간표)
  const handleResetAll = () => {
    resetSettings();
    resetTeachers();
    clearSchedule();
    setIsResetModalOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">설정</h1>
          <p className="mt-1 text-gray-500">
            학년, 반 수, 과목을 설정합니다
          </p>
        </div>
        <button
          onClick={() => setIsResetModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          초기화
        </button>
      </div>

      {/* 학년 설정 */}
      <Card title="학년 설정" description="전담 수업이 있는 학년을 선택하고 반 수를 설정하세요">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {GRADES.map((gradeNum) => {
            const grade = grades.find((g) => g.grade === gradeNum);
            const isEnabled = grade?.enabled ?? false;
            const classCount = grade?.classCount ?? 3;

            return (
              <div
                key={gradeNum}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isEnabled
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={() => toggleGrade(gradeNum as Grade)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="font-semibold text-gray-900">
                      {gradeNum}학년
                    </span>
                  </label>
                </div>

                {isEnabled && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">반 수:</span>
                    <select
                      value={classCount}
                      onChange={(e) =>
                        setClassCount(gradeNum as Grade, parseInt(e.target.value))
                      }
                      className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                        <option key={n} value={n}>
                          {n}반
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* 과목 설정 */}
      <Card
        title="과목 설정"
        description="전담 과목을 추가하고 관리하세요"
      >
        <div className="space-y-4">
          {/* 과목 목록 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {subjects.map((subject) => (
              <div
                key={subject.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-6 h-6 rounded-full flex-shrink-0"
                    style={{ backgroundColor: subject.color }}
                  />
                  <span className="font-medium text-gray-900">
                    {subject.name}
                  </span>
                </div>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditingSubject(subject)}
                    className="p-1 text-gray-400 hover:text-blue-600 rounded"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => removeSubject(subject.id)}
                    className="p-1 text-gray-400 hover:text-red-600 rounded"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 과목 추가 버튼 */}
          <Button onClick={() => setIsAddModalOpen(true)}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            과목 추가
          </Button>
        </div>
      </Card>

      {/* 과목 추가 모달 */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="과목 추가"
      >
        <div className="space-y-4">
          <Input
            label="과목 이름"
            value={newSubjectName}
            onChange={(e) => setNewSubjectName(e.target.value)}
            placeholder="예: 영어"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              색상 선택
            </label>
            <div className="flex flex-wrap gap-2">
              {COLOR_PALETTE.map((color) => (
                <button
                  key={color}
                  onClick={() => setNewSubjectColor(color)}
                  className={`w-8 h-8 rounded-full transition-transform ${
                    newSubjectColor === color
                      ? 'ring-2 ring-offset-2 ring-blue-500 scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              취소
            </Button>
            <Button onClick={handleAddSubject} disabled={!newSubjectName.trim()}>
              추가
            </Button>
          </div>
        </div>
      </Modal>

      {/* 과목 수정 모달 */}
      <Modal
        isOpen={!!editingSubject}
        onClose={() => setEditingSubject(null)}
        title="과목 수정"
      >
        {editingSubject && (
          <div className="space-y-4">
            <Input
              label="과목 이름"
              value={editingSubject.name}
              onChange={(e) =>
                setEditingSubject({ ...editingSubject, name: e.target.value })
              }
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                색상 선택
              </label>
              <div className="flex flex-wrap gap-2">
                {COLOR_PALETTE.map((color) => (
                  <button
                    key={color}
                    onClick={() =>
                      setEditingSubject({ ...editingSubject, color })
                    }
                    className={`w-8 h-8 rounded-full transition-transform ${
                      editingSubject.color === color
                        ? 'ring-2 ring-offset-2 ring-blue-500 scale-110'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="secondary" onClick={() => setEditingSubject(null)}>
                취소
              </Button>
              <Button onClick={handleUpdateSubject} disabled={!editingSubject.name.trim()}>
                저장
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* 초기화 확인 모달 */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="데이터 초기화"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-medium text-red-800">주의: 이 작업은 되돌릴 수 없습니다</p>
                <p className="mt-1 text-sm text-red-700">
                  모든 설정, 전담교사, 시간표 데이터가 초기화됩니다.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="secondary" onClick={() => setIsResetModalOpen(false)}>
              취소
            </Button>
            <Button
              onClick={handleResetAll}
              className="!bg-red-600 hover:!bg-red-700"
            >
              전체 초기화
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

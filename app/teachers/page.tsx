'use client';

import { useState } from 'react';
import { Button, Card, Input, Modal, Badge } from '@/components/ui';
import { useSettingsStore } from '@/stores/settings-store';
import { useTeachersStore } from '@/stores/teachers-store';
import { useScheduleStore } from '@/stores/schedule-store';
import { Grade, GRADES } from '@/types';

export default function TeachersPage() {
  const { grades, subjects } = useSettingsStore();
  const {
    teachers,
    addTeacher,
    updateTeacherName,
    removeTeacher,
    addAssignment,
    removeAssignment,
  } = useTeachersStore();
  const { removeEntriesByTeacher } = useScheduleStore();

  const enabledGrades = grades.filter((g) => g.enabled);

  // 교사 삭제 (스케줄도 함께 삭제)
  const handleRemoveTeacher = (teacherId: string) => {
    removeEntriesByTeacher(teacherId);
    removeTeacher(teacherId);
  };

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTeacherName, setNewTeacherName] = useState('');
  const [editingTeacher, setEditingTeacher] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAddTeacher = () => {
    if (newTeacherName.trim()) {
      addTeacher(newTeacherName.trim());
      setNewTeacherName('');
      setIsAddModalOpen(false);
    }
  };

  const handleStartEdit = (teacherId: string, currentName: string) => {
    setEditingTeacher(teacherId);
    setEditName(currentName);
  };

  const handleSaveEdit = () => {
    if (editingTeacher && editName.trim()) {
      updateTeacherName(editingTeacher, editName.trim());
      setEditingTeacher(null);
      setEditName('');
    }
  };

  const handleToggleAssignment = (
    teacherId: string,
    grade: Grade,
    subjectId: string,
    hasAssignment: boolean
  ) => {
    if (hasAssignment) {
      removeAssignment(teacherId, grade, subjectId);
    } else {
      addAssignment(teacherId, grade, subjectId);
    }
  };

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">전담교사 관리</h1>
          <p className="mt-1 text-gray-500">
            전담교사를 추가하고 담당 학년/과목을 설정합니다
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          교사 추가
        </Button>
      </div>

      {/* 안내 메시지 */}
      {enabledGrades.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-yellow-800">
            먼저 설정 페이지에서 학년을 활성화해주세요.
          </p>
        </div>
      )}

      {subjects.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-yellow-800">
            먼저 설정 페이지에서 과목을 추가해주세요.
          </p>
        </div>
      )}

      {/* 교사 목록 */}
      {teachers.length === 0 ? (
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
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              등록된 전담교사가 없습니다
            </h3>
            <p className="mt-2 text-gray-500">
              교사 추가 버튼을 눌러 전담교사를 등록하세요
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {teachers.map((teacher) => (
            <Card key={teacher.id}>
              <div className="space-y-4">
                {/* 교사 이름 */}
                <div className="flex items-center justify-between">
                  {editingTeacher === teacher.id ? (
                    <div className="flex items-center space-x-2">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-48"
                        autoFocus
                      />
                      <Button size="sm" onClick={handleSaveEdit}>
                        저장
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingTeacher(null)}
                      >
                        취소
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {teacher.name}
                      </h3>
                      <Badge variant="info">
                        {teacher.assignments.length}개 담당
                      </Badge>
                    </div>
                  )}

                  {editingTeacher !== teacher.id && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          handleStartEdit(teacher.id, teacher.name)
                        }
                        className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleRemoveTeacher(teacher.id)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                {/* 담당 학년/과목 설정 */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    담당 학년/과목 설정
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr>
                          <th className="px-3 py-2 text-left text-sm font-medium text-gray-500">
                            과목
                          </th>
                          {enabledGrades.map((g) => (
                            <th
                              key={g.grade}
                              className="px-3 py-2 text-center text-sm font-medium text-gray-500"
                            >
                              {g.grade}학년
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {subjects.map((subject) => (
                          <tr key={subject.id}>
                            <td className="px-3 py-2">
                              <div className="flex items-center space-x-2">
                                <div
                                  className="w-4 h-4 rounded-full"
                                  style={{ backgroundColor: subject.color }}
                                />
                                <span className="text-sm font-medium text-gray-900">
                                  {subject.name}
                                </span>
                              </div>
                            </td>
                            {enabledGrades.map((g) => {
                              const hasAssignment = teacher.assignments.some(
                                (a) =>
                                  a.grade === g.grade &&
                                  a.subjectId === subject.id
                              );
                              return (
                                <td
                                  key={g.grade}
                                  className="px-3 py-2 text-center"
                                >
                                  <button
                                    onClick={() =>
                                      handleToggleAssignment(
                                        teacher.id,
                                        g.grade,
                                        subject.id,
                                        hasAssignment
                                      )
                                    }
                                    className={`w-8 h-8 rounded-lg transition-all ${
                                      hasAssignment
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                    }`}
                                  >
                                    {hasAssignment ? (
                                      <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                    ) : (
                                      <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                      </svg>
                                    )}
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 현재 담당 목록 */}
                {teacher.assignments.length > 0 && (
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-sm text-gray-600 mb-2">현재 담당:</p>
                    <div className="flex flex-wrap gap-2">
                      {teacher.assignments.map((assignment) => {
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
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* 교사 추가 모달 */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="전담교사 추가"
      >
        <div className="space-y-4">
          <Input
            label="교사 이름"
            value={newTeacherName}
            onChange={(e) => setNewTeacherName(e.target.value)}
            placeholder="예: 김영희"
            autoFocus
          />

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              취소
            </Button>
            <Button onClick={handleAddTeacher} disabled={!newTeacherName.trim()}>
              추가
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { Card } from '@/components/ui';
import { useSettingsStore } from '@/stores/settings-store';
import { useTeachersStore } from '@/stores/teachers-store';
import { useScheduleStore } from '@/stores/schedule-store';

export default function Dashboard() {
  const { grades, subjects } = useSettingsStore();
  const { teachers } = useTeachersStore();
  const { schedule, conflicts } = useScheduleStore();

  const enabledGrades = grades.filter((g) => g.enabled);
  const totalClasses = enabledGrades.reduce((sum, g) => sum + g.classCount, 0);

  const stats = [
    {
      label: '활성 학년',
      value: enabledGrades.length,
      unit: '개 학년',
      color: 'bg-blue-500',
    },
    {
      label: '전체 학급',
      value: totalClasses,
      unit: '개 반',
      color: 'bg-green-500',
    },
    {
      label: '전담교사',
      value: teachers.length,
      unit: '명',
      color: 'bg-purple-500',
    },
    {
      label: '배정된 수업',
      value: schedule.length,
      unit: '개',
      color: 'bg-orange-500',
    },
  ];

  const quickLinks = [
    {
      href: '/settings',
      title: '설정',
      description: '학년, 반 수, 과목을 설정합니다',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      href: '/teachers',
      title: '전담교사 관리',
      description: '전담교사를 추가하고 담당 과목을 설정합니다',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      href: '/schedule',
      title: '시간표 작성',
      description: '전담교사별 시간표를 작성합니다',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      href: '/overview',
      title: '전체 보기',
      description: '전체 시간표를 확인하고 다운로드합니다',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <p className="mt-1 text-gray-500">
          전담교사 시간표 배치 현황을 한눈에 확인하세요
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">
                  {stat.value}
                  <span className="text-lg font-normal text-gray-500 ml-1">
                    {stat.unit}
                  </span>
                </p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg opacity-20`} />
            </div>
          </div>
        ))}
      </div>

      {/* 충돌 경고 */}
      {conflicts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg
                className="w-5 h-5 text-red-500"
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
            </div>
            <div>
              <h3 className="text-sm font-medium text-red-800">
                {conflicts.length}개의 시간표 충돌이 발견되었습니다
              </h3>
              <ul className="mt-2 text-sm text-red-700 space-y-1">
                {conflicts.slice(0, 3).map((conflict, idx) => (
                  <li key={idx}>• {conflict.message}</li>
                ))}
                {conflicts.length > 3 && (
                  <li className="text-red-600">
                    ... 그 외 {conflicts.length - 3}개
                  </li>
                )}
              </ul>
              <Link
                href="/schedule"
                className="mt-2 inline-block text-sm font-medium text-red-800 hover:text-red-900"
              >
                시간표에서 확인하기 →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 빠른 링크 */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">빠른 시작</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
                  {link.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {link.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">{link.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 현재 설정 요약 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 과목 목록 */}
        <Card title="등록된 과목" description="현재 설정된 전담 과목 목록">
          {subjects.length === 0 ? (
            <p className="text-gray-500 text-sm">등록된 과목이 없습니다</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {subjects.map((subject) => (
                <span
                  key={subject.id}
                  className="px-3 py-1 rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: subject.color }}
                >
                  {subject.name}
                </span>
              ))}
            </div>
          )}
        </Card>

        {/* 전담교사 목록 */}
        <Card title="전담교사 현황" description="등록된 전담교사 목록">
          {teachers.length === 0 ? (
            <p className="text-gray-500 text-sm">등록된 전담교사가 없습니다</p>
          ) : (
            <div className="space-y-2">
              {teachers.slice(0, 5).map((teacher) => (
                <div
                  key={teacher.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <span className="font-medium text-gray-900">{teacher.name}</span>
                  <span className="text-sm text-gray-500">
                    {teacher.assignments.length}개 담당
                  </span>
                </div>
              ))}
              {teachers.length > 5 && (
                <p className="text-sm text-gray-500 pt-2">
                  ... 그 외 {teachers.length - 5}명
                </p>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

'use client';

import { Subject, ScheduleEntry, ConflictType } from '@/types';

interface TimeSlotProps {
  entry?: ScheduleEntry;
  subject?: Subject;
  conflictType?: ConflictType;
  onClick: () => void;
  isSelected?: boolean;
}

export default function TimeSlot({
  entry,
  subject,
  conflictType,
  onClick,
  isSelected,
}: TimeSlotProps) {
  // 충돌에 따른 배경색 결정
  const getBackgroundStyle = () => {
    if (conflictType === 'same-class-same-time') {
      return 'bg-red-100 border-red-400 ring-2 ring-red-400';
    }
    if (conflictType === 'same-teacher-same-time') {
      return 'bg-orange-100 border-orange-400 ring-2 ring-orange-400';
    }
    if (entry && subject) {
      return 'border-transparent';
    }
    return 'border-gray-200 hover:border-blue-300 hover:bg-blue-50';
  };

  return (
    <button
      onClick={onClick}
      className={`
        w-full h-16 rounded-lg border-2 transition-all
        flex items-center justify-center text-sm font-medium
        ${getBackgroundStyle()}
        ${isSelected ? 'ring-2 ring-blue-500' : ''}
      `}
      style={
        entry && subject && !conflictType
          ? { backgroundColor: subject.color + '20', borderColor: subject.color }
          : undefined
      }
    >
      {entry && subject ? (
        <div className="text-center">
          <span
            className="font-semibold"
            style={{ color: subject.color }}
          >
            {subject.name}
          </span>
          {conflictType && (
            <div className="text-xs mt-0.5">
              {conflictType === 'same-class-same-time' ? '⚠️ 중복' : '⚠️ 교사 중복'}
            </div>
          )}
        </div>
      ) : (
        <span className="text-gray-400">+</span>
      )}
    </button>
  );
}

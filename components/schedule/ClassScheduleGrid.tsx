'use client';

import { DAYS, PERIODS, Day, Period, Grade, Subject, ScheduleEntry, Conflict } from '@/types';

interface ClassScheduleGridProps {
  grade: Grade;
  classNumber: number;
  entries: ScheduleEntry[];
  subjects: Subject[];
  conflicts: Conflict[];
  onSlotClick: (day: Day, period: Period, existingEntry?: ScheduleEntry) => void;
}

export default function ClassScheduleGrid({
  grade,
  classNumber,
  entries,
  subjects,
  conflicts,
  onSlotClick,
}: ClassScheduleGridProps) {
  const getEntryAt = (day: Day, period: Period) => {
    return entries.find(
      (e) =>
        e.grade === grade &&
        e.classNumber === classNumber &&
        e.day === day &&
        e.period === period
    );
  };

  const getConflictType = (entry?: ScheduleEntry) => {
    if (!entry) return undefined;

    const conflict = conflicts.find((c) =>
      c.entries.some((e) => e.id === entry.id)
    );
    return conflict?.type;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* 헤더 */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">
          {grade}학년 {classNumber}반
        </h3>
      </div>

      {/* 시간표 그리드 */}
      <div className="p-4">
        <table className="w-full table-fixed">
          <thead>
            <tr>
              <th className="w-[40px] py-2 text-sm font-medium text-gray-500">
                교시
              </th>
              {DAYS.map((day) => (
                <th key={day} className="py-2 text-sm font-medium text-gray-500">
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
                  const entry = getEntryAt(day, period);
                  const subject = entry
                    ? subjects.find((s) => s.id === entry.subjectId)
                    : undefined;
                  const conflictType = getConflictType(entry);

                  return (
                    <td key={day} className="p-1">
                      <div
                        onClick={() => onSlotClick(day, period, entry)}
                        className={`
                          h-10 rounded-lg border-2 cursor-pointer transition-all
                          flex items-center justify-center
                          ${conflictType === 'same-class-same-time'
                            ? 'border-red-400 bg-red-100'
                            : conflictType === 'same-teacher-same-time'
                              ? 'border-orange-400 bg-orange-100'
                              : entry && subject
                                ? 'border-transparent'
                                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                          }
                        `}
                        style={
                          entry && subject && !conflictType
                            ? { backgroundColor: subject.color, borderColor: subject.color }
                            : undefined
                        }
                      >
                        {entry && subject ? (
                          <span className="text-sm font-semibold text-white">
                            {subject.name}
                          </span>
                        ) : (
                          <span className="text-gray-400">+</span>
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
    </div>
  );
}

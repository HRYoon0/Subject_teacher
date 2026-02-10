'use client';

import { DAYS, PERIODS, Day, Period, ScheduleEntry, Subject, Teacher, GradeSettings, Conflict } from '@/types';

interface TeacherScheduleGridProps {
  teacher: Teacher;
  entries: ScheduleEntry[];
  subjects: Subject[];
  grades: GradeSettings[];
  conflicts: Conflict[];
  onSlotClick: (day: Day, period: Period) => void;
  onEntryClick: (entry: ScheduleEntry) => void;
}

export default function TeacherScheduleGrid({
  teacher,
  entries,
  subjects,
  grades,
  conflicts,
  onSlotClick,
  onEntryClick,
}: TeacherScheduleGridProps) {
  const getEntriesAt = (day: Day, period: Period) => {
    return entries.filter((e) => e.day === day && e.period === period);
  };

  const hasConflict = (day: Day, period: Period) => {
    const slotEntries = getEntriesAt(day, period);
    return slotEntries.length > 1;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="bg-blue-50 px-4 py-3 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          {teacher.name} 선생님 시간표
        </h3>
        <p className="text-base text-gray-500 mt-1">
          클릭하여 수업을 배정하세요
        </p>
      </div>

      <div className="p-4 overflow-x-auto">
        <table className="w-full table-fixed min-w-[600px]">
          <thead>
            <tr>
              <th className="w-[60px] py-2 text-base font-medium text-gray-500">
                교시
              </th>
              {DAYS.map((day) => (
                <th key={day} className="w-[calc((100%-60px)/5)] py-2 text-base font-medium text-gray-500 text-center">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERIODS.map((period) => (
              <tr key={period}>
                <td className="py-1 text-center text-base font-medium text-gray-600">
                  {period}
                </td>
                {DAYS.map((day) => {
                  const slotEntries = getEntriesAt(day, period);
                  const isConflict = hasConflict(day, period);

                  return (
                    <td key={day} className="p-1">
                      <div
                        onClick={() => onSlotClick(day, period)}
                        className={`
                          h-[65px] rounded-lg border-2 cursor-pointer transition-all
                          ${slotEntries.length > 0 ? 'p-0' : 'flex items-center justify-center'}
                          ${isConflict
                            ? 'border-orange-400 bg-orange-50'
                            : slotEntries.length > 0
                              ? 'border-transparent'
                              : 'border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                          }
                        `}
                      >
                        {slotEntries.length > 0 ? (
                          slotEntries.map((entry) => {
                            const subject = subjects.find((s) => s.id === entry.subjectId);
                            return (
                              <button
                                key={entry.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEntryClick(entry);
                                }}
                                className="w-full h-full rounded-md text-base font-semibold text-white hover:opacity-90 transition-opacity flex items-center justify-center"
                                style={{ backgroundColor: subject?.color || '#6B7280' }}
                              >
                                {entry.grade}-{entry.classNumber}
                              </button>
                            );
                          })
                        ) : (
                          <span className="text-gray-400 text-xl">+</span>
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

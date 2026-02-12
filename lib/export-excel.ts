import ExcelJS from 'exceljs';
import { ScheduleEntry, Teacher, Subject, GradeSettings, DAYS, PERIODS } from '@/types';

export interface ExportData {
  schedule: ScheduleEntry[];
  teachers: Teacher[];
  subjects: Subject[];
  grades: GradeSettings[];
}

// 공통 스타일 설정
const titleStyle: Partial<ExcelJS.Style> = {
  font: { size: 18, bold: true },
  alignment: { horizontal: 'center', vertical: 'middle' },
};

const headerStyle: Partial<ExcelJS.Style> = {
  font: { size: 12, bold: true },
  alignment: { horizontal: 'center', vertical: 'middle' },
  fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } },
  border: {
    top: { style: 'thin' },
    bottom: { style: 'thin' },
    left: { style: 'thin' },
    right: { style: 'thin' },
  },
};

const cellStyle: Partial<ExcelJS.Style> = {
  font: { size: 12 },
  alignment: { horizontal: 'center', vertical: 'middle' },
  border: {
    top: { style: 'thin' },
    bottom: { style: 'thin' },
    left: { style: 'thin' },
    right: { style: 'thin' },
  },
};

const subTitleStyle: Partial<ExcelJS.Style> = {
  font: { size: 14, bold: true },
  alignment: { horizontal: 'left', vertical: 'middle' },
};

// 엑셀 Blob 생성 (브라우저에서 직접 실행)
export async function generateExcel(data: ExportData): Promise<Blob> {
  const { schedule, teachers, subjects, grades } = data;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = '전담교사 배치 프로그램';
  workbook.created = new Date();

  // 1. 교사별 시간표 시트
  teachers.forEach((teacher) => {
    const teacherSchedule = schedule.filter((e) => e.teacherId === teacher.id);
    if (teacherSchedule.length === 0) return;

    const worksheet = workbook.addWorksheet(teacher.name.substring(0, 31));

    worksheet.columns = [
      { width: 10 },
      { width: 18 },
      { width: 18 },
      { width: 18 },
      { width: 18 },
      { width: 18 },
    ];

    worksheet.mergeCells('A1:F1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `${teacher.name} 선생님 시간표`;
    titleCell.style = titleStyle;
    worksheet.getRow(1).height = 30;

    worksheet.getRow(2).height = 10;

    const headerRow = worksheet.getRow(3);
    const headers = ['교시', '월', '화', '수', '목', '금'];
    headers.forEach((header, idx) => {
      const cell = headerRow.getCell(idx + 1);
      cell.value = header;
      cell.style = headerStyle;
    });
    headerRow.height = 25;

    PERIODS.forEach((period, periodIdx) => {
      const row = worksheet.getRow(4 + periodIdx);
      row.height = 25;

      const periodCell = row.getCell(1);
      periodCell.value = `${period}교시`;
      periodCell.style = cellStyle;

      DAYS.forEach((day, dayIdx) => {
        const entries = teacherSchedule.filter(
          (e) => e.day === day && e.period === period
        );

        const cell = row.getCell(dayIdx + 2);
        if (entries.length > 0) {
          const cellContent = entries
            .map((e) => `${e.grade}-${e.classNumber}`)
            .join(', ');
          cell.value = cellContent;
        } else {
          cell.value = '';
        }
        cell.style = cellStyle;
      });
    });
  });

  // 2. 학년별 시간표 시트 (반별로 구분)
  grades.forEach((gradeSettings) => {
    const gradeSchedule = schedule.filter((e) => e.grade === gradeSettings.grade);

    const worksheet = workbook.addWorksheet(`${gradeSettings.grade}학년`);

    worksheet.columns = [
      { width: 10 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
    ];

    worksheet.mergeCells('A1:F1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `${gradeSettings.grade}학년 시간표`;
    titleCell.style = titleStyle;
    worksheet.getRow(1).height = 30;

    let currentRow = 3;

    for (let classNumber = 1; classNumber <= gradeSettings.classCount; classNumber++) {
      const subTitleRow = worksheet.getRow(currentRow);
      worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
      const subTitleCell = subTitleRow.getCell(1);
      subTitleCell.value = `${gradeSettings.grade}학년 ${classNumber}반`;
      subTitleCell.style = subTitleStyle;
      subTitleRow.height = 25;
      currentRow++;

      const headerRow = worksheet.getRow(currentRow);
      const headers = ['교시', '월', '화', '수', '목', '금'];
      headers.forEach((header, idx) => {
        const cell = headerRow.getCell(idx + 1);
        cell.value = header;
        cell.style = headerStyle;
      });
      headerRow.height = 25;
      currentRow++;

      PERIODS.forEach((period) => {
        const row = worksheet.getRow(currentRow);
        row.height = 22;

        const periodCell = row.getCell(1);
        periodCell.value = `${period}교시`;
        periodCell.style = cellStyle;

        DAYS.forEach((day, dayIdx) => {
          const entry = gradeSchedule.find(
            (e) =>
              e.classNumber === classNumber &&
              e.day === day &&
              e.period === period
          );

          const cell = row.getCell(dayIdx + 2);
          if (entry) {
            const subject = subjects.find((s) => s.id === entry.subjectId);
            cell.value = subject?.name || '';
          } else {
            cell.value = '';
          }
          cell.style = cellStyle;
        });

        currentRow++;
      });

      currentRow += 1;
    }
  });

  // 3. 전체 배정 목록 시트
  const allScheduleSheet = workbook.addWorksheet('전체 배정');

  allScheduleSheet.columns = [
    { width: 14 },
    { width: 10 },
    { width: 8 },
    { width: 8 },
    { width: 10 },
    { width: 12 },
  ];

  allScheduleSheet.mergeCells('A1:F1');
  const allTitleCell = allScheduleSheet.getCell('A1');
  allTitleCell.value = '전체 배정 목록';
  allTitleCell.style = titleStyle;
  allScheduleSheet.getRow(1).height = 30;

  allScheduleSheet.getRow(2).height = 10;

  const allHeaderRow = allScheduleSheet.getRow(3);
  const allHeaders = ['교사', '학년', '반', '요일', '교시', '과목'];
  allHeaders.forEach((header, idx) => {
    const cell = allHeaderRow.getCell(idx + 1);
    cell.value = header;
    cell.style = headerStyle;
  });
  allHeaderRow.height = 25;

  const sortedSchedule = [...schedule].sort((a, b) => {
    const teacherA = teachers.find((t) => t.id === a.teacherId)?.name || '';
    const teacherB = teachers.find((t) => t.id === b.teacherId)?.name || '';
    if (teacherA !== teacherB) return teacherA.localeCompare(teacherB);

    const dayOrder = ['월', '화', '수', '목', '금'];
    if (a.day !== b.day) return dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);

    return a.period - b.period;
  });

  sortedSchedule.forEach((entry, idx) => {
    const teacher = teachers.find((t) => t.id === entry.teacherId);
    const subject = subjects.find((s) => s.id === entry.subjectId);

    const row = allScheduleSheet.getRow(4 + idx);
    row.height = 22;

    const values = [
      teacher?.name || '',
      `${entry.grade}학년`,
      `${entry.classNumber}반`,
      entry.day,
      `${entry.period}교시`,
      subject?.name || '',
    ];

    values.forEach((value, colIdx) => {
      const cell = row.getCell(colIdx + 1);
      cell.value = value;
      cell.style = cellStyle;
    });
  });

  // 4. 요약 시트
  const summarySheet = workbook.addWorksheet('요약');

  summarySheet.columns = [
    { width: 18 },
    { width: 15 },
  ];

  summarySheet.mergeCells('A1:B1');
  const summaryTitleCell = summarySheet.getCell('A1');
  summaryTitleCell.value = '시간표 요약';
  summaryTitleCell.style = titleStyle;
  summarySheet.getRow(1).height = 30;

  let summaryRow = 3;

  const teacherSubTitle = summarySheet.getRow(summaryRow);
  summarySheet.mergeCells(`A${summaryRow}:B${summaryRow}`);
  teacherSubTitle.getCell(1).value = '전담교사 목록';
  teacherSubTitle.getCell(1).style = subTitleStyle;
  teacherSubTitle.height = 25;
  summaryRow++;

  const teacherHeader = summarySheet.getRow(summaryRow);
  teacherHeader.getCell(1).value = '이름';
  teacherHeader.getCell(1).style = headerStyle;
  teacherHeader.getCell(2).value = '담당 수업 수';
  teacherHeader.getCell(2).style = headerStyle;
  teacherHeader.height = 25;
  summaryRow++;

  teachers.forEach((teacher) => {
    const count = schedule.filter((e) => e.teacherId === teacher.id).length;
    const row = summarySheet.getRow(summaryRow);
    row.getCell(1).value = teacher.name;
    row.getCell(1).style = cellStyle;
    row.getCell(2).value = `${count}개`;
    row.getCell(2).style = cellStyle;
    row.height = 22;
    summaryRow++;
  });

  summaryRow++;

  const gradeSubTitle = summarySheet.getRow(summaryRow);
  summarySheet.mergeCells(`A${summaryRow}:B${summaryRow}`);
  gradeSubTitle.getCell(1).value = '학년별 배정 수';
  gradeSubTitle.getCell(1).style = subTitleStyle;
  gradeSubTitle.height = 25;
  summaryRow++;

  const gradeHeader = summarySheet.getRow(summaryRow);
  gradeHeader.getCell(1).value = '학년';
  gradeHeader.getCell(1).style = headerStyle;
  gradeHeader.getCell(2).value = '배정 수';
  gradeHeader.getCell(2).style = headerStyle;
  gradeHeader.height = 25;
  summaryRow++;

  grades.forEach((g) => {
    const count = schedule.filter((e) => e.grade === g.grade).length;
    const row = summarySheet.getRow(summaryRow);
    row.getCell(1).value = `${g.grade}학년`;
    row.getCell(1).style = cellStyle;
    row.getCell(2).value = `${count}개`;
    row.getCell(2).style = cellStyle;
    row.height = 22;
    summaryRow++;
  });

  summaryRow++;

  const totalRow = summarySheet.getRow(summaryRow);
  totalRow.getCell(1).value = '총 배정 수';
  totalRow.getCell(1).style = { ...cellStyle, font: { size: 11, bold: true } };
  totalRow.getCell(2).value = `${schedule.length}개`;
  totalRow.getCell(2).style = { ...cellStyle, font: { size: 11, bold: true } };
  totalRow.height = 25;

  // 브라우저용: ArrayBuffer → Blob
  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

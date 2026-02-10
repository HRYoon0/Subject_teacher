import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { ScheduleEntry, Teacher, Subject, GradeSettings, DAYS, PERIODS } from '@/types';

interface ExportData {
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

export async function POST(request: NextRequest) {
  try {
    const data: ExportData = await request.json();
    const { schedule, teachers, subjects, grades } = data;

    const workbook = new ExcelJS.Workbook();
    workbook.creator = '전담교사 배치 프로그램';
    workbook.created = new Date();

    // 1. 교사별 시간표 시트
    teachers.forEach((teacher) => {
      const teacherSchedule = schedule.filter((e) => e.teacherId === teacher.id);
      if (teacherSchedule.length === 0) return;

      const worksheet = workbook.addWorksheet(teacher.name.substring(0, 31));

      // 열 너비 설정
      worksheet.columns = [
        { width: 10 },
        { width: 18 },
        { width: 18 },
        { width: 18 },
        { width: 18 },
        { width: 18 },
      ];

      // 제목 (병합)
      worksheet.mergeCells('A1:F1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = `${teacher.name} 선생님 시간표`;
      titleCell.style = titleStyle;
      worksheet.getRow(1).height = 30;

      // 빈 줄
      worksheet.getRow(2).height = 10;

      // 헤더
      const headerRow = worksheet.getRow(3);
      const headers = ['교시', '월', '화', '수', '목', '금'];
      headers.forEach((header, idx) => {
        const cell = headerRow.getCell(idx + 1);
        cell.value = header;
        cell.style = headerStyle;
      });
      headerRow.height = 25;

      // 각 교시별 데이터
      PERIODS.forEach((period, periodIdx) => {
        const row = worksheet.getRow(4 + periodIdx);
        row.height = 25;

        // 교시
        const periodCell = row.getCell(1);
        periodCell.value = `${period}교시`;
        periodCell.style = cellStyle;

        // 각 요일
        DAYS.forEach((day, dayIdx) => {
          const entries = teacherSchedule.filter(
            (e) => e.day === day && e.period === period
          );

          const cell = row.getCell(dayIdx + 2);
          if (entries.length > 0) {
            // 전담교사 시간표: 학년-반만 표시
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

      // 열 너비 설정
      worksheet.columns = [
        { width: 10 },
        { width: 20 },
        { width: 20 },
        { width: 20 },
        { width: 20 },
        { width: 20 },
      ];

      // 제목 (병합)
      worksheet.mergeCells('A1:F1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = `${gradeSettings.grade}학년 시간표`;
      titleCell.style = titleStyle;
      worksheet.getRow(1).height = 30;

      let currentRow = 3;

      // 각 반별로 테이블 생성
      for (let classNumber = 1; classNumber <= gradeSettings.classCount; classNumber++) {
        // 반 제목
        const subTitleRow = worksheet.getRow(currentRow);
        worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
        const subTitleCell = subTitleRow.getCell(1);
        subTitleCell.value = `${gradeSettings.grade}학년 ${classNumber}반`;
        subTitleCell.style = subTitleStyle;
        subTitleRow.height = 25;
        currentRow++;

        // 헤더
        const headerRow = worksheet.getRow(currentRow);
        const headers = ['교시', '월', '화', '수', '목', '금'];
        headers.forEach((header, idx) => {
          const cell = headerRow.getCell(idx + 1);
          cell.value = header;
          cell.style = headerStyle;
        });
        headerRow.height = 25;
        currentRow++;

        // 각 교시별 데이터
        PERIODS.forEach((period) => {
          const row = worksheet.getRow(currentRow);
          row.height = 22;

          // 교시
          const periodCell = row.getCell(1);
          periodCell.value = `${period}교시`;
          periodCell.style = cellStyle;

          // 각 요일
          DAYS.forEach((day, dayIdx) => {
            const entry = gradeSchedule.find(
              (e) =>
                e.classNumber === classNumber &&
                e.day === day &&
                e.period === period
            );

            const cell = row.getCell(dayIdx + 2);
            if (entry) {
              // 학년별 시간표: 과목명만 표시
              const subject = subjects.find((s) => s.id === entry.subjectId);
              cell.value = subject?.name || '';
            } else {
              cell.value = '';
            }
            cell.style = cellStyle;
          });

          currentRow++;
        });

        // 빈 줄 추가 (반 사이 구분)
        currentRow += 1;
      }
    });

    // 3. 전체 배정 목록 시트
    const allScheduleSheet = workbook.addWorksheet('전체 배정');

    // 열 너비 설정
    allScheduleSheet.columns = [
      { width: 14 },
      { width: 10 },
      { width: 8 },
      { width: 8 },
      { width: 10 },
      { width: 12 },
    ];

    // 제목 (병합)
    allScheduleSheet.mergeCells('A1:F1');
    const allTitleCell = allScheduleSheet.getCell('A1');
    allTitleCell.value = '전체 배정 목록';
    allTitleCell.style = titleStyle;
    allScheduleSheet.getRow(1).height = 30;

    // 빈 줄
    allScheduleSheet.getRow(2).height = 10;

    // 헤더
    const allHeaderRow = allScheduleSheet.getRow(3);
    const allHeaders = ['교사', '학년', '반', '요일', '교시', '과목'];
    allHeaders.forEach((header, idx) => {
      const cell = allHeaderRow.getCell(idx + 1);
      cell.value = header;
      cell.style = headerStyle;
    });
    allHeaderRow.height = 25;

    // 정렬: 교사 > 요일 > 교시 순
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

    // 열 너비 설정
    summarySheet.columns = [
      { width: 18 },
      { width: 15 },
    ];

    // 제목 (병합)
    summarySheet.mergeCells('A1:B1');
    const summaryTitleCell = summarySheet.getCell('A1');
    summaryTitleCell.value = '시간표 요약';
    summaryTitleCell.style = titleStyle;
    summarySheet.getRow(1).height = 30;

    let summaryRow = 3;

    // 전담교사 목록 소제목
    const teacherSubTitle = summarySheet.getRow(summaryRow);
    summarySheet.mergeCells(`A${summaryRow}:B${summaryRow}`);
    teacherSubTitle.getCell(1).value = '전담교사 목록';
    teacherSubTitle.getCell(1).style = subTitleStyle;
    teacherSubTitle.height = 25;
    summaryRow++;

    // 전담교사 목록 헤더
    const teacherHeader = summarySheet.getRow(summaryRow);
    teacherHeader.getCell(1).value = '이름';
    teacherHeader.getCell(1).style = headerStyle;
    teacherHeader.getCell(2).value = '담당 수업 수';
    teacherHeader.getCell(2).style = headerStyle;
    teacherHeader.height = 25;
    summaryRow++;

    // 전담교사 데이터
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

    // 학년별 배정 수 소제목
    const gradeSubTitle = summarySheet.getRow(summaryRow);
    summarySheet.mergeCells(`A${summaryRow}:B${summaryRow}`);
    gradeSubTitle.getCell(1).value = '학년별 배정 수';
    gradeSubTitle.getCell(1).style = subTitleStyle;
    gradeSubTitle.height = 25;
    summaryRow++;

    // 학년별 배정 수 헤더
    const gradeHeader = summarySheet.getRow(summaryRow);
    gradeHeader.getCell(1).value = '학년';
    gradeHeader.getCell(1).style = headerStyle;
    gradeHeader.getCell(2).value = '배정 수';
    gradeHeader.getCell(2).style = headerStyle;
    gradeHeader.height = 25;
    summaryRow++;

    // 학년별 데이터
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

    // 총 배정 수
    const totalRow = summarySheet.getRow(summaryRow);
    totalRow.getCell(1).value = '총 배정 수';
    totalRow.getCell(1).style = { ...cellStyle, font: { size: 11, bold: true } };
    totalRow.getCell(2).value = `${schedule.length}개`;
    totalRow.getCell(2).style = { ...cellStyle, font: { size: 11, bold: true } };
    totalRow.height = 25;

    // 엑셀 파일 생성
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition':
          'attachment; filename="schedule.xlsx"',
      },
    });
  } catch (error) {
    console.error('엑셀 생성 오류:', error);
    return NextResponse.json(
      { error: '엑셀 파일 생성에 실패했습니다' },
      { status: 500 }
    );
  }
}

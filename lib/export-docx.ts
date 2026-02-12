import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  WidthType,
  AlignmentType,
  VerticalAlign,
  BorderStyle,
  HeadingLevel,
  PageBreak,
} from 'docx';
import { ScheduleEntry, Teacher, Subject, GradeSettings, DAYS, PERIODS } from '@/types';

export interface ExportData {
  schedule: ScheduleEntry[];
  teachers: Teacher[];
  subjects: Subject[];
  grades: GradeSettings[];
}

// 테이블 셀 스타일
const cellBorders = {
  top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  left: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  right: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
};

function createHeaderCell(text: string, width: number): TableCell {
  return new TableCell({
    children: [
      new Paragraph({
        children: [new TextRun({ text, bold: true, size: 24 })],
        alignment: AlignmentType.CENTER,
      }),
    ],
    width: { size: width, type: WidthType.DXA },
    shading: { fill: 'E2E8F0' },
    verticalAlign: VerticalAlign.CENTER,
    borders: cellBorders,
  });
}

function createCell(text: string, width: number): TableCell {
  return new TableCell({
    children: [
      new Paragraph({
        children: [new TextRun({ text, size: 22 })],
        alignment: AlignmentType.CENTER,
      }),
    ],
    width: { size: width, type: WidthType.DXA },
    verticalAlign: VerticalAlign.CENTER,
    borders: cellBorders,
  });
}

function createScheduleTable(headers: string[], rows: string[][]): Table {
  const colWidth = 1500;

  const headerRow = new TableRow({
    children: headers.map((h) => createHeaderCell(h, colWidth)),
    tableHeader: true,
  });

  const dataRows = rows.map(
    (row) =>
      new TableRow({
        children: row.map((cell) => createCell(cell, colWidth)),
      })
  );

  return new Table({
    rows: [headerRow, ...dataRows],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });
}

// DOCX Blob 생성 (브라우저에서 직접 실행)
export async function generateDocx(data: ExportData): Promise<Blob> {
  const { schedule, teachers, subjects, grades } = data;

  const tables: (Paragraph | Table)[] = [];

  // 메인 제목
  tables.push(
    new Paragraph({
      children: [new TextRun({ text: '전담교사 시간표', bold: true, size: 36 })],
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // 1. 교사별 시간표
  teachers.forEach((teacher, idx) => {
    const teacherSchedule = schedule.filter((e) => e.teacherId === teacher.id);
    if (teacherSchedule.length === 0) return;

    if (idx > 0) {
      tables.push(
        new Paragraph({
          children: [new PageBreak()],
        })
      );
    }

    tables.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${teacher.name} 선생님 시간표`, bold: true, size: 28 }),
        ],
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 200 },
      })
    );

    const headers = ['교시', '월', '화', '수', '목', '금'];
    const rows: string[][] = [];

    PERIODS.forEach((period) => {
      const row: string[] = [`${period}교시`];

      DAYS.forEach((day) => {
        const entries = teacherSchedule.filter(
          (e) => e.day === day && e.period === period
        );

        if (entries.length > 0) {
          const cellContent = entries
            .map((e) => `${e.grade}-${e.classNumber}`)
            .join(', ');
          row.push(cellContent);
        } else {
          row.push('');
        }
      });

      rows.push(row);
    });

    tables.push(createScheduleTable(headers, rows));
    tables.push(new Paragraph({ spacing: { after: 200 } }));
  });

  // 2. 학년별 시간표
  grades.forEach((gradeSettings) => {
    const gradeSchedule = schedule.filter((e) => e.grade === gradeSettings.grade);
    if (gradeSchedule.length === 0) return;

    tables.push(
      new Paragraph({
        children: [new PageBreak()],
      })
    );

    tables.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${gradeSettings.grade}학년 시간표`, bold: true, size: 28 }),
        ],
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 200 },
      })
    );

    for (let classNumber = 1; classNumber <= gradeSettings.classCount; classNumber++) {
      tables.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${gradeSettings.grade}학년 ${classNumber}반`,
              bold: true,
              size: 24,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 300, after: 100 },
        })
      );

      const headers = ['교시', '월', '화', '수', '목', '금'];
      const rows: string[][] = [];

      PERIODS.forEach((period) => {
        const row: string[] = [`${period}교시`];

        DAYS.forEach((day) => {
          const entry = gradeSchedule.find(
            (e) =>
              e.classNumber === classNumber && e.day === day && e.period === period
          );

          if (entry) {
            const subject = subjects.find((s) => s.id === entry.subjectId);
            row.push(subject?.name || '');
          } else {
            row.push('');
          }
        });

        rows.push(row);
      });

      tables.push(createScheduleTable(headers, rows));
      tables.push(new Paragraph({ spacing: { after: 100 } }));
    }
  });

  // 3. 요약
  tables.push(
    new Paragraph({
      children: [new PageBreak()],
    })
  );

  tables.push(
    new Paragraph({
      children: [new TextRun({ text: '시간표 요약', bold: true, size: 28 })],
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 200 },
    })
  );

  tables.push(
    new Paragraph({
      children: [new TextRun({ text: '전담교사 목록', bold: true, size: 24 })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 100 },
    })
  );

  const teacherSummaryRows = teachers.map((teacher) => {
    const count = schedule.filter((e) => e.teacherId === teacher.id).length;
    return [teacher.name, `${count}개`];
  });

  tables.push(createScheduleTable(['이름', '담당 수업 수'], teacherSummaryRows));

  tables.push(
    new Paragraph({
      children: [new TextRun({ text: '학년별 배정 수', bold: true, size: 24 })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 300, after: 100 },
    })
  );

  const gradeSummaryRows = grades.map((g) => {
    const count = schedule.filter((e) => e.grade === g.grade).length;
    return [`${g.grade}학년`, `${count}개`];
  });

  tables.push(createScheduleTable(['학년', '배정 수'], gradeSummaryRows));

  tables.push(
    new Paragraph({
      children: [
        new TextRun({ text: `총 배정 수: ${schedule.length}개`, bold: true, size: 24 }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 200 },
    })
  );

  // 문서 생성
  const doc = new Document({
    sections: [
      {
        children: tables,
      },
    ],
  });

  // 브라우저용: Blob으로 직접 변환
  return await Packer.toBlob(doc);
}

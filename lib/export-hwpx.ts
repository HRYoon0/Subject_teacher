import JSZip from 'jszip';
import { ScheduleEntry, Teacher, Subject, GradeSettings, DAYS, PERIODS } from '@/types';

export interface HwpxData {
  schedule: ScheduleEntry[];
  teachers: Teacher[];
  subjects: Subject[];
  grades: GradeSettings[];
}

// HWPX 기본 XML 템플릿들
const VERSION_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<hh:HWPXVersion xmlns:hh="http://www.hancom.co.kr/hwpx/format/2.0" version="2.0"/>`;

const CONTENT_TYPES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/version.xml" ContentType="application/hwpx-version+xml"/>
  <Override PartName="/Contents/header.xml" ContentType="application/hwpx-header+xml"/>
  <Override PartName="/Contents/section0.xml" ContentType="application/hwpx-section+xml"/>
  <Override PartName="/settings.xml" ContentType="application/hwpx-settings+xml"/>
</Types>`;

const RELS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Type="http://www.hancom.co.kr/hwpx/format/2.0/section" Target="Contents/section0.xml" Id="rId1"/>
  <Relationship Type="http://www.hancom.co.kr/hwpx/format/2.0/header" Target="Contents/header.xml" Id="rId2"/>
  <Relationship Type="http://www.hancom.co.kr/hwpx/format/2.0/settings" Target="settings.xml" Id="rId3"/>
</Relationships>`;

const HEADER_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<hh:head xmlns:hh="http://www.hancom.co.kr/hwpx/format/2.0" version="2.0">
  <hh:beginNum page="1" footnote="1" endnote="1" pic="1" tbl="1" equation="1"/>
  <hh:refList>
    <hh:fontfaces>
      <hh:fontface lang="HANGUL" fontCnt="2">
        <hh:font id="0" face="함초롬바탕" type="TTF" isEmbedded="false"/>
        <hh:font id="1" face="함초롬돋움" type="TTF" isEmbedded="false"/>
      </hh:fontface>
    </hh:fontfaces>
  </hh:refList>
</hh:head>`;

const SETTINGS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<hh:settings xmlns:hh="http://www.hancom.co.kr/hwpx/format/2.0">
  <hh:startPageNum systemDefault="true"/>
</hh:settings>`;

// XML 특수문자 이스케이프
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// 테이블 셀 생성 헬퍼
function createTableCell(text: string, width: number, bgColor?: string): string {
  return `
    <hp:tc>
      <hp:cellAddr colAddr="0" rowAddr="0"/>
      <hp:cellSpan colSpan="1" rowSpan="1"/>
      <hp:cellSz width="${width}" height="800"/>
      <hp:cellMargin left="60" right="60" top="60" bottom="60"/>
      <hp:para>
        <hp:run>
          <hp:t>${escapeXml(text)}</hp:t>
        </hp:run>
      </hp:para>
    </hp:tc>`;
}

// 시간표 테이블 생성
function createScheduleTable(
  title: string,
  headers: string[],
  rows: string[][]
): string {
  let tableXml = `
    <hp:tbl>
      <hp:tr>`;

  headers.forEach((header) => {
    tableXml += createTableCell(header, 1500, '#E5E7EB');
  });

  tableXml += `
      </hp:tr>`;

  rows.forEach((row) => {
    tableXml += `
      <hp:tr>`;
    row.forEach((cell) => {
      tableXml += createTableCell(cell, 1500);
    });
    tableXml += `
      </hp:tr>`;
  });

  tableXml += `
    </hp:tbl>`;

  return `
    <hp:para>
      <hp:run>
        <hp:t>${escapeXml(title)}</hp:t>
      </hp:run>
    </hp:para>
    ${tableXml}
    <hp:para/>`;
}

// HWPX Blob 생성 (브라우저에서 직접 실행)
export async function generateHwpx(data: HwpxData): Promise<Blob> {
  const { schedule, teachers, subjects } = data;

  let sectionContent = '';

  // 제목
  sectionContent += `
    <hp:para>
      <hp:run>
        <hp:t>전담교사 시간표</hp:t>
      </hp:run>
    </hp:para>
    <hp:para/>`;

  // 교사별 시간표
  teachers.forEach((teacher) => {
    const teacherSchedule = schedule.filter((e) => e.teacherId === teacher.id);
    if (teacherSchedule.length === 0) return;

    const headers = ['교시', ...DAYS];
    const rows: string[][] = [];

    PERIODS.forEach((period) => {
      const row: string[] = [`${period}교시`];

      DAYS.forEach((day) => {
        const entries = teacherSchedule.filter(
          (e) => e.day === day && e.period === period
        );

        if (entries.length > 0) {
          const cellContent = entries
            .map((e) => {
              const subject = subjects.find((s) => s.id === e.subjectId);
              return `${e.grade}-${e.classNumber} ${subject?.name || ''}`;
            })
            .join(', ');
          row.push(cellContent);
        } else {
          row.push('');
        }
      });

      rows.push(row);
    });

    sectionContent += createScheduleTable(`[${teacher.name} 선생님]`, headers, rows);
  });

  // section0.xml 생성
  const sectionXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<hp:sec xmlns:hp="http://www.hancom.co.kr/hwpx/format/2.0">
  ${sectionContent}
</hp:sec>`;

  // ZIP 파일 생성
  const zip = new JSZip();

  zip.file('version.xml', VERSION_XML);
  zip.file('[Content_Types].xml', CONTENT_TYPES_XML);
  zip.file('_rels/.rels', RELS_XML);
  zip.file('Contents/header.xml', HEADER_XML);
  zip.file('Contents/section0.xml', sectionXml);
  zip.file('settings.xml', SETTINGS_XML);

  // 브라우저용: Blob으로 생성
  return await zip.generateAsync({ type: 'blob' });
}

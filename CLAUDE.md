# 전담교사 배치 프로그램

## 프로젝트 개요
초등학교 전담교사 시간표 배치를 위한 데스크탑 애플리케이션 (Tauri v2 + Next.js)

## 기술 스택
- Next.js 16 (App Router, 정적 내보내기)
- Tauri v2 (데스크탑 앱 래퍼)
- Tailwind CSS 4
- Zustand (상태관리)
- ExcelJS (엑셀 생성, 클라이언트 사이드)
- docx (Word 문서 생성, 클라이언트 사이드)
- JSZip (HWPX 생성, 클라이언트 사이드)

## 현재 구현 상태

### ✅ 완료
- [x] 프로젝트 셋업 (Next.js, Tailwind)
- [x] 기본 레이아웃 및 네비게이션
- [x] 설정 페이지 (학년/반/과목 설정)
- [x] 전담교사 관리 페이지 (CRUD, 담당 학년/과목)
- [x] 시간표 작성 페이지 (그리드, 충돌 검사)
- [x] 전체 보기 페이지 (교사별/학년별/학급별)
- [x] 엑셀/Word/한글 다운로드 (클라이언트 사이드)
- [x] Zustand 로컬 스토리지 저장
- [x] Tauri v2 데스크탑 앱 설정

## 개발 명령어
```bash
npm run dev          # Next.js 개발 서버 (http://localhost:3000)
npm run build        # 정적 빌드 (out/ 폴더)
npm run tauri:dev    # Tauri 개발 모드 (Rust 필요)
npm run tauri:build  # Tauri 프로덕션 빌드 (.msi 생성)
```

## Tauri 빌드 요구사항
- Rust 툴체인 (rustup으로 설치)
- Windows: Visual Studio Build Tools
- macOS: Xcode Command Line Tools

## 프로젝트 구조
```
app/
├── page.tsx           # 대시보드
├── settings/          # 설정 (학년/반/과목)
├── teachers/          # 전담교사 관리
├── schedule/          # 시간표 작성
└── overview/          # 전체 보기 + 다운로드
components/
├── ui/                # 공통 UI 컴포넌트
└── schedule/          # 시간표 컴포넌트
lib/
├── export-excel.ts    # 클라이언트 엑셀 생성
├── export-docx.ts     # 클라이언트 Word 생성
└── export-hwpx.ts     # 클라이언트 HWPX 생성
stores/                # Zustand 스토어
types/                 # TypeScript 타입
src-tauri/             # Tauri Rust 백엔드
├── tauri.conf.json    # Tauri 설정
├── Cargo.toml         # Rust 의존성
└── src/               # Rust 소스
```

## 데이터 저장
브라우저 로컬 스토리지 (Zustand persist)

## 아키텍처 참고
- 모든 내보내기(Excel/Word/HWPX)는 클라이언트 사이드에서 실행
- API 라우트 없음 (정적 내보내기 모드)
- Tauri WebView가 Next.js 정적 빌드(out/)를 로드

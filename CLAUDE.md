# 전담교사 배치 프로그램

## 프로젝트 개요
초등학교 전담교사 시간표 배치를 위한 웹 애플리케이션

## 기술 스택
- Next.js 16 (App Router)
- Tailwind CSS 4
- Zustand (상태관리)
- xlsx (엑셀 생성)
- JSZip (HWPX 생성)

## 현재 구현 상태

### ✅ 완료
- [x] 프로젝트 셋업 (Next.js, Tailwind)
- [x] 기본 레이아웃 및 네비게이션
- [x] 설정 페이지 (학년/반/과목 설정)
- [x] 전담교사 관리 페이지 (CRUD, 담당 학년/과목)
- [x] 시간표 작성 페이지 (그리드, 충돌 검사)
- [x] 전체 보기 페이지 (교사별/학년별/학급별)
- [x] 엑셀 다운로드 API
- [x] HWPX 다운로드 API
- [x] Zustand 로컬 스토리지 저장

### 🚧 다음 단계 (미구현)

#### Phase 6: Google 인증 및 Sheets 연동
1. **Google Cloud Console 설정**
   - 새 프로젝트 생성
   - Google Sheets API 활성화
   - OAuth 2.0 클라이언트 ID 생성
   - 승인된 리디렉션 URI 설정

2. **NextAuth.js 설정**
   - `app/api/auth/[...nextauth]/route.ts` 구현
   - Google OAuth Provider 설정
   - 세션 관리

3. **Google Sheets 연동**
   - `lib/google-sheets.ts` - Sheets API 래퍼
   - 사용자별 스프레드시트 생성/연결
   - CRUD 작업 구현

#### Phase 7: 배포
1. **Vercel 배포**
   - GitHub 연동
   - 환경 변수 설정
   - 도메인 설정

2. **환경 변수 필요**
   ```
   GOOGLE_CLIENT_ID=
   GOOGLE_CLIENT_SECRET=
   NEXTAUTH_SECRET=
   NEXTAUTH_URL=
   ```

## 개발 명령어
```bash
npm run dev    # 개발 서버 (http://localhost:3000)
npm run build  # 프로덕션 빌드
npm run start  # 프로덕션 서버
```

## 프로젝트 구조
```
app/
├── page.tsx           # 대시보드
├── settings/          # 설정 (학년/반/과목)
├── teachers/          # 전담교사 관리
├── schedule/          # 시간표 작성
├── overview/          # 전체 보기
└── api/export/        # 다운로드 API
components/
├── ui/                # 공통 UI 컴포넌트
└── schedule/          # 시간표 컴포넌트
stores/                # Zustand 스토어
types/                 # TypeScript 타입
```

## 데이터 저장
현재: 브라우저 로컬 스토리지 (Zustand persist)
예정: Google Sheets (사용자별)

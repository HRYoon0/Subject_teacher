import { NextRequest, NextResponse } from 'next/server';
import { generateHwpx, HwpxData } from '@/lib/hwpx-generator';

export async function POST(request: NextRequest) {
  try {
    const data: HwpxData = await request.json();

    // HWPX 파일 생성
    const buffer = await generateHwpx(data);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/hwpx',
        'Content-Disposition': 'attachment; filename="schedule.hwpx"',
      },
    });
  } catch (error) {
    console.error('HWPX 생성 오류:', error);
    return NextResponse.json(
      { error: 'HWPX 파일 생성에 실패했습니다' },
      { status: 500 }
    );
  }
}

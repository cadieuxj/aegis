import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sizeParam = searchParams.get('size') || '192';
  const sizeNum = parseInt(sizeParam);

  // Validate size
  const validSizes = [72, 96, 128, 144, 152, 192, 384, 512];
  if (!validSizes.includes(sizeNum)) {
    return new Response('Invalid icon size', { status: 400 });
  }

  const size = { width: sizeNum, height: sizeNum };
  const borderRadius = Math.floor(sizeNum * 0.25);
  const diamondSize = Math.floor(sizeNum * 0.75);
  const circleSize = Math.floor(sizeNum * 0.28);

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: `${borderRadius}px`,
        }}
      >
        <div
          style={{
            width: `${diamondSize}px`,
            height: `${diamondSize}px`,
            background: 'rgba(255, 255, 255, 0.9)',
            transform: 'rotate(45deg)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: `${circleSize}px`,
            height: `${circleSize}px`,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)',
            border: '3px solid white',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}

import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 512,
  height: 512,
};

export const contentType = 'image/png';

export default function Icon() {
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
          borderRadius: '25%',
        }}
      >
        <svg
          width="320"
          height="320"
          viewBox="0 0 320 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M160 40 L280 160 L160 280 L40 160 Z"
            fill="white"
            opacity="0.9"
          />
          <path
            d="M160 80 L240 160 L160 240 L80 160 Z"
            fill="white"
          />
          <circle cx="160" cy="160" r="40" fill="#06b6d4" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}

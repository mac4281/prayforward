import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    
    // Get prayer text from query parameter (passed from client)
    const prayerText = searchParams.get('text') || '';

    if (!prayerText) {
      return new Response('No prayer text provided', { status: 400 });
    }

    // Get the base URL for the logo
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
    const logoUrl = `${baseUrl}/PIF-black.png`;
    
    // Fetch the logo image and convert to base64 data URL (Edge runtime compatible)
    let logoDataUrl: string | null = null;
    try {
      const logoResponse = await fetch(logoUrl);
      if (logoResponse.ok) {
        const logoBuffer = await logoResponse.arrayBuffer();
        // Convert ArrayBuffer to base64 in Edge runtime
        const bytes = new Uint8Array(logoBuffer);
        const binary = Array.from(bytes, byte => String.fromCharCode(byte)).join('');
        const logoBase64 = btoa(binary);
        const logoMimeType = logoResponse.headers.get('content-type') || 'image/png';
        logoDataUrl = `data:${logoMimeType};base64,${logoBase64}`;
      }
    } catch (error) {
      console.error('Error fetching logo:', error);
    }

    // Calculate adaptive font size based on text length
    const characterCount = prayerText.length;
    const baseFontSize = 72;
    const minFontSize = 32;
    const maxFontSize = 100;

    let adaptiveFontSize: number;
    if (characterCount < 50) {
      adaptiveFontSize = maxFontSize;
    } else if (characterCount < 100) {
      adaptiveFontSize = baseFontSize;
    } else if (characterCount < 200) {
      adaptiveFontSize = baseFontSize * 0.75;
    } else {
      adaptiveFontSize = minFontSize;
    }

    // Word wrap text
    const words = prayerText.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    const maxWidth = 800; // Approximate max width in pixels

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      // Approximate character width (font size * 0.6 is a rough estimate)
      const estimatedWidth = testLine.length * (adaptiveFontSize * 0.6);
      
      if (estimatedWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#E8E0D4',
          }}
        >
          {/* Cyan Header */}
          <div
            style={{
              width: '100%',
              height: '20%',
              backgroundColor: '#06ebfa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Logo */}
            {logoDataUrl ? (
              <img
                src={logoDataUrl}
                alt="Pray It Forward"
                width={432}
                height={130}
                style={{
                  objectFit: 'contain',
                  maxWidth: '40%',
                  maxHeight: '70%',
                }}
              />
            ) : (
              <div
                style={{
                  fontSize: 48,
                  fontWeight: 'bold',
                  color: '#000000',
                }}
              >
                Pray It Forward
              </div>
            )}
          </div>
          
          {/* Main Content Area */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '80px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: `${adaptiveFontSize * 0.2}px`,
              }}
            >
              {lines.map((line, index) => (
                <div
                  key={index}
                  style={{
                    fontSize: `${adaptiveFontSize}px`,
                    fontFamily: 'Georgia, serif',
                    color: '#000000',
                    lineHeight: 1.2,
                  }}
                >
                  {line}
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
      {
        width: 1080,
        height: 1080,
      }
    );
  } catch (error: any) {
    console.error('Error generating share image:', error);
    return new Response(error.message || 'Failed to generate share image', {
      status: 500,
    });
  }
}


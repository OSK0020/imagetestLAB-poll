import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    const filename = searchParams.get('filename') || 'ai_generation.jpg';

    if (!url) {
      return new Response('URL is required', { status: 400 });
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch content: ${response.statusText}`);
    }

    const blob = await response.blob();
    const headers = new Headers();
    
    // Extract file extension
    const dotIndex = filename.lastIndexOf('.');
    const ext = dotIndex !== -1 ? filename.slice(dotIndex).toLowerCase() : '.jpg';
    const nameWithoutExt = dotIndex !== -1 ? filename.slice(0, dotIndex) : filename;

    // Create an ASCII-safe fallback filename for older browsers and simple mobile parsers
    let safeAsciiPrefix = nameWithoutExt.replace(/[^a-zA-Z0-9_\-]/g, '_');
    if (!safeAsciiPrefix || /^_+$/.test(safeAsciiPrefix)) {
      safeAsciiPrefix = 'image';
    }
    const asciiFallback = `${safeAsciiPrefix}${ext}`;

    // RFC 6266 UTF-8 encoding support for modern browsers (including mobile Chrome & Safari)
    // Allows full Hebrew/Unicode filenames while keeping a safe ASCII fallback to prevent file format loss
    const encodedFilename = encodeURIComponent(filename);
    headers.set('Content-Disposition', `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encodedFilename}`);

    // Detect and enforce correct MIME Content-Type to make sure the OS registers it as an image
    let contentType = response.headers.get('Content-Type') || '';
    if (!contentType || contentType.startsWith('application/') || contentType === 'text/plain') {
      if (ext === '.png') contentType = 'image/png';
      else if (ext === '.webp') contentType = 'image/webp';
      else if (ext === '.zip') contentType = 'application/zip';
      else contentType = 'image/jpeg';
    }
    headers.set('Content-Type', contentType);

    return new Response(blob, {
      status: 200,
      headers,
    });
  } catch (err: any) {
    console.error('Download proxy error:', err);
    return new Response(err.message, { status: 500 });
  }
}

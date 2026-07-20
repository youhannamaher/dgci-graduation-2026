import { NextResponse } from 'next/server';
import { readLocalJson } from '@/lib/jsonStore';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  // Wait, Next.js dynamic params are sometimes awaited in newer Next.js versions.
  // Let's resolve the key from params.
  const { key } = await params;

  let filename = '';
  switch (key) {
    case 'ceremony-info':
      filename = 'ceremony-info.json';
      break;
    case 'program':
      filename = 'program.json';
      break;
    case 'graduates':
      filename = 'graduates.json';
      break;
    case 'gallery':
      filename = 'gallery.json';
      break;
    case 'journey':
      filename = 'journey.json';
      break;
    case 'messages':
      filename = 'messages.json';
      break;
    case 'media-links':
      filename = 'media-links.json';
      break;
    default:
      return NextResponse.json({ error: 'Data key not found' }, { status: 404 });
  }

  const data = readLocalJson(filename);
  return NextResponse.json(data);
}

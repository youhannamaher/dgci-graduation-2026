import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { readLocalJson } from '@/lib/jsonStore';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const isSupabaseConfigured = !!(supabaseUrl && (supabaseAnonKey || supabaseServiceKey));

// Use server-side client (with service key if available for administrative writes)
const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey)
  : null;

// --- DTO MAPPERS FOR SUPABASE (snake_case) TO CLIENT (camelCase) ---
const mapGradDbToClient = (g: any) => ({
  id: g.id,
  order: g.order_number,
  fullName: g.full_name,
  displayName: g.display_name,
  photo: g.photo_url || '',
  quote: g.quote || '',
  linkedin: g.linkedin || '',
  instagram: g.instagram || '',
  showProfile: g.show_profile ?? true
});

const mapGradClientToDb = (g: any) => ({
  id: g.id,
  order_number: g.order,
  full_name: g.fullName,
  display_name: g.displayName,
  photo_url: g.photo,
  quote: g.quote,
  linkedin: g.linkedin,
  instagram: g.instagram,
  show_profile: g.showProfile
});

const mapProgDbToClient = (p: any) => ({
  id: p.id,
  order: p.item_order,
  time: p.time,
  title: p.title,
  description: p.description || '',
  isCurrent: p.is_current ?? false
});

const mapProgClientToDb = (p: any) => ({
  id: p.id,
  item_order: p.order,
  time: p.time,
  title: p.title,
  description: p.description,
  is_current: p.isCurrent
});

const mapMsgDbToClient = (m: any) => {
  let graduateIds: string[] = [];
  try {
    if (Array.isArray(m.target_graduate_ids)) {
      graduateIds = m.target_graduate_ids;
    } else if (typeof m.target_graduate_ids === 'string') {
      graduateIds = JSON.parse(m.target_graduate_ids);
    }
  } catch (e) {
    console.error('Error parsing target_graduate_ids', e);
  }

  return {
    id: m.id,
    message: m.message,
    senderName: m.sender_name || 'Anonymous',
    isAnonymous: m.is_anonymous ?? false,
    targetType: m.target_type,
    targetGraduateIds: graduateIds,
    relation: m.relation || 'Guest',
    status: m.status,
    createdAt: m.created_at
  };
};

const mapMsgClientToDb = (m: any) => ({
  id: m.id,
  message: m.message,
  sender_name: m.senderName,
  is_anonymous: m.isAnonymous,
  target_type: m.targetType,
  target_graduate_ids: m.targetGraduateIds,
  relation: m.relation,
  status: m.status
});

const mapPhotoDbToClient = (p: any) => ({
  id: p.id,
  url: p.url,
  caption: p.caption || '',
  uploadedBy: p.uploaded_by || 'Anonymous',
  status: p.status,
  createdAt: p.created_at
});

const mapPhotoClientToDb = (p: any) => ({
  id: p.id,
  url: p.url,
  caption: p.caption,
  uploaded_by: p.uploadedBy,
  status: p.status
});

// GET Handler
export async function GET(
  request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;

  // If Supabase is connected, load from Supabase database
  if (isSupabaseConfigured && supabase) {
    try {
      switch (key) {
        case 'ceremony-info': {
          const { data, error } = await supabase
            .from('media_links')
            .select('*')
            .eq('type', 'ceremony_info')
            .single();

          if (error || !data) {
            // Seeding or default fallback
            return NextResponse.json(readLocalJson('ceremony-info.json'));
          }
          return NextResponse.json(JSON.parse(data.url));
        }

        case 'program': {
          const { data, error } = await supabase
            .from('program_items')
            .select('*')
            .order('item_order', { ascending: true });

          if (error || !data || data.length === 0) {
            return NextResponse.json(readLocalJson('program.json'));
          }
          return NextResponse.json(data.map(mapProgDbToClient));
        }

        case 'graduates': {
          const { data, error } = await supabase
            .from('graduates')
            .select('*')
            .order('order_number', { ascending: true });

          if (error || !data || data.length === 0) {
            return NextResponse.json(readLocalJson('graduates.json'));
          }
          return NextResponse.json(data.map(mapGradDbToClient));
        }

        case 'messages': {
          const { data, error } = await supabase
            .from('messages')
            .select('*')
            .order('created_at', { ascending: false });

          if (error || !data) {
            return NextResponse.json(readLocalJson('messages.json'));
          }
          return NextResponse.json(data.map(mapMsgDbToClient));
        }

        case 'gallery': {
          const { data, error } = await supabase
            .from('photos')
            .select('*')
            .order('created_at', { ascending: false });

          if (error || !data) {
            return NextResponse.json(readLocalJson('gallery.json'));
          }
          return NextResponse.json(data.map(mapPhotoDbToClient));
        }

        case 'media-links': {
          const { data, error } = await supabase
            .from('media_links')
            .select('*');

          if (error || !data || data.length === 0) {
            return NextResponse.json(readLocalJson('media-links.json'));
          }

          const links = { officialPhotosUrl: '', recapVideoUrl: '', fullCeremonyUrl: '' };
          data.forEach(item => {
            if (item.type === 'photos') links.officialPhotosUrl = item.url;
            if (item.type === 'video_recap') links.recapVideoUrl = item.url;
            if (item.type === 'video_full') links.fullCeremonyUrl = item.url;
          });
          return NextResponse.json(links);
        }

        case 'journey':
          return NextResponse.json(readLocalJson('journey.json'));

        default:
          return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
      }
    } catch (e) {
      console.error(`Supabase fetch failed on API for ${key}:`, e);
      // Fallback to local files
    }
  }

  // Local static files loader
  let filename = '';
  switch (key) {
    case 'ceremony-info': filename = 'ceremony-info.json'; break;
    case 'program': filename = 'program.json'; break;
    case 'graduates': filename = 'graduates.json'; break;
    case 'gallery': filename = 'gallery.json'; break;
    case 'journey': filename = 'journey.json'; break;
    case 'messages': filename = 'messages.json'; break;
    case 'media-links': filename = 'media-links.json'; break;
    default:
      return NextResponse.json({ error: 'Data key not found' }, { status: 404 });
  }

  const data = readLocalJson(filename);
  return NextResponse.json(data);
}

// POST Handler (For Database Writes)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  if (!isSupabaseConfigured || !supabase) {
    // If Supabase is not set, return success indicating local write is fine
    return NextResponse.json({ success: true, localOnly: true });
  }

  try {
    const body = await request.json();
    const { action, data, id, fields, list } = body;

    switch (key) {
      case 'ceremony-info': {
        const { error } = await supabase.from('media_links').upsert({
          id: 'ceremony-info',
          title: 'Ceremony Info',
          type: 'ceremony_info',
          url: JSON.stringify(data),
          is_active: true
        });
        return NextResponse.json({ success: !error, error });
      }

      case 'program': {
        if (action === 'add') {
          const { error } = await supabase.from('program_items').insert(mapProgClientToDb(data));
          return NextResponse.json({ success: !error, error });
        }
        if (action === 'update') {
          if (fields.isCurrent) {
            // clear active for others first
            await supabase.from('program_items').update({ is_current: false }).neq('id', id);
          }
          const { error } = await supabase.from('program_items').update(mapProgClientToDb(fields)).eq('id', id);
          return NextResponse.json({ success: !error, error });
        }
        if (action === 'delete') {
          const { error } = await supabase.from('program_items').delete().eq('id', id);
          return NextResponse.json({ success: !error, error });
        }
        if (action === 'reorder') {
          const promises = list.map((item: any) =>
            supabase.from('program_items').update({ item_order: item.order }).eq('id', item.id)
          );
          await Promise.all(promises);
          return NextResponse.json({ success: true });
        }
        break;
      }

      case 'graduates': {
        if (action === 'add') {
          const { error } = await supabase.from('graduates').insert(mapGradClientToDb(data));
          return NextResponse.json({ success: !error, error });
        }
        if (action === 'update') {
          const { error } = await supabase.from('graduates').update(mapGradClientToDb(fields)).eq('id', id);
          return NextResponse.json({ success: !error, error });
        }
        if (action === 'delete') {
          const { error } = await supabase.from('graduates').delete().eq('id', id);
          return NextResponse.json({ success: !error, error });
        }
        if (action === 'import') {
          await supabase.from('graduates').delete().neq('id', 'dummy');
          const { error } = await supabase.from('graduates').insert(list.map(mapGradClientToDb));
          return NextResponse.json({ success: !error, error });
        }
        if (action === 'reorder') {
          const promises = list.map((g: any) =>
            supabase.from('graduates').update({ order_number: g.order }).eq('id', g.id)
          );
          await Promise.all(promises);
          return NextResponse.json({ success: true });
        }
        break;
      }

      case 'messages': {
        if (action === 'create') {
          const { error } = await supabase.from('messages').insert(mapMsgClientToDb(data));
          return NextResponse.json({ success: !error, error });
        }
        if (action === 'approve') {
          const { error } = await supabase.from('messages').update({ status: 'approved' }).eq('id', id);
          return NextResponse.json({ success: !error, error });
        }
        if (action === 'reject') {
          const { error } = await supabase.from('messages').update({ status: 'rejected' }).eq('id', id);
          return NextResponse.json({ success: !error, error });
        }
        if (action === 'delete') {
          const { error } = await supabase.from('messages').delete().eq('id', id);
          return NextResponse.json({ success: !error, error });
        }
        break;
      }

      case 'gallery': {
        if (action === 'create') {
          const { error } = await supabase.from('photos').insert(mapPhotoClientToDb(data));
          return NextResponse.json({ success: !error, error });
        }
        if (action === 'approve') {
          const { error } = await supabase.from('photos').update({ status: 'approved' }).eq('id', id);
          return NextResponse.json({ success: !error, error });
        }
        if (action === 'reject' || action === 'delete') {
          const { error } = await supabase.from('photos').delete().eq('id', id);
          return NextResponse.json({ success: !error, error });
        }
        break;
      }

      case 'media-links': {
        await supabase.from('media_links').upsert({ id: 'photos', title: 'Official Photos', type: 'photos', url: data.officialPhotosUrl, is_active: true });
        await supabase.from('media_links').upsert({ id: 'video_recap', title: 'Recap Video', type: 'video_recap', url: data.recapVideoUrl, is_active: true });
        await supabase.from('media_links').upsert({ id: 'video_full', title: 'Full Ceremony Video', type: 'video_full', url: data.fullCeremonyUrl, is_active: true });
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Server action error:', error);
    return NextResponse.json({ success: false, error: 'Write request failed' }, { status: 500 });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

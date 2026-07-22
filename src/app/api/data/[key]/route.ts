import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { readLocalJson } from '@/lib/jsonStore';
import { sql as rawSql } from '@/lib/dbSql';

let supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
if (supabaseUrl.endsWith('/rest/v1/')) {
  supabaseUrl = supabaseUrl.slice(0, -9);
} else if (supabaseUrl.endsWith('/rest/v1')) {
  supabaseUrl = supabaseUrl.slice(0, -8);
}

const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();
const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

const isSupabaseConfigured = !!(supabaseUrl && (supabaseAnonKey || supabaseServiceKey));

// Use server-side client (with service key if available for administrative writes)
const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey)
  : null;

// Timeout utility for server-side HTTP database operations (4s for reliable response)
function withTimeout<T>(promise: PromiseLike<T>, ms = 4000): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Supabase query timed out')), ms)
    )
  ]);
}

// --- DTO MAPPERS FOR SUPABASE (snake_case) TO CLIENT (camelCase) ---
const mapGradDbToClient = (g: any) => ({
  id: g.id,
  order: g.order_number || g.order,
  fullName: g.full_name || g.fullName,
  displayName: g.display_name || g.displayName,
  photo: g.photo_url || g.photo || '',
  quote: g.quote || '',
  linkedin: g.linkedin || '',
  instagram: g.instagram || '',
  showProfile: true,
  bourse: g.bourse || '',
  masterProgram: g.master_program || g.masterProgram || '',
  isHighestHonors: g.is_highest_honors ?? g.isHighestHonors ?? false,
  honorsOrder: g.honors_order ?? g.honorsOrder ?? null
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
  show_profile: true,
  bourse: g.bourse || '',
  master_program: g.masterProgram || '',
  is_highest_honors: g.isHighestHonors ?? false,
  honors_order: g.honorsOrder ?? null
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
  const sql = rawSql;

  // 1. Try Direct SQL database read if SQL is configured (Bypasses missing DNS records!)
  if (sql) {
    try {
      switch (key) {
        case 'all': {
          const [info, prog, grads, msgs, pics, links] = await Promise.all([
            sql`SELECT url FROM media_links WHERE type = 'ceremony_info' LIMIT 1`,
            sql`SELECT id, item_order as "order", time, title, description, is_current as "isCurrent" FROM program_items ORDER BY item_order ASC`,
            sql`SELECT id, order_number as "order", full_name as "fullName", display_name as "displayName", photo_url as "photo", quote, linkedin, instagram, show_profile as "showProfile", bourse, master_program as "masterProgram", is_highest_honors as "isHighestHonors", honors_order as "honorsOrder" FROM graduates ORDER BY order_number ASC`,
            sql`SELECT id, message, sender_name as "senderName", is_anonymous as "isAnonymous", target_type as "targetType", target_graduate_ids as "targetGraduateIds", relation, status, created_at as "createdAt" FROM messages ORDER BY created_at DESC`,
            sql`SELECT id, url, caption, uploaded_by as "uploadedBy", status, created_at as "createdAt" FROM photos ORDER BY created_at DESC`,
            sql`SELECT type, url FROM media_links`
          ]);

          const infoData = info.length > 0 ? JSON.parse(info[0].url) : readLocalJson('ceremony-info.json');
          const progData = prog.length > 0 ? prog : readLocalJson('program.json');
          const gradsData = grads.length > 0 ? grads.map((g: any) => ({ ...g, showProfile: true })) : readLocalJson('graduates.json');
          const msgsData = msgs.length > 0 ? msgs.map((m: any) => ({
            ...m,
            targetGraduateIds: typeof m.targetGraduateIds === 'string' ? JSON.parse(m.targetGraduateIds) : (Array.isArray(m.targetGraduateIds) ? m.targetGraduateIds : [])
          })) : readLocalJson('messages.json');
          const galleryData = pics.length > 0 ? pics : readLocalJson('gallery.json');

          let mediaLinksData = readLocalJson('media-links.json');
          if (links.length > 0) {
            const linksObj = { officialPhotosUrl: '', recapVideoUrl: '', fullCeremonyUrl: '' };
            links.forEach((item: any) => {
              if (item.type === 'photos') linksObj.officialPhotosUrl = item.url;
              if (item.type === 'video_recap') linksObj.recapVideoUrl = item.url;
              if (item.type === 'video_full') linksObj.fullCeremonyUrl = item.url;
            });
            mediaLinksData = linksObj;
          }

          return NextResponse.json({
            _source: 'sql',
            journey: readLocalJson('journey.json'),
            ceremonyInfo: infoData,
            program: progData,
            graduates: gradsData,
            messages: msgsData,
            photos: galleryData,
            mediaLinks: mediaLinksData
          });
        }

        case 'ceremony-info': {
          const rows = await sql`SELECT url FROM media_links WHERE type = 'ceremony_info' LIMIT 1`;
          if (rows.length > 0) {
            return NextResponse.json(JSON.parse(rows[0].url));
          }
          return NextResponse.json(readLocalJson('ceremony-info.json'));
        }

        case 'program': {
          const rows = await sql`SELECT id, item_order as "order", time, title, description, is_current as "isCurrent" FROM program_items ORDER BY item_order ASC`;
          if (rows.length === 0) {
            return NextResponse.json(readLocalJson('program.json'));
          }
          return NextResponse.json(rows);
        }

        case 'graduates': {
          const rows = await sql`SELECT id, order_number as "order", full_name as "fullName", display_name as "displayName", photo_url as "photo", quote, linkedin, instagram, show_profile as "showProfile", bourse, master_program as "masterProgram", is_highest_honors as "isHighestHonors", honors_order as "honorsOrder" FROM graduates ORDER BY order_number ASC`;
          if (rows.length === 0) {
            return NextResponse.json(readLocalJson('graduates.json'));
          }
          return NextResponse.json(rows.map((g: any) => ({ ...g, showProfile: true })));
        }

        case 'messages': {
          const rows = await sql`SELECT id, message, sender_name as "senderName", is_anonymous as "isAnonymous", target_type as "targetType", target_graduate_ids as "targetGraduateIds", relation, status, created_at as "createdAt" FROM messages ORDER BY created_at DESC`;
          if (rows.length === 0) {
            return NextResponse.json(readLocalJson('messages.json'));
          }
          return NextResponse.json(rows.map((m: any) => ({
            ...m,
            targetGraduateIds: typeof m.targetGraduateIds === 'string' ? JSON.parse(m.targetGraduateIds) : (Array.isArray(m.targetGraduateIds) ? m.targetGraduateIds : [])
          })));
        }

        case 'gallery': {
          const rows = await sql`SELECT id, url, caption, uploaded_by as "uploadedBy", status, created_at as "createdAt" FROM photos ORDER BY created_at DESC`;
          if (rows.length === 0) {
            return NextResponse.json(readLocalJson('gallery.json'));
          }
          return NextResponse.json(rows);
        }

        case 'media-links': {
          const rows = await sql`SELECT type, url FROM media_links`;
          if (rows.length === 0) {
            return NextResponse.json(readLocalJson('media-links.json'));
          }
          const links = { officialPhotosUrl: '', recapVideoUrl: '', fullCeremonyUrl: '' };
          rows.forEach((item: any) => {
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
      console.error(`Direct SQL fetch failed for key '${key}', dropping down to HTTP fallback:`, e);
      // Fall through to try Supabase HTTP REST or local files
    }
  }

  // 2. Try Supabase HTTP REST (Default client-fallback mode)
  if (isSupabaseConfigured && supabase) {
    try {
      switch (key) {
        case 'all': {
          const [info, prog, grads, msgs, pics, links] = await Promise.all([
            withTimeout(supabase.from('media_links').select('*').eq('type', 'ceremony_info').single(), 4000).catch(() => ({ data: null, error: true })),
            withTimeout(supabase.from('program_items').select('*').order('item_order', { ascending: true }), 4000).catch(() => ({ data: null, error: true })),
            withTimeout(supabase.from('graduates').select('*').order('order_number', { ascending: true }), 4000).catch(() => ({ data: null, error: true })),
            withTimeout(supabase.from('messages').select('*').order('created_at', { ascending: false }), 4000).catch(() => ({ data: null, error: true })),
            withTimeout(supabase.from('photos').select('*').order('created_at', { ascending: false }), 4000).catch(() => ({ data: null, error: true })),
            withTimeout(supabase.from('media_links').select('*'), 4000).catch(() => ({ data: null, error: true }))
          ]);

          const infoData = info.data ? JSON.parse(info.data.url) : readLocalJson('ceremony-info.json');
          const progData = prog.data && prog.data.length > 0 ? prog.data.map(mapProgDbToClient) : readLocalJson('program.json');
          const gradsData = grads.data && grads.data.length > 0 ? grads.data.map(mapGradDbToClient) : readLocalJson('graduates.json');
          const msgsData = msgs.data ? msgs.data.map(mapMsgDbToClient) : readLocalJson('messages.json');
          const galleryData = pics.data ? pics.data.map(mapPhotoDbToClient) : readLocalJson('gallery.json');

          let mediaLinksData = readLocalJson('media-links.json');
          if (links.data && links.data.length > 0) {
            const linksObj = { officialPhotosUrl: '', recapVideoUrl: '', fullCeremonyUrl: '' };
            links.data.forEach((item: any) => {
              if (item.type === 'photos') linksObj.officialPhotosUrl = item.url;
              if (item.type === 'video_recap') linksObj.recapVideoUrl = item.url;
              if (item.type === 'video_full') linksObj.fullCeremonyUrl = item.url;
            });
            mediaLinksData = linksObj;
          }

          return NextResponse.json({
            _source: 'supabase',
            journey: readLocalJson('journey.json'),
            ceremonyInfo: infoData,
            program: progData,
            graduates: gradsData,
            messages: msgsData,
            photos: galleryData,
            mediaLinks: mediaLinksData
          });
        }

        case 'ceremony-info': {
          const { data, error } = await withTimeout(
            supabase
              .from('media_links')
              .select('*')
              .eq('type', 'ceremony_info')
              .single(),
            1500
          );

          if (error || !data) {
            return NextResponse.json(readLocalJson('ceremony-info.json'));
          }
          return NextResponse.json(JSON.parse(data.url));
        }

        case 'program': {
          const { data, error } = await withTimeout(
            supabase
              .from('program_items')
              .select('*')
              .order('item_order', { ascending: true }),
            1500
          );

          if (error) {
            console.error('Supabase program fetch error:', error);
            return NextResponse.json(readLocalJson('program.json'));
          }
          if (!data || data.length === 0) {
            return NextResponse.json(readLocalJson('program.json'));
          }
          return NextResponse.json(data.map(mapProgDbToClient));
        }

        case 'graduates': {
          const { data, error } = await withTimeout(
            supabase
              .from('graduates')
              .select('*')
              .order('order_number', { ascending: true }),
            1500
          );

          if (error) {
            console.error('Supabase graduates fetch error:', error);
            return NextResponse.json(readLocalJson('graduates.json'));
          }
          if (!data || data.length === 0) {
            return NextResponse.json(readLocalJson('graduates.json'));
          }
          return NextResponse.json(data.map(mapGradDbToClient));
        }

        case 'messages': {
          const { data, error } = await withTimeout(
            supabase
              .from('messages')
              .select('*')
              .order('created_at', { ascending: false }),
            1500
          );

          if (error || !data) {
            return NextResponse.json(readLocalJson('messages.json'));
          }
          return NextResponse.json(data.map(mapMsgDbToClient));
        }

        case 'gallery': {
          const { data, error } = await withTimeout(
            supabase
              .from('photos')
              .select('*')
              .order('created_at', { ascending: false }),
            1500
          );

          if (error || !data) {
            return NextResponse.json(readLocalJson('gallery.json'));
          }
          return NextResponse.json(data.map(mapPhotoDbToClient));
        }

        case 'media-links': {
          const { data, error } = await withTimeout(
            supabase
              .from('media_links')
              .select('*'),
            1500
          );

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
      console.error(`Supabase query timed out or failed on server for ${key}:`, e);
      // Fallback below to local files
    }
  }

  // 3. Local static files fallback loader (Runs when both SQL and HTTP fallbacks are suspended/unconfigured)
  if (key === 'all') {
    return NextResponse.json({
      _source: 'template',
      journey: readLocalJson('journey.json'),
      ceremonyInfo: readLocalJson('ceremony-info.json'),
      program: readLocalJson('program.json'),
      graduates: readLocalJson('graduates.json'),
      messages: readLocalJson('messages.json'),
      photos: readLocalJson('gallery.json'),
      mediaLinks: readLocalJson('media-links.json')
    });
  }

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
  const sql = rawSql;

  // 1. Try Direct SQL database write if SQL is configured
  if (sql) {
    try {
      const body = await request.json();
      const { action, data, id, fields, list } = body;

      switch (key) {
        case 'ceremony-info': {
          await sql`
            INSERT INTO media_links (id, title, type, url, is_active)
            VALUES ('ceremony-info', 'Ceremony Info', 'ceremony_info', ${JSON.stringify(data)}, true)
            ON CONFLICT (id) DO UPDATE SET url = EXCLUDED.url
          `;
          return NextResponse.json({ success: true });
        }

        case 'program': {
          if (action === 'add') {
            await sql`
              INSERT INTO program_items (id, item_order, time, title, description, is_current)
              VALUES (${data.id}, ${data.order}, ${data.time}, ${data.title}, ${data.description}, ${data.isCurrent})
            `;
            return NextResponse.json({ success: true });
          }
          if (action === 'update') {
            if (fields.isCurrent) {
              await sql`UPDATE program_items SET is_current = false WHERE id != ${id}`;
            }
            await sql`
              UPDATE program_items 
              SET 
                time = ${fields.time !== undefined ? fields.time : sql`time`},
                title = ${fields.title !== undefined ? fields.title : sql`title`},
                description = ${fields.description !== undefined ? fields.description : sql`description`},
                is_current = ${fields.isCurrent !== undefined ? fields.isCurrent : sql`is_current`},
                item_order = ${fields.order !== undefined ? fields.order : sql`item_order`}
              WHERE id = ${id}
            `;
            return NextResponse.json({ success: true });
          }
          if (action === 'delete') {
            await sql`DELETE FROM program_items WHERE id = ${id}`;
            return NextResponse.json({ success: true });
          }
          if (action === 'reorder') {
            const promises = list.map((item: any) =>
              sql`UPDATE program_items SET item_order = ${item.order} WHERE id = ${item.id}`
            );
            await Promise.all(promises);
            return NextResponse.json({ success: true });
          }
          break;
        }

        case 'graduates': {
          if (action === 'add') {
            await sql`
              INSERT INTO graduates (id, order_number, full_name, display_name, photo_url, quote, linkedin, instagram, show_profile, bourse, master_program, is_highest_honors, honors_order)
              VALUES (${data.id}, ${data.order}, ${data.fullName}, ${data.displayName}, ${data.photo}, ${data.quote}, ${data.linkedin}, ${data.instagram}, ${data.showProfile}, ${data.bourse || ''}, ${data.masterProgram || ''}, ${data.isHighestHonors ?? false}, ${data.honorsOrder || null})
            `;
            return NextResponse.json({ success: true });
          }
          if (action === 'update') {
            await sql`
              UPDATE graduates 
              SET 
                full_name = ${fields.fullName !== undefined ? fields.fullName : sql`full_name`},
                display_name = ${fields.displayName !== undefined ? fields.displayName : sql`display_name`},
                photo_url = ${fields.photo !== undefined ? fields.photo : sql`photo_url`},
                quote = ${fields.quote !== undefined ? fields.quote : sql`quote`},
                linkedin = ${fields.linkedin !== undefined ? fields.linkedin : sql`linkedin`},
                instagram = ${fields.instagram !== undefined ? fields.instagram : sql`instagram`},
                show_profile = ${fields.showProfile !== undefined ? fields.showProfile : sql`show_profile`},
                bourse = ${fields.bourse !== undefined ? fields.bourse : sql`bourse`},
                master_program = ${fields.masterProgram !== undefined ? fields.masterProgram : sql`master_program`},
                is_highest_honors = ${fields.isHighestHonors !== undefined ? fields.isHighestHonors : sql`is_highest_honors`},
                honors_order = ${fields.honorsOrder !== undefined ? fields.honorsOrder : sql`honors_order`},
                order_number = ${fields.order !== undefined ? fields.order : sql`order_number`}
              WHERE id = ${id}
            `;
            return NextResponse.json({ success: true });
          }
          if (action === 'delete') {
            await sql`DELETE FROM graduates WHERE id = ${id}`;
            return NextResponse.json({ success: true });
          }
          if (action === 'import') {
            await sql`DELETE FROM graduates`;
            for (const g of list) {
              await sql`
                INSERT INTO graduates (id, order_number, full_name, display_name, photo_url, quote, linkedin, instagram, show_profile, bourse, master_program, is_highest_honors, honors_order)
                VALUES (${g.id}, ${g.order}, ${g.fullName}, ${g.displayName}, ${g.photo}, ${g.quote}, ${g.linkedin}, ${g.instagram}, ${g.showProfile}, ${g.bourse || ''}, ${g.masterProgram || ''}, ${g.isHighestHonors ?? false}, ${g.honorsOrder || null})
              `;
            }
            return NextResponse.json({ success: true });
          }
          if (action === 'reorder') {
            const promises = list.map((g: any) =>
              sql`UPDATE graduates SET order_number = ${g.order} WHERE id = ${g.id}`
            );
            await Promise.all(promises);
            return NextResponse.json({ success: true });
          }
          break;
        }

        case 'messages': {
          if (action === 'create') {
            await sql`
              INSERT INTO messages (id, message, sender_name, is_anonymous, target_type, target_graduate_ids, relation, status)
              VALUES (${data.id}, ${data.message}, ${data.senderName}, ${data.isAnonymous}, ${data.targetType}, ${JSON.stringify(data.targetGraduateIds)}, ${data.relation}, ${data.status})
            `;
            return NextResponse.json({ success: true });
          }
          if (action === 'approve') {
            await sql`UPDATE messages SET status = 'approved' WHERE id = ${id}`;
            return NextResponse.json({ success: true });
          }
          if (action === 'approve_all') {
            await sql`UPDATE messages SET status = 'approved' WHERE status = 'pending'`;
            return NextResponse.json({ success: true });
          }
          if (action === 'reject') {
            await sql`UPDATE messages SET status = 'rejected' WHERE id = ${id}`;
            return NextResponse.json({ success: true });
          }
          if (action === 'delete') {
            await sql`DELETE FROM messages WHERE id = ${id}`;
            return NextResponse.json({ success: true });
          }
          break;
        }

        case 'gallery': {
          if (action === 'create') {
            await sql`
              INSERT INTO photos (id, url, caption, uploaded_by, status)
              VALUES (${data.id}, ${data.url}, ${data.caption}, ${data.uploadedBy}, ${data.status})
            `;
            return NextResponse.json({ success: true });
          }
          if (action === 'approve') {
            await sql`UPDATE photos SET status = 'approved' WHERE id = ${id}`;
            return NextResponse.json({ success: true });
          }
          if (action === 'approve_all') {
            await sql`UPDATE photos SET status = 'approved' WHERE status = 'pending'`;
            return NextResponse.json({ success: true });
          }
          if (action === 'reject' || action === 'delete') {
            await sql`DELETE FROM photos WHERE id = ${id}`;
            return NextResponse.json({ success: true });
          }
          break;
        }

        case 'media-links': {
          await sql`
            INSERT INTO media_links (id, title, type, url, is_active)
            VALUES ('photos', 'Official Photos', 'photos', ${data.officialPhotosUrl}, true)
            ON CONFLICT (id) DO UPDATE SET url = EXCLUDED.url
          `;
          await sql`
            INSERT INTO media_links (id, title, type, url, is_active)
            VALUES ('video_recap', 'Recap Video', 'video_recap', ${data.recapVideoUrl}, true)
            ON CONFLICT (id) DO UPDATE SET url = EXCLUDED.url
          `;
          await sql`
            INSERT INTO media_links (id, title, type, url, is_active)
            VALUES ('video_full', 'DGCI 2026 Video', 'video_full', ${data.fullCeremonyUrl}, true)
            ON CONFLICT (id) DO UPDATE SET url = EXCLUDED.url
          `;
          return NextResponse.json({ success: true });
        }
      }
    } catch (e) {
      console.error(`Direct SQL write action failed for key '${key}', dropping down to HTTP fallback:`, e);
      // Fall through to try Supabase HTTP REST
    }
  }

  // 2. Try Supabase HTTP REST (Default client-fallback mode)
  if (!isSupabaseConfigured || !supabase) {
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
        if (action === 'approve_all') {
          const { error } = await supabase.from('messages').update({ status: 'approved' }).eq('status', 'pending');
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
        if (action === 'approve_all') {
          const { error } = await supabase.from('photos').update({ status: 'approved' }).eq('status', 'pending');
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
        await supabase.from('media_links').upsert({ id: 'video_full', title: 'DGCI 2026 Video', type: 'video_full', url: data.fullCeremonyUrl, is_active: true });
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

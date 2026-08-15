const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

if (process.loadEnvFile) {
  try { process.loadEnvFile(); } catch (e) {}
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('Notice: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in environment or .env.');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Reading playlist.ts...');
  const playlistFile = fs.readFileSync(path.join(__dirname, '../src/data/playlist.ts'), 'utf-8');
  
  // Extract JSON videos
  const match = playlistFile.match(/videos:\s*(\[[\s\S]*?\])\s*\n\s*\};/);
  if (!match) {
    console.error('Could not parse videos array from playlist.ts');
    process.exit(1);
  }
  
  const videos = JSON.parse(match[1]);
  console.log(`Found ${videos.length} videos. Preparing upsert to Supabase...`);

  const payload = videos.map(v => ({
    id: v.id,
    title: v.title,
    external_link: v.externalLink,
    thumbnail_url: v.thumbnailUrl,
    category: v.category,
    order_index: v.orderIndex,
    accent_color: v.accentColor || '#ef4444'
  }));

  const { data, error } = await supabase.from('videos').upsert(payload, { onConflict: 'id' });
  if (error) {
    console.error('Error seeding videos:', error);
    process.exit(1);
  }

  console.log(`Successfully seeded ${payload.length} videos into Supabase table 'videos'!`);
}

seed();

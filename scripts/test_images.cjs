const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '../src/data/playlist.ts'), 'utf-8');
const jsonMatch = content.match(/videos:\s*(\[[\s\S]*?\])\s*};/);

if (!jsonMatch) {
  console.error('Could not find videos array in playlist.ts');
  process.exit(1);
}

const videos = JSON.parse(jsonMatch[1]);
console.log(`Found ${videos.length} videos. Checking image URLs...`);

async function checkImages() {
  const broken = [];
  for (const v of videos) {
    try {
      const res = await fetch(v.thumbnailUrl, { method: 'HEAD' });
      if (!res.ok) {
        broken.push({ id: v.id, title: v.title, url: v.thumbnailUrl, status: res.status });
      }
    } catch (e) {
      broken.push({ id: v.id, title: v.title, url: v.thumbnailUrl, error: e.message });
    }
  }
  console.log(`Check complete. Broken/failing images count: ${broken.length}`);
  if (broken.length > 0) {
    console.log(JSON.stringify(broken, null, 2));
  }
}

checkImages();

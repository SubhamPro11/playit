const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '../src/data/playlist.ts'), 'utf-8');
const jsonMatch = content.match(/videos:\s*(\[[\s\S]*?\])\s*};/);
const videos = JSON.parse(jsonMatch[1]);

const groups = {};
for (const v of videos) {
  if (!groups[v.category]) groups[v.category] = [];
  groups[v.category].push(v);
}

console.log('Total entries:', videos.length);
for (const [cat, list] of Object.entries(groups)) {
  console.log(`\n### Category: ${cat} (${list.length} entries)`);
  list.forEach(v => console.log(`  - #${String(v.orderIndex).padStart(2, '0')} ${v.title} (${v.externalLink})`));
}

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Load playlist
const playlistTsPath = path.resolve(__dirname, '../src/data/playlist.ts');
const playlistContent = fs.readFileSync(playlistTsPath, 'utf8');

const match = playlistContent.match(/export const PLAYLIST: PlaylistData = ([\s\S]*?);\s*$/);
if (!match) {
  console.error('Failed to match PLAYLIST data in playlist.ts');
  process.exit(1);
}

let playlistData;
try {
  const jsonLike = match[1].replace(/(title|description|videos|id|orderIndex|externalLink|thumbnailUrl|category|accentColor):/g, '"$1":');
  playlistData = JSON.parse(jsonLike);
} catch (e) {
  console.error('Error parsing playlist data:', e);
  process.exit(1);
}

function checkUrl(url) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    try {
      const parsed = new URL(url);
      const client = parsed.protocol === 'https:' ? https : http;

      const req = client.request(
        url,
        {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 PlayIt-HealthCheck/1.0',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          },
          timeout: 8000,
        },
        (res) => {
          const duration = Date.now() - startTime;
          const status = res.statusCode || 0;
          res.destroy(); // Don't download entire body

          let health = 'live';
          if (status >= 200 && status < 400) {
            health = status >= 300 ? 'redirect' : 'live';
          } else if (status >= 400) {
            health = 'broken';
          }

          resolve({
            url,
            statusCode: status,
            health,
            durationMs: duration,
          });
        }
      );

      req.on('timeout', () => {
        req.destroy();
        resolve({
          url,
          statusCode: 0,
          health: 'timeout',
          durationMs: Date.now() - startTime,
          error: 'Connection timeout after 8000ms',
        });
      });

      req.on('error', (err) => {
        resolve({
          url,
          statusCode: 0,
          health: 'broken',
          durationMs: Date.now() - startTime,
          error: err.message,
        });
      });

      req.end();
    } catch (err) {
      resolve({
        url,
        statusCode: 0,
        health: 'broken',
        durationMs: 0,
        error: err.message,
      });
    }
  });
}

async function runAudit() {
  console.log(`Starting health audit for ${playlistData.videos.length} stations...\n`);
  const results = [];
  const concurrency = 5;
  let cursor = 0;

  const worker = async () => {
    while (cursor < playlistData.videos.length) {
      const idx = cursor++;
      const video = playlistData.videos[idx];
      if (!video) break;

      const res = await checkUrl(video.externalLink);
      const icon = res.health === 'live' ? '✓' : res.health === 'redirect' ? '→' : res.health === 'timeout' ? '⏱' : '✗';
      console.log(`[${idx + 1}/${playlistData.videos.length}] ${icon} (${res.statusCode || 'ERR'}) ${video.title} -> ${video.externalLink}`);
      results.push({
        videoId: video.id,
        title: video.title,
        ...res,
        lastChecked: new Date().toISOString(),
      });
    }
  };

  await Promise.all(Array.from({ length: concurrency }, () => worker()));

  const live = results.filter((r) => r.health === 'live' || r.health === 'redirect').length;
  const flagged = results.filter((r) => r.health === 'broken' || r.health === 'timeout');

  console.log(`\nAudit Complete:`);
  console.log(`Total: ${results.length}`);
  console.log(`Reachable/Live: ${live}`);
  console.log(`Flagged for Manual Review: ${flagged.length}`);

  if (flagged.length > 0) {
    console.log('\nFlagged Stations (For Manual Review Only — Do not auto-delete):');
    flagged.forEach((f) => {
      console.log(` - [${f.health.toUpperCase()}] ${f.title} (${f.url}) - Error: ${f.error || f.statusCode}`);
    });
  }

  // Save report to src/data/link-health.json
  const outputPath = path.resolve(__dirname, '../src/data/link-health.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`\nSaved health report to: ${outputPath}`);
}

runAudit();

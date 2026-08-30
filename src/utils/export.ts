import { Video } from '../types/video';

/**
 * Downloads a text or binary file to the user's computer via a temporary anchor.
 */
function triggerDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Exports the complete station catalog as a formatted JSON document.
 */
export function exportStationsAsJson(videos: Video[]) {
  const exportData = {
    name: 'Airwaves — Curated Audio & Web Radio Showcase',
    description: 'A human-curated collection of independent audio websites, soundscapes, and web radio stations.',
    exportedAt: new Date().toISOString(),
    totalEntries: videos.length,
    stations: videos.map((v) => ({
      id: v.id,
      title: v.title,
      url: v.externalLink,
      category: v.category,
      orderIndex: v.orderIndex,
    })),
  };

  const jsonString = JSON.stringify(exportData, null, 2);
  triggerDownload(jsonString, `airwaves-stations-${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
}

/**
 * Escapes XML special characters for valid OPML document output.
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Exports the complete station catalog grouped by category into a standard OPML 2.0 file.
 */
export function exportStationsAsOpml(videos: Video[]) {
  const now = new Date().toUTCString();

  // Group stations by category
  const categories = Array.from(new Set(videos.map((v) => v.category)));

  let outlinesXml = '';
  for (const category of categories) {
    const categoryVideos = videos.filter((v) => v.category === category);
    outlinesXml += `    <outline text="${escapeXml(category)}">\n`;
    for (const station of categoryVideos) {
      outlinesXml += `      <outline text="${escapeXml(station.title)}" type="link" url="${escapeXml(station.externalLink)}" htmlUrl="${escapeXml(station.externalLink)}" category="${escapeXml(station.category)}" />\n`;
    }
    outlinesXml += `    </outline>\n`;
  }

  const opmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>Airwaves — Curated Audio &amp; Web Radio Collection</title>
    <dateCreated>${now}</dateCreated>
    <dateModified>${now}</dateModified>
    <ownerName>Airwaves Curator</ownerName>
    <docs>http://opml.org/spec2.opml</docs>
  </head>
  <body>
${outlinesXml}  </body>
</opml>`;

  triggerDownload(opmlContent, `airwaves-stations-${new Date().toISOString().slice(0, 10)}.opml`, 'text/xml');
}

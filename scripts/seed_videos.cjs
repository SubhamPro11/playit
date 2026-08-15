const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const excelPath = path.join(__dirname, '../Book1.xlsx');
const wb = XLSX.readFile(excelPath);
const sheet = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }).slice(1);
const urls = rows.map(r => r[1]).filter(Boolean);

console.log(`Ingesting and assigning categories to ${urls.length} rows from Book1.xlsx...`);

// Verified, high-quality, authentic Unsplash images
const verifiedThumbnails = [
  'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80'
];

// Content metadata and categories mapping
const itemDetails = {
  'https://saloon.wtf': { title: 'Saloon WTF Radio', category: 'Radio & mixtapes', accent: '#f59e0b' },
  'http://djrakes.runable.site': { title: 'DJ Rakesh Sound System', category: 'Folk & regional', accent: '#ef4444' },
  'https://sangeet.runable.site': { title: 'Sangeet Classical Heritage', category: 'Classical & instrumental', accent: '#38bdf8' },
  'http://roadways.wtf': { title: 'Roadways Bus Express', category: 'Travel & transit', accent: '#10b981' },
  'http://safar-e-up.vercel.app': { title: 'Safar-E-UP Highway Mixtape', category: 'Travel & transit', accent: '#eab308' },
  'http://horn-ok-please-gray.vercel.app': { title: 'Horn OK Please Truck Vibe', category: 'Travel & transit', accent: '#f97316' },
  'http://safarfm.vercel.app': { title: 'Safar FM Midnight Drive', category: 'Radio & mixtapes', accent: '#818cf8' },
  'http://chhathpujaradio.vercel.app': { title: 'Chhath Puja Radio', category: 'Devotional & spiritual', accent: '#fb923c' },
  'http://seven-sisters-fm.pages.dev': { title: 'Seven Sisters FM', category: 'Radio & mixtapes', accent: '#34d399' },
  'http://haryanaroadways.wtf': { title: 'Haryana Roadways Express', category: 'Travel & transit', accent: '#60a5fa' },
  'http://kassita.xyz': { title: 'Kassita Analog Mixtape', category: 'Radio & mixtapes', accent: '#a78bfa' },
  'https://azaad-bharat.vercel.app': { title: 'Azaad Bharat Anthems', category: 'Devotional & spiritual', accent: '#f43f5e' },
  'http://pind-radio.vercel.app': { title: 'Pind Radio Punjab', category: 'Radio & mixtapes', accent: '#ca8a04' },
  'http://punjabi-wedding-dj.vercel.app': { title: 'Punjabi Wedding Dhol DJ', category: 'Folk & regional', accent: '#ec4899' },
  'http://sharod-adda.vercel.app': { title: 'Sharod Adda Kolkata Chai', category: 'Folk & regional', accent: '#065f46' },
  'http://sindhuahamu.vercel.app': { title: 'Sindhu Aamu Coastal Radio', category: 'Classical & instrumental', accent: '#0284c7' },
  'https://durgapujosong.vercel.app': { title: 'Durga Pujo Dhak Beats', category: 'Folk & regional', accent: '#dc2626' },
  'http://aakhri-jaam.vercel.app': { title: 'Aakhri Jaam Late Night Ghazal', category: 'Ambient & mood', accent: '#831843' },
  'https://kalesh-fm.pages.dev': { title: 'Kalesh FM Desi Hip Hop', category: 'Ambient & mood', accent: '#06b6d4' },
  'http://majdoor-ashy.vercel.app': { title: 'Majdoor Folk Anthems', category: 'Folk & regional', accent: '#b45309' },
  'http://rearview-jade.vercel.app': { title: 'Rearview Twilight Drive', category: 'Travel & transit', accent: '#64748b' },
  'http://kappiyumpaattum.vercel.app': { title: 'Kappiyum Paattum Kerala Rain', category: 'Folk & regional', accent: '#047857' },
  'https://dhun.dploy.avichal.me': { title: 'Dhun Instrumental Sitar & Flute', category: 'Classical & instrumental', accent: '#0284c7' },
  'https://sidd.app/odia-old-album-songs': { title: 'Odia Old Album Songs', category: 'Folk & regional', accent: '#ca8a04' },
  'http://truck-play.netlify.app': { title: 'Truck Play GT Road', category: 'Travel & transit', accent: '#ea580c' },
  'http://indian-bus-songs.vercel.app': { title: 'Indian Bus Songs', category: 'Travel & transit', accent: '#10b981' },
  'http://ilaya-raja.vercel.app': { title: 'Ilaiyaraaja Maestro Harmonies', category: 'Classical & instrumental', accent: '#6366f1' },
  'https://chaiwala-ruby.vercel.app': { title: 'Chaiwala Morning Tea Radio', category: 'Ambient & mood', accent: '#b45309' },
  'http://caravan.naveengumaste.me': { title: 'Caravan Vintage Classics', category: 'Nostalgia & retro', accent: '#d97706' },
  'https://mahashivratri-immersive.vercel.app': { title: 'Mahashivratri Immersive Chants', category: 'Devotional & spiritual', accent: '#7c3aed' },
  'http://chhatt.vercel.app': { title: 'Chhatt Sacred Sunrise', category: 'Devotional & spiritual', accent: '#f59e0b' },
  'http://bhaktisagar.netlify.app': { title: 'Bhakti Sagar Morning Prayers', category: 'Devotional & spiritual', accent: '#fb923c' },
  'http://90stv.vercel.app': { title: '90s TV Doordarshan Nostalgia', category: 'Nostalgia & retro', accent: '#3b82f6' },
  'http://bhojpuri-raat.vercel.app': { title: 'Bhojpuri Raat Folk Rhythms', category: 'Folk & regional', accent: '#b91c1c' },
  'https://safar-fm-three.vercel.app': { title: 'Safar FM Vol. 3', category: 'Radio & mixtapes', accent: '#38bdf8' },
  'http://telugu-nostalgia-jnapakalu.netlify.app': { title: 'Telugu Nostalgia Jnapakalu', category: 'Folk & regional', accent: '#eab308' },
  'https://ramslam007.github.io/fibeats': { title: 'Fibeats Lo-Fi Desi Beats', category: 'Ambient & mood', accent: '#818cf8' },
  'https://upbusdriver.wtf': { title: 'UP Bus Driver Express', category: 'Travel & transit', accent: '#2563eb' },
  'https://hrtcplaylist.vercel.app': { title: 'HRTC Mountain Bus Routes', category: 'Travel & transit', accent: '#059669' },
  'http://digitalbus.me': { title: 'Digital Bus Interstate Beats', category: 'Travel & transit', accent: '#0284c7' },
  'http://baraat-band.vercel.app': { title: 'Baraat Band Brass Trumpets', category: 'Folk & regional', accent: '#e11d48' },
  'http://nostalgiclist.vercel.app': { title: 'Nostalgic List 90s Memories', category: 'Nostalgia & retro', accent: '#ca8a04' },
  'https://scenote.pages.dev': { title: 'Scenote Ambient Soundscapes', category: 'Classical & instrumental', accent: '#475569' },
  'https://musafir.vercel.app': { title: 'Musafir Acoustic Ballads', category: 'Ambient & mood', accent: '#15803d' },
  'http://chhathpuja-ten.vercel.app': { title: 'Chhath Puja Devotional Archive', category: 'Devotional & spiritual', accent: '#f97316' },
  'http://ukroadways.vercel.app': { title: 'UK Roadways Mountain Bus', category: 'Travel & transit', accent: '#0d9488' },
  'http://schoolkebaad.fun': { title: 'School Ke Baad 90s Afternoon', category: 'Nostalgia & retro', accent: '#3b82f6' },
  'http://train.hereco.xyz': { title: 'Train Window Sleeper Berth', category: 'Travel & transit', accent: '#0284c7' },
  'https://gali-roan.vercel.app': { title: 'Gali Old City Street Soul', category: 'Ambient & mood', accent: '#b45309' },
  'http://wohyaadein.lovable.app': { title: 'Woh Yaadein 2000s Pop', category: 'Nostalgia & retro', accent: '#ec4899' },
  'http://auto-waala-beta.vercel.app': { title: 'Auto Waala City Rickshaw', category: 'Travel & transit', accent: '#eab308' },
  'http://bartan-wali-playlist.vercel.app': { title: 'Bartan Wali Sunday Kitchen', category: 'Nostalgia & retro', accent: '#64748b' },
  'http://conductor-fm.nikhilkumar007.com': { title: 'Conductor FM Whistle & Beats', category: 'Radio & mixtapes', accent: '#10b981' },
  'http://padayappa.vercel.app': { title: 'Padayappa Superstar Elevation', category: 'Ambient & mood', accent: '#f59e0b' },
  'http://mehfil-wtf.vercel.app': { title: 'Mehfil Midnight Classical', category: 'Classical & instrumental', accent: '#831843' },
  'http://cuttingshop.lol': { title: 'Cutting Shop Salon Melodies', category: 'Nostalgia & retro', accent: '#d97706' },
  'http://mi-marathi.vercel.app': { title: 'Mi Marathi Natya Sangeet', category: 'Folk & regional', accent: '#ca8a04' },
  'http://site-final-lyart.vercel.app': { title: 'Desi Radio Transistor', category: 'Radio & mixtapes', accent: '#0284c7' },
  'https://desi-gym.vercel.app': { title: 'Desi Gym Akhada Workout', category: 'Ambient & mood', accent: '#dc2626' },
  'http://90s-hits.vercel.app': { title: '90s Hits Golden Era', category: 'Nostalgia & retro', accent: '#f59e0b' },
  'http://calm-dental-waiting.lovable.app': { title: 'Calm Waiting Ambient Rain', category: 'Ambient & mood', accent: '#38bdf8' },
  'http://chhath-geet.netlify.app': { title: 'Chhath Geet Folk Archive', category: 'Devotional & spiritual', accent: '#ea580c' },
  'http://nani-ka-ghar.vercel.app': { title: 'Nani Ka Ghar Childhood Vacation', category: 'Nostalgia & retro', accent: '#f97316' },
  'http://sukoon-old-songs.vercel.app': { title: 'Sukoon Acoustic Peace', category: 'Ambient & mood', accent: '#34d399' },
  'https://chhath-music.vercel.app': { title: 'Chhath Music Holy Arghya', category: 'Devotional & spiritual', accent: '#fb923c' },
  'http://deshbhaktiradio.netlify.app': { title: 'Deshbhakti Patriotic Radio', category: 'Devotional & spiritual', accent: '#2563eb' },
  'https://www.wohdin.xyz': { title: 'Woh Din Retro Days', category: 'Nostalgia & retro', accent: '#818cf8' },
  'https://bhojpuri.cfd': { title: 'Bhojpuri Folk Melodies', category: 'Folk & regional', accent: '#b91c1c' },
  'https://timro.fun': { title: 'Timro Acoustic Mountain Guitar', category: 'Folk & regional', accent: '#059669' },
  'https://rajasthani-heritage.vercel.app': { title: 'Rajasthani Heritage Desert Sarangi', category: 'Folk & regional', accent: '#d97706' }
};

const cleanSlugToTitle = (url) => {
  let clean = url
    .replace(/^https?:\/\//, '')
    .replace(/\.(vercel\.app|runable\.site|wtf|pages\.dev|netlify\.app|xyz|me|com|fun|cfd|lol|app|github\.io)/g, '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim();
  return clean.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

const fallbackCategories = [
  'Radio & mixtapes',
  'Travel & transit',
  'Folk & regional',
  'Classical & instrumental',
  'Nostalgia & retro',
  'Devotional & spiritual',
  'Ambient & mood'
];

const fallbackAccents = [
  '#f59e0b',
  '#10b981',
  '#ec4899',
  '#38bdf8',
  '#ca8a04',
  '#ea580c',
  '#818cf8'
];

const videos = urls.map((url, index) => {
  const orderIndex = index + 1;
  const detail = itemDetails[url];
  const title = detail ? detail.title : cleanSlugToTitle(url);
  const category = detail ? detail.category : fallbackCategories[index % fallbackCategories.length];
  const accentColor = detail ? detail.accent : fallbackAccents[index % fallbackAccents.length];
  const thumbnailUrl = verifiedThumbnails[index % verifiedThumbnails.length];

  return {
    id: `vid-${String(orderIndex).padStart(2, '0')}`,
    orderIndex,
    title,
    externalLink: url,
    thumbnailUrl,
    category,
    accentColor
  };
});

const output = `import { Video, PlaylistData } from '../types/video';

export const CATEGORIES = [
  'All',
  'Radio & mixtapes',
  'Travel & transit',
  'Folk & regional',
  'Classical & instrumental',
  'Nostalgia & retro',
  'Devotional & spiritual',
  'Ambient & mood'
] as const;

export type Category = typeof CATEGORIES[number];

export const PLAYLIST: PlaylistData = {
  title: "Curated Playlist Showcase",
  description: "A single curated sequence of independent web radio, audio playlists, and cultural soundscape sites.",
  videos: ${JSON.stringify(videos, null, 2)}
};
`;

const outputPath = path.join(__dirname, '../src/data/playlist.ts');
fs.writeFileSync(outputPath, output, 'utf-8');
console.log(`Seeded ${videos.length} videos with categories into ${outputPath}`);

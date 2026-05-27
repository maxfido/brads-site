const PLAYLIST_FEED = 'https://www.youtube.com/feeds/videos.xml?playlist_id=PLA23cyq26qJdjhFvumO16TZ9c8p-d4lc-';

function parseEntries(xml) {
  const entries = [];
  const entryRe = /<entry>([\s\S]*?)<\/entry>/g;
  let m;
  while ((m = entryRe.exec(xml)) !== null) {
    const block = m[1];
    const videoId   = (block.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)     || [])[1] || '';
    const title     = (block.match(/<title>([^<]+)<\/title>/)               || [])[1] || '';
    const published = (block.match(/<published>([^<]+)<\/published>/)       || [])[1] || '';
    const thumb     = (block.match(/<media:thumbnail url="([^"]+)"/)        || [])[1]
      || (videoId ? `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg` : '');
    if (videoId) entries.push({ videoId, title, published, thumb });
  }
  return entries;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');

  try {
    const xml = await fetch(PLAYLIST_FEED).then(r => {
      if (!r.ok) throw new Error(`YouTube feed returned ${r.status}`);
      return r.text();
    });
    const entries = parseEntries(xml);
    if (!entries.length) throw new Error('No entries parsed from feed');
    res.status(200).json({ entries });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

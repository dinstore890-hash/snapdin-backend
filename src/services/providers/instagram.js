const axios = require('axios');
const BaseProvider = require('./provider');

class InstagramProvider extends BaseProvider {
  constructor() {
    super();
    this.client = axios.create({
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': 'instagram-downloader-download-instagram-videos-stories.p.rapidapi.com',
      },
    });
  }

  async getVideo(url) {
    const response = await this.client.get(
      'https://instagram-downloader-download-instagram-videos-stories.p.rapidapi.com/unified/url',
      {
        params: { url },
        headers: {
          'x-rapidapi-host': 'instagram-downloader-download-instagram-videos-stories.p.rapidapi.com',
          'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        },
      }
    );

    const data = response.data;
    if (!data || !data.success) throw new Error('Could not fetch Instagram video.');

    return this._normalise(data, url);
  }

  _normalise(d, originalUrl) {
    const items = d.data?.content?.items || [];
    const mediaType = d.media_type || '';

    // Reels/video: data.url langsung berisi video URL
    const directUrl = d.data?.url || d.url || '';

    // Carousel/sidecar: ambil dari items
    const videoItem = items.find(i => i.type === 'video') || items[0] || {};
    const mediaUrl  = directUrl || videoItem.media_url || '';
    const thumb     = d.data?.cover_thumbnail || d.data?.thumbnail_url || videoItem.thumbnail_url || '';
    const title     = d.data?.title || 'Instagram Video';

    return {
      title,
      author:    '@instagram',
      thumbnail: thumb,
      duration:  '00:00',
      videoUrl:  originalUrl,
      isHd:      true,
      downloads: {
        nowm:  mediaUrl,
        wm:    mediaUrl,
        mp3:   '',
        cover: thumb,
      },
    };
  }
}

module.exports = new InstagramProvider();

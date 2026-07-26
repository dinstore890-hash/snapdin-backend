const axios = require('axios');
const BaseProvider = require('./provider');

class InstagramProvider extends BaseProvider {
  constructor() {
    super();
    this.client = axios.create({ timeout: 15000 });
  }

  async getVideo(url) {
    const maxRetries = 3;
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await this.client.get(
          'https://instagram-reels-downloader-api.p.rapidapi.com/download',
          {
            params: { url },
            headers: {
              'x-rapidapi-host': 'instagram-reels-downloader-api.p.rapidapi.com',
              'x-rapidapi-key': process.env.RAPIDAPI_KEY,
            },
          }
        );
        const data = response.data;
        console.log('Instagram API response:', JSON.stringify(data).slice(0, 500));
        if (!data || !data.success) throw new Error('Could not fetch Instagram post.');
        const result = this._normalise(data, url);
        console.log('Instagram normalised:', JSON.stringify(result).slice(0, 300));
        return result;
      } catch (err) {
        lastError = err;
        if (err.response?.status === 429 && i < maxRetries - 1) {
          const delay = (i + 1) * 3000;
          console.log(`Rate limited, retrying in ${delay}ms...`);
          await new Promise(r => setTimeout(r, delay));
        } else {
          throw err;
        }
      }
    }
    throw lastError;
  }

  _normalise(d, originalUrl) {
    const medias   = d.data?.medias || [];
    const title    = d.data?.title || 'Instagram Post';
    const thumb    = d.data?.thumbnail || medias.find(m => m.type === 'video')?.thumbnail || '';
    const username = d.data?.owner?.username || 'instagram';

    const videos = medias.filter(m => m.type === 'video');
    const images = medias.filter(m => m.type === 'image');

    const mediaUrl  = videos[0]?.url || '';
    const hasImages = images.length > 0 && !mediaUrl;
    const isCarousel = images.length > 1;

    return {
      title,
      author:    `@${username}`,
      thumbnail: thumb,
      duration:  '00:00',
      videoUrl:  originalUrl,
      isHd:      true,
      images:    (hasImages || isCarousel) ? images.map(i => i.url) : null,
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

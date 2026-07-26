const axios = require('axios');
const BaseProvider = require('./provider');

class InstagramProvider extends BaseProvider {
  constructor() {
    super();
    this.client = axios.create({
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36',
      },
    });
  }

  async getVideo(url) {
    // Use RapidAPI Instagram downloader
    const response = await this.client.get('https://instagram-downloader-download-instagram-videos-stories.p.rapidapi.com/index', {
      params: { url },
      headers: {
        'x-rapidapi-host': 'instagram-downloader-download-instagram-videos-stories.p.rapidapi.com',
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
      },
    });

    const data = response.data;
    if (!data || !data.media) throw new Error('Could not fetch Instagram video.');

    return this._normalise(data);
  }

  _normalise(d) {
    const media = Array.isArray(d.media) ? d.media[0] : d.media;
    return {
      title:     d.title || 'Instagram Video',
      author:    d.author || '@instagram',
      thumbnail: d.thumbnail || '',
      duration:  '00:00',
      videoUrl:  d.url || '',
      isHd:      true,
      downloads: {
        nowm:  media || '',
        wm:    media || '',
        mp3:   '',
        cover: d.thumbnail || '',
      },
    };
  }
}

module.exports = new InstagramProvider();

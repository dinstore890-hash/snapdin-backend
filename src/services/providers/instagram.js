const axios = require('axios');
const BaseProvider = require('./provider');

class InstagramProvider extends BaseProvider {
  constructor() {
    super();
    this.client = axios.create({
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': 'instagram-reels-downloader-api.p.rapidapi.com',
      },
    });
  }

  async getVideo(url) {
    const response = await this.client.get(
      'https://instagram-reels-downloader-api.p.rapidapi.com/download',
      {
        params: { url },
        headers: { 'x-rapidapi-key': process.env.RAPIDAPI_KEY },
      }
    );

    const data = response.data;
    if (!data) throw new Error('Could not fetch Instagram video.');

    return this._normalise(data, url);
  }

  _normalise(d, originalUrl) {
    // API returns { url: [...] } or { url: 'string' }
    const urls = Array.isArray(d.url) ? d.url : [d.url];
    const videoUrl = urls.find(u => u && u.includes('.mp4')) || urls[0] || '';
    const thumb    = d.thumbnail || d.thumb || '';

    return {
      title:     d.title || 'Instagram Video',
      author:    d.author || '@instagram',
      thumbnail: thumb,
      duration:  '00:00',
      videoUrl:  originalUrl,
      isHd:      true,
      downloads: {
        nowm:  videoUrl,
        wm:    videoUrl,
        mp3:   '',
        cover: thumb,
      },
    };
  }
}

module.exports = new InstagramProvider();

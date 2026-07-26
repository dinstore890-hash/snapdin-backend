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
    console.log('Instagram API response:', JSON.stringify(data).slice(0, 500));
    if (!data || !data.success) throw new Error('Could not fetch Instagram video.');

    const result = this._normalise(data, url);
    console.log('Instagram normalised:', JSON.stringify(result).slice(0, 300));
    return result;
  }

  _normalise(d, originalUrl) {
    const content = d.data?.content || {};
    const items   = content.items || [];

    // Single video: data.content.media_url
    // Carousel: data.content.items[].media_url
    const mediaUrl = content.media_url || items.find(i => i.type === 'video')?.media_url || items[0]?.media_url || '';
    const thumb    = content.thumbnail_url || d.data?.cover_thumbnail || items[0]?.thumbnail_url || '';
    const title    = d.data?.title || 'Instagram Video';

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

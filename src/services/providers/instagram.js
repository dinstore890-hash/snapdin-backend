const axios = require('axios');
const BaseProvider = require('./provider');

class InstagramProvider extends BaseProvider {
  constructor() {
    super();
    this.client = axios.create({
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getVideo(url) {
    const maxRetries = 3;
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
      try {
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
        console.log('Instagram API response:', JSON.stringify(data).slice(0, 1000));
        if (!data || !data.success) throw new Error('Could not fetch Instagram post.');
        const result = this._normalise(data, url);
        console.log('Instagram normalised:', JSON.stringify(result).slice(0, 300));
        return result;
      } catch (err) {
        lastError = err;
        if (err.response?.status === 429 && i < maxRetries - 1) {
          const delay = (i + 1) * 3000;
          console.log(`Instagram rate limited, retrying in ${delay}ms...`);
          await new Promise(r => setTimeout(r, delay));
        } else {
          throw err;
        }
      }
    }
    throw lastError;
  }

  _normalise(d, originalUrl) {
    const content = d.data?.content || {};
    const items   = content.items || [];
    const mediaType = d.media_type || '';

    const isCarousel = mediaType === 'sidecar' || items.length > 0;
    const images = isCarousel && items.length > 0
      ? items.map(i => i.media_url).filter(Boolean)
      : null;

    const isSinglePhoto = !isCarousel && (mediaType === 'photo' || (!mediaType && content.media_url && !content.media_url.includes('.mp4')));

    const mediaUrl = content.media_url || '';
    const thumb    = content.thumbnail_url || images?.[0] || '';
    const title    = d.data?.title || 'Instagram Post';

    return {
      title,
      author:    '@instagram',
      thumbnail: thumb,
      duration:  '00:00',
      videoUrl:  originalUrl,
      isHd:      true,
      images:    images || (isSinglePhoto && mediaUrl ? [mediaUrl] : null),
      downloads: {
        nowm:  (!images && !isSinglePhoto) ? mediaUrl : '',
        wm:    (!images && !isSinglePhoto) ? mediaUrl : '',
        mp3:   '',
        cover: thumb,
      },
    };
  }
}

module.exports = new InstagramProvider();

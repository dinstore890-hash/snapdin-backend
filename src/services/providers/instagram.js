const axios = require('axios');
const BaseProvider = require('./provider');

class InstagramProvider extends BaseProvider {
  constructor() {
    super();
    this.client = axios.create({
      timeout: 15000,
    });
  }

  async getVideo(url) {
    const maxRetries = 3;
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await this.client.get(
          'https://instagram-scraper-api2.p.rapidapi.com/v1/post_info',
          {
            params: { code_or_id_or_url: url },
            headers: {
              'x-rapidapi-host': 'instagram-scraper-api2.p.rapidapi.com',
              'x-rapidapi-key': process.env.RAPIDAPI_KEY,
            },
          }
        );
        const data = response.data;
        console.log('Instagram API response:', JSON.stringify(data).slice(0, 1000));
        if (!data || !data.data) throw new Error('Could not fetch Instagram post.');
        const result = this._normalise(data);
        console.log('Instagram normalised:', JSON.stringify(result).slice(0, 300));
        return result;
      } catch (err) {
        lastError = err;
        if (err.response?.status === 429 && i < maxRetries - 1) {
          const delay = (i + 1) * 2000;
          console.log(`Instagram rate limited, retrying in ${delay}ms...`);
          await new Promise(r => setTimeout(r, delay));
        } else {
          throw err;
        }
      }
    }
    throw lastError;
  }

  _normalise(d) {
    const item = d.data;
    const mediaType = item.media_type; // 1=photo, 2=video, 8=carousel
    const originalUrl = item.code ? `https://www.instagram.com/p/${item.code}/` : '';

    let images = null;
    let mediaUrl = '';
    let thumb = item.thumbnail_url || item.display_url || '';

    if (mediaType === 8) {
      // Carousel
      images = (item.carousel_media || []).map(m => m.display_url || m.thumbnail_url || '').filter(Boolean);
    } else if (mediaType === 2) {
      // Video
      const versions = item.video_versions || [];
      mediaUrl = versions[0]?.url || '';
      thumb = item.thumbnail_url || item.display_url || '';
    } else {
      // Single photo
      images = [item.display_url || item.thumbnail_url || ''].filter(Boolean);
    }

    const title = item.caption?.text?.slice(0, 100) || 'Instagram Post';
    const username = item.user?.username || 'instagram';

    return {
      title,
      author: `@${username}`,
      thumbnail: thumb,
      duration: '00:00',
      videoUrl: originalUrl,
      isHd: true,
      images,
      downloads: {
        nowm: mediaUrl,
        wm:   mediaUrl,
        mp3:  '',
        cover: thumb,
      },
    };
  }
}

module.exports = new InstagramProvider();

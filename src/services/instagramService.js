const provider = require('./providers/instagram');

const fetchInstagramData = async (url) => {
  try {
    return await provider.getVideo(url);
  } catch (err) {
    const wrapped = new Error('Unable to fetch Instagram video.');
    wrapped.cause      = err;
    wrapped.statusCode = 502;
    throw wrapped;
  }
};

module.exports = { fetchInstagramData };

const app    = require('./app');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  logger.info(`SnapDin backend running on port ${PORT} [${process.env.NODE_ENV}]`);
});

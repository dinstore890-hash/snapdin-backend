const { successResponse } = require('../utils/response');

const getRoot = (req, res) => {
  successResponse(res, { message: 'SnapDin Backend Running' });
};

const getHealth = (req, res) => {
  successResponse(res, { status: 'OK' });
};

module.exports = { getRoot, getHealth };

module.exports.getPaginationParams = (req, defaultPageSize = 20) => {
  const page = parseInt(req.query.page, 10) || 1;
  const skip = (page - 1) * defaultPageSize;
  return { page, pageSize: defaultPageSize, skip };
};

function sendSuccess(res, statusCode, message, data = null, meta = undefined) {
  const body = { success: true, message };
  if (data !== null) body.data = data;
  if (meta !== undefined) body.meta = meta;
  return res.status(statusCode).json(body);
}

function sendError(res, statusCode, message, errors = undefined) {
  const body = { success: false, message };
  if (errors !== undefined) body.errors = errors;
  return res.status(statusCode).json(body);
}

module.exports = { sendSuccess, sendError };

// Same envelope as the Java ApiResponse<T>: { success, message, data }.
export const ok = (res, message, data = null) =>
  res.status(200).json({ success: true, message, data });

export const failure = (res, status, message) =>
  res.status(status).json({ success: false, message, data: null });

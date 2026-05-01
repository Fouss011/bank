export function errorHandler(err, req, res, next) {
  console.error('❌ Error:', err)

  const status = err.status || 500
  const message =
    err.message || "Une erreur interne s'est produite"

  res.status(status).json({
    success: false,
    message,
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  })
}
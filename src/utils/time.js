export function calculateDuration(startTime, endTime = Date.now()) {
  return ((endTime - startTime) / 1000).toFixed(2)
}

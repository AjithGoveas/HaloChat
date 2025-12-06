export function log(message, ...args) {
	console.log(`[HaloChat] ${new Date().toISOString()} - ${message}`, ...args);
}
export function warn(message, ...args) {
	console.warn(`[HaloChat] ${new Date().toISOString()} - ${message}`, ...args);
}
export function err(message, ...args) {
	console.error(`[HaloChat] ${new Date().toISOString()} - ${message}`, ...args);
}

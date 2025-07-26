/**
 * Convert BigInt values to strings for JSON serialization
 * @param {*} obj - Object to process
 * @returns {*} - Object with BigInt values converted to strings
 */
function serializeBigInt(obj) {
	if (obj === null || obj === undefined) return obj;
	
	if (typeof obj === 'bigint') {
		return obj.toString();
	}
	
	if (Array.isArray(obj)) {
		return obj.map(serializeBigInt);
	}
	
	if (typeof obj === 'object') {
		const result = {};
		for (const [key, value] of Object.entries(obj)) {
			result[key] = serializeBigInt(value);
		}
		return result;
	}
	
	return obj;
}

/**
 * Convert string values back to BigInt for specific fields
 * @param {*} obj - Object to process
 * @returns {*} - Object with BigInt strings converted back to BigInt
 */
function deserializeBigInt(obj) {
	if (obj === null || obj === undefined) return obj;
	
	if (Array.isArray(obj)) {
		return obj.map(deserializeBigInt);
	}
	
	if (typeof obj === 'object') {
		const result = {};
		for (const [key, value] of Object.entries(obj)) {
			// Convert known BigInt fields back to BigInt
			if (key === 'autoClose' && typeof value === 'string' && /^\d+$/.test(value)) {
				result[key] = BigInt(value);
			} else {
				result[key] = deserializeBigInt(value);
			}
		}
		return result;
	}
	
	return obj;
}

module.exports = { serializeBigInt, deserializeBigInt };

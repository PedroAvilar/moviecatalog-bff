const sanitizeString = (value) => {
    if (typeof value != 'string') return value;

    return value
        .replace(/<\/?[^>]+(>|$)/g, '')
        .replace(/javascript:/gi, '')
        .trim();
};

const sanitizeObject = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;

    const sanitized = {}

    for (const key in obj) {
        if (key.startsWith('$') || key.includes('.')) continue;
        
        const value = obj[key];

        if (typeof value === 'string') {
            sanitized[key] = sanitizeString(value);
        } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            sanitized[key] = sanitizeObject(value);
        } else if (Array.isArray(value)) {
            sanitized[key] = value.map(item => (typeof item === 'object' ? sanitizeObject(item) : sanitizeString(item)));
        } else {
            sanitized[key] = value;
        }
    }
    return sanitized;
};

const sanitizeInput = (req, res, next) => {
    if (req.body) {
        req.body = sanitizeObject(req.body);
    }
    next();
};

export default sanitizeInput;
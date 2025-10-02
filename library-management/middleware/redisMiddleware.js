const { getRedisClient } = require('../config/redis');

// Generic cache middleware
const cache = (duration = 300) => {
    return async (req, res, next) => {
        const client = getRedisClient();
        
        if (!client) {
            return next();
        }

        // Create cache key based on URL and query parameters
        const key = `cache:${req.originalUrl}`;
        
        try {
            const cachedData = await client.get(key);
            
            if (cachedData) {
                console.log(`Cache hit for key: ${key}`);
                return res.json(JSON.parse(cachedData));
            }
            
            // Store original res.json function
            const originalJson = res.json;
            
            // Override res.json to cache the response
            res.json = function(data) {
                // Cache the response
                client.setEx(key, duration, JSON.stringify(data))
                    .catch(err => console.error('Cache set error:', err));
                
                // Call original res.json
                return originalJson.call(this, data);
            };
            
            next();
        } catch (error) {
            console.error('Cache middleware error:', error);
            next();
        }
    };
};

// User session cache
const cacheUserSession = async (userId, userData, duration = 900) => {
    const client = getRedisClient();
    if (!client) return;
    
    try {
        const key = `session:${userId}`;
        await client.setEx(key, duration, JSON.stringify(userData));
    } catch (error) {
        console.error('Session cache error:', error);
    }
};

// Get cached user session
const getCachedUserSession = async (userId) => {
    const client = getRedisClient();
    if (!client) return null;
    
    try {
        const key = `session:${userId}`;
        const cachedData = await client.get(key);
        return cachedData ? JSON.parse(cachedData) : null;
    } catch (error) {
        console.error('Get session cache error:', error);
        return null;
    }
};

// Clear user session cache
const clearUserSessionCache = async (userId) => {
    const client = getRedisClient();
    if (!client) return;
    
    try {
        const key = `session:${userId}`;
        await client.del(key);
    } catch (error) {
        console.error('Clear session cache error:', error);
    }
};

// Clear cache by pattern
const clearCacheByPattern = async (pattern) => {
    const client = getRedisClient();
    if (!client) return;
    
    try {
        const keys = await client.keys(pattern);
        if (keys.length > 0) {
            await client.del(keys);
            console.log(`Cleared ${keys.length} cache entries matching pattern: ${pattern}`);
        }
    } catch (error) {
        console.error('Clear cache by pattern error:', error);
    }
};

module.exports = {
    cache,
    cacheUserSession,
    getCachedUserSession,
    clearUserSessionCache,
    clearCacheByPattern
};
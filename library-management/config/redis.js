const redis = require('redis');

let redisClient;

const connectRedis = async () => {
    try {
        redisClient = redis.createClient({
            host: process.env.REDIS_HOST || 'localhost',
            port: process.env.REDIS_PORT || 6379,
            password: process.env.REDIS_PASSWORD || undefined,
            // For Redis Cloud or external Redis
            url: process.env.REDIS_URL || undefined
        });

        redisClient.on('error', (err) => {
            console.error('Redis Client Error:', err);
        });

        redisClient.on('connect', () => {
            console.log('Connected to Redis');
        });

        await redisClient.connect();
        
        // Test the connection
        await redisClient.ping();
        console.log('Redis connection successful');
        
        return redisClient;
    } catch (error) {
        console.error('Redis connection failed:', error);
        return null;
    }
};

const getRedisClient = () => {
    return redisClient;
};

const closeRedis = async () => {
    if (redisClient) {
        await redisClient.quit();
    }
};

module.exports = {
    connectRedis,
    getRedisClient,
    closeRedis
};
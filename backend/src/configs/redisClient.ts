import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_HOST
});

redisClient.on('error', (err) => {
  console.error('Redis client not connected to the server:', err);
});

redisClient.on('connect', () => {
  console.log('Redis client connected to the server');
});

redisClient.connect();

export default redisClient;

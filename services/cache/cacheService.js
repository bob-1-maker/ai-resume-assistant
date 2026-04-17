import dotenv from 'dotenv';
import { createClient } from 'redis';

dotenv.config();

const CACHE_EXPIRY = 3600;

let redisClient = null;
let redisInitialized = false;

const filterSensitiveInfo = (data) => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sensitiveFields = ['password', 'token', 'creditCard', 'ssn'];
  const filteredData = { ...data };

  sensitiveFields.forEach((field) => {
    if (filteredData[field]) {
      filteredData[field] = '***';
    }
  });

  return filteredData;
};

const generateCacheKey = (prefix, data) => {
  const filteredData = filterSensitiveInfo(data);
  return `${prefix}:${JSON.stringify(filteredData)}`;
};

const getRedisClient = async () => {
  if (redisInitialized) {
    return redisClient;
  }

  redisInitialized = true;

  if (process.env.REDIS_ENABLED !== 'true') {
    return null;
  }

  redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });

  try {
    await redisClient.connect();
  } catch (error) {
    console.error('Redis connection failed:', error);
    redisClient = null;
  }

  return redisClient;
};

const getFromCache = async (key) => {
  const client = await getRedisClient();

  if (!client?.isReady) {
    return null;
  }

  try {
    const cachedData = await client.get(key);
    return cachedData ? JSON.parse(cachedData) : null;
  } catch (error) {
    console.error('Read cache failed:', error);
    return null;
  }
};

const setToCache = async (key, data) => {
  const client = await getRedisClient();

  if (!client?.isReady) {
    return;
  }

  try {
    await client.set(key, JSON.stringify(data), {
      EX: CACHE_EXPIRY
    });
  } catch (error) {
    console.error('Write cache failed:', error);
  }
};

export {
  filterSensitiveInfo,
  generateCacheKey,
  getFromCache,
  setToCache
};

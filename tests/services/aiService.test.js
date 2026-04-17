import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const getFromCache = jest.fn();
const setToCache = jest.fn();
const generateCacheKey = jest.fn();
const buildChatRequest = jest.fn();
const extractChatContent = jest.fn();
const getMockAIResponse = jest.fn();
const buildGenerateMessages = jest.fn();
const buildOptimizeMessages = jest.fn();
const buildParseResumeMessages = jest.fn();
const buildStructuredParseMessages = jest.fn();
const buildWeatherProfileMessages = jest.fn();
const requestWithRetry = jest.fn();
const parseResumeFromText = jest.fn();
const fallbackParse = jest.fn();
const validateAndCompleteResult = jest.fn();
const completeMissingFields = jest.fn();
const safeParseAiJson = jest.fn();
const normalizeWeatherProfile = jest.fn();
const buildFallbackWeatherProfile = jest.fn();

jest.unstable_mockModule('../../services/cache/cacheService.js', () => ({
  getFromCache,
  setToCache,
  generateCacheKey
}));

jest.unstable_mockModule('../../services/ai/promptBuilders.js', () => ({
  buildChatRequest,
  extractChatContent,
  getMockAIResponse,
  buildGenerateMessages,
  buildOptimizeMessages,
  buildParseResumeMessages,
  buildStructuredParseMessages,
  buildWeatherProfileMessages
}));

jest.unstable_mockModule('../../services/http/requestWithRetry.js', () => ({
  requestWithRetry
}));

jest.unstable_mockModule('../../services/ai/parsers.js', () => ({
  parseResumeFromText,
  fallbackParse,
  validateAndCompleteResult,
  completeMissingFields,
  safeParseAiJson,
  normalizeWeatherProfile,
  buildFallbackWeatherProfile
}));

const {
  generateResume,
  parseResume,
  parseStructuredResume,
  buildWeatherProfile
} = await import('../../services/ai/aiService.js');

describe('aiService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetAllMocks();
    process.env = { ...originalEnv };
    generateCacheKey.mockReturnValue('cache-key');
    buildChatRequest.mockReturnValue({ model: 'demo', messages: [] });
    extractChatContent.mockReturnValue('generated content');
    getMockAIResponse.mockReturnValue('mock content');
    buildGenerateMessages.mockReturnValue([]);
    buildOptimizeMessages.mockReturnValue([]);
    buildParseResumeMessages.mockReturnValue([]);
    buildStructuredParseMessages.mockReturnValue([]);
    buildWeatherProfileMessages.mockReturnValue([]);
    validateAndCompleteResult.mockImplementation((value) => value);
    completeMissingFields.mockImplementation((text, value) => value);
    normalizeWeatherProfile.mockImplementation((value) => value);
    buildFallbackWeatherProfile.mockReturnValue({ summary: 'fallback' });
  });

  it('returns cached generate result when present', async () => {
    getFromCache.mockResolvedValue({ content: 'cached' });

    const result = await generateResume({
      basicInfo: { name: 'Alice' },
      jobDescription: 'frontend'
    });

    expect(generateCacheKey).toHaveBeenCalled();
    expect(result).toEqual({
      data: { content: 'cached' },
      msg: expect.any(String)
    });
    expect(requestWithRetry).not.toHaveBeenCalled();
  });

  it('falls back to mock generation when AI api key is absent', async () => {
    getFromCache.mockResolvedValue(null);
    process.env.AI_API_KEY = '';

    const result = await generateResume({
      basicInfo: { name: 'Alice' },
      jobDescription: 'frontend'
    });

    expect(getMockAIResponse).toHaveBeenCalled();
    expect(setToCache).toHaveBeenCalledWith('cache-key', { content: 'mock content' });
    expect(result).toEqual({
      data: { content: 'mock content' },
      msg: expect.any(String)
    });
  });

  it('falls back to local resume parsing when parse-resume AI key is absent', async () => {
    parseResumeFromText.mockReturnValue({ name: 'Alice' });
    process.env.AI_API_KEY = '';

    const result = await parseResume('resume text');

    expect(parseResumeFromText).toHaveBeenCalledWith('resume text');
    expect(result).toEqual({
      data: { name: 'Alice' },
      msg: expect.any(String)
    });
  });

  it('uses fallback structured parsing when provider call fails', async () => {
    process.env.AI_API_KEY = 'key';
    requestWithRetry.mockRejectedValue(new Error('boom'));
    fallbackParse.mockReturnValue({ name: 'Alice' });

    const result = await parseStructuredResume('long enough resume text');

    expect(fallbackParse).toHaveBeenCalledWith('long enough resume text');
    expect(validateAndCompleteResult).toHaveBeenCalled();
    expect(completeMissingFields).toHaveBeenCalled();
    expect(result.data._parseWarning).toContain('AI');
  });

  it('returns normalized weather profile when provider succeeds', async () => {
    process.env.DOUBAN_API_KEY = 'key';
    requestWithRetry.mockResolvedValue({
      choices: [{ message: { content: '{"summary":"ok"}' } }]
    });
    safeParseAiJson.mockReturnValue({ summary: 'ok' });
    normalizeWeatherProfile.mockReturnValue({ summary: 'ok' });

    const payload = {
      city: 'Shanghai',
      weather: 'Sunny',
      temp: 28,
      wind: '3',
      humidity: '50%',
      aqi: 'Good',
      rainProb: 10,
      userTags: ['commute']
    };

    const result = await buildWeatherProfile(payload);

    expect(requestWithRetry).toHaveBeenCalled();
    expect(normalizeWeatherProfile).toHaveBeenCalledWith({ summary: 'ok' }, payload);
    expect(result).toEqual({
      data: { summary: 'ok' },
      message: expect.any(String)
    });
  });

  it('returns fallback weather profile when provider fails', async () => {
    process.env.DOUBAN_API_KEY = 'key';
    requestWithRetry.mockRejectedValue(new Error('boom'));

    const payload = {
      city: 'Shanghai',
      weather: 'Sunny',
      temp: 28,
      wind: '3',
      humidity: '50%',
      aqi: 'Good',
      rainProb: 10,
      userTags: ['commute']
    };

    const result = await buildWeatherProfile(payload);

    expect(buildFallbackWeatherProfile).toHaveBeenCalledWith(payload);
    expect(result).toEqual({
      data: { summary: 'fallback' },
      message: expect.any(String)
    });
  });
});

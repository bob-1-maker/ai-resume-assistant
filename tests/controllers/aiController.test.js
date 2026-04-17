import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { createMockReq, createMockRes } from '../helpers/httpMocks.js';

const parseResume = jest.fn();
const generateResume = jest.fn();
const optimizeResume = jest.fn();
const parseStructuredResume = jest.fn();
const buildWeatherProfile = jest.fn();
const buildFallbackWeatherProfile = jest.fn();

jest.unstable_mockModule('../../services/ai/aiService.js', () => ({
  parseResume,
  generateResume,
  optimizeResume,
  parseStructuredResume,
  buildWeatherProfile,
  buildFallbackWeatherProfile
}));

const {
  parseResumeHandler,
  generateResumeHandler,
  optimizeResumeHandler,
  parseStructuredResumeHandler,
  weatherProfileHandler
} = await import('../../controllers/aiController.js');

describe('aiController', () => {
  beforeEach(() => {
    parseResume.mockReset();
    generateResume.mockReset();
    optimizeResume.mockReset();
    parseStructuredResume.mockReset();
    buildWeatherProfile.mockReset();
    buildFallbackWeatherProfile.mockReset();
  });

  it('returns 400 when parse-resume text is missing', async () => {
    const req = createMockReq({ body: {} });
    const res = createMockRes();

    await parseResumeHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(parseResume).not.toHaveBeenCalled();
  });

  it('returns service payload for parse-resume requests', async () => {
    const req = createMockReq({ body: { text: 'resume text' } });
    const res = createMockRes();
    parseResume.mockResolvedValue({
      data: { name: 'Alice' },
      msg: 'ok'
    });

    await parseResumeHandler(req, res);

    expect(parseResume).toHaveBeenCalledWith('resume text');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      code: 200,
      data: { name: 'Alice' },
      msg: 'ok'
    });
  });

  it('returns 400 when generate input is incomplete', async () => {
    const req = createMockReq({ body: { jobDescription: 'frontend' } });
    const res = createMockRes();

    await generateResumeHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(generateResume).not.toHaveBeenCalled();
  });

  it('returns service payload for generate requests', async () => {
    const req = createMockReq({
      body: {
        basicInfo: { name: 'Alice' },
        jobDescription: 'frontend'
      }
    });
    const res = createMockRes();
    generateResume.mockResolvedValue({
      data: { content: 'generated' },
      msg: 'generated ok'
    });

    await generateResumeHandler(req, res);

    expect(generateResume).toHaveBeenCalledWith({
      basicInfo: { name: 'Alice' },
      jobDescription: 'frontend'
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('returns 400 when parse input is too short', async () => {
    const req = createMockReq({ body: { resumeText: 'short' } });
    const res = createMockRes();

    await parseStructuredResumeHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(parseStructuredResume).not.toHaveBeenCalled();
  });

  it('returns 400 with fallback weather profile when weather payload is incomplete', async () => {
    const req = createMockReq({ body: { city: 'Shanghai' } });
    const res = createMockRes();
    buildFallbackWeatherProfile.mockReturnValue({ summary: 'fallback' });

    await weatherProfileHandler(req, res);

    expect(buildFallbackWeatherProfile).toHaveBeenCalledWith({ city: 'Shanghai' });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(buildWeatherProfile).not.toHaveBeenCalled();
  });

  it('returns service payload for complete weather profile requests', async () => {
    const req = createMockReq({
      body: {
        city: 'Shanghai',
        weather: 'Sunny',
        temp: 28,
        wind: '3',
        humidity: '50%',
        aqi: 'Good',
        rainProb: 10,
        userTags: ['通勤族']
      }
    });
    const res = createMockRes();
    buildWeatherProfile.mockResolvedValue({
      data: { summary: 'ok' },
      message: 'success'
    });

    await weatherProfileHandler(req, res);

    expect(buildWeatherProfile).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      code: 200,
      data: { summary: 'ok' },
      message: 'success'
    });
  });
});

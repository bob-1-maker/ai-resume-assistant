import { describe, expect, it } from '@jest/globals';
import fs from 'fs';
import path from 'path';

const userApiPath = path.resolve(process.cwd(), 'src/api/user.ts');
const clientPath = path.resolve(process.cwd(), 'src/api/client.ts');

describe('user API client config', () => {
  it('uses the shared /api client instead of a hard-coded localhost backend URL', () => {
    const userApiSource = fs.readFileSync(userApiPath, 'utf8');
    const clientSource = fs.readFileSync(clientPath, 'utf8');

    expect(userApiSource).toContain("from '@/api/client'");
    expect(clientSource).toContain("baseURL: '/api'");
    expect(userApiSource).not.toContain('http://localhost:3001/api');
  });
});

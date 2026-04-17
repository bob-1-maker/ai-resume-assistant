import { describe, expect, it } from '@jest/globals';
import fs from 'fs';
import path from 'path';

const routerPath = path.resolve(process.cwd(), 'src/router/index.ts');
const loginViewPath = path.resolve(process.cwd(), 'src/views/Login.vue');

describe('login route recovery', () => {
  it('keeps the /login route linked to the restored Login view file', () => {
    const routerSource = fs.readFileSync(routerPath, 'utf8');
    const loginViewSource = fs.readFileSync(loginViewPath, 'utf8');

    expect(fs.existsSync(loginViewPath)).toBe(true);
    expect(routerSource).toContain("path: '/login'");
    expect(routerSource).toContain("component: () => import('../views/Login.vue')");
    expect(loginViewSource).toContain('to="/admin-login"');
  });

  it('keeps the login view wired with a visible register path', () => {
    const loginViewSource = fs.readFileSync(loginViewPath, 'utf8');

    expect(loginViewSource).toContain("activeMode = ref<'login' | 'register'>('login')");
    expect(loginViewSource).toContain('confirmPassword');
    expect(loginViewSource).toContain('handleRegister');
    expect(loginViewSource).toContain('还没有账号？立即注册');
    expect(loginViewSource).toContain('已有账号？返回登录');
  });
});

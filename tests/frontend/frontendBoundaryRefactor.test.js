import { describe, expect, it } from '@jest/globals';
import fs from 'fs';
import path from 'path';

const readSource = (relativePath) => {
  return fs.readFileSync(path.resolve(process.cwd(), relativePath), 'utf8');
};

describe('phase 1 frontend boundary refactor', () => {
  it('routes user, resume, and admin APIs through the shared client factory', () => {
    const clientSource = readSource('src/api/client.ts');
    const userApiSource = readSource('src/api/user.ts');
    const resumeApiSource = readSource('src/api/resume.ts');
    const adminApiSource = readSource('src/api/admin.ts');

    expect(clientSource).toContain('export const createApiClient');
    expect(userApiSource).toContain("from '@/api/client'");
    expect(resumeApiSource).toContain("from '@/api/client'");
    expect(adminApiSource).toContain("from '@/api/client'");
  });

  it('centralizes auth session storage and avoids direct logout token removal in views and router', () => {
    const authStorageSource = readSource('src/utils/authStorage.ts');
    const userStoreSource = readSource('src/store/user.ts');
    const routerSource = readSource('src/router/index.ts');
    const homeViewSource = readSource('src/views/Home.vue');

    expect(authStorageSource).toContain('export const USER_TOKEN_KEY');
    expect(authStorageSource).toContain('export const clearUserSession');
    expect(userStoreSource).toContain("from '@/utils/authStorage'");
    expect(routerSource).toContain("from '@/utils/authStorage'");
    expect(homeViewSource).not.toContain("localStorage.removeItem('userToken')");
    expect(homeViewSource).toContain('userStore.logout()');
  });

  it('splits ResumeBuilder rendering into focused subcomponents', () => {
    const builderSource = readSource('src/components/ResumeBuilder.vue');

    expect(builderSource).toContain("import ResumeBuilderHeader from './ResumeBuilderHeader.vue'");
    expect(builderSource).toContain("import ResumeBuilderEditPanel from './ResumeBuilderEditPanel.vue'");
    expect(builderSource).toContain("import ResumeBuilderPreview from './ResumeBuilderPreview.vue'");
    expect(builderSource).toContain('<ResumeBuilderHeader');
    expect(builderSource).toContain('<ResumeBuilderEditPanel');
    expect(builderSource).toContain('<ResumeBuilderPreview');
  });
});

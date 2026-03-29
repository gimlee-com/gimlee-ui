import { vi } from 'vitest';
import * as a11yAddonAnnotations from "@storybook/addon-a11y/preview";
import { setProjectAnnotations } from '@storybook/react-vite';
import * as projectAnnotations from './preview';

vi.mock('../src/services/apiClient', () => ({
  apiClient: {
    getToken: vi.fn().mockReturnValue(null),
    setToken: vi.fn(),
    get: vi.fn().mockImplementation((url) => {
      if (url.startsWith('/session/init')) {
        return Promise.resolve({ accessToken: '', userProfile: null });
      }
      if (url.startsWith('/reports/reasons')) {
        return Promise.resolve([]);
      }
      return Promise.resolve({});
    }),
    post: vi.fn().mockResolvedValue({}),
    put: vi.fn().mockResolvedValue({}),
    patch: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
  },
}));

// This is an important step to apply the right configuration when testing your stories.
// More info at: https://storybook.js.org/docs/api/portable-stories/portable-stories-vitest#setprojectannotations
setProjectAnnotations([a11yAddonAnnotations, projectAnnotations]);
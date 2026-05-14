import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';
import MockAdapter from 'axios-mock-adapter';

vi.mock('../../stores/useAuthStore', () => ({
  useAuthStore: {
    getState: vi.fn(() => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setAuth: vi.fn(),
      setAccessToken: vi.fn(),
      clearAuth: vi.fn(),
    })),
  },
}));

import { useAuthStore } from '../../stores/useAuthStore';
import { apiClient } from '../../api/apiClient';

describe('apiClient', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
  });

  afterEach(() => {
    mock.reset();
    vi.clearAllMocks();
  });

  it('baseURL이 VITE_API_BASE_URL 환경 변수를 사용한다', () => {
    expect(apiClient.defaults.baseURL).toBe(import.meta.env.VITE_API_BASE_URL);
  });

  it('accessToken이 있으면 Authorization 헤더에 Bearer 토큰을 첨부한다', async () => {
    vi.mocked(useAuthStore.getState).mockReturnValue({
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token',
      user: null,
      setAuth: vi.fn(),
      setAccessToken: vi.fn(),
      clearAuth: vi.fn(),
    });

    mock.onGet('/api/test').reply((config: AxiosRequestConfig) => {
      expect(config.headers?.['Authorization']).toBe('Bearer test-access-token');
      return [200, { success: true, data: null }];
    });

    await apiClient.get('/api/test');
  });

  it('accessToken이 없으면 Authorization 헤더를 첨부하지 않는다', async () => {
    vi.mocked(useAuthStore.getState).mockReturnValue({
      accessToken: null,
      refreshToken: null,
      user: null,
      setAuth: vi.fn(),
      setAccessToken: vi.fn(),
      clearAuth: vi.fn(),
    });

    mock.onGet('/api/test').reply((config: AxiosRequestConfig) => {
      expect(config.headers?.['Authorization']).toBeUndefined();
      return [200, { success: true, data: null }];
    });

    await apiClient.get('/api/test');
  });

  it('401 응답 시 refreshToken으로 /api/auth/refresh 요청을 보낸다', async () => {
    const mockRefreshToken = 'test-refresh-token';
    const mockNewAccessToken = 'new-access-token';
    const mockSetAccessToken = vi.fn();

    vi.mocked(useAuthStore.getState).mockReturnValue({
      accessToken: 'expired-token',
      refreshToken: mockRefreshToken,
      user: null,
      setAuth: vi.fn(),
      setAccessToken: mockSetAccessToken,
      clearAuth: vi.fn(),
    });

    const refreshMock = new MockAdapter(axios);
    refreshMock
      .onPost(`${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh`)
      .reply(200, { success: true, data: { accessToken: mockNewAccessToken } });

    mock.onGet('/api/protected').replyOnce(401).onGet('/api/protected').reply(200, { success: true, data: 'ok' });

    await apiClient.get('/api/protected');

    expect(mockSetAccessToken).toHaveBeenCalledWith(mockNewAccessToken);

    refreshMock.restore();
  });
});

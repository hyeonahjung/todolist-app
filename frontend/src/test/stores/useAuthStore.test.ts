import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../../stores/useAuthStore';
import type { User } from '../../types/user.types';

const mockUser: User = { userId: 1, email: 'test@example.com', name: '홍길동' };

beforeEach(() => {
  useAuthStore.getState().clearAuth();
});

describe('useAuthStore', () => {
  it('초기 상태는 모두 null이다', () => {
    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.user).toBeNull();
  });

  it('setAuth로 토큰과 사용자를 설정한다', () => {
    useAuthStore.getState().setAuth('access-token', 'refresh-token', mockUser);
    const state = useAuthStore.getState();
    expect(state.accessToken).toBe('access-token');
    expect(state.refreshToken).toBe('refresh-token');
    expect(state.user).toEqual(mockUser);
  });

  it('setAccessToken으로 accessToken만 갱신한다', () => {
    useAuthStore.getState().setAuth('old-token', 'refresh-token', mockUser);
    useAuthStore.getState().setAccessToken('new-token');
    const state = useAuthStore.getState();
    expect(state.accessToken).toBe('new-token');
    expect(state.refreshToken).toBe('refresh-token');
    expect(state.user).toEqual(mockUser);
  });

  it('clearAuth로 모든 인증 상태를 초기화한다', () => {
    useAuthStore.getState().setAuth('access-token', 'refresh-token', mockUser);
    useAuthStore.getState().clearAuth();
    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.user).toBeNull();
  });

  it('localStorage를 사용하지 않는다 (새로고침 시 토큰 초기화)', () => {
    useAuthStore.getState().setAuth('access-token', 'refresh-token', mockUser);
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
  });
});

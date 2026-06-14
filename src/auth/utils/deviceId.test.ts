import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getOrCreateDeviceId } from './deviceId';

describe('deviceId', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('crypto', {
      randomUUID: vi.fn().mockReturnValue('mocked-uuid'),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should generate and store a new deviceId if none exists', () => {
    const id = getOrCreateDeviceId();
    expect(id).toBe('mocked-uuid');
    expect(localStorage.getItem('gimlee_device_id')).toBe('mocked-uuid');
    expect(crypto.randomUUID).toHaveBeenCalled();
  });

  it('should return existing deviceId from localStorage', () => {
    localStorage.setItem('gimlee_device_id', 'existing-id');
    const id = getOrCreateDeviceId();
    expect(id).toBe('existing-id');
    expect(crypto.randomUUID).not.toHaveBeenCalled();
  });

  it('should use fallback when randomUUID is not a function', () => {
    vi.stubGlobal('crypto', {
      getRandomValues: vi.fn().mockReturnValue(new Uint8Array([0])),
    });
    
    const id = getOrCreateDeviceId();
    expect(id).toBeDefined();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    expect(crypto.getRandomValues).toHaveBeenCalled();
  });

  it('should use Math.random fallback when crypto is completely unavailable', () => {
    vi.stubGlobal('crypto', undefined);
    vi.stubGlobal('window', {});

    const id = getOrCreateDeviceId();
    expect(id).toBeDefined();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });
});

import { server } from '@/mocks/node';
import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest';

beforeEach(() => {
  const mockResizeObserver = vi.fn();

  mockResizeObserver.mockReturnValue({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  });

  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    configurable: true,
    value: mockResizeObserver,
  });
});

beforeAll(() => {
  server.listen();

  vi.mock('next/navigation', async () => {
    const actual = await vi.importActual('next-router-mock');

    return {
      ...actual,
      useSearchParams: vi.fn(() => ({
        get: vi.fn(() => null),
      })),
    };
  });
});

afterEach(() => server.resetHandlers());

afterAll(() => server.close());

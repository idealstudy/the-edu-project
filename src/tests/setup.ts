import { server } from '@/mocks/node';
import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest';

process.env.NEXT_PUBLIC_SPRING_SERVER_BASE_URL = 'http://mock-spring-api';

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

  vi.mock('next/navigation', () => import('next-router-mock'));
});

afterEach(() => server.resetHandlers());

afterAll(() => server.close());

import { randomUUID } from 'node:crypto';

const SERVER_EVENT_ROUTES = {
  DASHBOARD_BFF_UNEXPECTED_ERROR: '/api/v1/dashboard',
} as const;

type ServerEventId = keyof typeof SERVER_EVENT_ROUTES;

const SAFE_ERROR_CLASSES = new Set([
  'Error',
  'TypeError',
  'RangeError',
  'ReferenceError',
  'SyntaxError',
  'URIError',
  'AxiosError',
]);

function toSafeErrorClass(error: unknown): string {
  if (!(error instanceof Error)) return 'UnknownError';
  return SAFE_ERROR_CLASSES.has(error.name) ? error.name : 'UnknownError';
}

export function reportSafeServerError(
  eventId: ServerEventId,
  error: unknown
): string {
  const correlationId = randomUUID();

  try {
    process.stderr.write(
      `${JSON.stringify({
        eventId,
        route: SERVER_EVENT_ROUTES[eventId],
        errorClass: toSafeErrorClass(error),
        correlationId,
      })}\n`
    );
  } catch {
    // 관측성 장애가 원래 API 오류 응답을 가리지 않게 한다.
  }

  return correlationId;
}

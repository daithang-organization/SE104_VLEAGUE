export function getApiErrorMessage(error: unknown): string | undefined {
  if (!error || typeof error !== 'object' || !('response' in error)) return undefined;

  const response = (error as { response?: { data?: { message?: unknown } } }).response;
  const message = response?.data?.message;

  if (typeof message === 'string') return message;
  if (Array.isArray(message)) {
    const lines = message.filter((item): item is string => typeof item === 'string');
    return lines.length ? lines.join('\n') : undefined;
  }

  return undefined;
}

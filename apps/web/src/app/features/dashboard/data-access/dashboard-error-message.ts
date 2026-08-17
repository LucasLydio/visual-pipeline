export function dashboardErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error && 'error' in error) {
    const apiError = error as { error?: { message?: string | string[] } };
    const message = apiError.error?.message;
    return Array.isArray(message) ? message.join(', ') : (message ?? fallback);
  }

  return fallback;
}

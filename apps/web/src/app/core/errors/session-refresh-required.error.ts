export class SessionRefreshRequiredError extends Error {
  constructor(message = 'Refresh your session to continue.') {
    super(message);
    this.name = 'SessionRefreshRequiredError';
  }
}

export interface WebhookResult {
  status: 'processed' | 'ignored';
  message: string;
  runId?: string;
}

export interface GitHubRepositoryPayload {
  id?: number | string;
  html_url?: string;
  clone_url?: string;
  ssh_url?: string;
  full_name?: string;
}

export interface GitHubPushPayload {
  ref?: string;
  after?: string;
  repository?: GitHubRepositoryPayload;
}

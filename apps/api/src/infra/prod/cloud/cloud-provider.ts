export const CLOUD_PROVIDERS = ['aws', 'gcp', 'azure'] as const;

export type CloudProvider = (typeof CLOUD_PROVIDERS)[number];

export function isCloudProvider(value: string): value is CloudProvider {
  return CLOUD_PROVIDERS.some((provider) => provider === value);
}

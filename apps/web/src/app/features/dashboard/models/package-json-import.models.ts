export interface PackageScriptImportStep {
  readonly id: string;
  readonly name: string;
  readonly command: string;
  readonly order: number;
}

export type PackageImportTarget =
  | { readonly type: 'template'; readonly templateId: string; readonly label: string }
  | { readonly type: 'pipeline'; readonly pipelineId: string; readonly label: string };

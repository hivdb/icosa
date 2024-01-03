export type TRawAlgorithmVersion = [string, string, string];

export interface IAlgorithmVersion {
  value: string;
  label: string;
  family: string;
  version: string;
  publishDate: string;
  species: string;
}

export interface IConfig {
  algorithmVersions: Record<string, TRawAlgorithmVersion[]>
  excludeAlgorithmVersions: string[]
}

export interface IAlgVerSelectProps {
  config: IConfig;
  onChange: (version: IAlgorithmVersion) => void;
}

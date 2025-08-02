import React from 'react';
import Select from '../select';
import style from './style.module.scss';

function getEnumCompatValue(family: string, version: string) {
  return (
    `${family}_${version}`
      .replace(/[^_0-9A-Za-z-]/g, '_')
      .replace('-stanford', 'stanford')
      .replace('-', 'p')
  );
}

function getLabel(family: string, version: string) {
  return `${family} ${version}`;
}

export function getLatestVersion(family: string, config: any) {
  const {algorithmVersions: algVers} = config;
  const versions = algVers[family];
  const [
    version,
    publishDate,
    species
  ] = versions[versions.length - 1];
  return {
    value: getEnumCompatValue(family, version),
    label: getLabel(family, version),
    family,
    version,
    publishDate,
    species
  };
}

export function getLatestVersions(config: any) {
  const latestVers = [] as any[];
  const {algorithmVersions: algVers} = config;
  for (const family of Object.keys(algVers)) {
    latestVers.push(getLatestVersion(family, config));
  }
  return latestVers;
}

export interface AlgVerSelectProps {
  config: {
    algorithmVersions: Record<string, any[]>;
    excludeAlgorithmVersions: string[];
  };
  onChange: (value: any) => void;
  [key: string]: any;
}

export default function AlgVerSelect({
  config: {
    algorithmVersions: algVers,
    excludeAlgorithmVersions: excludeVers
  },
  onChange,
  ...props
}: AlgVerSelectProps) {
  const excludePatterns = React.useMemo(
    () => excludeVers.map(pattern => new RegExp(pattern)),
    [excludeVers]
  );

  const options = React.useMemo(
    () => {
      const options: any[] = [];
      for (const [family, versions] of Object.entries(algVers)) {
        const group: any = {
          label: family,
          options: [] as any[]
        };
        for (const [ver] of versions as any[]) {
          const value = getEnumCompatValue(family, ver);
          let skip = false;
          for (const pattern of excludePatterns) {
            if (pattern.test(value)) {
              skip = true;
              break;
            }
          }
          if (skip) {
            continue;
          }
          group.options.push({
            label: getLabel(family, ver),
            value
          });
        }
        (group.options as any).reverse();
        options.push(group);
      }
      return options;
    },
    [algVers, excludePatterns]
  );

  return (
    <Select
      {...props}
      options={options}
      className={style['algver-select']}
      classNamePrefix="algver-select"
      placeholder="Select an algorithm..."
      onChange={onChange}
    />
  );
}

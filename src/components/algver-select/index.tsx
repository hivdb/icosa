import React from 'react';
import Select from '../select';
import style from './style.module.scss';

/**
 * Normalize the combination of algorithm family and version into an enum
 * compatible string value. Non-alphanumeric characters are replaced and
 * Stanford style versions are mapped to a simplified form.
 *
 * @param family - Algorithm family name.
 * @param version - Version identifier for the algorithm.
 * @returns A normalized string safe to use as an enum key.
 */
function getEnumCompatValue(family: string, version: string): string {
  return (
    `${family}_${version}`
      .replace(/[^_0-9A-Za-z-]/g, '_')
      .replace('-stanford', 'stanford')
      .replace('-', 'p')
  );
}

/**
 * Human readable label combining algorithm family and version.
 *
 * @param family - Algorithm family name.
 * @param version - Version identifier for the algorithm.
 * @returns Concatenated label string.
 */
function getLabel(family: string, version: string): string {
  return `${family} ${version}`;
}

/**
 * Retrieve the latest algorithm version information for a family.
 *
 * @param family - Algorithm family key.
 * @param config - Configuration object containing `algorithmVersions`.
 * @returns The most recent version entry formatted for use with `<Select>`.
 */
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

/**
 * Generate a list containing the latest version for every algorithm family.
 *
 * @param config - Configuration object containing `algorithmVersions`.
 * @returns Array of option objects representing each family's latest version.
 */
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
  /** Callback invoked when the selected value changes. */
  onChange: (value: any) => void;
  /** Name applied to the underlying select element. */
  name: string;
  [key: string]: any;
}

/**
 * Dropdown for selecting algorithm version grouped by family.
 *
 * @param props - {@link AlgVerSelectProps} controlling the selection.
 * @returns A `Select` element with grouped algorithm version options.
 */
export default function AlgVerSelect({
  config: {
    algorithmVersions: algVers,
    excludeAlgorithmVersions: excludeVers
  },
  onChange,
  name,
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
      name={name}
      options={options}
      className={style['algver-select']}
      classNamePrefix="algver-select"
      placeholder="Select an algorithm..."
      onChange={onChange}
    />
  );
}

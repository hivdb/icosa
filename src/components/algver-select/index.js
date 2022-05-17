import React from 'react';
import PropTypes from 'prop-types';

import Select from '../select';

import style from "./style.module.scss";


function getEnumCompatValue(family, version) {
  return (
    `${family}_${version}`
      .replace(/[^_0-9A-Za-z-]/g, '_')
      .replace('-stanford', 'stanford')
      .replace('-', 'p')
  );
}


function getLabel(family, version) {
  return `${family} ${version}`;
}


export function getLatestVersion(family, config) {
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


export function getLatestVersions(config) {
  const latestVers = [];
  const {algorithmVersions: algVers} = config;
  for (const family of Object.keys(algVers)) {
    latestVers.push(getLatestVersion(family, config));
  }
  return latestVers;
}


AlgVerSelect.propTypes = {
  config: PropTypes.shape({
    algorithmVersions: PropTypes.object.isRequired,
    excludeAlgorithmVersions: PropTypes.array
  }).isRequired,
  onChange: PropTypes.func.isRequired
};


export default function AlgVerSelect({
  config: {
    algorithmVersions: algVers,
    excludeAlgorithmVersions: excludeVers
  },
  onChange,
  ...props
}) {
  const excludePatterns = React.useMemo(
    () => excludeVers.map(pattern => new RegExp(pattern)),
    [excludeVers]
  );

  const options = React.useMemo(
    () => {
      const options = [];
      for (let [family, versions] of Object.entries(algVers)) {
        const group = {
          label: family,
          options: []
        };
        for (const [ver] of versions) {
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
        group.options.reverse();
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
     onChange={onChange} />
  );

}

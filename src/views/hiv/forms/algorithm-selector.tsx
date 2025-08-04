import React from 'react';
import readFile from '../../../utils/read-file';
import BigData from '../../../utils/big-data';
import useMounted from '../../../utils/use-mounted';

import FileInput from '../../../components/file-input';
import AlgVerSelect, {
  getLatestVersions
} from '../../../components/algver-select';

import style from './style.module.scss';

interface SelectedAlgorithmProps {
  children: React.ReactNode;
  onRemove: () => void;
}

function SelectedAlgorithm({
  children,
  onRemove
}: SelectedAlgorithmProps) {
  const handleRemove = React.useCallback(
    event => {
      event.preventDefault();
      onRemove();
    },
    [onRemove]
  );

  return <span className={style['selected-alg']}>
    {children}
    <a
     href="#remove-alg"
     onClick={handleRemove}
     title="Remove this algorithm"
     className={style['remove-btn']}>
      X
    </a>
  </span>;
}

function getCustomAlgLabel(fileName: string): string {
  return fileName.replace(/.xml$/i, '') + ' (local)';
}

function getCustomAlgValue(fileName: string): string {
  return `CUSTOM-ALG-${fileName}`;
}

function isCustomAlg(value: string): boolean {
  return value.startsWith('CUSTOM-ALG-');
}

interface AlgorithmSelectorProps {
  config: { messages: Record<string, string> };
  algorithms: Record<string, { value: string; label: React.ReactNode; xml?: string }>;
  onChange: (algs: Record<string, any>) => void;
}

function AlgorithmSelector({
  config,
  algorithms,
  onChange
}: AlgorithmSelectorProps) {
  const {messages} = config;
  const [checkboxError, setCheckboxError] = React.useState<string | null>(null);

  const isMounted = useMounted();

  const timeoutLock = React.useRef<NodeJS.Timeout | null>(null);
  const setTimeoutClearError = React.useCallback(
    () => {
      if (timeoutLock.current !== null) {
        clearTimeout(timeoutLock.current);
      }
      timeoutLock.current = setTimeout(() => {
        if (isMounted()) {
          setCheckboxError(null);
          timeoutLock.current = null;
        }
      }, 5000);
    },
    [setCheckboxError, isMounted]
  );

  const handleAdd = React.useCallback(
    ({ value, label }: { value: string; label: React.ReactNode }) => {
      algorithms[value] = { value, label };
      onChange(algorithms);
    },
    [algorithms, onChange]
  );

  const handleRemove = React.useCallback(
    (name: string) => {
      if (Object.keys(algorithms).length > 2) {
        delete algorithms[name];
        onChange(algorithms);
      }
      else {
        setCheckboxError('At least 2 algorithms must be selected!');
        setTimeoutClearError();
      }
    },
    [algorithms, onChange, setTimeoutClearError]
  );

  const handleUpload = React.useCallback(
    async (fileList: FileList | File[]) => {
      fileList = [...(fileList as any)];
      if (fileList.length === 0) {
        return;
      }
      const myAlgorithms = { ...algorithms };
      for (const file of fileList as any[]) {
        const fileName = (file as File).name;
        const value = getCustomAlgValue(fileName);
        myAlgorithms[value] = {
          label: getCustomAlgLabel(fileName),
          value,
          xml: await readFile(file as File)
        };
      }
      if (isMounted()) {
        onChange(myAlgorithms);
      }
    },
    [algorithms, onChange, isMounted]
  );


  return (
    <fieldset className={style['algorithm-options']}>
      <legend>{
        messages['multi-algorithm-selection-title'] ||
        '<multi-algorithm-selection-title>'
      }</legend>
      <div>{
        messages['multi-algorithm-selection-desc'] ||
        '<multi-algorithm-selection-desc>'
      }</div>
      {Object.keys(algorithms).length > 0 ?
        <p>
          <span className={style['with-trailing-space']}>{
            messages['multi-algorithm-selection-selected-algs'] ||
            '<multi-algorithm-selection-selected-algs>'
          }</span>
          {Object.values(algorithms)
            .map(({value, label}, idx) => (
              <SelectedAlgorithm
               key={idx}
               onRemove={() => handleRemove(value)}>
                {label}
              </SelectedAlgorithm>
            ))
          }
        </p> : null}
      <div>
        <AlgVerSelect
         name="algver-select"
         config={config}
         value={null}
         onChange={handleAdd} />
        <span className={style['with-trailing-space']}> or </span>
        <FileInput
         btnStyle="info"
         onChange={handleUpload}
         name="custom-asi-file"
         multiple={true}
         hideSelected={true}
         accept="application/xml">
          Choose Local ASI2 File(s)
        </FileInput>
        <span className={style['checkbox-error']}>
          {checkboxError}
        </span>
      </div>
    </fieldset>
  );
}


/**
 * Hook managing algorithm selection with optional custom algorithm uploads.
 *
 * @param config - Configuration including available algorithm versions.
 * @returns Tuple of rendered selector component and submit-state fetcher.
 */
export default function useAlgorithmSelector(config: any): [JSX.Element | null, () => Promise<{ algorithms: string[]; customAlgorithms: any }>] {
  const {
    algorithmVersions,
    excludeAlgorithmVersions
  } = config;

  const defaultAlgorithms = React.useMemo(
    () => algorithmVersions ? getLatestVersions({
      algorithmVersions,
      excludeAlgorithmVersions
    }).reduce((acc, {value, label}) => {
      acc[value] = {value, label};
      return acc;
    }, {}) : {},
    [algorithmVersions, excludeAlgorithmVersions]
  );

  const [algorithms, setAlgorithms] = React.useState<Record<string, any>>(defaultAlgorithms);

  const getAlgorithms = React.useCallback(() => {
    const publicAlgorithms = Object.keys(algorithms).filter(alg => !isCustomAlg(alg));
    const customAlgorithms = Object.keys(algorithms)
      .filter(alg => isCustomAlg(alg))
      .reduce((list: any[], alg) => {
        const { label, xml } = algorithms[alg];
        list.push({ name: label, xml });
        return list;
      }, []);
    return [publicAlgorithms, customAlgorithms];
  }, [algorithms]);

  const getSubmitState = React.useCallback(async () => {
    let [algorithmsList, customAlgorithms] = getAlgorithms();
    customAlgorithms = await BigData.save(customAlgorithms);
    return { algorithms: algorithmsList, customAlgorithms };
  }, [getAlgorithms]);

  return [
    algorithmVersions ? (
      <AlgorithmSelector
        {...{
          config,
          algorithms,
          onChange: setAlgorithms
        }}
      />
    ) : null,
    getSubmitState
  ];
}

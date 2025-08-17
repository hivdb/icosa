import {
  ReactElement,
  useCallback,
  useMemo,
  useState
} from 'react';

import Markdown from '../../../components/markdown';
import Link from '../../../components/link';
import CheckboxInput from '../../../components/checkbox-input';

import style from './style.module.scss';

interface DrugDisplayOptionsProps {
  drugDisplayNames: Record<string, string>;
  drugDisplayOptions: Array<{ drugClass: string; drugs: Array<{ name: string; disabled: boolean }> }>;
  messages: Record<string, string>;
  uncheckedDrugs: Set<string>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectAll: (e: React.MouseEvent) => void;
  onReset: (e: React.MouseEvent) => void;
}

/**
 * Render checkboxes for enabling or disabling drug display options.
 *
 * @param props - {@link DrugDisplayOptionsProps}
 * @returns Fieldset element containing controls for drug display.
 */
function DrugDisplayOptions({
  drugDisplayOptions,
  drugDisplayNames,
  messages,
  uncheckedDrugs,
  onChange,
  onSelectAll,
  onReset
}: DrugDisplayOptionsProps) {

  return (
    <fieldset className={style['drug-display-options']}>
      <legend>
        {messages['drug-display-options-title']}
      </legend>
      <p className={style['first-para']}>
        <Markdown inline>
          {messages['drug-display-options-desc']}
        </Markdown> (
        <Link
         href="#select-all"
         onClick={onSelectAll}>
          {messages['drug-display-options-select-all']}
        </Link>,{' '}
        <Link
         href="#revert"
         onClick={onReset}>
          {messages['drug-display-options-reset']}
        </Link>)
      </p>
      <div className={style['all-options']}>
        {drugDisplayOptions.map(({drugClass, drugs}) => <div key={drugClass}>
          <div className={style['label-drug-class']}>{drugClass}:</div>
          <div className={style['checkboxes']}>
            {drugs.map(({name, disabled}) => (
              <CheckboxInput
               key={name} name="drugs"
               id={`drug-display-option-${name}`}
               className={style['drug-display-option-checkbox']}
               onChange={onChange}
               value={name}
               disabled={disabled}
               checked={!uncheckedDrugs.has(name)}>
                {drugDisplayNames[name] || name}
              </CheckboxInput>
            ))}
          </div>
        </div>)}
      </div>
    </fieldset>
  );
}

/**
 * Hook providing drug display options widget and form state handlers.
 *
 * @param config - Configuration including drug display options and messages.
 * @returns Tuple containing component and submit-state getter.
 */
export default function useDrugDisplayOptions(config: any): [ReactElement | null, () => { disabledDrugs: string[] }] {
  const {
    drugDisplayOptions,
    drugDisplayNames,
    messages
  } = config;
  const defaultUncheckedDrugs = useMemo(
    () =>
      Object.values(drugDisplayOptions || {}).reduce(
        (acc: string[], { drugs }: any) => [
          ...acc,
          ...drugs.filter(({ disabled }: any) => !disabled).map(({ name }: any) => name)
        ],
        []
      ),
    [drugDisplayOptions]
  );

  const [uncheckedDrugs, setUncheckedDrugs] = useState<Set<string>>(new Set(defaultUncheckedDrugs));

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const drug = e.currentTarget.value;
      const newUncheckedDrugs = new Set(uncheckedDrugs);
      if (e.currentTarget.checked) {
        newUncheckedDrugs.delete(drug);
      } else {
        newUncheckedDrugs.add(drug);
      }
      setUncheckedDrugs(newUncheckedDrugs);
    },
    [uncheckedDrugs]
  );

  const handleSelectAll = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setUncheckedDrugs(new Set());
    },
    []
  );

  const handleReset = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setUncheckedDrugs(new Set(defaultUncheckedDrugs));
    },
    [defaultUncheckedDrugs]
  );

  const getSubmitState = useCallback(
    () => ({ disabledDrugs: Array.from(uncheckedDrugs) }),
    [uncheckedDrugs]
  );

  return [
    drugDisplayOptions ? (
      <DrugDisplayOptions
       {...{
         drugDisplayOptions,
         drugDisplayNames,
         messages,
         uncheckedDrugs,
         onChange: handleChange,
         onSelectAll: handleSelectAll,
         onReset: handleReset
       }} />
    ) : null,
    getSubmitState
  ];
}

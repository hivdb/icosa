import React, {useState} from 'react';
import Select from '../../components/select';
import AlgVerSelect from '../../components/algver-select';
import MutationSuggestOptions from '../../components/mutations-input/mutation-suggest-options';
import type {SelectOption} from '../../components/select/types';
import style from './index.module.scss';

/**
 * Debug view for the Select component showing all possible configurations.
 * This helps verify the react-select v5 migration works correctly.
 */
export default function SelectDebugger() {
  const [basicValue, setBasicValue] = useState<SelectOption | null>(null);
  const [asyncValue, setAsyncValue] = useState<SelectOption | null>(null);
  const [creatableValue, setCreatableValue] = useState<SelectOption | null>(null);
  const [asyncCreatableValue, setAsyncCreatableValue] = useState<SelectOption | null>(null);
  const [virtualizedValue, setVirtualizedValue] = useState<SelectOption | null>(null);
  const [customPromptValue, setCustomPromptValue] = useState<SelectOption | null>(null);

  // State for component integration demos
  const [paginatorValue, setPaginatorValue] = useState<SelectOption | null>(null);
  const [cameraViewValue, setCameraViewValue] = useState<SelectOption | null>(null);
  const [algVerValue, setAlgVerValue] = useState<any>(null);
  const [selectedMutation, setSelectedMutation] = useState<{value: string; label: string} | null>(null);

  const basicOptions: SelectOption[] = [
    {label: 'M184V', value: 'm184v'},
    {label: 'K65R', value: 'k65r'},
    {label: 'L74V', value: 'l74v'},
    {label: 'Y115F', value: 'y115f'},
    {label: 'M41L', value: 'm41l'}
  ];

  // Generate 150 options for virtualized select
  const manyOptions: SelectOption[] = Array.from({length: 150}, (_, i) => ({
    label: `Mutation ${i + 1}`,
    value: `mut${i + 1}`
  }));

  const loadOptions = (input: string, callback: (options: SelectOption[]) => void) => {
    setTimeout(() => {
      const filtered = basicOptions.filter(opt =>
        opt.label.toLowerCase().includes(input.toLowerCase())
      );
      callback(filtered);
    }, 500);
  };

  const handleCreate = (data: {label: string}) => {
    // eslint-disable-next-line no-console
    console.log('Created new option:', data);
    alert(`Created new option: ${data.label}`);
  };

  // Mock data for component integration demos
  const paginatorOptions: SelectOption[] = Array.from({length: 5}, (_, i) => ({
    label: `${i + 1}. Sequence_${i + 1}`,
    value: `seq${i + 1}`
  }));

  const cameraViewOptions: SelectOption[] = [
    {label: 'Front View', value: 'front'},
    {label: 'Side View', value: 'side'},
    {label: 'Top View', value: 'top'}
  ];

  // Mock algorithm versions config for AlgVerSelect
  const mockAlgVerConfig = {
    algorithmVersions: {
      'HIVDB': [
        ['9.5', '2023-12-01', 'HIV-1'],
        ['9.4', '2023-06-01', 'HIV-1'],
        ['9.3', '2022-12-01', 'HIV-1']
      ],
      'ANRS': [
        ['v2023', '2023-01-01', 'HIV-1'],
        ['v2022', '2022-01-01', 'HIV-1']
      ],
      'Rega': [
        ['11.0', '2023-01-01', 'HIV-1'],
        ['10.0', '2022-01-01', 'HIV-1']
      ]
    },
    excludeAlgorithmVersions: []
  };

  // Mock config for MutationSuggestOptions
  const mockMutationConfig = {
    allowPositions: true,
    geneReferences: {
      RT: 'PISPIETVPVKLKPGMDGPKVKQWPLTEEKIKALVEICTEMEKEGKISKIGPENPYNTPVFAIKKKDSTKWRKLVDFRELNKRTQDFWEVQLGIPHPAGLKKKKSVTVLDVGDAYFSVPLDEDFRKYTAFTIPSINNETPGIRYQYNVLPQGWKGSPAIFQSSMTKILEPFRKQNPDIVIYQYMDDLYVGSDLEIGQHRTKIEELRQHLLRWGLTTPDKKHQKEPPFLWMGYELHPDKWTVQPIVLPEKDSWTVNDIQKLVGKLNWASQIYPGIKVRQLCKLLRGTKALTEVIPLTEEAELELAENREILKEPVHGVYYDPSKDLIAEIQKQGQGQWTYQIYQEPFKNLKTGKYARMRGAHTNDVKQLTEAVQKITTESIVIWGKTPKFKLPIQKETWETWWTEYWQATWIPEWEFVNTPPLVKLWYQLEKEPIVGAETFYVDGAANRETKLGKAGYVTNRGRQKVVTLTDTTNQKTELQAIYLALQDSGLEVNIVTDSQYALGIIQAQPDQSESELVNQIIEQLIKKEKVYLAWVPAHKGIGGNEQVDKLVSAGIRKVLFLDGIDKAQDEHEKYHSNWRAMASDFNLPPVVAKEIVASCDKCQLKGEAMHGQVDCSPGIWQLDCTHLEGKVILVAVHVASGYIEAEVIPAETGQETAYFLLKLAGRWPVKTIHTDNGSNFTGATVRAACWWAGIKQEFGIPYNPQSQGVVESMNKELKKIIGQVRDQAEHLKTAVQMAVFIHNFKRKGGIGGYSAGERIVDIIATDIQTKELQKQITKIQNFRVYYRDSRNPLWKGPAKLLWKGEGAVVIQDNSDIKVVPRRKAKIIRDYGKQMAGDDCVASRQDED',
      PR: 'PQITLWQRPLVTIKIGGQLKEALLDTGADDTVLEEMSLPGRWKPKMIGGIGGFIKVRQYDQILIEICGHKAIGTVLVGPTPVNIIGRNLLTQIGCTLNF'
    },
    geneDisplay: {
      RT: 'Reverse Transcriptase',
      PR: 'Protease'
    },
    messages: {}
  };

  const handleMutationSelect = (option: {value: string; label: string}) => {
    setSelectedMutation(option);
    // eslint-disable-next-line no-console
    console.log('Selected mutation:', option);
  };

  return (
    <div className={style.container}>
      <h1 className={style.title}>Select Component Debugger</h1>
      <p className={style.description}>
        This page demonstrates all possible configurations of the Select component
        after migrating from react-select v1.x to v5, including components that use Select.
      </p>

      <div className={style.section}>
        <h2 className={style['section-title']}>1. Basic Select</h2>
        <p className={style['section-description']}>
          Standard select with predefined options
        </p>
        <Select
          name="basic-select"
          label="Mutation"
          options={basicOptions}
          value={basicValue}
          onChange={setBasicValue}
          placeholder="Select a mutation..."
        />
        <div className={style['selected-value']}>
          <strong>Selected:</strong> {basicValue ? JSON.stringify(basicValue) : 'None'}
        </div>
      </div>

      <div className={style.section}>
        <h2 className={style['section-title']}>2. Async Select</h2>
        <p className={style['section-description']}>
          Select with asynchronous option loading (type to search, 500ms delay)
        </p>
        <Select
          name="async-select"
          label="Mutation"
          loadOptions={loadOptions}
          value={asyncValue}
          onChange={setAsyncValue}
          placeholder="Type to search..."
        />
        <div className={style['selected-value']}>
          <strong>Selected:</strong> {asyncValue ? JSON.stringify(asyncValue) : 'None'}
        </div>
      </div>

      <div className={style.section}>
        <h2 className={style['section-title']}>3. Creatable Select</h2>
        <p className={style['section-description']}>
          Select that allows creating new options (type a new value and press Enter)
        </p>
        <Select
          name="creatable-select"
          label="Mutation"
          options={basicOptions}
          allowCreate={true}
          value={creatableValue}
          onChange={setCreatableValue}
          onCreate={handleCreate}
          placeholder="Select or create a mutation..."
        />
        <div className={style['selected-value']}>
          <strong>Selected:</strong> {creatableValue ? JSON.stringify(creatableValue) : 'None'}
        </div>
      </div>

      <div className={style.section}>
        <h2 className={style['section-title']}>4. Async Creatable Select</h2>
        <p className={style['section-description']}>
          Combines async loading with the ability to create new options
        </p>
        <Select
          name="async-creatable-select"
          label="Mutation"
          loadOptions={loadOptions}
          allowCreate={true}
          value={asyncCreatableValue}
          onChange={setAsyncCreatableValue}
          onCreate={handleCreate}
          placeholder="Type to search or create..."
        />
        <div className={style['selected-value']}>
          <strong>Selected:</strong> {asyncCreatableValue ? JSON.stringify(asyncCreatableValue) : 'None'}
        </div>
      </div>

      <div className={style.section}>
        <h2 className={style['section-title']}>5. Virtualized Select (100+ options)</h2>
        <p className={style['section-description']}>
          Automatically uses VirtualizedSelect for large option lists (&gt;100 items)
        </p>
        <Select
          name="virtualized-select"
          label="Mutation"
          options={manyOptions}
          value={virtualizedValue}
          onChange={setVirtualizedValue}
          placeholder="Select from 150 options..."
        />
        <div className={style['selected-value']}>
          <strong>Selected:</strong> {virtualizedValue ? JSON.stringify(virtualizedValue) : 'None'}
        </div>
      </div>

      <div className={style.section}>
        <h2 className={style['section-title']}>6. Custom Prompt Text Creator</h2>
        <p className={style['section-description']}>
          Creatable select with custom prompt text for new options
        </p>
        <Select
          name="custom-prompt-select"
          label="Gene"
          options={basicOptions}
          allowCreate={true}
          value={customPromptValue}
          onChange={setCustomPromptValue}
          onCreate={handleCreate}
          promptTextCreator={(label) => `Add new gene: ${label}`}
          placeholder="Select or create a gene..."
        />
        <div className={style['selected-value']}>
          <strong>Selected:</strong> {customPromptValue ? JSON.stringify(customPromptValue) : 'None'}
        </div>
      </div>

      <hr className={style.divider} />

      <h2 className={style['integration-title']}>Component Integration Demos</h2>
      <p className={style.description}>
        These demos show how existing components that use Select continue to work after the migration.
      </p>

      <div className={style.section}>
        <h2 className={style['section-title']}>7. Report Paginator Pattern</h2>
        <p className={style['section-description']}>
          Select used for paginating through sequences (as in report-paginator component)
        </p>
        <Select
          isSearchable
          options={paginatorOptions}
          name="sequence-select"
          placeholder="Select a sequence"
          onChange={setPaginatorValue}
          value={paginatorValue}
        />
        <div className={style['selected-value']}>
          <strong>Selected:</strong> {paginatorValue ? JSON.stringify(paginatorValue) : 'None'}
        </div>
      </div>

      <div className={style.section}>
        <h2 className={style['section-title']}>8. Camera Controller Pattern</h2>
        <p className={style['section-description']}>
          Select used for switching camera views (as in protein-viewer/camera-controller)
        </p>
        <Select
          options={cameraViewOptions}
          name="view"
          placeholder="Select a view"
          onChange={setCameraViewValue}
          value={cameraViewValue}
        />
        <div className={style['selected-value']}>
          <strong>Selected:</strong> {cameraViewValue ? JSON.stringify(cameraViewValue) : 'None'}
        </div>
      </div>

      <div className={style.section}>
        <h2 className={style['section-title']}>9. AlgVerSelect Component</h2>
        <p className={style['section-description']}>
          Grouped select for algorithm versions (uses Select internally)
        </p>
        <AlgVerSelect
          config={mockAlgVerConfig}
          name="algorithm-version"
          onChange={setAlgVerValue}
          value={algVerValue}
        />
        <div className={style['selected-value']}>
          <strong>Selected:</strong> {algVerValue ? JSON.stringify(algVerValue) : 'None'}
        </div>
      </div>

      <div className={style.section}>
        <h2 className={style['section-title']}>10. MutationSuggestOptions Component</h2>
        <p className={style['section-description']}>
          Mutation suggestion dropdowns (migrated from react-dropdown to Select component)
        </p>
        <MutationSuggestOptions
          gene="RT"
          mutations={[
            [184, ['V', 'I']],
            [215, ['Y', 'F', 'C', 'D', 'E', 'S', 'V']],
            [41, ['L']]
          ]}
          config={mockMutationConfig}
          onChange={handleMutationSelect}
        />
        <div className={style['selected-value']}>
          <strong>Selected:</strong> {selectedMutation ? JSON.stringify(selectedMutation) : 'None'}
        </div>
      </div>
    </div>
  );
}

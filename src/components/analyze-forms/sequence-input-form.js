import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import {parseFasta} from '../../utils/fasta';
import BigData from '../../utils/big-data';
import readFile from '../../utils/read-file';
import BaseForm from './base';
import FileInput from '../file-input';
import RadioInput from '../radio-input';
import CheckboxInput from '../checkbox-input';
import Link from '../link/basic';

import style from './style.module.scss';


const exampleFastaPropType = PropTypes.shape({
  url: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired
});


export default class SequenceInputForm extends React.Component {

  static propTypes = {
    children: PropTypes.node,
    childrenPlacement: PropTypes.oneOf(['top', 'bottom']).isRequired,
    exampleFasta: PropTypes.arrayOf(exampleFastaPropType),
    to: PropTypes.string,
    outputOptions: PropTypes.objectOf(PropTypes.shape({
      label: PropTypes.node.isRequired,
      subOptions: PropTypes.arrayOf(PropTypes.node.isRequired),
      defaultSubOptions: PropTypes.arrayOf(PropTypes.number.isRequired),
      renderer: PropTypes.func
    }).isRequired).isRequired,
    onSubmit: PropTypes.func
  };

  static defaultProps = {
    childrenPlacement: 'top'
  };

  constructor() {
    super(...arguments);
    this.state = {
      header: '',
      sequence: '',
      showExamples: false,
      // progress: 0,
      // numProcessedSeqs: 0,
      // numAllSeqs: 0,
      isSubmitting: false,
      outputOption: '__default',
      outputSubOptions: null,
      optionResult: null

    };
  }

  headerChange = (evt) => {
    let header = evt.target.value;
    this.setState({header});
  };

  sequenceChange = (e) => {
    let sequence = e.target.value;
    this.setState({sequence});
  };

  handleReset = () => {
    this.setState({
      header: '',
      sequence: '',
      showExamples: false
    });
  };

  handleSubmit = async (e) => {
    const {outputOption} = this.state;
    const {outputOptions, onSubmit} = this.props;
    let sequences = parseFasta(this.state.sequence, 'userinput');
    if (this.state.header && sequences.length > 0) {
      sequences[0].header = this.state.header;
    }
    let validated = true;
    let state = {};
    let query;
    if (onSubmit) {
      [validated, state, query] = await onSubmit(e, sequences);
    }
    if (validated) {
      if (outputOption.startsWith('__')) {
        await BigData.clear();
        Object.assign(state, {
          sequences: await BigData.save(sequences),
          outputOption: outputOption.replace(/^__/, '')
        });
      }
      else {
        validated = false; // stop submitting
        this.setState({isSubmitting: true});
        state.sequences = sequences.map(
          ({header, sequence}) => ({header, sequence})
        );
        state.subOptionIndices = Array.from(this.state.outputSubOptions);
        state.onFinish = () => setTimeout(() => this.setState({
          isSubmitting: false,
          optionResult: null
        }));
        this.setState({
          isSubmitting: true,
          optionResult: outputOptions[outputOption].renderer(state)
        });
      }
    }
    return [validated, state, query];
  };

  handleUpload = (filelist) => {
    const file = filelist[0];
    if (!file || !(/^text\/.+$|^application\/x-gzip$|^$/.test(file.type))) {
      return;
    }
    /*let fileName = file.name;
    let fileSize = file.size;
    this.setState({fileName, fileSize});*/
    readFile(file)
      .then(sequence => this.setState({sequence}));
  };

  get outputOptions() {
    const {outputOptions} = this.props;
    return Object.assign({
      __default: {
        label: 'HTML'
      }
    }, outputOptions);
  }

  handleOOChange = (e) => {
    const outputOption = e.currentTarget.value;
    const target = this.outputOptions[outputOption];
    const outputSubOptions =
      target.subOptions ? new Set(target.defaultSubOptions) : null;
    this.setState({outputOption, outputSubOptions});
  };

  handleOOChildChange = (e) => {
    let {outputSubOptions} = this.state;
    const child = parseInt(e.currentTarget.value, 10);
    if (e.currentTarget.checked) {
      outputSubOptions.add(child);
    }
    else {
      outputSubOptions.delete(child);
    }
    outputSubOptions = new Set(outputSubOptions);
    this.setState({outputSubOptions});
  };

  async loadExample(url) {
    const resp = await fetch(url);
    const sequence = await resp.text();
    this.setState({sequence, showExamples: false});
  }

  handleShowExamples = async (e) => {
    e && e.preventDefault();
    const {exampleFasta} = this.props;
    if (exampleFasta.length === 1) {
      const [{url}] = exampleFasta;
      await this.loadExample(url);
    }
    else {
      this.setState({showExamples: true});
    }
  };

  handleLoadExample = async (e) => {
    e && e.preventDefault();
    const url = e.currentTarget.dataset.href;
    await this.loadExample(url);
  };

  render() {
    const {outputOptions} = this;
    const {
      to, children,
      childrenPlacement, exampleFasta
    } = this.props;
    const {
      header, sequence, showExamples, outputOption,
      outputSubOptions, isSubmitting, optionResult
    } = this.state;
    const hasOptions = Object.keys(outputOptions || {}).length > 1;
    const hasOptionChild = outputSubOptions !== null;

    return (
      <BaseForm
       to={to}
       resetDisabled={
         (sequence === '' && header === '' && !showExamples) || isSubmitting
       }
       submitDisabled={sequence === '' || isSubmitting}
       onSubmit={this.handleSubmit}
       onReset={this.handleReset}>
        {childrenPlacement === 'top' ? children : null}
        <div className={style['input-group']}>
          <label
           className={style['input-label']}
           htmlFor="header">Header:</label>
          <input
           onChange={this.headerChange}
           value={header}
           className={style['header-input']}
           type="text" name="header" />
          <span
           className={style['header-input-notation']}>
            (optional)
          </span>
        </div>
        <div className={style['input-group']}>
          <label
           className={style['input-label']}
           htmlFor="fasta-file">Upload text file:</label>
          <FileInput
           onChange={this.handleUpload}
           name="fasta-file"
           accept={
             "application/x-gzip,text/plain,text/x-fasta," +
             ".gz," +
             ".fasta,.fas,.fna"
           } />
          <span className={style['file-options']}>
            {!showExamples && exampleFasta && exampleFasta.length > 0 ?
              <Link
               href="#"
               onClick={this.handleShowExamples}>
                Load Examples
              </Link> : null}
          </span>
        </div>
        {showExamples ? <div className={style['input-group']}>
          <label className={style['input-label']}>
            Select an example:
          </label>
          <ul className={style['file-options']}>
            {exampleFasta.map(({url, title}, idx) => <li key={idx}>
              <Link
               href={url}
               data-href={url}
               onClick={this.handleLoadExample}>
                {title}
              </Link>
            </li>)}
          </ul>
        </div> : null}
        <textarea
         rows="7"
         className={classNames(style['input-group'], style['sequence-input'])}
         value={sequence}
         onChange={this.sequenceChange} />
        {hasOptions ?
          <fieldset className={style['output-options']}>
            <legend>Output options</legend>
            <div>
              {Object.entries(outputOptions)
                .sort()
                .map(([value, {label}], idx) => (
                  <RadioInput
                   key={idx}
                   id={`output-options-${idx}`}
                   name="output-options"
                   value={value}
                   onChange={this.handleOOChange}
                   checked={value === outputOption}>
                    {label}
                  </RadioInput>
                ))}
            </div>
            {hasOptionChild ?
              <div className={style.children}>
                <label
                 className={style['input-label']}
                 htmlFor="output-options-child">Select outputs: </label>
                {outputOptions[outputOption].subOptions
                  .map((label, idx) => (
                    <CheckboxInput
                     id={`output-options-child-${idx}`}
                     name="output-option-children"
                     key={idx} value={idx}
                     onChange={this.handleOOChildChange}
                     checked={outputSubOptions.has(idx)}>
                      {label}
                    </CheckboxInput>
                  ))}
              </div> : null}
          </fieldset> :
          null}
        {childrenPlacement === 'bottom' ? children : null}
        <div className={classNames(style['loading-modal'], isSubmitting ?
          null : style.hidden)
        }>
          <div className={style.inner}>
            {optionResult}
          </div>
        </div>
      </BaseForm>
    );
  }
}

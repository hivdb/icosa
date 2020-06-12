import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Dropzone from 'react-dropzone';
import ProgressBar from 'react-progressbar';
import {routerShape, matchShape} from 'found';
import {FaRegFileAlt, FaTimesCircle} from 'react-icons/fa';

import {parseSequenceReads} from '../../utils/sequence-reads';
import BigData from '../../utils/big-data';
import readFile from '../../utils/read-file';
import BaseForm from './base';
import FileInput from '../file-input';
import RadioInput from '../radio-input';
import CheckboxInput from '../checkbox-input';
import Link from '../link/basic';

import style from './style.module.scss';

const SUPPORT_FORMATS =
  "text/tsv,text/plain,.tsv,.txt,.codfreq,.codfish,.aavf";

const DEFAULT_CUTOFF = 0.2;  // 20%

export default class SequenceReadsInputForm extends React.Component {

  static propTypes = {
    match: matchShape.isRequired,
    router: routerShape.isRequired,
    children: PropTypes.node,
    to: PropTypes.string,
    outputOptions: PropTypes.object,
    onSubmit: PropTypes.func,
    exampleCodonReads: PropTypes.arrayOf(
      PropTypes.string.isRequired
    )
  }

  constructor() {
    super(...arguments);
    this.state = {
      allSequenceReads: [],
      progress: 0,
      numProcessedSeqs: 0,
      numAllSeqs: 0,
      isSubmitting: false,
      outputOption: '__default',
      outputOptionChildren: null
    };
  }

  handleReset = () => {
    this.setState({allSequenceReads: []});
  }

  handleSubmit = async (e) => {
    const {outputOptions} = this.props;
    const {outputOption, allSequenceReads} = this.state;
    let validated = true;
    let state = {};
    if (this.props.onSubmit) {
      [validated, state] = await this.props.onSubmit(e, allSequenceReads);
    }
    if (validated) {
      if (outputOption.startsWith('__')) {
        await BigData.clear();
        Object.assign(state, {
          allSequenceReads: await BigData.save(allSequenceReads),
          outputOption: outputOption.replace(/^__/, '')
        });
      }
      else {
        validated = false; // stop submitting
        this.setState({isSubmitting: true});
        state.allSequenceReads = allSequenceReads;
        state.children = this.state.outputOptionChildren;
        outputOptions[outputOption].callback(state)
          .progress(({
            percent,
            processedLength: numProcessedSeqs,
            seqLength: numAllSeqs
          }) => this.setState({
            progress: parseInt(percent * 100, 10),
            numProcessedSeqs, numAllSeqs
          }))
          .done(() => this.setState({
            progress: 0,
            isSubmitting: false}));
      }
    }
    return [validated, state];
  }

  handleLoadExamples = async (e) => {
    e && e.preventDefault();
    const {exampleCodonReads} = this.props;
    const allSequenceReads = [];
    for (const url of exampleCodonReads) {
      const resp = await fetch(url);
      const data = await resp.text();
      let name = url.split('/');
      name = name[name.length - 1];
      allSequenceReads.push(parseSequenceReads(name, data, DEFAULT_CUTOFF));
    }
    this.setState({allSequenceReads});
  }

  handleUpload = async (fileList) => {
    const {allSequenceReads} = this.state;
    fileList = Array.from(fileList).map(f => [f.name, readFile(f)]);
    for (const [name, asyncData] of fileList) {
      const data = await asyncData;
      allSequenceReads.push(parseSequenceReads(name, data, DEFAULT_CUTOFF));
    }
    this.setState({allSequenceReads});
  }

  handleRemoveSeqReads(index) {
    return (e) => {
      e.preventDefault();
      e.stopPropagation();
      const {allSequenceReads} = this.state;
      allSequenceReads.splice(index, 1);
      this.setState({allSequenceReads});
    };
  }

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
    const outputOptionChildren =
      target.children ? new Set(target.defaultChildren) : null;
    this.setState({outputOption, outputOptionChildren});
  }

  handleOOChildChange = (e) => {
    let {outputOptionChildren} = this.state;
    const child = parseInt(e.currentTarget.value, 10);
    if (e.currentTarget.checked) {
      outputOptionChildren.add(child);
    }
    else {
      outputOptionChildren.delete(child);
    }
    outputOptionChildren = new Set(outputOptionChildren);
    this.setState({outputOptionChildren});
  }

  render() {
    const {outputOptions} = this;
    const {match, router, to, exampleCodonReads} = this.props;
    const {
      allSequenceReads, outputOption, numProcessedSeqs, numAllSeqs,
      outputOptionChildren, isSubmitting, progress} = this.state;
    const hasOptions = Object.keys(outputOptions || {}).length > 1;
    const hasOptionChild = Object.keys(outputOptionChildren || {}).length > 0;

    return (
      <BaseForm
       {...{match, router, to}}
       resetDisabled={allSequenceReads.length === 0 || isSubmitting}
       submitDisabled={allSequenceReads.length === 0 || isSubmitting}
       onSubmit={this.handleSubmit}
       onReset={this.handleReset}>
        {this.props.children}
        <div className={style['input-group']}>
          <label
           className={style['input-label']}
           htmlFor="reads-file">Upload file(s):</label>
          <FileInput
           onChange={this.handleUpload}
           name="reads-file"
           multiple
           accept={SUPPORT_FORMATS} />
          <span className={style['file-options']}>
            {exampleCodonReads && exampleCodonReads.length ?
              <Link
               href="#"
               onClick={this.handleLoadExamples}>
                Load Example Data
              </Link> : null}
          </span>
        </div>
        <Dropzone
         accept={SUPPORT_FORMATS}
         onDrop={(acceptedFiles) => this.handleUpload(acceptedFiles)}>
          {({getRootProps, getInputProps, isDragActive}) => <>
            <input {...getInputProps()} />
            <ul
             data-drag-active={isDragActive}
             data-placeholder={"Drag and drop CodFreq/AAVF files here"}
             {...getRootProps({className: style['sequence-reads-preview']})}>
              {allSequenceReads.map((sr, idx) => (
                <li key={idx}>
                  <FaRegFileAlt className={style['file-icon']} />
                  <br />
                  <span className={style['file-name']}>{sr.name}</span>
                  <FaTimesCircle
                   onClick={this.handleRemoveSeqReads(idx)}
                   className={style.remove} />
                </li>
              ))}
            </ul>
          </>}
        </Dropzone>
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
                {outputOptions[outputOption].children
                .map((label, idx) => (
                  <CheckboxInput
                   id={`output-options-child-${idx}`}
                   name="output-option-children"
                   key={idx} value={idx}
                   onChange={this.handleOOChildChange}
                   checked={outputOptionChildren.has(idx)}>
                    {label}
                  </CheckboxInput>
                ))}
              </div> : null}
          </fieldset>
          : null}
        <div className={classNames(
          style['loading-modal'], isSubmitting ?
          null : style.hidden)
        }>
          <div className={style.inner}>
            <strong>
              Analyzing sequence ({numProcessedSeqs}/{numAllSeqs} finished) ...
            </strong>
            <ProgressBar
             className={style['progress-bar']}
             completed={progress} />
          </div>
        </div>
      </BaseForm>
    );
  }
}

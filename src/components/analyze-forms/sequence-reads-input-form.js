import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Dropzone from 'react-dropzone';
import ProgressBar from 'react-progressbar';
import {routerShape, matchShape} from 'found';
import {FaRegFileAlt} from '@react-icons/all-files/fa/FaRegFileAlt';
import {FaTimesCircle} from '@react-icons/all-files/fa/FaTimesCircle';

import {
  parseSequenceReads,
  buildGeneValidator
} from '../../utils/sequence-reads';
import fastq2codfreq from '../../utils/fastq2codfreq';
import BigData from '../../utils/big-data';
import readFile from '../../utils/read-file';
import BaseForm from './base';
import FileInput from '../file-input';
import RadioInput from '../radio-input';
import CheckboxInput from '../checkbox-input';
import Link from '../link/basic';
import {ConfigContext} from '../report';

import style from './style.module.scss';

const SUPPORT_FORMATS =
  ".fastq, .gz, application/gzip, text/tsv, text/plain, " +
  ".tsv, .txt, .codfreq, .codfish, .aavf";


function reformCodFreqs(allSequenceReads, geneValidator) {
  return allSequenceReads.map(
    ({allReads, ...seqReads}) => ({
      allReads: allReads.map(
        ({allCodonReads, gene, position, ...read}) => {
          [gene, position] = geneValidator(gene, position);
          return {
            allCodonReads: allCodonReads.map(
              ({codon, reads}) => ({codon, reads})
            ),
            gene,
            position,
            ...read
          };
        }
      ),
      ...seqReads
    })
  );
}


export default function SequenceReadsInputFormWrapper(props) {

  return <ConfigContext.Consumer>
    {config => <SequenceReadsInputForm {...props} config={config} />}
  </ConfigContext.Consumer>;
}


class SequenceReadsInputForm extends React.Component {

  static propTypes = {
    match: matchShape.isRequired,
    router: routerShape.isRequired,
    config: PropTypes.object.isRequired,
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
      allFastqFiles: [],
      progress: 0,
      progressDesc: '',
      numProcessedSeqs: 0,
      numAllSeqs: 0,
      isSubmitting: false,
      outputOption: '__default',
      outputOptionChildren: null
    };
  }

  handleReset = () => {
    this.setState({
      allSequenceReads: [],
      allFastqFiles: []
    });
  }

  handleSubmit = async (e) => {
    e && e.persist();
    const {config, outputOptions} = this.props;
    let {outputOption, allFastqFiles, allSequenceReads} = this.state;
    let validated = true;
    let state = {};
    if (this.props.onSubmit) {
      [validated, state] = await this.props.onSubmit(
        e, allSequenceReads, allFastqFiles
      );
    }
    if (validated) {
      if (allFastqFiles.length > 0) {
        this.setState({isSubmitting: true});
        const geneValidator = buildGeneValidator(config.geneValidatorDefs);
        for await (const progress of fastq2codfreq(allFastqFiles)) {
          let {loaded, codfreqs, count, total, description} = progress;
          total = Math.round(total / 0.99); // make total a little bit larger
          const pcnt = Math.floor(count / total * 100);
          this.setState({
            progress: pcnt,
            progressDesc: `${description} (${pcnt}%)`
          });
          if (loaded) {
            allSequenceReads = [
              ...allSequenceReads,
              ...reformCodFreqs(
                codfreqs, geneValidator
              )
            ];
            break;
          }
        }
        this.setState({
          isSubmitting: false,
          progress: 0,
          progressDesc: ''
        });
      }
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
    const {config, exampleCodonReads} = this.props;
    const geneValidator = buildGeneValidator(config.geneValidatorDefs);
    const allSequenceReads = [];
    for (const url of exampleCodonReads) {
      const resp = await fetch(url);
      const data = await resp.text();
      let name = url.split('/');
      name = name[name.length - 1];
      allSequenceReads.push(parseSequenceReads(
        name,
        data,
        geneValidator
      ));
    }
    this.setState({allSequenceReads});
  }

  handleUpload = async (fileList) => {
    const {config} = this.props;
    const {allSequenceReads, allFastqFiles} = this.state;
    const knownFiles = new Set();
    const geneValidator = buildGeneValidator(config.geneValidatorDefs);
    for (const {name} of allSequenceReads) {
      knownFiles.add(name);
    }
    for (const {name} of allFastqFiles) {
      knownFiles.add(name);
    }
    const unsupportedFiles = [];
    for (const file of Array.from(fileList)) {
      const name = file.name;
      if (knownFiles.has(name)) {
        unsupportedFiles.push(name);
      }
      else if (/[^\w.()-]/.test(name)) {
        unsupportedFiles.push(name);
      }
      else if (/\.fastq(\.gz)?$/i.test(name)) {
        allFastqFiles.push(file);
      }
      else if (/\.gz$/i.test(name)) {
        unsupportedFiles.push(name);
      }
      else {
        const data = await readFile(file);
        allSequenceReads.push(parseSequenceReads(
          name,
          data,
          geneValidator
        ));
      }
    }
    if (unsupportedFiles.length > 0) {
      alert(
        'Unsupported file/duplicate file/invalid file name:\n - ' +
        unsupportedFiles.join('\n - ')
      );
    }
    this.setState({allSequenceReads, allFastqFiles});
  }

  handleRemoveFastq(index) {
    return (e) => {
      e.preventDefault();
      e.stopPropagation();
      const {allFastqFiles} = this.state;
      allFastqFiles.splice(index, 1);
      this.setState({allFastqFiles});
    };
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
    const {config, match, router, to, exampleCodonReads} = this.props;
    const {
      allSequenceReads, allFastqFiles, outputOption,
      numProcessedSeqs, numAllSeqs, progressDesc,
      outputOptionChildren, isSubmitting, progress} = this.state;
    const hasOptions = Object.keys(outputOptions || {}).length > 1;
    const hasOptionChild = Object.keys(outputOptionChildren || {}).length > 0;
    const allowSubmit = (allFastqFiles.length + allSequenceReads.length) > 0;

    return (
      <BaseForm
       {...{match, router, to}}
       resetDisabled={!allowSubmit || isSubmitting}
       submitDisabled={!allowSubmit || isSubmitting}
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
             data-placeholder={
               config.messages['seqreads-analysis-form-placeholder']
             }
             {...getRootProps({className: style['sequence-reads-preview']})}>
              {allFastqFiles.map((f, idx) => (
                <li key={`fastq-${idx}`}>
                  <FaRegFileAlt className={style['file-icon']} />
                  <br />
                  <span className={style['file-name']}>{f.name}</span>
                  <FaTimesCircle
                   onClick={this.handleRemoveFastq(idx)}
                   className={style.remove} />
                </li>
              ))}
              {allSequenceReads.map((sr, idx) => (
                <li key={`codfreq-${idx}`}>
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
              {progressDesc ? progressDesc :
                ('Analyzing sequence (' +
                `${numProcessedSeqs}/${numAllSeqs} finished) ...`)}
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

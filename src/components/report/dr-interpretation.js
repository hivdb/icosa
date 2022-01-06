import React from 'react';
import PropTypes from 'prop-types';

import DRMutationByTypes from './dr-mutation-by-types';
import DRCommentByTypes from './dr-comment-by-types';
import DRLevels from './dr-levels';

import style from './style.module.scss';


export default class DRInterpretation extends React.Component {

  static propTypes = {
    strain: PropTypes.string.isRequired,
    geneDR: PropTypes.shape({
      gene: PropTypes.shape({
        name: PropTypes.string.isRequired,
        drugClasses: PropTypes.array.isRequired
      }).isRequired,
      levels: PropTypes.array.isRequired,
      algorithm: PropTypes.shape({
        family: PropTypes.string.isRequired,
        version: PropTypes.string.isRequired,
        publishDate: PropTypes.string.isRequired
      }).isRequired
    }).isRequired,
    output: PropTypes.string.isRequired,
    suppressDRI: PropTypes.bool.isRequired,
    suppressLevels: PropTypes.bool.isRequired,
    disabledDrugs: PropTypes.arrayOf(
      PropTypes.string.isRequired
    )
  }

  static defaultProps = {
    output: 'default',
    suppressLevels: false,
    suppressDRI: false
  }

  render() {
    const {
      strain, suppressLevels, suppressDRI,
      geneDR, output, disabledDrugs
    } = this.props;
    const {algorithm, gene} = geneDR;

    return (
      <section className={style['dr-interpretation']}>
        <h2>
          Drug resistance interpretation: {gene.name}
        </h2>
        <div className={style['header-annotation']}>
          {algorithm.family} {algorithm.version} ({algorithm.publishDate})
        </div>
        <DRMutationByTypes {...geneDR} {...{output, strain}} />
        {suppressDRI ?
          <p>
            Drug resistance interpretation is suppressed due to
            failed quality assessment (severe warning).
          </p> :
          <>
            {suppressLevels ? null : <div className={style['dr-levels']}>
              {gene.drugClasses.map((drugClass, idx) => (
                <DRLevels
                 key={idx} {...{output, drugClass, disabledDrugs}}
                 levels={geneDR.levels.filter(
                   ds => ds.drugClass.name === drugClass.name
                 )} />
              ))}
            </div>}
            <DRCommentByTypes {...{output, disabledDrugs, ...geneDR}} />
          </>}
      </section>
    );
  }
}

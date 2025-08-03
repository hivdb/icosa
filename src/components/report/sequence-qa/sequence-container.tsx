import React from 'react';
import GeneChart from './gene-chart';
import AutofitGraph from '../autofit';

export interface SequenceAnalysisQAChartProps {
  /** Aligned gene sequences to visualise. */
  alignedGeneSequences: Array<Record<string, any>>;
  /** Output mode for rendering; "printable" disables resizing. */
  output?: string;
}

/**
 * Displays quality assessment charts for aligned sequences.
 *
 * @param props - Component properties.
 * @returns Rendered sequence quality assessment section.
 */
export default function SequenceAnalysisQAChart({
  alignedGeneSequences,
  output = 'default'
}: SequenceAnalysisQAChartProps) {
  const [width, setWidth] = React.useState(
    output === 'printable' ? 8 * 72 : 0
  );

  /**
   * Handle resize events from the AutofitGraph container.
   *
   * @param size - Object containing the new width of the container.
   * @returns Nothing.
   */
  const handleResize = React.useCallback(({width}: {width: number}) => {
    setWidth(width);
  }, []);

  return (
    <AutofitGraph output={output} onResize={handleResize}>
      <h2>Sequence quality assessment</h2>
      {alignedGeneSequences.map((props, idx) => (
        <GeneChart key={idx} containerWidth={width} {...props} />
      ))}
    </AutofitGraph>
  );
}

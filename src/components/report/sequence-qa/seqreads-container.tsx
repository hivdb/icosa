import React from 'react';
import GeneChart from './gene-chart';
import AutofitGraph from '../autofit';

export interface SeqReadsAnalysisQAChartProps {
  /** Array of gene sequence read objects to plot. */
  allGeneSequenceReads: Array<Record<string, any>>;
  /** Output mode for rendering; "printable" disables resizing. */
  output?: string;
}

/**
 * Displays quality assessment charts for sequence reads.
 *
 * @param props - Component properties.
 * @returns Rendered quality assessment charts.
 */
export default function SeqReadsAnalysisQAChart({
  allGeneSequenceReads,
  output = 'default'
}: SeqReadsAnalysisQAChartProps) {
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
      <h2>Sequence Reads Quality Assessment</h2>
      {allGeneSequenceReads.map((props, idx) => (
        <GeneChart
          key={idx}
          containerWidth={width}
          frameShifts={[]}
          {...props}
        />
      ))}
    </AutofitGraph>
  );
}

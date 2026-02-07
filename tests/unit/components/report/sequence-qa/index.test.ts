import {SeqReadsAnalysisQAChart, SequenceAnalysisQAChart} from '../../../../../src/components/report/sequence-qa';

test('sequence QA exports exist', () => {
  expect(typeof SeqReadsAnalysisQAChart).toBe('function');
  expect(typeof SequenceAnalysisQAChart).toBe('function');
});

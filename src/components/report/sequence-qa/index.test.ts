import {SeqReadsAnalysisQAChart, SequenceAnalysisQAChart} from './index';

test('sequence QA exports exist', () => {
  expect(typeof SeqReadsAnalysisQAChart).toBe('function');
  expect(typeof SequenceAnalysisQAChart).toBe('function');
});

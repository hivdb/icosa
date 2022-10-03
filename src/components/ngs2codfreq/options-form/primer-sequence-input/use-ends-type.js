import React from 'react';


export default function useEndsType(sequence, setSequence) {
  const threeEndType = React.useMemo(
    () => {
      const [seq] = sequence.split(';', 1);
      if (seq.length > 1) {
        if (seq.endsWith('X')) {
          return 'non-internal';
        }
        if (seq.endsWith('$')) {
          return 'anchored';
        }
      }
      return 'regular';
    },
    [sequence]
  );

  const fiveEndType = React.useMemo(
    () => {
      if (sequence.length > 1) {
        if (sequence.startsWith('X')) {
          return 'non-internal';
        }
        if (sequence.startsWith('^')) {
          return 'anchored';
        }
      }
      return 'regular';
    },
    [sequence]
  );

  const setThreeEndType = React.useCallback(
    event => {
      const type = event.currentTarget.value;
      const [seq, ...seqopts] = sequence.split(';');
      const bareSeq = seq.replace(/[X$]$/, '');
      if (type === 'regular') {
        setSequence([bareSeq, ...seqopts].join(';'));
      }
      else if (type === 'anchored') {
        setSequence([bareSeq + '$', ...seqopts].join(';'));
      }
      else if (type === 'non-internal') {
        setSequence([bareSeq + 'X', ...seqopts].join(';'));
      }
    },
    [setSequence, sequence]
  );

  const setFiveEndType = React.useCallback(
    event => {
      const type = event.currentTarget.value;
      const bareSeq = sequence.replace(/^[X^]/, '');
      if (type === 'regular') {
        setSequence(bareSeq);
      }
      else if (type === 'anchored') {
        setSequence('^' + bareSeq);
      }
      else if (type === 'non-internal') {
        setSequence('X' + bareSeq);
      }
    },
    [setSequence, sequence]
  );

  return {
    threeEndType,
    setThreeEndType,
    fiveEndType,
    setFiveEndType
  };
}

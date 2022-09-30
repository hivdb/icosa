import React from 'react';


export default function useValidation(primers) {
  const [errors, setErrors] = React.useState([]);

  React.useEffect(
    () => {
      const newErrors = [];
      const headerCounter = {};
      const seqCounter = {};
      for (const {header, sequence: seq, type} of primers) {
        const [bareSeq] = seq.split(';', 1);
        if (header in headerCounter) {
          if (headerCounter[header] === 1) {
            newErrors.push(<>
              Duplicate headers <em>{header}</em>.
            </>);
          }
          headerCounter[header] ++;
        }
        else {
          headerCounter[header] = 1;
        }
        if (bareSeq in seqCounter) {
          if (seqCounter[bareSeq] === 1) {
            newErrors.push(<>
              Duplicate primer sequences <strong>{bareSeq}</strong>
              {' '}(<em>{header}</em>).
            </>);
          }
          seqCounter[bareSeq] ++;
        }
        else {
          seqCounter[bareSeq] = 1;
        }

        if (bareSeq.length < 4) {
          newErrors.push(<>
            primer sequence is too short: <strong>{bareSeq}</strong>
            {' '}(<em>{header}</em>).
          </>);
        }

        if (bareSeq.length > 200) {
          newErrors.push(<>
            primer sequence is too
            long: <strong>{bareSeq.slice(0, 180)}</strong>... (
            <em>{header}</em>).
          </>);
        }

        if (type === 'three-end' && /^[X^]/.test(bareSeq)) {
          newErrors.push(<>
            A 3’ end primer can not be anchored or placed at 5’ end.  Remove
            the prefix ‘X’ or ‘^’ from
            sequence <strong>{bareSeq}</strong> (<em>{header}</em>), or change
            it to a different type of end.
          </>);
        }

        if (type === 'five-end' && /[X$]$/.test(bareSeq)) {
          newErrors.push(<>
            A 5’ end primer can not be anchored or placed at 3’ end.  Remove
            the suffix ‘X’ or ‘$’ from
            sequence <strong>{bareSeq}</strong> (<em>{header}</em>), or change
            it to a different type of end.
          </>);
        }
      }
      setErrors(newErrors);
    },
    [primers]
  );

  return errors;
}

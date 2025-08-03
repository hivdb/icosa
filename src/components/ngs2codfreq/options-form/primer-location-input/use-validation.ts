import React from 'react';
import type { PrimerBed } from '../types';

/** Validate primer locations against a reference sequence. */
export default function useValidation(primers: PrimerBed[], refSequence: string | null) {
  const [errors, setErrors] = React.useState<React.ReactNode[]>([]);

  React.useEffect(
    () => {
      if (!refSequence) {
        return;
      }
      const newErrors = [];
      const nameCounter = {};
      for (const {name, start, end} of primers) {
        if (start < 0) {
          newErrors.push(<>
            Start position cannot be less than 0 ({name}={start}).
          </>);
        }
        if (end > refSequence.length) {
          newErrors.push(<>
            End position cannot be greater than {refSequence.length}
            {' '}({name}={end}).
          </>);
        }
        if (nameCounter[name]) {
          if (nameCounter[name] === 1) {
            newErrors.push(<>
              Duplicate primer name: {name}.
            </>);
          }
          else {
            nameCounter[name] ++;
          }
        }
        else {
          nameCounter[name] = 1;
        }
        if (end <= start) {
          newErrors.push(<>
            End position must be after, not before start
            position ({name}: start={start}, end={end}).
          </>);
        }
      }
      setErrors(newErrors);
    },
    [primers, refSequence]
  );

  return errors;
}

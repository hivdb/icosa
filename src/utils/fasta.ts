/**
 * Parse a FASTA formatted string into an array of sequences.
 *
 * @param raw - The raw FASTA text.
 * @param fileName - Name of the originating file for unnamed sequences.
 * @returns Array of parsed sequence objects containing header, sequence and size.
 */
export function parseFasta(raw: string, fileName: string) {
  const sequences: Array<{header: string; sequence: string; size: number}> = [];
  let unnamedNum = 0;
  const knownHeaders = new Set<string>();
  for (const rawseq of raw.split(/^(?=>)/gm)) {
    let header: string | undefined;
    let size: number;
    const seqArr: string[] = [];

    for (let line of rawseq.split(/[\r\n]+/g)) {
      if (line.startsWith('#')) {
        continue;
      }
      else if (line.startsWith('>')) {
        header = header || line.slice(1).trim();
      }
      else {
        seqArr.push(line.trim());
      }
    }
    const sequence = seqArr.join('');
    size = sequence.length;
    if (!header) {
      if (size) {
        header = `${fileName} unamed sample: ${++ unnamedNum}`;
      }
      else {
        // ignore if header and sequence are both empty
        continue;
      }
    }

    // prevent headers conflict
    const origHeader = header;
    let suffix = 1;
    while (knownHeaders.has(header)) {
      header = `${origHeader}-conflict${suffix}`;
      suffix ++;
    }
    knownHeaders.add(header);

    sequences.push({header, sequence, size});
  }
  return sequences;
}

/**
 * Concatenate sequence(s) into FASTA format.
 * @param header - Header string or array of objects with header and sequence.
 * @param sequence - Sequence string when header is a single record.
 * @returns FASTA formatted string.
 */
export function concatFasta(
  header: string | Array<{header: string; sequence: string}>,
  sequence?: string
): string {
  if (Array.isArray(header)) {
    return header
      .map(({header: h, sequence: s}) => concatFasta(h, s))
      .join('\n');
  }
  return `>${header}\n${sequence}`;
}

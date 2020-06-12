export function parseFasta(raw, fileName) {
  let sequences = [];
  let unnamedNum = 0;
  const knownHeaders = new Set();
  for (let rawseq of raw.split(/^(?=>)/gm)) {
    let header, size;
    let sequence = [];

    for (let line of rawseq.split(/[\r\n]+/g)) {
      if (line.startsWith('#')) {
        continue;
      }
      else if (line.startsWith('>')) {
        header = header || line.slice(1).trim();
      }
      else {
        sequence.push(line.trim());
      }
    }
    sequence = sequence.join('');
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

export function concatFasta(header, sequence) {
  if (header instanceof Array) {
    return header
      .map(({header, sequence}) => concatFasta(header, sequence))
      .join('\n');
  }
  else {
    return `>${header}\n${sequence}`;
  }
}

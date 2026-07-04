// Remove characters that are not valid UTF-8 from a sequence header. The
// header is used as an identity anchor to match a sequence to its analysis
// results, so it is cleaned here on the client (where the same value is both
// submitted and used for matching, keeping them consistent). We drop:
//  - the Unicode replacement character U+FFFD, which is what an invalid input
//    byte (e.g. a stray 0xCA) decodes to when a file is read as UTF-8 -- the
//    "invalid symbol" that previously crashed the aligner;
//  - unpaired surrogate code units (U+D800-U+DFFF), which cannot be encoded
//    as UTF-8.
// All other characters -- including control characters and printable Unicode
// (accented letters, CJK, emoji) -- are preserved.
export function sanitizeHeader(header) {
  let cleaned = '';
  for (const ch of header) {
    const code = ch.codePointAt(0);
    if (code === 0xFFFD || (code >= 0xD800 && code <= 0xDFFF)) {
      continue;
    }
    cleaned += ch;
  }
  return cleaned;
}

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
        header = header || sanitizeHeader(line.slice(1)).trim();
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

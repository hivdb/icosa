import config from '../config';

export function parseMutation(mut) {
  let pos = null;
  let aas = null;
  let cons = null;
  let gene = null;
  if (config.mutationGenePattern.test(mut)) {
    gene = mut.slice(0, 2).toUpperCase();
    mut = mut.slice(2);
    if (mut.slice(0, 1) === ':') {
      mut = mut.slice(1);
    }
  }
  if (/^[A-Za-z]/.test(mut)) {
    cons = mut.slice(0, 1);
    mut = mut.slice(1);
  }
  pos = Math.abs(parseInt(mut, 10));
  if (!isNaN(pos)) {
    aas = mut.slice(pos.toString().length);
    aas = aas.replace(/[^A-Za-z_-]+/g, '');
  }
  return [pos, aas, cons, gene];
}

export function mutationCompare(mut1, mut2) {
  const [pos1, aas1] = parseMutation(mut1);
  const [pos2, aas2] = parseMutation(mut2);
  let diff = pos1 - pos2;
  if (diff === 0) {
    if (aas1 < aas2) {
      diff = -1;
    }
    else if (aas1 > aas2) {
      diff = 1;
    }
    else {
      diff = 0;
    }
  }
  return diff;
}

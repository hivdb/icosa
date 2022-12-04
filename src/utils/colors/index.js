import COLORS from './colors.json';


const NUM_COLORS = COLORS.length;

export {NUM_COLORS};


export function getColorHex(index, darkness) {
  return COLORS[index % COLORS.length][darkness];
}


export function getColorInt(index, darkness) {
  return Number.parseInt(
    COLORS[index % COLORS.length][darkness].replace('#', '0x')
  );
}

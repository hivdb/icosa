const iwanthue = require('iwanthue');

const NUM_COLORS = 15;
const SEED = 4535745;

const lightColors = iwanthue(NUM_COLORS, {
  colorSpace: {
    hmin: 0,
    hmax: 360,
    cmin: 30,
    cmax: 80,
    lmin: 65,
    lmax: 100
  },
  clustering: 'k-means',
  quality: 100,
  ultraPrecision: true,
  distance: 'euclidean',
  seed: SEED
});

const darkColors = iwanthue(NUM_COLORS, {
  colorSpace: {
    hmin: 0,
    hmax: 360,
    cmin: 30,
    cmax: 80,
    lmin: 35,
    lmax: 60
  },
  clustering: 'k-means',
  quality: 100,
  ultraPrecision: true,
  distance: 'euclidean',
  seed: SEED
});

const colors = [];
for (let i = 0; i < NUM_COLORS; i ++) {
  colors.push({
    light: lightColors[i],
    dark: darkColors[i]
  });
}

console.log(JSON.stringify(colors, null, '  '));

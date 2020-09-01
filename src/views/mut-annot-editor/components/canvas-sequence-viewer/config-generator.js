import COLORS from './colors.json';

const BASE_SIZE_PIXEL_MAP = {
  large: 40,
  middle: 32,
  small: 24
};

const FONT_FAMILY = 'Source Sans Pro';

export async function preloadFonts() {
  await document.fonts.load(`bold 16px "${FONT_FAMILY}"`);
  await document.fonts.load(`italic 16px "${FONT_FAMILY}"`);
  await document.fonts.load(`16px "${FONT_FAMILY}"`);
}

export default class ConfigGenerator {

  constructor({
    sizeName,
    canvasWidthPixel,
    seqLength,
    colorBoxPositions,
    circleInBoxPositions,
    underscoreAnnotLocations,
    underscoreAnnotNames,
    aminoAcidsAnnotPositions,
    aminoAcidsCatNames
  }) {
    this.fontFamily = FONT_FAMILY;

    Object.assign(this, {
      sizeName,
      canvasWidthPixel,
      seqLength,
      colorBoxPositions,
      circleInBoxPositions,
      underscoreAnnotLocations,
      underscoreAnnotNames,
      aminoAcidsAnnotPositions,
      aminoAcidsCatNames
    });

    const baseSizePixel = BASE_SIZE_PIXEL_MAP[sizeName];
    this.initSizeConfig({
      baseSizePixel
    });
    this.initGridConfig({
      baseSizePixel,
      canvasWidthPixel,
      seqLength
    });
    this.initAnnotsConfig({
      underscoreAnnotLocations,
      aminoAcidsAnnotPositions
    });
    this.initCanvasConfig({
      seqLength,
      underscoreAnnotNames
    });
    this.initCoordConfig({
      baseSizePixel,
      underscoreAnnotNames,
      aminoAcidsAnnotPositions
    });
    this.initColorConfig({});
  }

  getHash() {
    const {
      sizeName,
      canvasWidthPixel,
      seqLength,
      colorBoxPositions,
      circleInBoxPositions,
      underscoreAnnotLocations,
      underscoreAnnotNames,
      aminoAcidsAnnotPositions,
      aminoAcidsCatNames
    } = this;
    return (
      `${sizeName}$$$${canvasWidthPixel}$$$${seqLength}$$$` +
      `${JSON.stringify(colorBoxPositions)}$$$` +
      `${JSON.stringify(circleInBoxPositions)}$$$` +
      `${JSON.stringify(underscoreAnnotNames)}$$$` +
      `${JSON.stringify(underscoreAnnotLocations)}$$$` +
      `${JSON.stringify(aminoAcidsAnnotPositions)}$$$` +
      `${JSON.stringify(aminoAcidsCatNames)}$$$`
    );
  }

  initSizeConfig({
    baseSizePixel
  }) {
    const posItemSizePixel = baseSizePixel;
    const horizontalMarginPixel = baseSizePixel / 5;
    const underscoreAnnotHeightPixel = baseSizePixel / 8;
    const underscoreAnnotMarginPixel = baseSizePixel / 12;
    const verticalMarginPixel = baseSizePixel / 3;

    Object.assign(this, {
      baseSizePixel,
      posItemSizePixel,
      horizontalMarginPixel,
      underscoreAnnotHeightPixel,
      verticalMarginPixel,

      circleInBoxRadiusPixel: baseSizePixel * 0.3,

      strokeWidthPixel: baseSizePixel / 16,

      posItemOuterWidthPixel: (
        horizontalMarginPixel + baseSizePixel
      ),
      posItemOuterHeightPixel: (
        verticalMarginPixel + baseSizePixel
      ),

      refAAFontSizePixel: baseSizePixel / 2,
      posNumFontSizePixel: baseSizePixel / 4.5,
      hoverPosNumFontSizePixel: baseSizePixel / 2,

      underscoreAnnotMarginPixel,

      aminoAcidAnnotFontSizePixel: baseSizePixel * 0.45,
      aminoAcidAnnotHeightPixel: baseSizePixel * 0.35,
      aminoAcidAnnotMarginPixel: baseSizePixel / 32
    });
  }

  initGridConfig({baseSizePixel, canvasWidthPixel, seqLength}) {
    const {
      posItemOuterWidthPixel
    } = this;
    const numCols = Math.floor(
      canvasWidthPixel / posItemOuterWidthPixel
    );
    const numRows = Math.ceil(seqLength / numCols);
    Object.assign(this, {
      numCols, numRows,
      numPosPerPage: numCols * 10
    });
  }

  initAnnotsConfig({
    underscoreAnnotLocations,
    aminoAcidsAnnotPositions
  }) {
    const {
      numCols,
      numRows,
      underscoreAnnotMarginPixel,
      underscoreAnnotHeightPixel,
      aminoAcidAnnotMarginPixel,
      aminoAcidAnnotHeightPixel
    } = this;
    const {matrix: usLocMatrix} = underscoreAnnotLocations;
    let underscoreAnnotColorIndexOffset = 0;
    const usOuterSize = (
      underscoreAnnotMarginPixel + underscoreAnnotHeightPixel
    );
    const aaOuterSize = (
      aminoAcidAnnotMarginPixel + aminoAcidAnnotHeightPixel
    );
    const underscoreAnnotOffsetYPixelPerRow = [];
    for (let r = 0; r < numRows; r ++) {
      const startPos = r * numCols + 1;
      const endPos = (r + 1) * numCols;
      const annotHeightPerPos = new Array(numCols).fill(0);
      for (let pos = startPos; pos <= endPos; pos ++) {
        const posLocs = usLocMatrix[pos - 1];
        if (posLocs && posLocs.length > 0) {
          annotHeightPerPos[pos - startPos] += posLocs.length * usOuterSize;
        }
      }
      for (const positions of aminoAcidsAnnotPositions) {
        for (const [pos,, aas] of Object.values(positions)) {
          if (pos < startPos) {
            continue;
          }
          else if (pos > endPos) {
            break;
          }
          if (aas && aas.length > 0) {
            annotHeightPerPos[pos - startPos] += aas.length * aaOuterSize;
          }
        }
      }
      const maxHeight = Math.max(...annotHeightPerPos);
      underscoreAnnotOffsetYPixelPerRow.push(maxHeight);
    }
    Object.assign(this, {
      underscoreAnnotColorIndexOffset,
      underscoreAnnotOffsetYPixelPerRow
    });
  }

  initCanvasConfig({seqLength, underscoreAnnotNames}) {
    const {
      numCols,
      posItemOuterHeightPixel,
      verticalMarginPixel,
      underscoreAnnotMarginPixel,
      underscoreAnnotHeightPixel,
      underscoreAnnotOffsetYPixelPerRow
    } = this;
    const underscoreAnnotOuterSize = (
      underscoreAnnotMarginPixel + underscoreAnnotHeightPixel
    );
    Object.assign(this, {
      canvasHeightPixel: (
        verticalMarginPixel +
        Math.ceil(seqLength / numCols) *
        posItemOuterHeightPixel +
        underscoreAnnotOffsetYPixelPerRow.reduce((sum, px) => sum + px, 0) +
        verticalMarginPixel +
        underscoreAnnotNames.length * underscoreAnnotOuterSize
      )
    });
  }

  initCoordConfig({
    baseSizePixel
  }) {
    const {
      numRows,
      verticalMarginPixel: vMargin,
      posItemOuterHeightPixel: boxOuterHeight,
      underscoreAnnotOffsetYPixelPerRow
    } = this;
    let posItemOffsetY = vMargin;
    const posItemOffsetYPixelPerRow = [];
    for (let r = 0; r < numRows; r ++) {
      if (r > 0) {
        posItemOffsetY += boxOuterHeight;
        posItemOffsetY += underscoreAnnotOffsetYPixelPerRow[r - 1];
      }
      posItemOffsetYPixelPerRow.push(posItemOffsetY);
    }
    Object.assign(this, {
      posItemOffsetYPixelPerRow,
      refAAOffsetPixel: {
        x: 0,
        y: baseSizePixel / 8
      },
      posNumOffsetPixel: {
        x: baseSizePixel / 12,
        y: baseSizePixel / 12
      },
      hoverPosNumOffsetPixel: {
        x: 0,
        y: baseSizePixel * 1.2
      },
      circleInBoxOffsetPixel: {
        x: baseSizePixel / 2,
        y: baseSizePixel / 2 + baseSizePixel / 12
      }
    });
  }

  initColorConfig() {
    Object.assign(this, {
      posNumColor: '#444',
      hoverPosNumColor: '#222',

      refAADarkColor: '#000',
      refAALightColor: '#fff',

      strokeDefaultColor: '#ddd',
      strokeDefaultColorHovering: '#777',

      backgroundDefaultColor: '#ddd',
      backgroundDefaultColorHovering: '#ddd',

      circleInBoxLightColor: '#fff',
      circleInBoxDarkColor: '#000',

      selectedStrokeColor: '#235fc5',
      selectedBackgroundColor: 'rgba(35, 95, 197, .4)'
    });
  }

  posRange2CoordPairs = (startPos, endPos, locIndex) => {
    const {
      numCols,
      posItemSizePixel,
      underscoreAnnotHeightPixel,
      underscoreAnnotMarginPixel
    } = this;
    const coordPairs = [];
    const offsetY = (
      posItemSizePixel + underscoreAnnotMarginPixel + 
      locIndex * (underscoreAnnotHeightPixel + underscoreAnnotMarginPixel)
    );
    const endOffsetY = offsetY + underscoreAnnotHeightPixel;
    let startCoord = this.pos2Coord(startPos);
    let endCoord;
    for (
      let breakPos = Math.ceil(startPos / numCols) * numCols;
      breakPos < endPos;
      breakPos += numCols
    ) {
      endCoord = this.pos2Coord(breakPos);
      endCoord.x += posItemSizePixel;
      startCoord.y += offsetY;
      endCoord.y += endOffsetY;
      coordPairs.push({startCoord, endCoord});
      startCoord = this.pos2Coord(breakPos + 1);
    }
    endCoord = this.pos2Coord(endPos);
    endCoord.x += posItemSizePixel;
    startCoord.y += offsetY;
    endCoord.y += endOffsetY;
    coordPairs.push({startCoord, endCoord});
    return coordPairs;
  }

  posAA2Coord = (pos, aaOffsetIndex) => {
    const {
      posItemSizePixel,
      underscoreAnnotLocations,
      underscoreAnnotHeightPixel,
      underscoreAnnotMarginPixel,
      aminoAcidAnnotHeightPixel,
      aminoAcidAnnotMarginPixel
    } = this;
    const {matrix: usLocMatrix} = underscoreAnnotLocations;
    const usOuterSize = (
      underscoreAnnotHeightPixel + underscoreAnnotMarginPixel
    );
    const aaOuterSize = (
      aminoAcidAnnotHeightPixel + aminoAcidAnnotMarginPixel
    );
    const posLocs = usLocMatrix[pos - 1] || [];
    return {
      x: 0,
      y: (
        posItemSizePixel + underscoreAnnotMarginPixel + 
        posLocs.length * usOuterSize +
        aaOffsetIndex * aaOuterSize
      )
    };
  }

  pos2Coord = (pos) => {
    if (!pos || pos < 1 || pos > this.seqLength) {
      return {};
    }
    const {
      horizontalMarginPixel: hMargin,
      posItemSizePixel: boxSize,
      posItemOffsetYPixelPerRow: offsetYPerRow,
      numCols
    } = this;
    const colNumber0 = (pos - 1) % numCols;
    const rowNumber0 = Math.floor((pos - 1) / numCols);
    const x = colNumber0 * (hMargin + boxSize) + hMargin;
    let y = offsetYPerRow[rowNumber0];
    return {x, y};
  }

  coord2Pos = (x, y) => {
    const {
      canvasWidthPixel: canvasWidth,
      canvasHeightPixel: canvasHeight,
      horizontalMarginPixel: hMargin,
      posItemSizePixel: boxSize,
      posItemOffsetYPixelPerRow: offsetYPerRow,
      numCols
    } = this;
    if (
      x < 0 || x > canvasWidth ||
      y < 0 || y > canvasHeight
    ) {
      return null;
    }
    x += hMargin / 2;
    // const offsetX = (x - hMargin) % (hMargin + boxSize);
    // if (offsetX > boxSize) {
    //   return null;
    // }
    // const offsetY = (y - vMargin) % (vMargin + boxSize);
    // if (offsetY > boxSize) {
    //   return null;
    // }
    let colNumber0 = Math.floor((x - hMargin) / (hMargin + boxSize));
    if (colNumber0 < 0) {
      colNumber0 = 0;
    }
    else if (colNumber0 >= numCols) {
      colNumber0 = numCols - 1;
    }
    let rowNumber0 = 0;
    while (offsetYPerRow[rowNumber0] < y) {
      rowNumber0 ++;
    }
    rowNumber0 --;

    const pos = rowNumber0 * numCols + colNumber0 + 1;
    if (pos < 1) {
      return 1;
    }
    else if (pos > this.seqLength) {
      return this.seqLength;
    }
    return pos;
  }

  getAnnotPosLookup(annotStyle) {
    let lookup;
    switch (annotStyle) {
      case 'colorBox':
        lookup = this.colorBoxPositions;
        break;
      case 'circleInBox':
        lookup = this.circleInBoxPositions;
        break;
      default:
        return [];
    }
    return lookup;
  }

  getAnnotatedAAs = (pos) => {
    const aaDefs = [];
    for (const lookup of this.aminoAcidsAnnotPositions) {
      const posDef = lookup[pos];
      if (!posDef) {
        continue;
      }
      const [, colorIdx, aas] = posDef;
      const colorGrp = COLORS[colorIdx % COLORS.length];
      for (const idx in aas) {
        const aminoAcid = aas[idx];
        aaDefs.push({
          aminoAcid,
          offsetPixel: this.posAA2Coord(pos, idx),
          color: colorGrp.dark
        });
      }
    }
    return aaDefs;
  }

  isPositionAnnotated = (pos, annotStyle) => {
    const lookup = this.getAnnotPosLookup(annotStyle);
    return pos in lookup;
  }

  getColorIndex = (pos, annotStyle) => {
    const lookup = this.getAnnotPosLookup(annotStyle);
    const posDef = lookup[pos];
    if (posDef) {
      const [, colorIdx] = posDef;
      return colorIdx % COLORS.length;
    }
  }

  getUnderscoreAnnotColorIndex = (annotName) => {
    const {underscoreAnnotColorIndexOffset, underscoreAnnotNames} = this;
    const colorIdx = (
      underscoreAnnotNames.indexOf(annotName) +
      underscoreAnnotColorIndexOffset
    );
    return colorIdx % COLORS.length;
  }

  getStrokeColor = (pos, hovering, annotStyle) => {
    if (hovering) {
      return this.strokeDefaultColorHovering;
    }
    else {
      const colorIdx = this.getColorIndex(pos, annotStyle);
      if (colorIdx !== undefined) {
        return COLORS[colorIdx].dark;
      }
      return this.strokeDefaultColor;
    }
  }

  getRefAAColor = (pos) => {
    if (
      !this.isPositionAnnotated(pos, 'colorBox') &&
      this.isPositionAnnotated(pos, 'circleInBox')
    ) {
      return this.refAALightColor;
    }
    return this.refAADarkColor;
  }

  getBgColor = (pos, hovering, annotStyle) => {
    if (hovering) {
      return this.backgroundDefaultColorHovering;
    }
    else if (annotStyle === 'circleInBox') {
      if (this.isPositionAnnotated(pos, 'colorBox')) {
        return this.circleInBoxLightColor;
      }
      return this.circleInBoxDarkColor;
    }
    else {
      const colorIdx = this.getColorIndex(pos, annotStyle);
      if (colorIdx !== undefined) {
        return COLORS[colorIdx].light;
      }
      return this.backgroundDefaultColor;
    }
  }

  getUnderscoreAnnotColor = (annotName) => {
    const colorIdx = this.getUnderscoreAnnotColorIndex(annotName);
    return COLORS[colorIdx].med;
  }

  updateLegendContext = ({onUpdate}) => {
    const colorBoxAnnotColorIdx = {};
    for (const [, colorIdx, val] of Object.values(this.colorBoxPositions)) {
      colorBoxAnnotColorIdx[val] = colorIdx;
    }
    const colorBoxAnnotColorLookup = {};
    for (let [val, colorIdx] of Object.entries(colorBoxAnnotColorIdx)) {
      colorIdx = colorIdx % COLORS.length;
      colorBoxAnnotColorLookup[val] = {
        stroke: COLORS[colorIdx].dark,
        bg: COLORS[colorIdx].light
      };
    }
    const underscoreAnnotColorLookup = {};
    for (const annotName of this.underscoreAnnotNames) {
      underscoreAnnotColorLookup[annotName] = (
        this.getUnderscoreAnnotColor(annotName)
      );
    }
    onUpdate({
      colorBoxAnnotColorLookup,
      underscoreAnnotColorLookup,
      aminoAcidsCatColorLookup: this.aminoAcidsCatNames.reduce(
        (acc, name, idx) => {
          acc[name] = COLORS[idx % COLORS.length].dark;
          return acc;
        }, {}
      )
    });
  }

}

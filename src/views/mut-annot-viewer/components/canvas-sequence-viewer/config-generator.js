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
    seqFragment,
    colorBoxPositions,
    circleInBoxPositions,
    underscoreAnnotLocations,
    underscoreAnnotNames,
    aminoAcidsAnnotPositions,
    aminoAcidsCatNames,
    aminoAcidsOverrideColors
  }) {
    this.fontFamily = FONT_FAMILY;

    Object.assign(this, {
      sizeName,
      canvasWidthPixel,
      seqFragment,
      colorBoxPositions,
      circleInBoxPositions,
      underscoreAnnotLocations,
      underscoreAnnotNames,
      aminoAcidsAnnotPositions,
      aminoAcidsCatNames,
      aminoAcidsOverrideColors
    });

    const baseSizePixel = BASE_SIZE_PIXEL_MAP[sizeName];
    this.initSizeConfig({
      baseSizePixel
    });
    this.initGridConfig({
      baseSizePixel,
      canvasWidthPixel,
      seqFragment
    });
    this.initAnnotsConfig({
      underscoreAnnotLocations,
      aminoAcidsAnnotPositions
    });
    this.initCanvasConfig({
      seqFragment,
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
      seqFragment,
      colorBoxPositions,
      circleInBoxPositions,
      underscoreAnnotLocations,
      underscoreAnnotNames,
      aminoAcidsAnnotPositions,
      aminoAcidsCatNames,
      aminoAcidsOverrideColors
    } = this;
    return (
      `${sizeName}$$$${canvasWidthPixel}$$$` +
      `${JSON.stringify(seqFragment)}$$$` +
      `${JSON.stringify(colorBoxPositions)}$$$` +
      `${JSON.stringify(circleInBoxPositions)}$$$` +
      `${JSON.stringify(underscoreAnnotNames)}$$$` +
      `${JSON.stringify(underscoreAnnotLocations)}$$$` +
      `${JSON.stringify(aminoAcidsAnnotPositions)}$$$` +
      `${JSON.stringify(aminoAcidsCatNames)}$$$` +
      `${JSON.stringify(aminoAcidsOverrideColors)}$$$`
    );
  }

  initSizeConfig({
    baseSizePixel
  }) {
    const posItemSizePixel = baseSizePixel;
    const horizontalMarginPixel = baseSizePixel / 5;
    const underscoreAnnotHeightPixel = baseSizePixel / 8;
    const underscoreAnnotMarginPixel = baseSizePixel / 8;
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
      posNumFontSizePixel: baseSizePixel / 3,
      hoverTextFontSizePixel: baseSizePixel / 2,

      underscoreAnnotMarginPixel,

      aminoAcidAnnotFontSizePixel: baseSizePixel * 0.45,
      aminoAcidAnnotHeightPixel: baseSizePixel * 0.45,
      aminoAcidAnnotMarginPixel: baseSizePixel / 32
    });
  }

  initGridConfig({canvasWidthPixel, seqFragment}) {
    const {
      posItemOuterWidthPixel
    } = this;
    const [posStart, posEnd] = seqFragment;
    const seqFragmentLen = posEnd - posStart + 1;
    const numCols = Math.floor(
      canvasWidthPixel / posItemOuterWidthPixel
    );
    const numRows = Math.ceil(seqFragmentLen / numCols);
    Object.assign(this, {
      numCols,
      numRows,
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
      aminoAcidAnnotHeightPixel,
      seqFragment: [absPosStart]
    } = this;
    const {matrix: usLocMatrix = []} = underscoreAnnotLocations;
    let underscoreAnnotColorIndexOffset = 0;
    const usOuterSize = (
      underscoreAnnotMarginPixel + underscoreAnnotHeightPixel
    );
    const aaOuterSize = (
      aminoAcidAnnotMarginPixel + aminoAcidAnnotHeightPixel
    );
    const underscoreAnnotOffsetYPixelPerRow = [];
    for (let r = 0; r < numRows; r ++) {
      const posStart = r * numCols + absPosStart;
      const posEnd = (r + 1) * numCols + absPosStart - 1;
      const annotHeightPerPos = new Array(numCols).fill(0);
      for (let pos = posStart; pos <= posEnd; pos ++) {
        const posLocs = usLocMatrix[pos - 1];
        if (posLocs && posLocs.length > 0) {
          annotHeightPerPos[pos - posStart] += posLocs.length * usOuterSize;
        }
      }
      for (const positions of aminoAcidsAnnotPositions) {
        for (const [pos,, aas] of Object.values(positions)) {
          if (pos < posStart) {
            continue;
          }
          else if (pos > posEnd) {
            break;
          }
          if (aas && aas.length > 0) {
            annotHeightPerPos[pos - posStart] += aas.length * aaOuterSize;
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

  initCanvasConfig({seqFragment, underscoreAnnotNames}) {
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
    const [posStart, posEnd] = seqFragment;
    const seqFragmentLen = posEnd - posStart + 1;
    Object.assign(this, {
      canvasHeightPixel: (
        verticalMarginPixel +
        Math.ceil(seqFragmentLen / numCols) *
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
        y: baseSizePixel / 20
      },
      hoverPosNumOffsetPixel: {
        x: 0,
        y: baseSizePixel * -0.2
      },
      hoverUnderscoreAnnotOffsetPixel: {
        x: 0,
        y: baseSizePixel * -0.5
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
      hoverTextColor: '#222',

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

  posRange2CoordPairs = (posStart, posEnd, locIndex) => {
    const {
      numCols,
      posItemSizePixel,
      underscoreAnnotHeightPixel,
      underscoreAnnotMarginPixel,
      seqFragment: [absPosStart, absPosEnd]
    } = this;
    posStart = Math.max(absPosStart, posStart);
    posEnd = Math.min(absPosEnd, posEnd);
    if (posEnd < posStart) {
      return [];
    }
    const coordPairs = [];
    const offsetY = (
      posItemSizePixel + underscoreAnnotMarginPixel +
      locIndex * (underscoreAnnotHeightPixel + underscoreAnnotMarginPixel)
    );
    const endOffsetY = offsetY + underscoreAnnotHeightPixel;
    let startCoord = this.pos2Coord(posStart);
    let endCoord;
    for (
      let breakPos = (
        Math.ceil((posStart - absPosStart + 1) / numCols) *
        numCols + absPosStart - 1
      );
      breakPos < posEnd;
      breakPos += numCols
    ) {
      endCoord = this.pos2Coord(breakPos);
      endCoord.x += posItemSizePixel;
      startCoord.y += offsetY;
      endCoord.y += endOffsetY;
      coordPairs.push({startCoord, endCoord});
      startCoord = this.pos2Coord(breakPos + 1);
    }
    endCoord = this.pos2Coord(posEnd);
    endCoord.x += posItemSizePixel;
    startCoord.y += offsetY;
    endCoord.y += endOffsetY;
    coordPairs.push({startCoord, endCoord});
    return coordPairs;
  };

  posAA2Coord = (pos, aaOffsetIndex) => {
    const {
      posItemSizePixel,
      underscoreAnnotLocations,
      underscoreAnnotHeightPixel,
      underscoreAnnotMarginPixel,
      aminoAcidAnnotHeightPixel,
      aminoAcidAnnotMarginPixel
    } = this;
    const {matrix: usLocMatrix = []} = underscoreAnnotLocations;
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
  };

  pos2Coord = (pos) => {
    const [posStart, posEnd] = this.seqFragment;
    if (!pos || pos < posStart || pos > posEnd) {
      return {};
    }
    const {
      horizontalMarginPixel: hMargin,
      posItemSizePixel: boxSize,
      posItemOffsetYPixelPerRow: offsetYPerRow,
      numCols
    } = this;
    const colNumber0 = (pos - posStart) % numCols;
    const rowNumber0 = Math.floor((pos - posStart) / numCols);
    const x = colNumber0 * (hMargin + boxSize) + hMargin;
    let y = offsetYPerRow[rowNumber0];
    return {x, y};
  };

  coord2UnderscoreAnnot = (x, y) => {
    const {
      posItemSizePixel,
      underscoreAnnotHeightPixel,
      underscoreAnnotMarginPixel,
      underscoreAnnotLocations: {matrix = []}
    } = this;
    const offsetY = posItemSizePixel + underscoreAnnotMarginPixel;
    const usHeight = underscoreAnnotHeightPixel + underscoreAnnotMarginPixel;

    const pos = this.coord2Pos(x, y);
    const posAnnots = matrix[pos - 1] || [];
    const {x: baseX, y: baseY} = this.pos2Coord(pos);
    const relY = y - baseY - offsetY;
    const locIdx = parseInt(relY / usHeight);
    if (locIdx >= 0 && locIdx < posAnnots.length) {
      return {
        annotName: posAnnots[locIdx],
        x: baseX,
        y: baseY + offsetY + locIdx * usHeight
      };
    }
    return {};
  };

  coord2Pos = (x, y) => {
    const {
      canvasWidthPixel: canvasWidth,
      canvasHeightPixel: canvasHeight,
      horizontalMarginPixel: hMargin,
      posItemSizePixel: boxSize,
      posItemOffsetYPixelPerRow: offsetYPerRow,
      seqFragment: [posStart, posEnd],
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

    const pos = rowNumber0 * numCols + colNumber0 + posStart;
    if (pos < posStart) {
      return posStart;
    }
    else if (pos > posEnd) {
      return posEnd;
    }
    return pos;
  };

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
    let globalIdxOffset = 0;
    const {aminoAcidsOverrideColors} = this;
    for (const lookup of this.aminoAcidsAnnotPositions) {
      const posDef = lookup[pos];
      if (!posDef) {
        continue;
      }
      const [, colorIdx, aas] = posDef;
      const colorGrp = COLORS[colorIdx % COLORS.length];
      const color = aminoAcidsOverrideColors[colorIdx] || colorGrp.dark;
      for (let idx = 0; idx < aas.length; idx ++) {
        const aminoAcid = aas[idx];
        aaDefs.push({
          aminoAcid,
          offsetPixel: this.posAA2Coord(pos, idx + globalIdxOffset),
          color
        });
      }
      globalIdxOffset += aas.length;
    }
    return aaDefs;
  };

  isPositionAnnotated = (pos, annotStyle) => {
    const lookup = this.getAnnotPosLookup(annotStyle);
    return pos in lookup;
  };

  getColorIndex = (pos, annotStyle) => {
    const lookup = this.getAnnotPosLookup(annotStyle);
    const posDef = lookup[pos];
    if (posDef) {
      const [, colorIdx] = posDef;
      return colorIdx % COLORS.length;
    }
  };

  getUnderscoreAnnotColorIndex = (annotName) => {
    const {underscoreAnnotColorIndexOffset, underscoreAnnotNames} = this;
    const colorIdx = (
      underscoreAnnotNames.indexOf(annotName) +
      underscoreAnnotColorIndexOffset
    );
    return colorIdx % COLORS.length;
  };

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
  };

  getRefAAColor = (pos) => {
    if (
      !this.isPositionAnnotated(pos, 'colorBox') &&
      this.isPositionAnnotated(pos, 'circleInBox')
    ) {
      return this.refAALightColor;
    }
    return this.refAADarkColor;
  };

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
  };

  getUnderscoreAnnotColor = (annotName) => {
    const colorIdx = this.getUnderscoreAnnotColorIndex(annotName);
    return COLORS[colorIdx].med;
  };

  updateLegendContext = ({onUpdate}) => {
    const {aminoAcidsOverrideColors} = this;
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
      aminoAcidsCatColorLookup: this.aminoAcidsCatNames
        .reduce((acc, name, idx) => {
          acc[name] = (
            aminoAcidsOverrideColors[idx] ||
            COLORS[idx % COLORS.length].dark
          );
          return acc;
        }, {})
    });
  };

}

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
    highlightedPositions,
    annotLevel,
    extraAnnotNames
  }) {
    this.fontFamily = FONT_FAMILY;

    Object.assign(this, {
      sizeName,
      canvasWidthPixel,
      seqLength,
      highlightedPositions,
      annotLevel,
      extraAnnotNames
    });

    const baseSizePixel = BASE_SIZE_PIXEL_MAP[sizeName];
    this.initSizeConfig({baseSizePixel, extraAnnotNames});
    this.initGridConfig({baseSizePixel, canvasWidthPixel, seqLength});
    this.initCoordConfig({baseSizePixel, extraAnnotNames});
    this.initColorConfig({});

    this.extraAnnotColorIndexOffset = 0;
    if (highlightedPositions.length > 0) {
      this.extraAnnotColorIndexOffset = Math.max(
        ...highlightedPositions.map(([, idx]) => idx)
      ) + 1;
    }
  }

  getHash() {
    const {
      sizeName,
      canvasWidthPixel,
      seqLength,
      highlightedPositions,
      annotLevel,
      extraAnnotNames
    } = this;
    return (
      `${sizeName}$$$${canvasWidthPixel}$$$${seqLength}$$$` +
      `${JSON.stringify(highlightedPositions)}$$$${annotLevel}$$$` +
      `${JSON.stringify(extraAnnotNames)}`
    );
  }

  initSizeConfig({baseSizePixel, extraAnnotNames}) {
    const posItemSizePixel = baseSizePixel;
    const horizontalMarginPixel = baseSizePixel / 5;
    const extraAnnotHeightPixel = baseSizePixel / 5;
    const annotMarginPixel = baseSizePixel / 8;
    const verticalMarginPixel = (
      baseSizePixel * 0.2 +
      (annotMarginPixel + extraAnnotHeightPixel) * extraAnnotNames.length
    );

    Object.assign(this, {
      baseSizePixel,
      posItemSizePixel,
      horizontalMarginPixel,
      extraAnnotHeightPixel,
      verticalMarginPixel,

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
      nonHighlightBgPathWidthPixel: baseSizePixel / 5,

      annotStrokeWidthPixel: baseSizePixel / 24,
      annotMarginPixel,
      annotTickLengthPixel: baseSizePixel / 5,
      annotValFontSizePixel: baseSizePixel / 2
    });
  }

  initGridConfig({baseSizePixel, canvasWidthPixel, seqLength}) {
    const numCols = Math.floor(
      canvasWidthPixel / this.posItemOuterWidthPixel
    );
    const numRows = Math.ceil(seqLength / numCols);
    Object.assign(this, {
      numCols, numRows,
      numPosPerPage: numCols * 10,
      canvasHeightPixel: (
        Math.ceil(seqLength / numCols) *
        this.posItemOuterHeightPixel +
        this.verticalMarginPixel
      )
    });
  }

  initCoordConfig({baseSizePixel, extraAnnotNames}) {
    Object.assign(this, {
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
      annotValOffsetPixel: {
        x: this.annotMarginPixel,
        y: - (
          this.annotTickLengthPixel +
          this.annotMarginPixel +
          this.annotValFontSizePixel
        )
      },
      annotValBottomOffsetPixel: {
        x: this.annotMarginPixel,
        y: (
          this.annotTickLengthPixel +
          this.annotMarginPixel * 2
        )
      }
    });
  }

  initColorConfig() {
    Object.assign(this, {
      posNumColor: '#444',
      hoverPosNumColor: '#222',

      strokeDefaultColor: '#ddd',
      strokeDefaultColorHovering: '#777',

      backgroundDefaultColor: '#ddd',
      backgroundDefaultColorHovering: '#ddd',

      selectedStrokeColor: '#235fc5',
      selectedBackgroundColor: 'rgba(35, 95, 197, .1)',

      annotStrokeColor: '#222',
      annotValTextColor: '#111'
    });
  }

  posRange2CoordPairs = (startPos, endPos, annotIndex) => {
    const {
      numCols,
      posItemSizePixel,
      extraAnnotHeightPixel,
      annotMarginPixel
    } = this;
    const coordPairs = [];
    const offsetY = (
      posItemSizePixel + annotMarginPixel + 
      annotIndex * (extraAnnotHeightPixel + annotMarginPixel)
    );
    const endOffsetY = offsetY + extraAnnotHeightPixel;
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

  pos2Coord = (pos) => {
    if (!pos || pos < 1 || pos > this.seqLength) {
      return {};
    }
    const {
      horizontalMarginPixel: hMargin,
      verticalMarginPixel: vMargin,
      posItemSizePixel: boxSize,
      numCols
    } = this;
    const colNumber0 = (pos - 1) % numCols;
    const rowNumber0 = Math.floor((pos - 1) / numCols);
    const x = colNumber0 * (hMargin + boxSize) + hMargin;
    const y = rowNumber0 * (vMargin + boxSize) + 1;
    return {x, y};
  }

  coord2Pos = (x, y) => {
    const {
      canvasWidthPixel: canvasWidth,
      canvasHeightPixel: canvasHeight,
      horizontalMarginPixel: hMargin,
      verticalMarginPixel: vMargin,
      posItemSizePixel: boxSize,
      numCols, numRows
    } = this;
    if (
      x < 0 || x > canvasWidth ||
      y < 0 || y > canvasHeight
    ) {
      return null;
    }
    x += hMargin / 2;
    y += vMargin / 2;
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
    let rowNumber0 = Math.floor((y - vMargin) / (vMargin + boxSize));
    if (rowNumber0 < 0) {
      rowNumber0 = 0;
    }
    else if (rowNumber0 >= numRows) {
      rowNumber0 = numRows - 1;
    }

    const pos = rowNumber0 * numCols + colNumber0 + 1;
    if (pos < 1) {
      return 1;
    }
    else if (pos > this.seqLength) {
      return this.seqLength;
    }
    return pos;
  }

  isPositionHighlighted = (pos) => {
    return this.highlightedPositions.findIndex(([p]) => p === pos) > -1;
  }

  getColorIndex = (pos) => {
    const highlighted = this.highlightedPositions.find(([p]) => p === pos);
    if (highlighted) {
      const [, colorIdx] = highlighted;
      return colorIdx % COLORS.length;
    }
  }

  getExtraAnnotColorIndex = (annotName) => {
    const {extraAnnotColorIndexOffset, extraAnnotNames} = this;
    const colorIdx = (
      extraAnnotNames.indexOf(annotName) +
      extraAnnotColorIndexOffset
    );
    return colorIdx % COLORS.length;
  }

  getStrokeColor = (pos, hovering) => {
    if (hovering) {
      return this.strokeDefaultColorHovering;
    }
    else {
      const colorIdx = this.getColorIndex(pos);
      if (colorIdx !== undefined) {
        return COLORS[colorIdx].dark;
      }
      return this.strokeDefaultColor;
    }
  }

  getBgColor = (pos, hovering) => {
    if (hovering) {
      return this.backgroundDefaultColorHovering;
    }
    else {
      const colorIdx = this.getColorIndex(pos);
      if (colorIdx !== undefined) {
        return COLORS[colorIdx].light;
      }
      return this.backgroundDefaultColor;
    }
  }

  getExtraAnnotColor = (annotName) => {
    const colorIdx = this.getExtraAnnotColorIndex(annotName);
    return COLORS[colorIdx].dark;
  }

}

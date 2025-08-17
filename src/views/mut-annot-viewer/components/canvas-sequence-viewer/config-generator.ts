import {getColorHex} from '../../../../utils/colors';
import type {LegendContextValue} from '../legend-context';

import type {SeqViewerSize} from '../../prop-types';

const BASE_SIZE_PIXEL_MAP: Record<SeqViewerSize, number> = {
  large: 40,
  middle: 32,
  small: 24
};

const FONT_FAMILY = 'Source Sans Pro';

/**
 * Preload fonts used by the canvas sequence viewer to avoid layout
 * shifts when the canvas is first rendered.
 */
export async function preloadFonts(): Promise<void> {
  await document.fonts.load(`bold 16px "${FONT_FAMILY}"`);
  await document.fonts.load(`italic 16px "${FONT_FAMILY}"`);
  await document.fonts.load(`16px "${FONT_FAMILY}"`);
}

/** Options for {@link ConfigGenerator}. */
interface ConfigGeneratorOptions {
  sizeName: SeqViewerSize;
  canvasWidthPixel: number;
  seqFragment: [number, number];
  colorBoxPositions: Record<number, unknown>;
  circleInBoxPositions: Record<number, unknown>;
  underscoreAnnotLocations: any;
  underscoreAnnotNames: string[];
  aminoAcidsAnnotPositions: Record<number, unknown>[];
  aminoAcidsCatNames: string[];
  aminoAcidsOverrideColors: string[];
}

/**
 * Generate rendering configuration for the sequence viewer. The class is a
 * collection of calculated values used throughout the canvas layers. Many of
 * the fields are intentionally typed as `any` while the migration progresses.
 */
export default class ConfigGenerator {

  fontFamily: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;

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
  }: ConfigGeneratorOptions) {
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
      baseSizePixel
    });
    this.initColorConfig();
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

  /**
   * Establish base measurements for sequence viewer elements.
   *
   * @param baseSizePixel - Base pixel unit for layout sizing.
   */
  initSizeConfig({
    baseSizePixel
  }: {baseSizePixel: number}) {
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

  /**
   * Initialize grid dimensions and related counts.
   *
   * @param canvasWidthPixel - Width of the drawing canvas in pixels.
   * @param seqFragment - Inclusive sequence fragment [start, end].
   */
  initGridConfig({canvasWidthPixel, seqFragment}: {canvasWidthPixel: number; seqFragment: [number, number]}) {
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

  /**
   * Calculate offsets for underscore and amino-acid annotations.
   *
   * @param underscoreAnnotLocations - Location matrix for underscore annotations.
   * @param aminoAcidsAnnotPositions - Annotation positions for amino acids.
   */
  initAnnotsConfig({
    underscoreAnnotLocations,
    aminoAcidsAnnotPositions
  }: {underscoreAnnotLocations: {matrix?: unknown[]}; aminoAcidsAnnotPositions: Record<number, unknown>[]}) {
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
        const posLocs = (usLocMatrix[pos - 1] as any[]) || [];
        if (posLocs.length > 0) {
          annotHeightPerPos[pos - posStart] += posLocs.length * usOuterSize;
        }
      }
      for (const positions of aminoAcidsAnnotPositions) {
        for (const [pos,, aas] of Object.values(positions) as Array<[number, unknown, any[]]>) {
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

  /**
   * Compute overall canvas dimensions.
   *
   * @param seqFragment - Inclusive sequence fragment [start, end].
   * @param underscoreAnnotNames - List of underscore annotation names.
   */
  initCanvasConfig({seqFragment, underscoreAnnotNames}: {seqFragment: [number, number]; underscoreAnnotNames: string[]}) {
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
        underscoreAnnotOffsetYPixelPerRow.reduce((sum: number, px: number) => sum + px, 0) +
        verticalMarginPixel +
        underscoreAnnotNames.length * underscoreAnnotOuterSize
      )
    });
  }

  /**
   * Establish coordinate offsets for each grid row.
   *
   * @param baseSizePixel - Base pixel size for layout calculations.
   */
  initCoordConfig({
    baseSizePixel
  }: {baseSizePixel: number}) {
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

  /**
   * Convert a position range into start/end coordinate pairs.
   *
   * @param posStart - Start position.
   * @param posEnd - End position.
   * @param locIndex - Annotation location index.
   * @returns Array of coordinate pair objects.
   */
  posRange2CoordPairs = (posStart: number, posEnd: number, locIndex: number) => {
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

  /**
   * Resolve coordinates for an amino-acid annotation at a position.
   *
   * @param pos - Sequence position.
   * @param aaOffsetIndex - Offset index of the amino acid.
   * @returns Coordinate object.
   */
  posAA2Coord = (pos: number, aaOffsetIndex: number) => {
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

  /**
   * Map a sequence position to x/y coordinates.
   *
   * @param pos - Sequence position.
   * @returns Coordinate object or empty object if out of range.
   */
  pos2Coord = (pos: number): {x?: number; y?: number} => {
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

  coord2UnderscoreAnnot = (x: number, y: number): {annotName?: string; x?: number; y?: number} => {
    const {
      posItemSizePixel,
      underscoreAnnotHeightPixel,
      underscoreAnnotMarginPixel,
      underscoreAnnotLocations: {matrix = []}
    } = this;
    const offsetY = posItemSizePixel + underscoreAnnotMarginPixel;
    const usHeight = underscoreAnnotHeightPixel + underscoreAnnotMarginPixel;

    const pos = this.coord2Pos(x, y);
    if (pos == null) {
      return {};
    }
    const posAnnots = (matrix[pos - 1] as string[]) || [];
    const {x: baseX, y: baseY} = this.pos2Coord(pos) as {x: number; y: number};
    const relY = y - baseY - offsetY;
    const locIdx = Math.floor(relY / usHeight);
    if (locIdx >= 0 && locIdx < posAnnots.length) {
      return {
        annotName: posAnnots[locIdx],
        x: baseX,
        y: baseY + offsetY + locIdx * usHeight
      };
    }
    return {};
  };

  coord2Pos = (x: number, y: number): number | null => {
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

  getAnnotPosLookup(annotStyle: string): Record<number, unknown> {
    let lookup: Record<number, unknown>;
    switch (annotStyle) {
      case 'colorBox':
        lookup = this.colorBoxPositions;
        break;
      case 'circleInBox':
        lookup = this.circleInBoxPositions;
        break;
      default:
        return {} as Record<number, unknown>;
    }
    return lookup;
  }

  /**
   * Retrieve amino-acid annotations for a given position.
   *
   * @param pos - Sequence position.
   * @returns Array of amino acid definitions with colors and offsets.
   */
  getAnnotatedAAs = (pos: number) => {
    const aaDefs: Array<{aminoAcid: string; offsetPixel: {x: number; y: number}; color: string}> = [];
    let globalIdxOffset = 0;
    const {aminoAcidsOverrideColors} = this;
    for (const lookup of this.aminoAcidsAnnotPositions) {
      const posDef = lookup[pos] as [number, number, string[]];
      if (!posDef) {
        continue;
      }
      const [, colorIdx, aas] = posDef;
      const color =
        aminoAcidsOverrideColors[colorIdx] ||
        getColorHex(colorIdx, 'dark');
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

  isPositionAnnotated = (pos: number, annotStyle: string): boolean => {
    const lookup = this.getAnnotPosLookup(annotStyle);
    return pos in lookup;
  };

  getColorIndex = (pos: number, annotStyle: string): number | undefined => {
    const lookup = this.getAnnotPosLookup(annotStyle);
    const posDef = lookup[pos] as [unknown, number, unknown];
    if (posDef) {
      const [, colorIdx] = posDef;
      return colorIdx;
    }
  };

  getUnderscoreAnnotColorIndex = (annotName: string): number => {
    const {underscoreAnnotColorIndexOffset, underscoreAnnotNames} = this;
    const colorIdx = (
      underscoreAnnotNames.indexOf(annotName) +
      underscoreAnnotColorIndexOffset
    );
    return colorIdx;
  };

  getStrokeColor = (pos: number, hovering: boolean, annotStyle: string): string => {
    if (hovering) {
      return this.strokeDefaultColorHovering;
    }
    else {
      const colorIdx = this.getColorIndex(pos, annotStyle);
      if (colorIdx !== undefined) {
        return getColorHex(colorIdx, 'dark');
      }
      return this.strokeDefaultColor;
    }
  };

  /**
   * Get reference amino acid color for a given position.
   * @param pos - Sequence position.
   * @returns Hex color string.
   */
  getRefAAColor = (pos: number): string => {
    if (
      !this.isPositionAnnotated(pos, 'colorBox') &&
      this.isPositionAnnotated(pos, 'circleInBox')
    ) {
      return this.refAALightColor;
    }
    return this.refAADarkColor;
  };

  /**
   * Resolve background color for a position.
   *
   * @param pos - Sequence position.
   * @param hovering - Whether the position is currently hovered.
   * @param annotStyle - Annotation style to consider.
   */
  getBgColor = (pos: number, hovering: boolean, annotStyle: string): string => {
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
        return getColorHex(colorIdx, 'light');
      }
      return this.backgroundDefaultColor;
    }
  };

  /**
   * Get color for underscore annotations.
   *
   * @param annotName - Annotation identifier.
   */
  getUnderscoreAnnotColor = (annotName: string): string => {
    const colorIdx = this.getUnderscoreAnnotColorIndex(annotName);
    return getColorHex(colorIdx, 'med');
  };

  /**
   * Update legend context with calculated color lookups.
   * @param onUpdate - Callback to merge legend colors.
   */
  updateLegendContext = ({onUpdate}: {onUpdate: (opts: Partial<Omit<LegendContextValue, 'onUpdate'>>) => void}): void => {
    const {aminoAcidsOverrideColors} = this;
    const colorBoxAnnotColorIdx: Record<string, number> = {};
      for (const [, colorIdx, val] of Object.values(
        this.colorBoxPositions as Record<number, [number, number, string]>
      ) as [number, number, string][]) {
        colorBoxAnnotColorIdx[val] = colorIdx;
      }
    const colorBoxAnnotColorLookup: Record<string, {stroke: string; bg: string}> = {};
    for (const [val, colorIdx] of Object.entries(colorBoxAnnotColorIdx)) {
      colorBoxAnnotColorLookup[val] = {
        stroke: getColorHex(colorIdx, 'dark'),
        bg: getColorHex(colorIdx, 'light')
      };
    }
    const underscoreAnnotColorLookup: Record<string, string> = {};
    for (const annotName of this.underscoreAnnotNames) {
      underscoreAnnotColorLookup[annotName] = (
        this.getUnderscoreAnnotColor(annotName)
      );
    }
    onUpdate({
      colorBoxAnnotColorLookup,
      underscoreAnnotColorLookup,
      aminoAcidsCatColorLookup: (this.aminoAcidsCatNames as string[])
        .reduce<Record<string, string>>((acc, name, idx) => {
          acc[name] = (
            aminoAcidsOverrideColors[idx] ||
            getColorHex(idx, 'dark')
          );
          return acc;
        }, {})
    });
  };

}

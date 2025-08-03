/**
 * Numeric values that control layout and styling for the
 * sequence reads threshold nomogram components.
 *
 * These constants are separated so that all related dimensions
 * can be shared across components without duplicating numbers.
 */
const constants = {
  paddingV: 20,
  paddingH: 20,
  strokeWidth: 2,
  axisLabelFontSize: 24,
  axisTickSize: 5,
  axisTitleFontSize: 28,
  axisTitlePadding: 4,
  yAxisLabelWidth: 50,
  xAxisLabelHeight: 35,
  axisStrokeWidth: 2,
  xAxisOffsetV: 5,
  yAxisOffsetH: -5,
  actualThresholdRadius: 6,
  actualThresholdArrowLineSize: 25,
  actualThresholdFontSize: 28
} as const;

export default constants;

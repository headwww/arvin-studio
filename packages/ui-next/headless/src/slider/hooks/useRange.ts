import type { SliderProps } from '../Slider';

export default function useRange(
  range?: SliderProps['range'],
): [
  range: boolean,
  rangeEditable: boolean,
  rangeDraggableTrack: boolean,
  minCount: number,
  maxCount?: number,
] {
  if (range === true || !range) {
    return [!!range, false, false, 0];
  }

  const {
    editable = false,
    draggableTrack = false,
    minCount,
    maxCount,
  } = range;

  return [true, editable, !editable && draggableTrack, minCount || 0, maxCount];
}

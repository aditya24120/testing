import { useCallback, useEffect, useRef, useState } from 'react';

type Props = {
  min: number;
  max: number;
  onStartChange: (min: number) => void;
  onEndChange: (max: number) => void;
  stepSize?: number;
  loaded: boolean;
};

const MultiRangeVideoSlider = ({
  min,
  max,
  onStartChange,
  onEndChange,
  stepSize = 0.001,
  loaded
}: Props) => {
  const minValRef = useRef<HTMLInputElement>(null);
  const maxValRef = useRef<HTMLInputElement>(null);
  const range = useRef<HTMLDivElement>(null);
  const [minVal, setMinVal] = useState(min);
  const [maxVal, setMaxVal] = useState(max);

  // Convert to percentage
  const getPercent = useCallback(
    (value: number) => Math.round(((value - min) / (max - min)) * 100),
    [min, max]
  );

  // Set width of the range to decrease from the right side
  useEffect(() => {
    if (minValRef.current) {
      const minPercent = getPercent(+minValRef.current.value);
      const maxPercent = getPercent(maxVal);
      if (range.current) {
        range.current.style.width = `${maxPercent - minPercent}%`;
      }
    }
  }, [maxVal, getPercent]);

  // Set width of the range to decrease from the left side
  useEffect(() => {
    if (maxValRef.current) {
      const minPercent = getPercent(minVal);
      const maxPercent = getPercent(+maxValRef.current.value);

      if (range.current) {
        range.current.style.left = `${minPercent}%`;
        range.current.style.width = `${maxPercent - minPercent}%`;
      }
    }
  }, [minVal, getPercent]);

  if (!loaded) {
    return null;
  }

  return (
    <div className="relative w-full">
      <input
        type="range"
        min={min}
        max={max}
        step={stepSize}
        value={minVal}
        ref={minValRef}
        onChange={(event) => {
          const value = Math.min(+event.target.value, maxVal - 4);
          setMinVal(value);
          onStartChange(value);
          event.target.value = value.toString();
        }}
        className={`thumb thumb-left pointer-events-none absolute top-1 h-0 w-full appearance-none outline-none ${
          minVal > max - 100 ? ' z-30' : 'z-50'
        } `}
      />

      <input
        type="range"
        min={min}
        max={max}
        step={stepSize}
        value={maxVal}
        ref={maxValRef}
        onChange={(event) => {
          const value = Math.max(+event.target.value, minVal + 4);
          setMaxVal(value);
          onEndChange(value);
          event.target.value = value.toString();
        }}
        className={`thumb thumb-right pointer-events-none absolute top-1 z-40 h-0 w-full appearance-none outline-none`}
      />

      <div className="slider relative w-full">
        <div className="slider__track absolute z-10 h-3 w-full rounded-[3px] bg-grey-200" />
        <div ref={range} className="slider__range  absolute z-20 h-3 rounded-[3px] bg-violet" />
        <div className=" absolute w-full">
          <div className="flex justify-between">
            <div className="slider__left-value mt-5 w-2 text-sm font-semibold text-violet">
              {Math.round(minVal * 10) / 10}
            </div>
            <div className="flex w-full justify-evenly">
              {[...new Array(Math.floor(max - 1))].map((_, i) => (
                <div
                  key={i}
                  className={`mt-4 w-[2px] ${(i + 1) % 5 === 0 ? 'h-4' : 'h-2'}   ${
                    Math.floor(minVal) > i
                      ? 'bg-grey-200'
                      : maxVal - 1 < i
                      ? 'bg-grey-200'
                      : 'bg-violet'
                  }`}
                />
              ))}
            </div>

            <div className="slider__right-value mt-5 w-8 text-sm font-semibold text-violet">
              {Math.floor(maxVal * 10) / 10}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default MultiRangeVideoSlider;

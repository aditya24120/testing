import React from 'react';
import ReactDatePicker from 'react-datepicker';
import { ReactDatePickerProps } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { twMerge } from 'tailwind-merge';

type DatepickerProps = ReactDatePickerProps;

function Datepicker(props: DatepickerProps) {
  return (
    <ReactDatePicker
      {...props}
      className={twMerge(
        'rounded border border-grey-200 p-2 font-semibold text-violet shadow-sm outline-none hover:enabled:border-violet hover:enabled:shadow-sm',
        props.className
      )}
    />
  );
}

export default Datepicker;

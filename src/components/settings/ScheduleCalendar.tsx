import React, { Dispatch, SetStateAction, useState } from 'react';
import { BsTrash } from 'react-icons/bs';
import { AiOutlineFieldTime } from 'react-icons/ai';
import DatePicker from 'react-datepicker';
import Modal from 'react-modal';
import 'react-datepicker/dist/react-datepicker.css';
import { trpc } from '../../utils/trpc';
import { useQueryClient } from 'react-query';
import ErrorAlert from '../alert/ErrorAlert';
import { formatTime } from '../../utils/date-time';

// const testData: { [key in Days]: string[] } = {
//   sun: ['10:00'],
//   mon: ['01:00', '13:00'],
//   tue: ['01:00'],
//   wed: ['01:00'],
//   thu: ['01:00'],
//   fri: ['10:00', '12:00', '14:00', '16:00'],
//   sat: ['10:00']
// };

const utcOffset = new Date().getTimezoneOffset();
type Days = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';

function roundToNearest15(date: string | Date = new Date()) {
  const minutes = 15;
  const ms = 1000 * 60 * minutes;
  if (typeof date === 'string') {
    const [eventHours, eventMinutes] = date.split(':');
    const newDate = new Date(new Date().setHours(+eventHours, +eventMinutes));

    return new Date(Math.floor(newDate.getTime() / ms) * ms);
  }

  return new Date(Math.floor(date.getTime() / ms) * ms);
}

const timeString = (date: Date) => {
  return `${date?.getHours()}:${String(date?.getMinutes()).padStart(2, '0')}`;
};

const ScheduleCalendar = ({ days }: { days: { [key in Days]: string[] } }) => {
  const queryClient = useQueryClient();
  const [error, setError] = useState('');

  const {
    mutateAsync: updateSchedulesTimes,
    error: scheduleTimesError,
    isLoading: isScheduleTimesLoading
  } = trpc.useMutation(['setting.updateScheduleTimes'], {
    onSuccess: () => {
      queryClient.invalidateQueries(['user.getAccountsAndSettings']);
    }
  });

  const handleAddEvent = async (day: Days, time: string) => {
    setError('');

    if (days[day].includes(time)) return;
    
    if (days[day].length >= 10) {
      setError('Can not set more than 10 auto-scheduled uploads per day');
      return;
    }

    const newEvents = [...days[day], time].sort();
    await updateSchedulesTimes({
      scheduleDays: { ...days, [day]: [...newEvents] },
      timeOffset: utcOffset
    });
  };

  const handleDeleteEvent = async (day: Days, time: string) => {
    setError('');

    const timeEvents = days[day].filter((item) => item !== time);
    await updateSchedulesTimes({
      scheduleDays: { ...days, [day]: [...timeEvents] },
      timeOffset: utcOffset
    });
  };

  return (
    <>
      <h2 className="mb-1 font-medium leading-none text-violet md:mb-0 md:leading-normal ">
        Click a day to set a time to schedule clips
      </h2>

      {error && <ErrorAlert title="Scheduled Upload Limit Reached" description={<p>{error}</p>} />}

      <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-7">
        {Object.keys(days).map((key, index) => (
          <DayItem
            key={index}
            day={key as Days}
            events={days[key as Days]}
            addEvent={handleAddEvent}
            deleteEvent={handleDeleteEvent}
          />
        ))}
      </div>

      <p className="mt-2 text-sm leading-none text-gray-400 md:leading-normal lg:text-base">
        Clips will upload at the selected day and time each week
      </p>
    </>
  );
};

export default ScheduleCalendar;

const DayItem = ({
  day,
  events,
  addEvent,
  deleteEvent
}: {
  day: Days;
  events: string[];
  addEvent: (day: Days, time: string) => void;
  deleteEvent: (day: Days, time: string) => void;
}) => {
  const [modal, setModal] = useState(false);

  const handleDeleteTime = (time: string) => {
    deleteEvent(day, time);
  };

  return (
    <>
      <div
        className="min-h-[100px] w-full cursor-pointer rounded-b-lg rounded-tl-lg border border-violet px-3 py-4 text-violet shadow shadow-violet/30 md:px-4 md:py-2"
        onClick={() => setModal(true)}
      >
        <div className="text-lg font-semibold capitalize">{day}</div>

        <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
          {events.map((event, index) => (
            <EventItem
              key={index}
              event={formatTime(event)}
              deleteTime={() => handleDeleteTime(event)}
            />
          ))}
        </div>
      </div>

      <EventForm modalOpen={modal} setModalOpen={setModal} day={day} addEvent={addEvent} />
    </>
  );
};

const EventItem = ({ event, deleteTime }: { event: string; deleteTime: () => void }) => {
  return (
    <div className="hover:bg-sidebar group flex items-center justify-between">
      <div>{event}</div>
      <BsTrash className="invisible text-rose-400 group-hover:visible" onClick={deleteTime} />
    </div>
  );
};

type Props = {
  modalOpen: boolean;
  setModalOpen: Dispatch<SetStateAction<boolean>>;
  addEvent: (day: Days, time: string) => void;
  day: Days;
  time?: string;
};

const EventForm = ({ modalOpen, setModalOpen, addEvent, day, time }: Props) => {
  const locale = navigator?.language;
  const [eventTime, setEventTime] = useState(time || timeString(roundToNearest15()));

  return (
    <Modal
      isOpen={modalOpen}
      ariaHideApp={false}
      style={{
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.75)'
        }
      }}
      className="absolute bottom-auto left-1/2 top-1/2 w-fit -translate-x-1/2 -translate-y-1/2 transform rounded-md bg-white px-5 py-3 shadow-inner"
      onRequestClose={() => setModalOpen(false)}
    >
      <div className="flex w-full flex-col items-center gap-4">
        <div className="flex flex-col py-2 ">
          <h1 className="block w-full pr-4 text-3xl">
            <span className="capitalize text-violet">{day}</span>
          </h1>
          <p className="text-gray-400">Clips will upload at the selected day and time each week.</p>
        </div>

        <div className="mb-6 flex items-center justify-center">
          <div className="m-auto mb-2 flex items-center justify-center  gap-2">
            <AiOutlineFieldTime className="h-8 w-8 text-violet " />
            <DatePicker
              selected={roundToNearest15(eventTime)}
              onChange={(date) => {
                if (date) {
                  setEventTime(timeString(date));
                }
              }}
              showTimeSelect
              showTimeSelectOnly
              timeFormat="p"
              timeIntervals={15}
              timeCaption="Time"
              dateFormat="h:mm aa"
              className="rounded border border-grey-300 p-2 text-center font-bold text-violet outline-none"
            />
          </div>
        </div>
      </div>

      <div className={`flex justify-end gap-4`}>
        <button
          disabled={false}
          className="inline-block rounded-b-lg rounded-tl-lg border-2 border-violet px-6 py-1 font-bold text-violet hover:enabled:bg-violet/5 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => setModalOpen(false)}
        >
          Close
        </button>
        <button
          onClick={() => {
            addEvent(day, eventTime);
            setModalOpen(false);
          }}
          className="inline-block rounded-b-lg rounded-tl-lg bg-violet px-6 py-1.5 font-bold text-white hover:enabled:bg-violet/80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save
        </button>
      </div>
    </Modal>
  );
};

import { signOut, useSession } from 'next-auth/react';
import { useContext, useState } from 'react';
import { ClipContext, UserContextState } from '../../context/ClipContext';
import { firstLetterToUppercase } from '../../utils';
import { trpc } from '../../utils/trpc';
import ClipCard from '../ClipCard';
import ClipsSkeleton from './ClipsSkeleton';
import Datepicker from '../common/Datepicker';

import { Session } from 'next-auth';
import { AiOutlineFilter } from 'react-icons/ai';
import FilterModal, { defaultFilters } from './FilterModal';
import { Clip, ClipWithYoutube } from '../../types/types';
import { motion, AnimatePresence } from 'framer-motion';

const defaultStartDate = () => {
  const start = new Date();
  const priorDate = start.setDate(start.getDate() - 14);

  return new Date(priorDate);
};

const getFilterClips = (clips: ClipWithYoutube[], filters: { [key: string]: any }) => {
  const arrayFilters = Object.keys(filters).filter((key) => {
    if (filters[key] === 'all') return false;
    return true;
  });
  const filteredClips = clips.filter((clip: { [key: string]: any }) => {
    for (const key of arrayFilters) {
      if (key === 'status') {
        console.log('status: ', filters[key]);
        if (filters[key] === 'unapproved') {
          if (clip['approved']) {
            return false;
          }
          continue;
        }
        // approved sccheduled uploaded
        if (!clip[filters[key]]) {
          return false;
        }
        continue;
      }
      if (typeof filters[key] === 'number') {
        if (clip[key] < filters[key]) {
          return false;
        }
        continue;
      }
      if (clip[key] === undefined || clip[key] !== filters[key]) {
        return false;
      }
    }
    return true;
  });

  return filteredClips;
};

const UsersClips = ({ grid }: { grid?: string }) => {
  const { data: session, status } = useSession();
  const user = session?.user;
  const [startDate, setStartDate] = useState<Date>(defaultStartDate);
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [selectingDate, setSelectingDate] = useState(true);
  const [dateChanged, setDateChanged] = useState(false);

  const { clips, currentUsername, setUserClips } = useContext(ClipContext) as UserContextState;
  const enabledQuery = selectingDate && (!currentUsername ? true : currentUsername === user?.name);

  const [filters, setFilters] = useState<typeof defaultFilters>(defaultFilters);

  const filteredClips = getFilterClips(clips, filters);

  const {
    data: clipsDB,
    isLoading,
    refetch,
    isFetching
  } = trpc.useQuery(
    ['clip.getUsersClips', { startDate, endDate: endDate!, changed: dateChanged }],
    {
      enabled: enabledQuery,
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        if (data?.noUser) {
          setUserClips([]);
          signOut();
          return;
        }
        if (data?.clips && user) {
          setUserClips(data.clips, user.name!);
        }
      }
    }
  );

  trpc.useQuery(['clip.getUsersLatestClips'], {
    enabled: !dateChanged && enabledQuery && !isLoading,
    onSuccess: (data) => {
      if (data && data.length > 0 && !dateChanged && enabledQuery && !clipsDB?.popularClips) {
        refetch();
      }
    }
  });

  const handleFilterUpdate = (filters: typeof defaultFilters) => {
    setFilters(filters);
  };
  const onDateChange = (dates: [Date | null, Date | null]) => {
    if (!dates) return;
    setSelectingDate(false);
    const [start, end] = dates;

    if (start && !end) {
      setStartDate(start);
      setEndDate(null);
    }
    if (end) {
      setSelectingDate(true);
      setDateChanged(true);
      setEndDate(end);
    }
  };

  if (status === 'loading') return null;
  if ((isLoading || (isFetching && clipsDB?.clips.length === 0)) && user) {
    return <ClipsSkeleton />;
  }

  if (currentUsername && filteredClips.length > 0) {
    return (
      <>
        <div className="flex flex-col items-center justify-between md:flex-row">
          <ClipHeader
            currentUsername={currentUsername}
            user={user}
            refreshClips={refetch}
            popularClips={clipsDB?.popularClips ?? false}
          />

          {currentUsername === user?.name && (
            <ClipFilters
              startDate={startDate}
              endDate={endDate}
              onDateChange={onDateChange}
              isLoading={isLoading}
              clips={clips}
              filters={filters}
              handleFilterUpdate={handleFilterUpdate}
            />
          )}
        </div>

        <motion.div
          layout
          className={`clips-card mt-6 grid w-full ${
            grid ? grid : 'grid-cols-1 gap-8 pb-16 md:grid-cols-2 lg:grid-cols-5 xl:grid-cols-5'
          }`}
        >
          <AnimatePresence>
            {filteredClips &&
              filteredClips
                .slice(0, 200)
                .map((clip, index) => (
                  <ClipCard key={clip.twitch_id} clip={clip} popular={clipsDB?.popularClips} />
                ))}
          </AnimatePresence>
        </motion.div>
      </>
    );
  }

  // todo: needs refactored by composition with the above if/return statement branch
  if (!isLoading && filteredClips?.length === 0 && currentUsername) {
    return (
      <>
        <div className="flex items-center justify-between">
          <ClipHeader
            currentUsername={currentUsername}
            user={user}
            refreshClips={refetch}
            popularClips={clipsDB?.popularClips ?? false}
          />

          {currentUsername === user?.name && (
            <ClipFilters
              startDate={startDate}
              endDate={endDate}
              onDateChange={onDateChange}
              isLoading={isLoading}
              clips={clips}
              filters={filters}
              handleFilterUpdate={handleFilterUpdate}
            />
          )}
        </div>
        <div className="text-violet">No recent clips found.</div>
      </>
    );
  }
  return null;
};

interface IFilters {
  startDate: Date;
  onDateChange: (dates: [Date | null, Date | null]) => void;
  isLoading: boolean;
  endDate: Date | null;
  clips: Clip[];
  filters: typeof defaultFilters;
  handleFilterUpdate: (filters: typeof defaultFilters) => void;
}

const ClipFilters = ({
  startDate,
  onDateChange,
  isLoading,
  endDate,
  filters,
  handleFilterUpdate
}: IFilters) => {
  const [filtersOpen, setFiltersOpen] = useState<boolean>(false);
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setFiltersOpen(true)}
        className="inline-block rounded-b-lg rounded-tl-lg border border-grey-200 p-2.5 font-bold text-violet hover:enabled:border-violet hover:enabled:shadow-md"
      >
        <AiOutlineFilter className="h-5 w-5" />
      </button>

      <Datepicker
        selected={startDate}
        // @ts-expect-error react-datepicker props are typed incorrectly
        onChange={onDateChange}
        dateFormat="PPy"
        disabled={isLoading}
        startDate={startDate}
        endDate={endDate}
        // @ts-expect-error react-datepicker props are typed incorrectly
        selectsRange
        wrapperClassName=""
      />

      <FilterModal
        modalOpen={filtersOpen}
        setModalOpen={setFiltersOpen}
        filters={filters}
        updateFilters={handleFilterUpdate}
      />
    </div>
  );
};

interface IHeader {
  currentUsername: string;
  user: Session['user'];
  refreshClips: () => Promise<any>;
  popularClips: boolean;
}

const ClipHeader = ({ currentUsername, user, refreshClips, popularClips }: IHeader) => {
  return (
    <div className="align-center flex w-full flex-wrap items-center gap-4">
      <h1 className="mb-2 flex items-center text-xl font-bold text-violet lg:text-4xl">
        {firstLetterToUppercase(currentUsername)}&rsquo;s most{' '}
        {popularClips && currentUsername === user?.name ? 'popular' : 'recent'} clips
      </h1>

      {user && currentUsername != user.name && (
        <button
          className="inline-block h-min rounded-b-lg rounded-tl-lg bg-violet px-1 py-1 text-sm font-bold text-white hover:enabled:bg-violet-600"
          onClick={() => refreshClips()}
        >
          My Clips
        </button>
      )}
    </div>
  );
};
export default UsersClips;

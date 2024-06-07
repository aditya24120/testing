import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { trpc } from '../../utils/trpc';
import ClipsSkeleton from './ClipsSkeleton';

import 'react-datepicker/dist/react-datepicker.css';
import SelectClipCard from './SelectClipCard';
import { Clip } from '../../types/types';
import ErrorAlert from '../alert/ErrorAlert';

const defaultStartDate = () => {
  const start = new Date();
  const priorDate = start.setDate(start.getDate() - 14);

  return new Date(priorDate);
};

const SelectClip = ({
  grid,
  setSelectedClip
}: {
  grid?: string;
  setSelectedClip: (clip: Clip) => void;
}) => {
  const { data: session, status } = useSession();
  const user = session?.user;
  const [startDate, setStartDate] = useState<Date>(defaultStartDate);
  const [endDate, setEndDate] = useState<Date>(new Date());

  if (status === 'loading' || !user) {
    return null;
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="mb-2 flex items-center text-2xl font-bold capitalize text-violet">
          {user?.name ? `${user.name}'s clips` : 'Most recent clips'}
        </h1>
      </div>

      <UsersClipsList startDate={startDate} endDate={endDate} setSelectedClip={setSelectedClip} />
    </>
  );
};

export default SelectClip;

type UsersClipsListProps = {
  startDate: Date;
  endDate: Date;
  setSelectedClip: (clip: Clip) => void;
};

const UsersClipsList = (props: UsersClipsListProps) => {
  const userClipsQuery = trpc.useQuery(
    ['clip.getClipsByUserId', { startDate: props.startDate, endDate: props.endDate }],
    {
      staleTime: Infinity,
      cacheTime: 0
    }
  );

  if (userClipsQuery.isLoading || userClipsQuery.isFetching) {
    return <ClipsSkeleton />;
  }

  if (userClipsQuery.isError) {
    return (
      <ErrorAlert
        title="Error"
        description={<p>An error has occurred while loading your clips</p>}
      />
    );
  }

  if (userClipsQuery.data == null || userClipsQuery.data.length == 0) {
    return <span className="text-grey-400">No clips found</span>;
  }

  return (
    <div className="flex flex-col gap-2 md:max-w-6xl md:flex-row md:flex-wrap">
      {userClipsQuery.data.slice(0, 50).map((clip, index) => (
        <SelectClipCard key={index} clip={clip} setSelectedClip={props.setSelectedClip} />
      ))}
    </div>
  );
};

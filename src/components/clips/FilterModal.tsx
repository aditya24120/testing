import { useCallback, useContext, useState } from 'react';
import Modal from 'react-modal';
import { Dispatch, SetStateAction } from 'react';
import Select from '../form/Select';
import NumberInput from '../form/NumberInput';
import { trpc } from '../../utils/trpc';
import { ClipContext, UserContextState } from '../../context/ClipContext';
import { FaUndo } from 'react-icons/fa';
import SecondaryButton from '../common/SecondaryButton';
import PrimaryButton from '../common/PrimaryButton';

type ClipFilters = 'game_id' | 'creator_name' | 'view_count' | 'status';

export const defaultFilters: { [key in ClipFilters]: any } = {
  game_id: 'all',
  creator_name: 'all',
  view_count: 0,
  status: 'all'
};

const customStyles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)'
  }
};

const statuses = [
  { value: 'approved', label: 'Approved' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'uploaded', label: 'uploaded' },
  { value: 'unapproved', label: 'Unapproved' }
];

type Props = {
  modalOpen: boolean;
  setModalOpen: Dispatch<SetStateAction<boolean>>;
  filters: typeof defaultFilters;
  updateFilters: (filters: typeof defaultFilters) => void;
};

const FilterModal = ({ modalOpen, setModalOpen, filters, updateFilters }: Props) => {
  const { clips } = useContext(ClipContext) as UserContextState;
  const [formFilters, setformFilters] = useState(filters);

  const creators = useCallback(
    () =>
      Array.from(
        new Set([
          ...clips
            .filter((clip) => {
              if (formFilters.game_id === 'all') return true;
              if (formFilters.game_id === clip.game_id) return true;
              return false;
            })
            .map((clip) => clip.creator_name)
        ])
      ).map((name) => {
        return { value: name, label: name };
      }),
    [formFilters.game_id, clips]
  );

  //setting games id and labels
  const uniqueIds = Array.from(new Set([...clips.map((clip) => clip.game_id)]));
  const { data: gameIdsFromTwitch, isLoading } = trpc.useQuery(['games.getGamesByIds', uniqueIds], {
    enabled: uniqueIds.length !== 0
  });

  const gameIds = gameIdsFromTwitch
    ? gameIdsFromTwitch.map((game) => {
        return { value: game.id, label: game.name };
      })
    : [];

  const handleOnUpdate = (fieldName: string, value: string | number | boolean) => {
    if (['approved', 'scheduled', 'uplaoded'].includes(fieldName)) {
      setformFilters({ ...filters, [fieldName]: value });
    } else {
      setformFilters({ ...filters, [fieldName]: value });
    }
  };

  const handleSubmit = () => {
    updateFilters(formFilters);
    setModalOpen(false);
  };

  const resetFilters = () => {
    updateFilters(defaultFilters);
    setformFilters(defaultFilters);
    setModalOpen(false);
  };

  return (
    <Modal
      isOpen={modalOpen}
      ariaHideApp={false}
      onRequestClose={() => setModalOpen(false)}
      style={customStyles}
      className="absolute bottom-auto left-1/2 top-1/2 w-full -translate-x-1/2 -translate-y-1/2 transform rounded-md bg-white p-4 shadow-inner md:w-1/2"
    >
      <div className="mb-3 flex w-full flex-col items-center md:mb-6">
        <label className="block w-full pr-4 text-xl font-bold text-violet md:text-2xl">
          Filter Clips
        </label>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Select
          id="game_id"
          label="Game Category"
          defaultValue={formFilters.game_id}
          options={[{ value: 'all', label: 'All' }, ...gameIds]}
          onUpdate={(fieldName, value) => handleOnUpdate(fieldName, value)}
        />
        <Select
          id="creator_name"
          label="Creator Name"
          defaultValue={formFilters.creator_name}
          options={[{ value: 'all', label: 'All' }, ...creators()]}
          onUpdate={(fieldName, value) => handleOnUpdate(fieldName, value)}
        />

        <NumberInput
          id={'view_count'}
          label="Min Views"
          min={0}
          value={formFilters.view_count}
          onUpdate={(fieldName, value) => handleOnUpdate(fieldName, value)}
        />
        <Select
          id="status"
          label="Status"
          defaultValue={formFilters.status}
          options={[{ value: 'all', label: 'All' }, ...statuses]}
          onUpdate={(fieldName, value) => handleOnUpdate(fieldName, value)}
        />
        <div className="lg:col-span-2" />
      </div>

      <div className={`flex justify-between gap-4`}>
        <SecondaryButton onClick={resetFilters} aria-label="Undo" className="px-2">
          <FaUndo className="h-4 w-4" />
        </SecondaryButton>

        <div className="flex gap-4">
          <SecondaryButton onClick={() => setModalOpen(false)}>Cancel</SecondaryButton>
          <PrimaryButton onClick={handleSubmit}>Apply Filters</PrimaryButton>
        </div>
      </div>
    </Modal>
  );
};

export default FilterModal;

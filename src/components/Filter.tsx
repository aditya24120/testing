import { Dispatch, SetStateAction } from 'react';

type Props = {
  sort: number;
  setSort: Dispatch<SetStateAction<number>>;
};
const Filter = ({ sort, setSort }: Props) => {
  return (
    <div className="filter-container mt-2 ">
      <button
        className={`mr-3 min-w-[4rem] cursor-pointer rounded-2xl border-2 border-none border-blue-500 bg-white px-1 py-1 font-bold text-blue-500 hover:bg-blue-500 hover:text-slate-50  ${
          sort === -1 ? 'bg-blue-500 text-slate-50' : ''
        }`}
        onClick={() => setSort(-1)}
      >
        Latest
      </button>
      <button
        className={`mr-3 min-w-[5rem] cursor-pointer rounded-2xl border-2 border-none border-blue-500 bg-white px-1 py-1 font-bold text-blue-500 hover:bg-blue-500 hover:text-slate-50   ${
          sort === 1 ? 'bg-blue-500 text-slate-50' : ''
        }`}
        onClick={() => setSort(1)}
      >
        Oldest
      </button>
    </div>
  );
};
export default Filter;

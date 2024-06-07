import { AiOutlineSchedule } from 'react-icons/ai';
import { FaTiktok, FaYoutube } from 'react-icons/fa';
import { FiVideo } from 'react-icons/fi';

const SkeletonLoader = () => {
  const skeleton = [1, 2, 3, 4, 5];
  const skeleton2 = [7, 8, 9];
  return (
    <>
      <div className="flex justify-between">
        <h2 className="text-4xl text-white">Dashboard - Loading...</h2>
      </div>
      <section className="mt-10 grid grid-cols-2 gap-12 ">
        <div className=" flex flex-col gap-4  rounded-md border border-border px-4 py-4">
          <h2 className="flex items-center gap-2 text-2xl">
            <AiOutlineSchedule className="h-6 w-6" /> Scheduled Clips
          </h2>

          {skeleton.map((s, index) => (
            <SkeletonClipList key={index} scheduled={true} />
          ))}
        </div>
        <div className=" flex flex-col gap-4  rounded-md border border-border px-4 py-4">
          <h2 className="flex items-center gap-2 text-2xl">
            <FiVideo className="h-6 w-6" /> Uploaded Clips
          </h2>

          {skeleton2.map((s, index) => (
            <SkeletonClipList key={index} />
          ))}
        </div>
      </section>
    </>
  );
};

const SkeletonClipList = ({ scheduled = false }: { scheduled?: boolean }) => {
  return (
    <div
      className={`grid animate-pulse grid-cols-6 items-center justify-between gap-2 border-b  border-border/20 py-2`}
    >
      <div className="h-4 w-full rounded bg-border/70 text-sm "></div>
      <div className={`${scheduled ? 'col-span-3' : 'col-span-4'} flex items-center gap-2`}>
        <div className="flex w-full flex-col gap-2">
          <h3 className="h-4 w-full rounded bg-border/70"></h3>
          <div className="h-4 w-4/5 rounded bg-gray-400"></div>
        </div>
      </div>
      <div className="flex items-center justify-center gap-4">
        <FaYoutube className={`h-10 w-10 text-red-500 grayscale`} />

        <FaTiktok className={`h-10 w-10 text-white opacity-30`} />
      </div>
      {scheduled && (
        <div className="flex flex-col items-center">
          <button className="border-navy-80 inline-block cursor-default rounded-b-lg rounded-tl-lg border-2 py-1 px-6 text-xs font-bold text-white">
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};
export default SkeletonLoader;

import Link from 'next/link';
import { cutTextToLength } from '../utils';
import { ClipWithYoutube } from '../types/types';
import TimeAgo from 'react-timeago';
import { FaPencilAlt, FaUsers } from 'react-icons/fa';
import { FiCrop } from 'react-icons/fi';
import { motion } from 'framer-motion';
import ReactTooltip from 'react-tooltip';
import { BiTime } from 'react-icons/bi';

const ClipCard = ({ clip, popular = false }: { clip: ClipWithYoutube; popular?: boolean }) => {
  const clipStatus =
    clip.approved && clip.uploaded
      ? 'Uploaded'
      : clip.approved && clip.scheduled
      ? 'Scheduled'
      : clip.approved
      ? 'Approved'
      : 'Unapproved';

  return (
    <>
      <ReactTooltip place="top" />
      <motion.div
        animate={{ opacity: 1 }}
        initial={{ opacity: 0 }}
        exit={{ opacity: 0 }}
        layout
        className="flex h-full justify-center opacity-90 hover:opacity-100"
      >
        <div className="bg-sidebar max-w-sm rounded-lg shadow-lg">
          <div className="relative">
            <img
              className="aspect-video rounded-lg"
              src={clip.thumbnail_url}
              alt=""
              width={480}
              height={272}
            />
            <div className="z-1 absolute top-0 w-full  rounded-t-lg bg-black bg-opacity-50">
              <div className="px-2 text-white">{cutTextToLength(clip.title, 30)}</div>
            </div>

            {!popular && (
              <div
                className={`z-1 absolute top-6 rounded-br-lg text-white ${
                  clipStatus !== 'Unapproved' ? 'bg-violet bg-opacity-80' : 'bg-black bg-opacity-60'
                }`}
              >
                <div className={`w-full px-2 text-xs `}>{clipStatus}</div>
              </div>
            )}

            <motion.div
              whileHover={{ opacity: [0, 1] }}
              transition={{
                duration: 0.3,
                ease: 'easeInOut',
                staggerChildren: 0.5
              }}
              className="absolute top-0 h-full w-full rounded-lg bg-black bg-opacity-0 hover:bg-opacity-50"
            >
              <div className="flex h-full w-full items-center justify-center gap-6 opacity-0 hover:opacity-100">
                <Link href={`/clips/${clip.twitch_id}`}>
                  <div
                    data-tip={'Upload Clip'}
                    data-effect="solid"
                    data-multiline="true"
                    data-class="tooltip"
                    className="rounded-full bg-black p-4 transition delay-75 ease-linear hover:scale-90 active:scale-75"
                  >
                    <FiCrop className="h-8 w-8 p-1" />
                  </div>
                </Link>
                <Link href={`/clips/approve/${clip.twitch_id}`}>
                  <div
                    data-tip={'Approve Clip'}
                    data-effect="solid"
                    data-multiline="true"
                    data-class="tooltip"
                    className="rounded-full bg-black p-4 transition delay-75 ease-linear hover:scale-90 active:scale-75"
                  >
                    <FaPencilAlt className="h-8 w-8 p-1 " />
                  </div>
                </Link>
              </div>
            </motion.div>
            <div className=" absolute bottom-0 right-0 w-full rounded-b-lg bg-black bg-opacity-50 ">
              <div className="flex items-center justify-between px-2 text-white">
                <TimeAgo date={clip.created_at} className="text-xs" />
                <div className="flex space-x-6">
                  {clip.duration && clip.duration > 0 && (
                    <span className=" flex items-center justify-center gap-1">
                      <BiTime />
                      {Math.floor(clip.duration)}s
                    </span>
                  )}

                  <span className=" flex items-center justify-center gap-1">
                    <FaUsers />
                    {clip.view_count}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};
export default ClipCard;

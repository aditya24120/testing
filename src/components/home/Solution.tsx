import { motion, useAnimation } from 'framer-motion';
import { useEffect } from 'react';
import { BiRocket } from 'react-icons/bi';
import { BsDroplet } from 'react-icons/bs';
import { FiEdit } from 'react-icons/fi';
import MotionWrap from '../MotionWrapper';
import { useInView } from 'react-intersection-observer';

const Solution = () => {
  const controls = useAnimation();
  const [ref, inView] = useInView();
  useEffect(() => {
    if (inView) {
      controls.start('visible');
    } else {
      controls.set('hidden');
      controls.stop();
    }
  }, [controls, inView]);

  return (
    <section id="solution" className="m-4 font-semibold  md:m-8">
      <div className="container relative mx-auto my-6 space-y-6 p-4 text-center">
        <div className="blob absolute left-1/3 top-1/2 hidden h-96 w-96 rotate-90 scale-[200%] bg-gradient-to-t from-slushi-500 to-transparent opacity-20 md:block" />

        <div className="relative mb-4 inline-block rounded-2xl bg-white px-6 py-2 font-bold text-violet opacity-100 shadow-md">
          Solution
        </div>

        <h2 className="mx-auto text-4xl font-bold text-violet-300 md:text-5xl lg:w-2/3">
          <span className="text-violet">Expand</span> Your Reach with Vertical Twitch Clips
        </h2>

        <p className="mx-auto text-lg text-violet-400 lg:w-2/3">
          Looking to grow your community on other social media platforms? Our app allows you to
          easily convert your Twitch clips into vertical videos, perfect for platforms like YouTube
          and TikTok. Say goodbye to the hassle of manually editing and reposting your content. With
          our app, expanding your reach has never been easier.
        </p>
      </div>

      <motion.div
        ref={ref}
        variants={{
          hidden: { opacity: 1, scale: 0 },
          visible: {
            opacity: 1,
            scale: 1,
            transition: {
              delayChildren: 0.3,
              staggerChildren: 0.2
            }
          }
        }}
        initial="hidden"
        animate={controls}
        className="container mx-auto grid auto-rows-fr justify-center gap-8 py-4 text-violet-400  sm:grid-cols-1 md:grid-cols-2 md:px-20 lg:grid-cols-3"
      >
        <motion.div
          variants={{
            hidden: { y: 20, opacity: 0 },
            visible: {
              y: 0,
              opacity: 1
            }
          }}
          className="group relative"
        >
          <div className="absolute left-8 top-0 z-10 origin-[0] -translate-y-6">
            <span
              className={`bg-primary inline-block rounded-xl border border-violet-200 p-2 text-rose-600/70 shadow-md group-hover:scale-110 group-hover:transition group-hover:duration-200 
                  group-hover:ease-linear
                 md:border-2`}
            >
              <BsDroplet className="h-10 w-10" />
            </span>
          </div>

          <div className="h-full space-y-2 rounded-md border border-violet-200 px-10 py-16 shadow group-hover:-translate-y-1 group-hover:shadow-xl group-hover:transition group-hover:duration-75 group-hover:ease-linear md:border-2 ">
            <h2 className="text-xl font-bold group-hover:text-violet ">No Watermarks</h2>
            <p className="">
              Our app guarantees no watermarks on your rendered videos, no matter your plan. Your
              clips remain truly yours
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={{
            hidden: { y: 20, opacity: 0 },
            visible: {
              y: 0,
              opacity: 1
            }
          }}
          className="group relative"
        >
          <div className="absolute left-8 top-0 z-10 origin-[0] -translate-y-6  ">
            <span
              className={`bg-primary inline-block rounded-xl border border-violet-200 p-2 text-rose-600/70 shadow-md group-hover:scale-110 group-hover:transition group-hover:duration-200 
                  group-hover:ease-linear
                 md:border-2`}
            >
              <FiEdit className="h-10 w-10" />
            </span>
          </div>
          <div className="h-full space-y-2 rounded-md border border-violet-200 px-10 py-16 shadow group-hover:-translate-y-1 group-hover:shadow-xl group-hover:transition group-hover:duration-75 group-hover:ease-linear md:border-2 ">
            <h2 className="text-xl font-bold group-hover:text-violet">Easy to use</h2>
            <p className="">
              Effortlessly edit your clips with no editing skills required. Simply select a template
              and crop your content, and you are ready to go!
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={{
            hidden: { y: 20, opacity: 0 },
            visible: {
              y: 0,
              opacity: 1
            }
          }}
          className="group relative"
        >
          <div className="absolute left-8 top-0 z-10 origin-[0] -translate-y-6  ">
            <span
              className={`bg-primary inline-block rounded-xl border border-violet-200 p-2 text-rose-600/70 shadow-md group-hover:scale-110 group-hover:transition group-hover:duration-200 
                  group-hover:ease-linear
                 md:border-2`}
            >
              <BiRocket className="h-10 w-10" />
            </span>
          </div>
          <div className="h-full space-y-2 rounded-md border border-violet-200 px-10 py-16 shadow group-hover:-translate-y-1 group-hover:shadow-xl group-hover:transition group-hover:duration-75 group-hover:ease-linear md:border-2 ">
            <h2 className="text-xl font-bold  group-hover:text-violet">Discoverability</h2>
            <p className="">
              Unlock the full potential of your content with our app. 70% of discovery comes from
              outside of Twitch, our app helps you expand your reach and grow your community beyond
              the platform.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};
// export default Solution;
export default MotionWrap(Solution, 'mt-20');

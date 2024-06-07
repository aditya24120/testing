import FaqItem from './FaqItem';
import { questions } from '../utils/faqQuestions';
import MotionWrap from './MotionWrapper';
import { motion, useAnimation } from 'framer-motion';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import Circles from './Circles';

const Faq = () => {
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
    <div className="relative overflow-hidden">
      <div className="blob absolute right-0 hidden h-96 w-96  rotate-90 scale-[200%] bg-gradient-to-l from-slushi-500/70 to-rose-500/20 opacity-30 md:block" />

      <section id="faq" className="mt-16">
        <div className="container mx-auto items-center text-center ">
          <div className="relative z-10 mb-8 inline-block rounded-2xl bg-white px-6 py-2 font-bold text-violet shadow-md">
            FAQ
          </div>

          <h2 className="mb-6 text-center text-3xl font-bold text-violet md:text-4xl">
            Frequently Asked Questions
          </h2>

          <p className="mx-auto max-w-lg px-6 text-center text-violet-400">
            Here are some of our FAQs. If you have any other questions you would like answered,
            please feel free to contact us.
          </p>
        </div>
      </section>

      <motion.section
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
        id="faq-accordion"
        className="relative z-10 overflow-hidden"
      >
        <div className="container mx-auto mb-32  px-6">
          <div className="relative m-8 mx-auto max-w-2xl ">
            <Circles classes=" absolute top-0 -right-6 opacity-10 hidden md:block" />
            <Circles classes=" absolute top-4 -left-12 rotate-12 opacity-10 hidden md:block" />
            <Circles classes=" absolute -bottom-20 left-1/2 rotate-45 opacity-10 hidden md:block" />

            {questions?.map(({ question, answer }, index) => (
              <FaqItem key={index} question={question} answer={answer} />
            ))}
          </div>
        </div>
      </motion.section>

      <div className="blob absolute left-1/3 top-64 hidden h-96 w-96 rotate-90  scale-[200%] bg-gradient-to-tr from-slushi-500/70 to-rose-500/20 opacity-30 md:block" />
    </div>
  );
};
export default MotionWrap(Faq);

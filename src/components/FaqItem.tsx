import { motion } from 'framer-motion';

export type FAQ = {
  question: string;
  answer: string;
};
const FaqItem = ({ question, answer }: FAQ) => {
  return (
    <motion.div
      variants={{
        hidden: { y: 20, opacity: 0 },
        visible: {
          y: 0,
          opacity: 1
        }
      }}
      className="group border-b py-1 outline-none"
      tabIndex={1}
    >
      <div className="ease group flex cursor-pointer items-center justify-between py-3 text-violet-400 transition duration-500">
        <div className="ease font-semibold transition duration-500 group-hover:text-violet group-focus:text-violet">
          {question}
        </div>

        <div className="ease transition duration-500 group-focus:-rotate-180 group-focus:text-violet">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="12">
            <path fill="none" stroke="currentColor" strokeWidth="3" d="M1 1l8 8 8-8" />
          </svg>
        </div>
      </div>

      <div className="ease max-h-0 overflow-hidden rounded p-2 transition duration-500 group-focus:max-h-screen group-focus:bg-slate-50/30">
        <p className="py-2 text-justify text-violet-400">{answer}</p>
      </div>
    </motion.div>
  );
};
export default FaqItem;

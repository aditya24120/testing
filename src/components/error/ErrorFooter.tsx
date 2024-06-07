import Link from 'next/link';
import { useState } from 'react';
import ReportBug from '../ReportBug';

const ErrorFooter = () => {
  const [model, setModel] = useState(false);
  return (
    <>
      <ReportBug modalOpen={model} setModalOpen={setModel} />
      <div className="space-x-12">
        <Link href={'/'}>
          <div className="inline-block rounded-b-lg rounded-tl-lg border-2 border-border bg-border py-3 px-6  font-bold text-black hover:bg-border/80 disabled:cursor-not-allowed disabled:opacity-50">
            HOME
          </div>
        </Link>
        <button
          onClick={() => setModel(true)}
          className="border-navy-80 inline-block rounded-b-lg rounded-tl-lg border-2 py-3 px-6 font-bold text-white hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Contact Us
        </button>
      </div>
    </>
  );
};
export default ErrorFooter;

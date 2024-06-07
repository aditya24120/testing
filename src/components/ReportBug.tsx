import { useState } from 'react';
import Modal from 'react-modal';
import { Dispatch, SetStateAction } from 'react';
import { toast } from 'react-toastify';
import { User } from '@prisma/client';
import { DefaultSession } from 'next-auth';
import ErrorAlert from './alert/ErrorAlert';
import SecondaryButton from './common/SecondaryButton';
import PrimaryButton from './common/PrimaryButton';

const customStyles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)'
  }
};

const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

type Props = {
  modalOpen: boolean;
  setModalOpen: Dispatch<SetStateAction<boolean>>;
  user?: DefaultSession['user'];
};
const ReportBug = ({ modalOpen, setModalOpen, user }: Props) => {
  const [reportText, setReportText] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<boolean>(false);

  const isValid = (): boolean => {
    setError(false);
    let valid: boolean = true;

    //empty string
    if (!reportText) {
      valid = false;
    }
    // incorrect url
    if (reportText.length < 5) {
      valid = false;
    }

    //email checke
    if (!user && !emailRegex.test(email)) {
      valid = false;
    }

    if (!valid) setError(true);

    return valid;
  };

  const handleSubmit = async () => {
    const valid = isValid();
    if (valid) {
      const body = { description: reportText, email: user ? user.email : email };
      const res = await fetch(`/api/reportBug`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.status !== 200) {
        toast.error('Report failed. Please try again or contact admin.');
        return;
      }
      setModalOpen(false);
      setReportText('');
      setEmail('');
      toast.success('Bug has been reported, thank you!');
    }
  };

  return (
    <Modal
      isOpen={modalOpen}
      ariaHideApp={false}
      style={customStyles}
      className="absolute bottom-auto left-1/2 top-1/2 w-full -translate-x-1/2 -translate-y-1/2 transform rounded-md bg-white p-4 shadow-inner md:w-1/2"
    >
      <div className="mb-3 flex w-full flex-col items-center md:mb-6">
        <label className="block w-full pr-4 text-2xl font-bold text-violet">Report a bug</label>
        <p className="mb-4 mt-2 w-full text-gray-400">
          Whats happening? Write as much as possible to explain your issue.
        </p>

        {error && (
          <ErrorAlert
            title="Invalid email"
            description={<p>Please input a valid email and a description of your issue.</p>}
            className="w-full"
          />
        )}

        {user && (
          <div className="mb-6 w-full">
            <label htmlFor="email" className="text-xl font-bold text-violet">
              Email
            </label>

            <input
              id="email"
              placeholder="example@example.com"
              value={email || ''}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full appearance-none rounded border border-grey-200 px-4 py-2 leading-tight text-violet placeholder-gray-300 focus-within:border-violet focus:outline-none"
            />
          </div>
        )}

        <div className="w-full ">
          <label htmlFor="reportBug" className="text-xl font-bold text-violet">
            Description
          </label>

          <textarea
            id="reportBug"
            value={reportText || ''}
            onChange={(e) => setReportText(e.target.value)}
            rows={4}
            style={{ minHeight: '100px' }}
            className="mt-1 w-full appearance-none rounded border border-grey-200 px-4 py-2 leading-tight text-violet placeholder-gray-300 focus-within:border-violet focus:outline-none"
            placeholder="Nothing is happening"
          />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <SecondaryButton onClick={() => setModalOpen(false)}>Cancel</SecondaryButton>
        <PrimaryButton onClick={handleSubmit}>Submit</PrimaryButton>
      </div>
    </Modal>
  );
};
export default ReportBug;

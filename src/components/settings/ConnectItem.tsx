import { useState } from 'react';

type Props = {
  icon: JSX.Element | null;
  label: string;
  blurb: string;
  providers?: string[];
  provider?: 'youtube' | 'tiktok' | 'instagram';
  username?: string;
  accountLoading: boolean;
  isLoading: boolean;
  isSubbed?: boolean;
  handleDisconnect?: (platform: 'youtube' | 'tiktok' | 'instagram') => Promise<void>;
  handleConnect: () => void;
};
const ConnectItem = ({
  icon,
  label,
  blurb,
  providers,
  provider,
  username,
  accountLoading,
  isLoading,
  isSubbed,
  handleConnect,
  handleDisconnect
}: Props) => {
  const [buttonDisabled, setButtonDisabled] = useState(false);

  return (
    <div className="border-border flex w-full flex-col items-center justify-between rounded-lg border px-4 py-2 lg:flex-row lg:px-6 lg:py-4">
      <div className="flex w-full flex-col md:gap-4 lg:flex-row lg:items-center">
        <div className="hidden lg:block">{icon}</div>
        <div className="mb-2 flex flex-col lg:mb-0">
          <h1 className="flex items-center gap-2 text-xl font-semibold text-violet md:text-2xl">
            <span className="lg:hidden">{icon}</span>
            {label}
          </h1>

          <p className="text-xs text-gray-400 md:text-base">{blurb}</p>
          {provider === 'instagram' && <p className="font-semibold text-violet-300">Coming soon</p>}
          {providers && provider && providers.includes(provider) && (
            <p className="font-semibold text-violet">
              {username ? `Connected to ${username}` : 'Connected'}
            </p>
          )}
        </div>
      </div>

      {providers && provider && providers.includes(provider) ? (
        <button
          disabled={accountLoading || isLoading}
          className={`inline-block w-full rounded-b-lg rounded-tl-lg border-2 border-violet px-6 py-1 font-bold text-violet transition-colors hover:enabled:bg-violet hover:enabled:text-white hover:enabled:shadow-md disabled:cursor-not-allowed disabled:opacity-50 lg:w-auto ${
            isLoading ? 'animate-pulse' : ''
          }`}
          onClick={() => {
            if (handleDisconnect) {
              handleDisconnect(provider);
            }
          }}
        >
          {isLoading ? 'Loading...' : 'Disconnect'}
        </button>
      ) : (
        <button
          disabled={accountLoading || isLoading || buttonDisabled || provider === 'instagram'}
          className={`inline-block w-full rounded-b-lg rounded-tl-lg border-2 border-violet px-6 py-1 font-bold text-violet transition-colors hover:enabled:bg-violet hover:enabled:text-white hover:enabled:shadow-md disabled:cursor-not-allowed disabled:opacity-50 lg:w-auto ${
            isLoading ? 'animate-pulse' : ''
          }`}
          onClick={() => {
            setButtonDisabled(true);
            handleConnect();
            setTimeout(() => {
              setButtonDisabled(false);
            }, 300);
          }}
        >
          {isSubbed && (isLoading ? 'Loading...' : 'Manage')}
          {typeof isSubbed === 'boolean' && !isSubbed && (isLoading ? 'Loading...' : 'Upgrade')}
          {typeof isSubbed !== 'boolean' && !isSubbed && (isLoading ? 'Loading...' : 'Connect')}
        </button>
      )}
    </div>
  );
};
export default ConnectItem;

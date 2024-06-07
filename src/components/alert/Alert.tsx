type AlertProps = { title: string; description: React.ReactNode; className?: string };

const Alert = (props: AlertProps) => {
  return (
    <div className={`mb-2 rounded-lg p-2 text-sm ${props.className || ''}`} role="alert">
      <div className="flex items-center">
        <svg
          className="inline h-5 w-5"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          ></path>
        </svg>

        <span className="ml-2 text-base font-bold leading-6">{props.title}</span>
      </div>

      <div className="ml-7 break-words leading-6">{props.description}</div>
    </div>
  );
};

export default Alert;

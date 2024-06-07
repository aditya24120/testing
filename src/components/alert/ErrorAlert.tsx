import Alert from './Alert';

type ErrorAlertProps = { title?: string; description: React.ReactNode; className?: string };

const ErrorAlert = (props: ErrorAlertProps) => {
  return (
    <Alert
      title={props.title ?? 'Error'}
      description={props.description}
      className={`bg-rose-200 text-rose-700 ${props.className ?? ''}`}
    />
  );
};

export default ErrorAlert;

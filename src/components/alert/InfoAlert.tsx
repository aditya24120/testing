import Alert from './Alert';

type InfoAlertProps = { title?: string; description: React.ReactNode; className?: string };

const InfoAlert = (props: InfoAlertProps) => {
  return (
    <Alert
      title={props.title ?? 'Info'}
      description={props.description}
      className={`bg-grey-100 text-violet ${props.className ?? ''}`}
    />
  );
};

export default InfoAlert;

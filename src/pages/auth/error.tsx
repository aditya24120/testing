import { useRouter } from 'next/router';
import { createElement, useEffect, useState } from 'react';
import AuthNoEmail from '../../components/error/AuthNoEmail';
import DefaultAuthError from '../../components/error/DefaultAuthError';
import Layout from '../../components/Layout';
import NoStateFound from '../../components/upload/NoStateFound';
import { errorStates } from '../../utils/errorStates';

const Error = () => {
  const router = useRouter();
  const { error } = router.query;

  const [state, setState] = useState(errorStates.DEFAULT);

  useEffect(() => {
    if (!error) return;
    if (error == 'NoEmail') {
      setState(errorStates.NO_EMAIL);
    }
  }, [error]);

  const stateToComp = {
    [errorStates.DEFAULT]: DefaultAuthError,
    [errorStates.NO_EMAIL]: AuthNoEmail
  };
  return <Layout>{createElement(stateToComp[state] || NoStateFound)}</Layout>;
};
export default Error;

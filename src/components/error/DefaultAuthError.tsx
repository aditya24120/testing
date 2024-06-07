import Link from 'next/link';
import ErrorFooter from './ErrorFooter';

const DefaultAuthError = () => {
  return (
    <section className=" m-auto  -mt-16 flex h-screen items-center justify-center md:-mt-24">
      <div className="m-auto flex  w-9/12 items-center justify-center py-16">
        <div className="overflow-hidden bg-sidebar pb-8 shadow-md sm:rounded-lg">
          <div className="border-t border-sidebar/20 px-12 pt-8 text-center">
            <h1 className="text-9xl font-bold text-border">401</h1>
            <h1 className="py-8 text-6xl font-medium text-white">Authentication failed!</h1>
            <p className="px-12 pb-8 text-2xl font-medium text-gray-200">
              Oops! Something went wrong.
            </p>
            <ErrorFooter />
          </div>
        </div>
      </div>
    </section>
  );
};
export default DefaultAuthError;

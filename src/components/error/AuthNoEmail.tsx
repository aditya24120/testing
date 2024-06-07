import ErrorFooter from './ErrorFooter';

const AuthNoEmail = () => {
  return (
    <section className=" m-auto  -mt-16 flex h-screen items-center justify-center md:-mt-24">
      <div className="m-auto flex  w-9/12 items-center justify-center py-16 ">
        <div className="overflow-hidden bg-sidebar pb-8 shadow-md sm:rounded-lg">
          <div className="border-t border-sidebar/20 px-12 pt-8 text-center">
            <h1 className="text-9xl font-bold text-border">400</h1>
            <h1 className="py-6 text-6xl font-medium text-white">Authentication failed!</h1>
            <p className="pb-8  text-lg text-gray-200">
              <span className="text-2xl font-medium text-border">Email not set!</span> Please set
              your email on twitch under settings then security and privacy tab
              <a
                href="https://www.twitch.tv/settings/security"
                className="text-border"
                target="_blank"
                rel="noreferrer"
              >
                {' '}
                here
              </a>
            </p>
            <ErrorFooter />
          </div>
        </div>
      </div>
    </section>
  );
};
export default AuthNoEmail;

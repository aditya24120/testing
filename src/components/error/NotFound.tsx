const NotFound = () => {
  return (
    <section className=" m-auto  -mt-16 flex h-screen items-center justify-center md:-mt-24">
      <div className="m-auto flex  w-9/12 items-center justify-center py-16">
        <div className="overflow-hidden bg-sidebar pb-8 shadow sm:rounded-lg">
          <div className="border-t border-sidebar/20 pt-8 text-center">
            <h1 className="text-9xl font-bold text-border">404</h1>
            <h1 className="py-8 text-6xl font-medium text-white">oops! Page not found</h1>
            <p className="px-12 pb-8 text-2xl font-medium text-gray-200">
              Oops! The page you are looking for does not exist. It might have been moved or
              deleted.
            </p>
            <div className="space-x-12">
              <button className="inline-block rounded-b-lg rounded-tl-lg border-2 border-border bg-border py-3 px-6  font-bold text-black hover:bg-border/80 disabled:cursor-not-allowed disabled:opacity-50">
                HOME
              </button>
              <button className="border-navy-80 inline-block rounded-b-lg rounded-tl-lg border-2 py-3 px-6 font-bold text-white hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50">
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default NotFound;

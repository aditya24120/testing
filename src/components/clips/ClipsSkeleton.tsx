import Image from 'next/image';

const skeleton = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const ClipsSkeleton = () => {
  return (
    <>
      <div className="align-center flex items-center gap-4">
        <h1 className="mb-4 text-2xl font-bold text-violet">Searching for clips...</h1>
      </div>

      <div className="clips-card grid w-full animate-pulse grid-cols-1 gap-8 pb-16 md:grid-cols-2 lg:grid-cols-6 xl:grid-cols-6">
        {skeleton.map((s, index) => (
          <div
            key={index}
            className="flex h-full w-full justify-center rounded-lg opacity-90 hover:opacity-100"
          >
            <div className="max-w-sm flex-1 rounded-lg bg-white shadow-lg">
              <div className="relative aspect-square h-28 w-full">
                <Image
                  className="h-auto max-w-full rounded-t-lg object-contain grayscale"
                  src="/assets/images/defaultClipImage.png"
                  alt=""
                  layout="fill"
                  objectFit="cover"
                />
              </div>

              <div className="rounded-b-lg bg-white p-4">
                <div className="mb-2 h-2 w-1/3 rounded-lg bg-gray-400" />
                <h5 className="bg-border/70  mb-2 h-4 w-full rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
export default ClipsSkeleton;

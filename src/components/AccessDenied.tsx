import { signIn } from 'next-auth/react';

export default function AccessDenied() {
  return (
    <>
      <h1>Access Denied</h1>
      <p>
        <a
          href={`/api/auth/signin/twitch`}
          onClick={(e) => {
            e.preventDefault();
            signIn('twitch', { callbackUrl: `/clips` });
          }}
          className="px-8 py-2 text-white bg-purple-700 border-2 border-purple-700 rounded-lg shadow-md hover:bg-purple-700/80 hover:border-purple-700/80 transition ease-in-out active:scale-90 duration-75"
        >
          Login
        </a>
      </p>
    </>
  );
}

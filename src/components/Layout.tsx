import { useEffect, useState } from 'react';
import Navbar from './Navbar';
// import Footer from './Footer'

export default function Layout({ children }: { children: React.ReactNode }) {
  const [scrollY, setScrollY] = useState<boolean>(false);
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY >= 28);
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen overflow-hidden scroll-smooth bg-white">
      <header
        className={`fixed left-0 top-0 z-20 w-full bg-white transition duration-100 ease-in ${
          scrollY ? 'bg-white/80' : 'bg-transparent'
        }`}
      >
        <Navbar />
      </header>
      <main className="mt-16 md:mt-24">{children}</main>
      {/* <footer>Footer</footer> */}
    </div>
  );
}

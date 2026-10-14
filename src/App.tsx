import { Home } from './pages/Home';
import { Contact } from './pages/Contact';
import { ComingSoon } from './pages/ComingSoon';
import { ShopDataProvider } from './context/ShopData';
import { Preloader } from './components/ui/Preloader';

// shortcut: a few fixed pages, so a path check instead of a router; add react-router if pages get parameters.
const path = window.location.pathname.replace(/\/+$/, '');
// Arriving at a section (/#men, from another page's menu) skips the intro, which locks scrolling.
const showIntro = !window.location.hash;

export function App() {
  if (path === '/contact') return <Contact />;
  if (path === '/men' || path === '/kids') return <ComingSoon collection={path === '/men' ? 'men' : 'kids'} />;
  return (
    <>
      {showIntro && <Preloader />}
      <ShopDataProvider>
        <Home />
      </ShopDataProvider>
    </>
  );
}

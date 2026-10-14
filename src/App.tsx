import { Home } from './pages/Home';
import { Contact } from './pages/Contact';
import { ShopDataProvider } from './context/ShopData';
import { Preloader } from './components/ui/Preloader';

// shortcut: one extra page, so a path check instead of a router; add react-router if more pages come.
const isContact = window.location.pathname.replace(/\/+$/, '') === '/contact';
// Arriving at a section (/#men, from the contact page's menu) skips the intro, which locks scrolling.
const showIntro = !window.location.hash;

export function App() {
  if (isContact) return <Contact />;
  return (
    <>
      {showIntro && <Preloader />}
      <ShopDataProvider>
        <Home />
      </ShopDataProvider>
    </>
  );
}

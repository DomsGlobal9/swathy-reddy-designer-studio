import { Home } from './pages/Home';
import { ShopDataProvider } from './context/ShopData';
import { Preloader } from './components/ui/Preloader';

export function App() {
  return (
    <>
      <Preloader />
      <ShopDataProvider>
        <Home />
      </ShopDataProvider>
    </>
  );
}

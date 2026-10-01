import { Home } from './pages/Home';
import { ShopDataProvider } from './context/ShopData';

export function App() {
  return (
    <ShopDataProvider>
      <Home />
    </ShopDataProvider>
  );
}

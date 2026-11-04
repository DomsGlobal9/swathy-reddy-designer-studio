import { Home } from './pages/Home';
import { Contact } from './pages/Contact';
import { ComingSoon } from './pages/ComingSoon';
import { NotFound } from './pages/NotFound';
import { BlogIndex } from './pages/BlogIndex';
import { BlogPostPage } from './pages/BlogPostPage';
import { ShopDataProvider } from './context/ShopData';
import { Preloader } from './components/ui/Preloader';

// Route parser
const rawPath = window.location.pathname.replace(/\/+$/, '');
const isBlogIndex = rawPath === '/blog' || rawPath === '/blogs';
const isBlogPost = rawPath.startsWith('/blog/');
const blogSlug = isBlogPost ? rawPath.replace(/^\/blog\//, '').replace(/\.html$/, '') : '';

// Arriving at a section (/#men, from another page's menu) skips the intro, which locks scrolling.
const showIntro = !window.location.hash && (rawPath === '' || rawPath === '/index.html');

export function App() {
  if (rawPath === '/contact') return <Contact />;
  if (rawPath === '/men' || rawPath === '/kids') return <ComingSoon collection={rawPath === '/men' ? 'men' : 'kids'} />;
  if (isBlogIndex) return <BlogIndex />;
  if (isBlogPost && blogSlug) return <BlogPostPage slug={blogSlug} />;
  if (rawPath !== '' && rawPath !== '/index.html') return <NotFound />;
  return (
    <>
      {showIntro && <Preloader />}
      <ShopDataProvider>
        <Home />
      </ShopDataProvider>
    </>
  );
}

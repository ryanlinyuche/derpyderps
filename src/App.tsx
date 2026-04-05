import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import AdminPage from './pages/AdminPage';
import AboutPage from './pages/AboutPage';
import StickerDetailPage from './pages/StickerDetailPage';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import { CartProvider } from './context/CartContext';
import { DataProvider } from './context/DataContext';

export default function App() {
  return (
    <DataProvider>
      <CartProvider>
        <BrowserRouter>
          <div className="min-h-screen" style={{ background: '#DEF1FF' }}>
            <Navbar />
            <CartDrawer />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/category/:id" element={<CategoryPage />} />
              <Route path="/sticker/:id" element={<StickerDetailPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </div>
        </BrowserRouter>
      </CartProvider>
    </DataProvider>
  );
}

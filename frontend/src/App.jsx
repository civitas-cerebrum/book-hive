import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import BookDetailPage from './pages/BookDetailPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import MarketplacePage from './pages/MarketplacePage';
import CreateListingPage from './pages/CreateListingPage';
import ProfilePage from './pages/ProfilePage';
import styles from './styles/layout.module.css';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <div className={styles.layout}>
              <Sidebar />
              <TopBar />
              <main className={styles.main}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/books/:id" element={<BookDetailPage />} />
                  <Route path="/marketplace" element={<MarketplacePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
                  <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                  <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
                  <Route path="/marketplace/sell" element={<ProtectedRoute><CreateListingPage /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                  <Route path="*" element={
                    <div style={{padding: '2rem', textAlign: 'center'}}>
                      <h1>Page Not Found</h1>
                      <p>The page you're looking for doesn't exist.</p>
                      <a href="/">Go Home</a>
                    </div>
                  } />
                </Routes>
              </main>
            </div>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

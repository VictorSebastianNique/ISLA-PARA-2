import { useAlert } from '../context/AlertContext';
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useEscapeKey } from '../hooks/useEscapeKey';
import CustomSelect from '../components/CustomSelect';
import { ShoppingCart, Search, User, ChevronLeft, Plus, Minus, X, Check, MapPin, Star, QrCode, ArrowRight, LogOut, Coffee, Pizza, Croissant, CakeSlice, CreditCard, Banknote, Smartphone, Clock, Sparkles, Gift, TrendingUp, ChefHat, Truck, Store, Phone, Tag, BellRing } from 'lucide-react';
import PageHeader from '../components/PageHeader';

// --- Helper: Category visual mapping ---
const CAT_THEMES = {
  cafe:    { gradient: 'linear-gradient(135deg, #8B4513, #D2691E)', icon: Coffee,    emoji: '☕' },
  postre:  { gradient: 'linear-gradient(135deg, #FF69B4, #FF1493)', icon: CakeSlice, emoji: '🍰' },
  pan:     { gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', icon: Croissant, emoji: '🥐' },
  bebida:  { gradient: 'linear-gradient(135deg, #00BFFF, #1E90FF)', icon: Coffee,    emoji: '🥤' },
  pizza:   { gradient: 'linear-gradient(135deg, #ef4444, #dc2626)', icon: Pizza,     emoji: '🍕' },
  default: { gradient: 'linear-gradient(135deg, var(--primary-color), var(--warning-color))', icon: ChefHat, emoji: '🍽️' },
};

const getCatTheme = (catName) => {
  const n = (catName || '').toLowerCase();
  if (n.includes('cafe') || n.includes('café') || n.includes('caliente')) return CAT_THEMES.cafe;
  if (n.includes('postre') || n.includes('dulce') || n.includes('torta')) return CAT_THEMES.postre;
  if (n.includes('pan') || n.includes('desayuno') || n.includes('ensalada')) return CAT_THEMES.pan;
  if (n.includes('bebida') || n.includes('frio') || n.includes('jugo')) return CAT_THEMES.bebida;
  if (n.includes('pizza') || n.includes('salado')) return CAT_THEMES.pizza;
  return CAT_THEMES.default;
};

// --- Confetti Component ---
const Confetti = () => {
  const colors = ['#ff6b2b', '#10d990', '#fbbf24', '#6366f1', '#ff4d6d', '#38bdf8', '#f472b6'];
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999, overflow: 'hidden' }}>
      {Array.from({ length: 40 }).map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: '-5%',
          left: `${Math.random() * 100}%`,
          width: `${6 + Math.random() * 8}px`,
          height: `${6 + Math.random() * 8}px`,
          backgroundColor: colors[i % colors.length],
          borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          animation: `confettiFall ${2 + Math.random() * 3}s linear ${Math.random() * 2}s forwards`,
          opacity: 0.9,
        }} />
      ))}
    </div>
  );
};

// --- Glassmorphism Card helper ---
const glassCard = (extra = {}) => ({
  background: 'rgba(255,255,255,0.04)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '1.25rem',
  ...extra,
});

// --- Level badge theming ---
const LEVEL_THEMES = {
  Bronce:  { bg: 'linear-gradient(135deg, #cd7f32, #b8860b)', glow: 'rgba(205,127,50,0.4)' },
  Plata:   { bg: 'linear-gradient(135deg, #c0c0c0, #a8a8a8)', glow: 'rgba(192,192,192,0.4)' },
  Oro:     { bg: 'linear-gradient(135deg, #ffd700, #f59e0b)', glow: 'rgba(255,215,0,0.4)' },
  Platino: { bg: 'linear-gradient(135deg, #e5e4e2, #bfc1c2)', glow: 'rgba(229,228,226,0.4)' },
};

export default function CustomerApp() {
  const { showAlert } = useAlert();
  const navigate = useNavigate();
  const { locations, menu, categories, subcategories, customers, addCustomer, orders, setOrders, updateCustomerPoints, updateOrderStatus, menuStatus, registerOnlineSale, promotions } = useStore();

  const [currentScreen, setCurrentScreen] = useState('login');
  const [loggedCustomer, setLoggedCustomer] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState('');

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [selectedSubcat, setSelectedSubcat] = useState('all');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState(null);

  useEscapeKey(() => {
    if (isCartOpen) setIsCartOpen(false);
    if (pendingItem) setPendingItem(null);
  });

  const [deliveryMethod, setDeliveryMethod] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [yapePhone, setYapePhone] = useState('');
  const [yapeOp, setYapeOp] = useState('');
  const [cardNum, setCardNum] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [receiptType, setReceiptType] = useState('boleta');
  const [docNum, setDocNum] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [fiscalAddress, setFiscalAddress] = useState('');
  const [payingOrderId, setPayingOrderId] = useState(null);
  const [pendingItem, setPendingItem] = useState(null);
  const [itemQty, setItemQty] = useState('1');
  const [itemDetails, setItemDetails] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scannedTable, setScannedTable] = useState('');

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const savedId = localStorage.getItem('customerId');
    if (savedId && customers) {
      const c = customers.find(x => x.id === savedId);
      if (c) { setLoggedCustomer(c); setCurrentScreen('dashboard'); }
    }
  }, [customers]);

  const myActiveOrders = useMemo(() => {
    if (!loggedCustomer || !orders) return [];
    return orders.filter(o => o.customerId === loggedCustomer.id && o.status !== 'completed' && o.status !== 'cancelled').sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [orders, loggedCustomer]);

  const applicablePromotions = useMemo(() => {
    if (!loggedCustomer || !promotions) return [];
    return promotions.filter(p => p.isActive && p.targetLevels.includes(loggedCustomer.level));
  }, [promotions, loggedCustomer]);

  useEffect(() => {
    if (applicablePromotions.length > 0 && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    const lastCount = parseInt(localStorage.getItem('promoCount') || '0');
    if (applicablePromotions.length > lastCount) {
      showAlert('¡Tienes nuevas promociones exclusivas!', 'success');
      if (Notification.permission === 'granted') {
        new Notification('¡Nueva Promoción en Cafetería!', {
          body: applicablePromotions[applicablePromotions.length - 1].title,
          icon: '/favicon.svg'
        });
      }
    }
    localStorage.setItem('promoCount', applicablePromotions.length.toString());
  }, [applicablePromotions.length]);

  // === AUTH ===
  const handleAuth = (e) => {
    e.preventDefault();
    setAuthError('');
    if (!phone || !pin) return setAuthError('Por favor completa todos los campos.');
    if (authMode === 'login') {
      const existing = customers?.find(c => c.phone === phone && c.pin === pin);
      if (existing) {
        setLoggedCustomer(existing); localStorage.setItem('customerId', existing.id); setCurrentScreen('dashboard');
      } else { setAuthError('Celular o PIN incorrectos. Si no tienes cuenta, regístrate.'); }
    } else {
      if (!name) return setAuthError('Por favor ingresa tu nombre.');
      if (customers?.find(c => c.phone === phone)) return setAuthError('Este número ya está registrado. Inicia sesión.');
      const newCustomer = { id: Date.now().toString(), name, phone, pin, points: 0, level: 'Bronce', totalSpent: 0 };
      addCustomer(newCustomer); setLoggedCustomer(newCustomer); localStorage.setItem('customerId', newCustomer.id); setCurrentScreen('dashboard');
    }
  };

  const handleLogout = () => { setLoggedCustomer(null); localStorage.removeItem('customerId'); setCurrentScreen('login'); setCart([]); };

  const handleSimulateScan = () => {
    if (!scannedTable) return;
    setScanning(true);
    setTimeout(() => { setScanning(false); updateCustomerPoints(loggedCustomer.id, 10); showAlert(`¡Check-in exitoso en la Mesa ${scannedTable}! Has ganado 10 puntos.`); setScannedTable(''); setCurrentScreen('dashboard'); }, 1500);
  };

  const filteredMenu = useMemo(() => {
    return menu.filter(item => {
      if (item.active === false) return false;
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
      if (selectedCat === 'daily') {
        return matchesSearch && item.isDailyMenu;
      }
      const matchesCat = selectedCat === 'all' || item.categoryId === selectedCat;
      const matchesSubcat = selectedSubcat === 'all' || item.subcategoryId === selectedSubcat;
      // Si está en 'all', ocultamos el menú del día para que no se mezcle, o lo mostramos? Lo mostramos es mejor.
      return matchesSearch && matchesCat && matchesSubcat;
    });
  }, [menu, search, selectedCat, selectedSubcat]);

  const handleOpenItemModal = (item) => { setPendingItem(item); setItemQty(''); setItemDetails(''); };
  const appendQty = (num) => { if (itemQty.length < 3) setItemQty(prev => prev + num); };
  const clearQty = () => setItemQty('');
  const confirmAddItem = () => {
    const qty = parseInt(itemQty) || 1;
    setCart(prev => {
      const ex = prev.find(i => i.item.id === pendingItem.id && i.details === itemDetails);
      if (ex) return prev.map(i => (i.item.id === pendingItem.id && i.details === itemDetails) ? { ...i, quantity: i.quantity + qty } : i);
      return [...prev, { item: pendingItem, quantity: qty, details: itemDetails }];
    });
    setPendingItem(null);
  };
  const removeFromCart = (id, details = '') => {
    setCart(prev => {
      const ex = prev.find(i => i.item.id === id && (i.details || '') === details);
      if (!ex) return prev;
      if (ex.quantity > 1) return prev.map(i => (i.item.id === id && (i.details || '') === details) ? { ...i, quantity: i.quantity - 1 } : i);
      return prev.filter(i => !(i.item.id === id && (i.details || '') === details));
    });
  };
  const incrementCartItem = (id, details = '') => {
    setCart(prev => prev.map(i => (i.item.id === id && (i.details || '') === details) ? { ...i, quantity: i.quantity + 1 } : i));
  };

  const cartSubTotal = cart.reduce((sum, i) => sum + (i.item.price * i.quantity), 0);

  const discountAmount = useMemo(() => {
    if (!selectedPromo) return 0;
    if (selectedPromo.discountType === 'percentage') {
      return cartSubTotal * (selectedPromo.discountValue / 100);
    }
    if (selectedPromo.discountType === 'fixed') {
      return Math.min(cartSubTotal, parseFloat(selectedPromo.discountValue || 0));
    }
    if (selectedPromo.discountType === '2x1') {
      let pairsDiscount = 0;
      cart.forEach(c => {
        const pairs = Math.floor(c.quantity / 2);
        pairsDiscount += pairs * c.item.price;
      });
      return Math.min(cartSubTotal, pairsDiscount);
    }
    return 0; // free_delivery handled separately if needed
  }, [selectedPromo, cartSubTotal, cart]);

  const cartTotal = Math.max(0, cartSubTotal - discountAmount);

  // === CHECKOUT FLOW ===
  const startCheckout = () => { setIsCartOpen(false); setCurrentScreen('checkout_method'); };
  const handleDeliverySelect = (method) => { setDeliveryMethod(method); if (method === 'recojo') setCurrentScreen('checkout_payment'); };
  const submitDeliveryOrder = (e) => {
    e.preventDefault();
    if (!deliveryAddress) return showAlert('Ingresa tu dirección');
    const newOrder = { id: Date.now().toString(), type: 'delivery', locationId: selectedLocation.id, items: cart, subTotal: cartSubTotal, discount: discountAmount, appliedPromo: selectedPromo ? selectedPromo.id : null, total: cartTotal, status: 'pending_approval', customerId: loggedCustomer.id, customerName: loggedCustomer.name, customerPhone: loggedCustomer.phone, address: deliveryAddress, timestamp: new Date().toISOString() };
    setOrders(prev => [...(prev || []), newOrder]); setCart([]); setSelectedPromo(null); setCurrentScreen('checkout_success');
  };
  const submitPaidOrder = (e) => {
    if (e) e.preventDefault();
    if ((paymentMethod === 'yape' || paymentMethod === 'izipay') && receiptType === 'factura') {
      if (!docNum || !razonSocial || !fiscalAddress) return showAlert('Para factura, por favor completa RUC, Razón Social y Dirección Fiscal.');
    }
    const paymentData = { method: paymentMethod, yapePhone: paymentMethod === 'yape' ? yapePhone : null, yapeOp: paymentMethod === 'yape' ? yapeOp : null, cardNum: paymentMethod === 'izipay' ? cardNum.slice(-4) : null, receipt: paymentMethod !== 'cash' ? { type: receiptType, docNum, razonSocial, fiscalAddress } : null };
    const isPaid = paymentMethod === 'yape' || paymentMethod === 'izipay';
    const pointsGained = Math.floor(cartTotal * 0.5);
    updateCustomerPoints(loggedCustomer.id, pointsGained, cartTotal);
    const newOrder = { id: Date.now().toString(), type: 'recojo', locationId: selectedLocation.id, items: cart, subTotal: cartSubTotal, discount: discountAmount, appliedPromo: selectedPromo ? selectedPromo.id : null, total: cartTotal, status: 'pending', customerId: loggedCustomer.id, customerName: loggedCustomer.name, customerPhone: loggedCustomer.phone, paymentData, receiptEmitted: isPaid, timestamp: Date.now() };
    if (isPaid) registerOnlineSale(newOrder);
    setOrders(prev => [...(prev || []), newOrder]); setCart([]); setSelectedPromo(null); setCurrentScreen('checkout_success');
  };
  const handlePayApprovedDelivery = (orderId, method) => {
    if ((method === 'yape' || method === 'izipay') && receiptType === 'factura') {
      if (!docNum || !razonSocial || !fiscalAddress) return showAlert('Para factura, por favor completa RUC, Razón Social y Dirección Fiscal.');
    }
    const orderToPay = orders.find(o => o.id === orderId);
    if (!orderToPay) return;
    const pointsGained = Math.floor(orderToPay.total * 0.5);
    updateCustomerPoints(loggedCustomer.id, pointsGained, orderToPay.total);
    const isPaid = method === 'yape' || method === 'izipay';
    const paymentData = { method, yapePhone: method === 'yape' ? yapePhone : null, yapeOp: method === 'yape' ? yapeOp : null, cardNum: method === 'izipay' ? cardNum.slice(-4) : null, receipt: isPaid ? { type: receiptType, docNum, razonSocial, fiscalAddress } : null };
    const updatedOrder = { ...orderToPay, status: 'pending', paymentData, receiptEmitted: isPaid };
    if (isPaid) registerOnlineSale(updatedOrder);
    setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
    setPayingOrderId(null); setCurrentScreen('checkout_success');
  };

  // ================= SCREENS =================

  // ── LOGIN ──
  const renderLogin = () => (
    <div className="animate-fade-in" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-color)', backgroundImage: 'var(--bg-gradient)', position: 'relative', overflow: 'hidden' }}>
      {/* Decorative orbs */}
      <div style={{ position: 'absolute', top: '-15%', right: '-10%', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(255,107,43,0.15) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none' }} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div className="animate-float" style={{ width: '100px', height: '100px', borderRadius: '28px', background: 'linear-gradient(135deg, #ff6b2b, #f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', boxShadow: '0 0 40px rgba(255,107,43,0.4), 0 0 80px rgba(255,107,43,0.15)', border: '2px solid rgba(255,255,255,0.15)' }}>
          <Sparkles size={48} color="white" strokeWidth={1.5} />
        </div>

        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem', textAlign: 'center', letterSpacing: '-0.04em', lineHeight: 1.1 }}>
          {authMode === 'login' ? 'Hola de nuevo' : 'Únete a nosotros'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '2.5rem', fontSize: '1.05rem', maxWidth: '340px', lineHeight: 1.5 }}>
          Acumula puntos, obtén descuentos y vive la experiencia premium.
        </p>

        <div style={{ ...glassCard({ padding: '2.5rem', maxWidth: '400px', width: '100%' }) }}>
          {authError && (
            <div className="animate-fade-in" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger-color)', padding: '0.9rem 1rem', borderRadius: '0.75rem', marginBottom: '1.5rem', fontSize: '0.88rem', textAlign: 'center', border: '1px solid rgba(255,77,109,0.25)' }}>
              {authError}
            </div>
          )}
          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {authMode === 'register' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tu Nombre</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input type="text" className="input w-full" placeholder="Ej. Juan Pérez" value={name} onChange={e => setName(e.target.value)} style={{ paddingLeft: '2.8rem', padding: '0.9rem 1rem 0.9rem 2.8rem', fontSize: '1rem', borderRadius: '0.85rem' }} />
                </div>
              </div>
            )}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Celular</label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="tel" className="input w-full" placeholder="987 654 321" value={phone} onChange={e => setPhone(e.target.value)} maxLength={15} style={{ paddingLeft: '2.8rem', padding: '0.9rem 1rem 0.9rem 2.8rem', fontSize: '1rem', borderRadius: '0.85rem' }} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>PIN</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '1rem' }}>🔐</span>
                <input type="password" className="input w-full" placeholder="••••••" value={pin} onChange={e => setPin(e.target.value)} maxLength={6} style={{ paddingLeft: '2.8rem', padding: '0.9rem 1rem 0.9rem 2.8rem', fontSize: '1rem', letterSpacing: '0.3em', borderRadius: '0.85rem' }} />
              </div>
            </div>
            <button type="submit" style={{ marginTop: '0.8rem', padding: '1rem', borderRadius: '1rem', fontWeight: 700, fontSize: '1.05rem', border: 'none', cursor: 'pointer', color: 'white', background: 'linear-gradient(135deg, #ff6b2b, #f59e0b)', backgroundSize: '200% auto', boxShadow: '0 0 24px rgba(255,107,43,0.35)', transition: 'all 0.3s ease' }}
              onMouseOver={e => { e.currentTarget.style.backgroundPosition = 'right center'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(255,107,43,0.5)'; }}
              onMouseOut={e => { e.currentTarget.style.backgroundPosition = 'left center'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 24px rgba(255,107,43,0.35)'; }}
            >
              {authMode === 'login' ? 'Iniciar Sesión' : 'Crear mi Cuenta VIP'} ✨
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.92rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{authMode === 'login' ? '¿Aún no tienes cuenta?' : '¿Ya eres miembro VIP?'}</span>
            <button onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(''); }}
              style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontWeight: 700, marginLeft: '0.5rem', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
              {authMode === 'login' ? 'Regístrate' : 'Inicia Sesión'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ── DASHBOARD ──
  const renderDashboard = () => {
    const lvl = LEVEL_THEMES[loggedCustomer.level] || LEVEL_THEMES.Bronce;
    const nextLevelPoints = { Bronce: 500, Plata: 1500, Oro: 5000, Platino: 99999 };
    const progress = Math.min(100, (loggedCustomer.points / (nextLevelPoints[loggedCustomer.level] || 500)) * 100);

    return (
      <div className="animate-fade-in" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', backgroundImage: 'var(--bg-gradient)', paddingBottom: '2rem' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(180deg, rgba(255,107,43,0.08) 0%, transparent 100%)', padding: '2.5rem 1.5rem 2rem', position: 'relative' }}>
          <button onClick={handleLogout} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', ...glassCard({ borderRadius: '50%', padding: '0.6rem', cursor: 'pointer', display: 'flex' }) }}>
            <LogOut size={18} color="var(--text-secondary)" />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: lvl.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 800, color: 'white', boxShadow: `0 0 24px ${lvl.glow}`, border: '2px solid rgba(255,255,255,0.2)' }}>
              {loggedCustomer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>Bienvenido de nuevo</p>
              <h2 style={{ margin: 0, fontFamily: 'Outfit, sans-serif', fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{loggedCustomer.name}</h2>
            </div>
          </div>
        </div>

        <div style={{ padding: '0 1.5rem' }}>
          {/* VIP Card */}
          <div className="animate-slide-up" style={{ ...glassCard({ padding: '1.5rem', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' }) }}>
            <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', background: `radial-gradient(circle, ${lvl.glow} 0%, transparent 70%)`, borderRadius: '50%', filter: 'blur(20px)', pointerEvents: 'none' }} />
            
            {/* Level & Points row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.2rem', position: 'relative', zIndex: 1 }}>
              <div>
                <p style={{ color: 'var(--text-muted)', margin: '0 0 0.15rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Nivel</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Star size={18} color="var(--warning-color)" fill="var(--warning-color)" />
                  <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>{loggedCustomer.level}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: 'var(--text-muted)', margin: '0 0 0.15rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Puntos</p>
                <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', fontWeight: 800, color: 'var(--primary-color)' }}>{loggedCustomer.points}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                <span>Progreso al siguiente nivel</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div style={{ height: '6px', borderRadius: '99px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress}%`, borderRadius: '99px', background: 'linear-gradient(90deg, var(--primary-color), var(--warning-color))', transition: 'width 1s cubic-bezier(0.4,0,0.2,1)', boxShadow: '0 0 8px rgba(255,107,43,0.4)' }} />
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="animate-slide-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem', animationDelay: '0.1s' }}>
            {[
              { icon: <Gift size={18} />, label: 'Puntos', value: loggedCustomer.points, color: '#ff6b2b' },
              { icon: <TrendingUp size={18} />, label: 'Gastado', value: `S/${(loggedCustomer.totalSpent || 0).toFixed(0)}`, color: '#10d990' },
              { icon: <Clock size={18} />, label: 'Pedidos', value: myActiveOrders.length, color: '#6366f1' },
            ].map((s, i) => (
              <div key={i} style={{ ...glassCard({ padding: '1rem', textAlign: 'center' }) }}>
                <div style={{ color: s.color, marginBottom: '0.3rem', display: 'flex', justifyContent: 'center' }}>{s.icon}</div>
                <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{s.value}</p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '0.1rem 0 0', fontWeight: 500 }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Tus Promociones */}
          {applicablePromotions.length > 0 && (
            <div className="animate-slide-up" style={{ marginBottom: '1.5rem', animationDelay: '0.15s' }}>
              <h3 style={{ margin: '0 0 0.8rem', fontSize: '1.1rem', color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}>
                <Tag size={18} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '0.4rem', color: 'var(--primary-color)' }} />
                Tus Promociones Exclusivas
              </h3>
              <div style={{ display: 'flex', gap: '0.8rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }} className="hide-scroll">
                {applicablePromotions.map(promo => (
                  <div key={promo.id} style={{ ...glassCard({ padding: '1.2rem', minWidth: '220px', flexShrink: 0, position: 'relative', overflow: 'hidden', borderLeft: '3px solid var(--primary-color)' }) }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, padding: '0.3rem 0.6rem', background: 'var(--primary-color)', color: 'white', fontSize: '0.7rem', fontWeight: 800, borderBottomLeftRadius: '10px' }}>
                      {promo.discountType === 'percentage' ? `-${promo.discountValue}%` :
                       promo.discountType === 'fixed' ? `-S/${promo.discountValue}` :
                       promo.discountType === '2x1' ? '2x1' : 'Envío Gratis'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                      <BellRing size={16} color="var(--primary-color)" />
                      <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 700 }}>{promo.title}</h4>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>{promo.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="animate-slide-up" style={{ display: 'grid', gap: '0.85rem', marginBottom: '1.5rem', animationDelay: '0.2s' }}>
            <button onClick={() => setCurrentScreen('scanner')}
              style={{ ...glassCard({ padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.3s ease' }) }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}>
              <div style={{ background: 'rgba(99,102,241,0.15)', padding: '0.85rem', borderRadius: '0.85rem', color: '#6366f1', display: 'flex' }}><QrCode size={24} /></div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.05rem', fontWeight: 700 }}>Check-in en Mesa</h3>
                <p style={{ margin: '0.1rem 0 0', color: 'var(--text-muted)', fontSize: '0.82rem' }}>Escanea el QR y gana puntos</p>
              </div>
              <ArrowRight size={18} color="var(--text-muted)" />
            </button>

            <button onClick={() => setCurrentScreen('location_select')}
              style={{ padding: '1.2rem', borderRadius: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', textAlign: 'left', border: 'none', background: 'linear-gradient(135deg, #ff6b2b, #f59e0b)', boxShadow: '0 8px 32px rgba(255,107,43,0.3)', transition: 'all 0.3s ease' }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(255,107,43,0.45)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(255,107,43,0.3)'; }}>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.85rem', borderRadius: '0.85rem', color: 'white', display: 'flex' }}><ShoppingCart size={24} /></div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, color: 'white', fontSize: '1.05rem', fontWeight: 700 }}>Hacer un Pedido</h3>
                <p style={{ margin: '0.1rem 0 0', color: 'rgba(255,255,255,0.8)', fontSize: '0.82rem' }}>Delivery o Recojo en tienda</p>
              </div>
              <ArrowRight size={18} color="rgba(255,255,255,0.7)" />
            </button>
          </div>

          {/* Active Orders */}
          {myActiveOrders.length > 0 && (
            <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)', fontSize: '1.1rem', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                <Clock size={18} color="var(--primary-color)" /> Pedidos en Curso
              </h3>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {myActiveOrders.map(o => {
                  const statusConfig = {
                    pending_approval: { label: 'Esperando aprobación', color: 'var(--warning-color)', bg: 'rgba(251,191,36,0.1)' },
                    accepted_awaiting_payment: { label: 'Aprobado — Pago pendiente', color: 'var(--info-color)', bg: 'rgba(56,189,248,0.1)' },
                    pending: { label: 'En preparación', color: 'var(--primary-color)', bg: 'rgba(255,107,43,0.1)' },
                    ready: { label: o.type === 'delivery' ? '¡En camino!' : '¡Listo para recojo!', color: 'var(--success-color)', bg: 'rgba(16,217,144,0.1)' },
                  };
                  const st = statusConfig[o.status] || statusConfig.pending;
                  return (
                    <div key={o.id} style={{ ...glassCard({ padding: '1.2rem' }) }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          {o.type === 'delivery' ? <Truck size={16} /> : <Store size={16} />}
                          {o.type === 'delivery' ? 'Delivery' : 'Recojo'}
                        </span>
                        <span style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--primary-color)', fontWeight: 800, fontSize: '1.1rem' }}>S/ {o.total.toFixed(2)}</span>
                      </div>
                      {o.deliveryFee > 0 && <p style={{ margin: '0 0 0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Incluye S/ {o.deliveryFee.toFixed(2)} de envío</p>}
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: st.bg, padding: '0.35rem 0.8rem', borderRadius: '99px', fontSize: '0.78rem', fontWeight: 600, color: st.color }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: st.color, display: 'inline-block', animation: 'pulse-glow 2s infinite' }} />
                        {st.label}
                      </div>
                      {o.status === 'accepted_awaiting_payment' && (
                        <button onClick={() => { setPayingOrderId(o.id); setCurrentScreen('checkout_payment'); }}
                          style={{ marginTop: '0.8rem', width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: 'none', background: 'linear-gradient(135deg, var(--primary-color), var(--warning-color))', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
                          Realizar Pago Ahora
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ── SCANNER ──
  const renderScanner = () => (
    <div className="animate-fade-in" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', backgroundImage: 'var(--bg-gradient)' }}>
      <div style={{ padding: '1.2rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem', background: 'var(--surface-solid)', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => setCurrentScreen('dashboard')} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex' }}><ChevronLeft size={22} /></button>
        <h2 style={{ margin: 0, fontFamily: 'Outfit, sans-serif', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>Check-in QR</h2>
      </div>
      <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
        <div className="animate-float" style={{ width: '120px', height: '120px', margin: '0 auto 2rem', borderRadius: '28px', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed rgba(99,102,241,0.3)' }}>
          {scanning ? <div className="animate-spin" style={{ width: '40px', height: '40px', border: '3px solid rgba(99,102,241,0.2)', borderTopColor: '#6366f1', borderRadius: '50%' }} /> : <QrCode size={48} color="#6366f1" />}
        </div>
        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          {scanning ? 'Procesando...' : 'Ingresa tu mesa'}
        </h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>Gana puntos al hacer check-in</p>
        <input type="text" className="input" placeholder="Número de mesa" value={scannedTable} onChange={e => setScannedTable(e.target.value)}
          style={{ maxWidth: '200px', textAlign: 'center', fontSize: '1.5rem', fontWeight: 700, padding: '1rem', borderRadius: '1rem', marginBottom: '1.5rem' }} />
        <br />
        <button onClick={handleSimulateScan} disabled={scanning || !scannedTable}
          style={{ padding: '0.9rem 2.5rem', borderRadius: '99px', border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', opacity: scanning || !scannedTable ? 0.5 : 1, boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}>
          {scanning ? 'Verificando...' : 'Hacer Check-in'}
        </button>
      </div>
    </div>
  );

  // ── LOCATION SELECT ──
  const renderLocationSelect = () => (
    <div className="animate-fade-in" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', backgroundImage: 'var(--bg-gradient)' }}>
      <div style={{ padding: '1.2rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem', ...glassCard({ borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none' }), position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => setCurrentScreen('dashboard')} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex' }}><ChevronLeft size={22} /></button>
        <div>
          <h2 style={{ margin: 0, fontFamily: 'Outfit, sans-serif', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>Elige tu sucursal</h2>
          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>{locations.length} sucursales disponibles</p>
        </div>
      </div>
      <div style={{ padding: '1.5rem', display: 'grid', gap: '0.85rem' }}>
        {locations.map((loc, idx) => {
          const now = new Date();
          const currentHour = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
          const openTime = loc.openTime || '08:00';
          const closeTime = loc.closeTime || '22:00';
          const isOpen = currentHour >= openTime && currentHour <= closeTime;
          return (
            <button key={loc.id} className="animate-slide-up"
              onClick={() => { if (!isOpen) return; localStorage.setItem('currentLocationId', loc.id); setSelectedLocation(loc); setCurrentScreen('menu'); }}
              style={{ ...glassCard({ padding: '1.3rem', display: 'flex', alignItems: 'center', gap: '1rem', textAlign: 'left', cursor: isOpen ? 'pointer' : 'not-allowed', transition: 'all 0.3s ease', opacity: isOpen ? 1 : 0.5 }), animationDelay: `${idx * 0.08}s` }}
              onMouseOver={e => { if (isOpen) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'var(--primary-color)'; } }}
              onMouseOut={e => { if (isOpen) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; } }}>
              <div style={{ background: isOpen ? 'rgba(16,217,144,0.12)' : 'rgba(255,255,255,0.05)', padding: '0.9rem', borderRadius: '0.85rem', color: isOpen ? 'var(--success-color)' : 'var(--text-muted)', display: 'flex' }}>
                <MapPin size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 700 }}>{loc.name}</h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: isOpen ? 'var(--success-color)' : 'var(--danger-color)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: isOpen ? 'var(--success-color)' : 'var(--danger-color)', display: 'inline-block' }} />
                  {isOpen ? `Abierto · ${openTime} – ${closeTime}` : `Cerrado · ${openTime} – ${closeTime}`}
                </p>
              </div>
              {isOpen && <ArrowRight size={18} color="var(--text-muted)" />}
            </button>
          );
        })}
      </div>
    </div>
  );

  // ── MENU ──
  const renderMenu = () => {
    const pointsToEarn = Math.floor(cartTotal * 0.5);
    return (
      <div className="animate-fade-in" style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-color)', overflow: 'hidden' }}>
        <PageHeader icon={<MapPin />} iconGradient="135deg, var(--primary-color), var(--warning-color)" iconGlow="var(--primary-glow)" title={selectedLocation?.name || 'Local'} subtitle="Recibiendo pedidos" badge="Modo Cliente" badgeColor="var(--success-color)"
          actions={<>
            <button className="btn btn-outline" style={{ fontSize: isMobile ? '0.8rem' : '0.9rem' }} onClick={() => setCurrentScreen('location_select')}><ChevronLeft size={16} /> Volver</button>
            {isMobile && (
              <button onClick={() => setIsCartOpen(true)} style={{ ...glassCard({ padding: '0.5rem 0.8rem', borderRadius: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', position: 'relative' }) }}>
                <ShoppingCart size={16} color="var(--primary-color)" />
                {cart.length > 0 && <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'var(--danger-color)', color: 'white', width: '18px', height: '18px', borderRadius: '50%', fontSize: '0.65rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cart.reduce((s, c) => s + c.quantity, 0)}</span>}
              </button>
            )}
          </>}
        />

        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxWidth: '1200px', width: '100%', margin: '0 auto', padding: isMobile ? '0.5rem' : '1.5rem' }}>
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'row', gap: '1.5rem', overflow: 'hidden' }}>
            {/* Menu Side */}
            <div style={{ flex: isMobile ? undefined : 2, width: isMobile ? '100%' : undefined, minHeight: 0, display: isMobile && isCartOpen ? 'none' : 'flex', flexDirection: 'column', overflowY: 'auto', paddingRight: isMobile ? 0 : '0.5rem' }}>
              {/* Search */}
              <div style={{ marginBottom: '0.85rem', position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" className="input w-full" style={{ paddingLeft: '3rem', borderRadius: '99px', ...glassCard({ borderRadius: '99px' }) }} placeholder="Buscar plato..." value={search} onChange={e => setSearch(e.target.value)} />
                {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={14} /></button>}
              </div>

              {/* Category Chips */}
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.6rem', marginBottom: '0.5rem', scrollbarWidth: 'none' }}>
                <button onClick={() => { setSelectedCat('all'); setSelectedSubcat('all'); }}
                  style={{ whiteSpace: 'nowrap', padding: '0.5rem 1rem', borderRadius: '99px', border: selectedCat === 'all' ? 'none' : '1px solid rgba(255,255,255,0.08)', background: selectedCat === 'all' ? 'linear-gradient(135deg, var(--primary-color), var(--warning-color))' : 'rgba(255,255,255,0.04)', color: selectedCat === 'all' ? 'white' : 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  🍽️ Todos
                </button>
                {menu.some(i => i.isDailyMenu) && (
                  <button onClick={() => { setSelectedCat('daily'); setSelectedSubcat('all'); }}
                    style={{ whiteSpace: 'nowrap', padding: '0.5rem 1rem', borderRadius: '99px', border: selectedCat === 'daily' ? 'none' : '1px solid rgba(255,255,255,0.08)', background: selectedCat === 'daily' ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.04)', color: selectedCat === 'daily' ? 'white' : 'var(--success-color)', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '0.3rem', boxShadow: selectedCat === 'daily' ? '0 4px 12px rgba(16,185,129,0.3)' : 'none' }}>
                    ✨ Menú del Día
                  </button>
                )}
                {categories.filter(c => c.active).map(cat => {
                  const theme = getCatTheme(cat.name);
                  const isActive = selectedCat === cat.id;
                  return (
                    <button key={cat.id} onClick={() => { setSelectedCat(cat.id); setSelectedSubcat('all'); }}
                      style={{ whiteSpace: 'nowrap', padding: '0.5rem 1rem', borderRadius: '99px', border: isActive ? 'none' : '1px solid rgba(255,255,255,0.08)', background: isActive ? theme.gradient : 'rgba(255,255,255,0.04)', color: isActive ? 'white' : 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      {theme.emoji} {cat.name}
                    </button>
                  );
                })}
              </div>

              {/* Subcategory Chips */}
              {selectedCat !== 'all' && (
                <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.6rem', marginBottom: '0.6rem', scrollbarWidth: 'none' }}>
                  <button onClick={() => setSelectedSubcat('all')}
                    style={{ whiteSpace: 'nowrap', padding: '0.35rem 0.9rem', borderRadius: '99px', border: selectedSubcat === 'all' ? 'none' : '1px solid rgba(255,255,255,0.06)', background: selectedSubcat === 'all' ? 'var(--primary-subtle)' : 'transparent', color: selectedSubcat === 'all' ? 'var(--primary-color)' : 'var(--text-muted)', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>Todas</button>
                  {subcategories?.filter(s => s.categoryId === selectedCat && s.active !== false).map(sub => (
                    <button key={sub.id} onClick={() => setSelectedSubcat(sub.id)}
                      style={{ whiteSpace: 'nowrap', padding: '0.35rem 0.9rem', borderRadius: '99px', border: selectedSubcat === sub.id ? 'none' : '1px solid rgba(255,255,255,0.06)', background: selectedSubcat === sub.id ? 'var(--primary-subtle)' : 'transparent', color: selectedSubcat === sub.id ? 'var(--primary-color)' : 'var(--text-muted)', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>{sub.name}</button>
                  ))}
                </div>
              )}

              {/* Menu Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? '100%' : '280px'}, 1fr))`, gap: '0.75rem' }}>
                {filteredMenu.map((item, idx) => {
                  const currentDay = new Date().getDay();
                  const availableToday = !item.availableDays || item.availableDays.length === 0 || item.availableDays.includes(currentDay);
                  const isAgotado = menuStatus && menuStatus[item.id] === false;
                  const disabled = isAgotado || !availableToday;
                  const cat = categories.find(c => c.id === item.categoryId);
                  const theme = getCatTheme(cat?.name);

                  return (
                    <div key={item.id} className="animate-slide-up"
                      onClick={() => {
                        if (!availableToday) { showAlert(`Este plato solo está disponible los días: ${item.availableDays.map(d => ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][d]).join(', ')}`); return; }
                        if (!isAgotado) handleOpenItemModal(item);
                        else showAlert("Este plato se encuentra agotado actualmente.");
                      }}
                      style={{ ...glassCard({ padding: '1.1rem', cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all 0.25s ease', opacity: disabled ? 0.5 : 1, filter: disabled ? 'grayscale(0.8)' : 'none', display: 'flex', gap: '0.8rem', alignItems: 'center' }), animationDelay: `${Math.min(idx * 0.04, 0.4)}s` }}
                      onMouseOver={e => { if (!disabled) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'; } }}
                      onMouseOut={e => { if (!disabled) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none'; } }}>
                      {/* Category accent dot */}
                      <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: theme.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0, opacity: disabled ? 0.4 : 0.85 }}>
                        {theme.emoji}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.15rem' }}>
                          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</h3>
                          {availableToday && isAgotado && <span style={{ background: 'var(--danger-color)', color: 'white', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.55rem', fontWeight: 800, flexShrink: 0, textTransform: 'uppercase' }}>Agotado</span>}
                        </div>
                        {item.description ? <p style={{ margin: '0 0 0.3rem', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.description}</p>
                          : <p style={{ margin: '0 0 0.3rem', fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Sin detalles</p>}
                        {!availableToday && <p style={{ fontSize: '0.7rem', color: 'var(--warning-color)', margin: 0, fontWeight: 600 }}>Solo: {item.availableDays.map(d => ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][d]).join(', ')}</p>}
                        <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, color: 'var(--primary-color)', fontSize: '1.05rem' }}>S/ {item.price.toFixed(2)}</span>
                      </div>
                      <div style={{ background: disabled ? 'rgba(255,255,255,0.03)' : 'rgba(255,107,43,0.12)', padding: '0.5rem', borderRadius: '10px', flexShrink: 0, display: 'flex', transition: 'all 0.2s ease' }}>
                        <Plus size={16} style={{ color: disabled ? 'var(--text-muted)' : 'var(--primary-color)' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cart Side */}
            {(!isMobile || isCartOpen) && (
              <div style={{ flex: isMobile ? undefined : 1, width: isMobile ? '100%' : undefined, ...(!isMobile ? glassCard({ display: 'flex', flexDirection: 'column', padding: '1.5rem', minHeight: 0 }) : { background: 'var(--surface-solid)', display: 'flex', flexDirection: 'column', position: 'fixed', inset: 0, zIndex: 100, padding: 0, minHeight: 0 }) }}>
                <div style={{ padding: isMobile ? '1.2rem 1.5rem' : '0 0 1rem 0', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  {isMobile && <button onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex' }}><X size={22} /></button>}
                  <ShoppingCart size={20} color="var(--primary-color)" />
                  <h2 style={{ margin: 0, fontFamily: 'Outfit, sans-serif', fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>Tu Pedido</h2>
                  {cart.length > 0 && <span style={{ background: 'var(--primary-subtle)', color: 'var(--primary-color)', padding: '0.15rem 0.5rem', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 700 }}>{cart.reduce((s, c) => s + c.quantity, 0)} items</span>}
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '1rem 1.5rem' : '1rem 0' }}>
                  {cart.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '3rem' }}>
                      <ShoppingCart size={40} style={{ opacity: 0.15, marginBottom: '0.8rem' }} />
                      <p style={{ fontSize: '0.9rem' }}>Tu carrito está vacío</p>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Agrega platos del menú</p>
                    </div>
                  ) : cart.map(c => (
                    <div key={`${c.item.id}-${c.details}`} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '0.88rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.item.name}</p>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>S/ {c.item.price.toFixed(2)}</span>
                        {c.details && <p style={{ fontSize: '0.72rem', color: 'var(--warning-color)', fontStyle: 'italic', margin: '0.15rem 0 0' }}>📝 {c.details}</p>}
                      </div>
                      {/* Qty controls */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <button onClick={() => removeFromCart(c.item.id, c.details || '')} style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', transition: 'all 0.15s ease' }}
                          onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--danger-color)'; e.currentTarget.style.color = 'var(--danger-color)'; }}
                          onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                          <Minus size={12} />
                        </button>
                        <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{c.quantity}</span>
                        <button onClick={() => incrementCartItem(c.item.id, c.details || '')} style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', transition: 'all 0.15s ease' }}
                          onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--primary-color)'; e.currentTarget.style.color = 'var(--primary-color)'; }}
                          onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                          <Plus size={12} />
                        </button>
                      </div>
                      <span style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--primary-color)', fontWeight: 800, fontSize: '0.95rem', minWidth: '55px', textAlign: 'right' }}>S/ {(c.item.price * c.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-color)', padding: isMobile ? '1rem 1.5rem 2rem' : '1rem 0 0' }}>
                  {/* Selector de Promociones */}
                  {cart.length > 0 && applicablePromotions.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 600 }}>¿Tienes una promoción?</label>
                      <CustomSelect 
                        className="w-full"
                        style={{ padding: '0.8rem', borderRadius: '0.75rem', background: 'rgba(255,107,43,0.05)', borderColor: selectedPromo ? 'var(--primary-color)' : 'rgba(255,107,43,0.2)', color: 'var(--text-primary)', fontWeight: 600, outline: 'none' }}
                        value={selectedPromo ? selectedPromo.id : ''}
                        onChange={val => setSelectedPromo(applicablePromotions.find(p => p.id === val) || null)}
                        options={[
                          { value: '', label: '🎁 Selecciona una promoción (Opcional)' },
                          ...applicablePromotions.map(p => ({
                            value: p.id,
                            label: `${p.title} (${p.discountType === 'percentage' ? `-${p.discountValue}%` : p.discountType === 'fixed' ? `-S/${p.discountValue}` : p.discountType === '2x1' ? '2x1' : 'Delivery Gratis'})`
                          }))
                        ]}
                      />
                    </div>
                  )}

                  {cartTotal > 0 && (
                    <div style={{ background: 'rgba(16,217,144,0.08)', border: '1px dashed rgba(16,217,144,0.25)', padding: '0.65rem 0.8rem', borderRadius: '0.75rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Star size={14} color="var(--success-color)" fill="var(--success-color)" />
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Ganarás <strong style={{ color: 'var(--success-color)' }}>+{pointsToEarn} pts</strong></span>
                    </div>
                  )}

                  {discountAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.95rem', fontWeight: 600, color: 'var(--success-color)' }}>
                      <span>Descuento aplicado</span>
                      <span>- S/ {discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1.3rem', fontWeight: 800 }}>
                    <span style={{ color: 'var(--text-primary)' }}>Total</span>
                    <div style={{ textAlign: 'right' }}>
                      {discountAmount > 0 && <span style={{ fontSize: '0.8rem', textDecoration: 'line-through', color: 'var(--text-muted)', marginRight: '0.5rem', fontWeight: 500 }}>S/ {cartSubTotal.toFixed(2)}</span>}
                      <span style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--primary-color)' }}>S/ {cartTotal.toFixed(2)}</span>
                    </div>
                  </div>
                  <button onClick={startCheckout} disabled={cart.length === 0}
                    style={{ width: '100%', padding: '1rem', borderRadius: '0.85rem', border: 'none', fontSize: '1rem', fontWeight: 700, cursor: cart.length === 0 ? 'not-allowed' : 'pointer', color: 'white', background: cart.length === 0 ? 'var(--surface-hover)' : 'linear-gradient(135deg, #ff6b2b, #f59e0b)', opacity: cart.length === 0 ? 0.4 : 1, boxShadow: cart.length > 0 ? '0 8px 24px rgba(255,107,43,0.3)' : 'none', transition: 'all 0.3s ease' }}>
                    Confirmar Pedido →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile floating cart */}
        {isMobile && cart.length > 0 && !isCartOpen && (
          <div style={{ position: 'fixed', bottom: '1.2rem', left: '1.2rem', right: '1.2rem', zIndex: 50 }}>
            <button onClick={() => setIsCartOpen(true)}
              style={{ width: '100%', background: 'linear-gradient(135deg, #ff6b2b, #f59e0b)', border: 'none', padding: '1rem 1.5rem', borderRadius: '99px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', boxShadow: '0 8px 32px rgba(255,107,43,0.4)', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                <div style={{ background: 'rgba(0,0,0,0.2)', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>{cart.reduce((s, c) => s + c.quantity, 0)}</div>
                <span style={{ fontWeight: 700, fontSize: '1rem' }}>Ver Carrito</span>
              </div>
              <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.1rem' }}>S/ {cartTotal.toFixed(2)}</span>
            </button>
          </div>
        )}

        {/* Item Modal */}
        {pendingItem && (
          <div className="animate-fade-in" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setPendingItem(null)}>
            <div className="animate-bounce-in" style={{ ...glassCard({ padding: '1.8rem', maxWidth: '440px', width: '100%', maxHeight: '90vh', overflowY: 'auto', background: 'var(--surface-solid)', border: '1px solid var(--border-color)' }) }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <h2 style={{ margin: 0, fontFamily: 'Outfit, sans-serif', fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>{pendingItem.name}</h2>
                  <span style={{ color: 'var(--primary-color)', fontWeight: 700, fontSize: '1.05rem' }}>S/ {pendingItem.price.toFixed(2)} c/u</span>
                </div>
                <button onClick={() => setPendingItem(null)} style={{ ...glassCard({ padding: '0.4rem', borderRadius: '10px', cursor: 'pointer', display: 'flex' }) }}><X size={16} color="var(--text-secondary)" /></button>
              </div>

              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '1.25rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cantidad</label>
                  <div style={{ ...glassCard({ padding: '0.8rem', textAlign: 'center', fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.4rem', fontFamily: 'Outfit, sans-serif' }) }}>{itemQty || '1'}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem', marginTop: '0.6rem' }}>
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0'].map(num => (
                      <button key={num} type="button"
                        style={{ padding: '0.8rem', fontSize: '1.15rem', fontWeight: 700, borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: num === 'C' ? 'rgba(255,77,109,0.1)' : 'rgba(255,255,255,0.04)', color: num === 'C' ? 'var(--danger-color)' : 'var(--text-primary)', cursor: 'pointer', gridColumn: num === '0' ? 'span 2' : 'span 1', transition: 'all 0.15s ease', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onClick={e => { e.stopPropagation(); num === 'C' ? clearQty() : appendQty(num); }}
                        onMouseOver={e => { e.currentTarget.style.background = num === 'C' ? 'rgba(255,77,109,0.2)' : 'rgba(255,255,255,0.08)'; }}
                        onMouseOut={e => { e.currentTarget.style.background = num === 'C' ? 'rgba(255,77,109,0.1)' : 'rgba(255,255,255,0.04)'; }}>
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notas (Opcional)</label>
                  <textarea className="input w-full" style={{ resize: 'none', minHeight: isMobile ? '80px' : '150px', marginTop: '0.4rem', borderRadius: '0.75rem', flex: 1 }} placeholder="Ej. Sin cebolla, bien cocido..."
                    value={itemDetails} onChange={e => setItemDetails(e.target.value)} onClick={e => e.stopPropagation()} />
                </div>
              </div>

              <button onClick={e => { e.stopPropagation(); confirmAddItem(); }}
                style={{ marginTop: '1.25rem', width: '100%', padding: '1rem', borderRadius: '0.85rem', border: 'none', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', color: 'white', background: 'linear-gradient(135deg, #ff6b2b, #f59e0b)', boxShadow: '0 8px 24px rgba(255,107,43,0.3)' }}>
                Añadir al carrito · S/ {(pendingItem.price * parseInt(itemQty || '1')).toFixed(2)}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── CHECKOUT METHOD ──
  const renderCheckoutMethod = () => (
    <div className="animate-fade-in" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', backgroundImage: 'var(--bg-gradient)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '1.2rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem', ...glassCard({ borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none' }) }}>
        <button onClick={() => setCurrentScreen('menu')} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex' }}><ChevronLeft size={22} /></button>
        <h2 style={{ margin: 0, fontFamily: 'Outfit, sans-serif', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>Método de Entrega</h2>
      </div>
      {/* Stepper */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1.2rem 1.5rem' }}>
        {['Entrega', 'Pago', 'Listo'].map((step, i) => (
          <React.Fragment key={step}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: i === 0 ? 'var(--primary-color)' : 'rgba(255,255,255,0.06)', color: i === 0 ? 'white' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800 }}>{i + 1}</div>
              <span style={{ fontSize: '0.78rem', color: i === 0 ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: i === 0 ? 700 : 500 }}>{step}</span>
            </div>
            {i < 2 && <div style={{ flex: 1, maxWidth: '40px', height: '1px', background: 'rgba(255,255,255,0.08)' }} />}
          </React.Fragment>
        ))}
      </div>

      <div style={{ padding: '0 1.5rem', flex: 1 }}>
        <div style={{ display: 'grid', gap: '0.85rem' }}>
          <button onClick={() => handleDeliverySelect('recojo')} className="animate-slide-up"
            style={{ ...glassCard({ padding: '1.3rem', display: 'flex', alignItems: 'center', gap: '1rem', textAlign: 'left', cursor: 'pointer', transition: 'all 0.3s ease', borderColor: deliveryMethod === 'recojo' ? 'var(--primary-color)' : undefined }) }}
            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; }}>
            <div style={{ background: 'rgba(255,107,43,0.12)', padding: '1rem', borderRadius: '1rem', color: 'var(--primary-color)', display: 'flex' }}><Store size={24} /></div>
            <div>
              <h3 style={{ margin: 0, fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 700 }}>Recojo en Tienda</h3>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>Pasa por tu pedido al local</p>
            </div>
          </button>
          <button onClick={() => handleDeliverySelect('delivery')} className="animate-slide-up" style={{ ...glassCard({ padding: '1.3rem', display: 'flex', alignItems: 'center', gap: '1rem', textAlign: 'left', cursor: 'pointer', transition: 'all 0.3s ease', borderColor: deliveryMethod === 'delivery' ? 'var(--info-color)' : undefined }), animationDelay: '0.08s' }}
            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; }}>
            <div style={{ background: 'rgba(56,189,248,0.12)', padding: '1rem', borderRadius: '1rem', color: 'var(--info-color)', display: 'flex' }}><Truck size={24} /></div>
            <div>
              <h3 style={{ margin: 0, fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 700 }}>Delivery</h3>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>Te lo llevamos a casa (sujeto a aprobación)</p>
            </div>
          </button>
        </div>

        {deliveryMethod === 'delivery' && (
          <div className="animate-slide-up" style={{ ...glassCard({ padding: '1.5rem', marginTop: '1.5rem' }) }}>
            <h4 style={{ margin: '0 0 1rem', fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)', fontWeight: 700 }}>Dirección de Envío</h4>
            <input type="text" className="input w-full" placeholder="Ej. Av. Larco 123, Miraflores" value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} style={{ padding: '0.9rem 1rem', borderRadius: '0.75rem' }} />
            <p style={{ margin: '0.8rem 0 0', fontSize: '0.78rem', color: 'var(--warning-color)' }}>* El pago se habilita una vez aprobado y con costo de envío asignado.</p>
            <button onClick={submitDeliveryOrder} style={{ marginTop: '1.2rem', width: '100%', padding: '1rem', borderRadius: '0.85rem', border: 'none', background: 'linear-gradient(135deg, #38bdf8, #6366f1)', color: 'white', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 8px 24px rgba(56,189,248,0.3)' }}>Enviar Pedido a Revisión</button>
          </div>
        )}
      </div>
    </div>
  );

  // ── CHECKOUT PAYMENT ──
  const renderCheckoutPayment = () => {
    const orderToPay = payingOrderId ? orders.find(o => o.id === payingOrderId) : null;
    const amountToPay = orderToPay ? orderToPay.total : cartTotal;
    return (
      <div className="animate-fade-in" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', backgroundImage: 'var(--bg-gradient)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.2rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem', ...glassCard({ borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none' }) }}>
          <button onClick={() => { if (payingOrderId) { setPayingOrderId(null); setCurrentScreen('dashboard'); } else { setCurrentScreen('checkout_method'); } }} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex' }}><ChevronLeft size={22} /></button>
          <h2 style={{ margin: 0, fontFamily: 'Outfit, sans-serif', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>Medio de Pago</h2>
        </div>
        {/* Stepper */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1.2rem 1.5rem' }}>
          {['Entrega', 'Pago', 'Listo'].map((step, i) => (
            <React.Fragment key={step}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: i <= 1 ? 'var(--primary-color)' : 'rgba(255,255,255,0.06)', color: i <= 1 ? 'white' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800 }}>{i < 1 ? <Check size={12} /> : i + 1}</div>
                <span style={{ fontSize: '0.78rem', color: i <= 1 ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: i === 1 ? 700 : 500 }}>{step}</span>
              </div>
              {i < 2 && <div style={{ flex: 1, maxWidth: '40px', height: '1px', background: i < 1 ? 'var(--primary-color)' : 'rgba(255,255,255,0.08)' }} />}
            </React.Fragment>
          ))}
        </div>

        <div style={{ padding: '0 1.5rem', flex: 1, overflowY: 'auto', paddingBottom: '2rem' }}>
          <div style={{ ...glassCard({ padding: '1rem', marginBottom: '1.5rem', textAlign: 'center' }) }}>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total a pagar</p>
            <p style={{ margin: '0.3rem 0 0', fontFamily: 'Outfit, sans-serif', fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary-color)' }}>S/ {amountToPay.toFixed(2)}</p>
          </div>

          <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {[
              { id: 'yape', label: 'Yape / Plin', icon: <Smartphone size={22} />, color: '#742384', bg: 'rgba(116,35,132,0.12)' },
              { id: 'izipay', label: 'Tarjeta (IziPay)', icon: <CreditCard size={22} />, color: '#e2001a', bg: 'rgba(226,0,26,0.12)' },
              { id: 'cash', label: 'Pago en Local', icon: <Banknote size={22} />, color: 'var(--success-color)', bg: 'rgba(16,217,144,0.12)' },
            ].map(m => (
              <button key={m.id} onClick={() => setPaymentMethod(m.id)}
                style={{ ...glassCard({ padding: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.9rem', cursor: 'pointer', transition: 'all 0.2s ease', borderColor: paymentMethod === m.id ? m.color : undefined, boxShadow: paymentMethod === m.id ? `0 0 16px ${m.bg}` : 'none' }) }}>
                <div style={{ background: m.bg, padding: '0.7rem', borderRadius: '0.75rem', color: m.color, display: 'flex' }}>{m.icon}</div>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{m.label}</span>
                {paymentMethod === m.id && <Check size={16} color={m.color} style={{ marginLeft: 'auto' }} />}
              </button>
            ))}
          </div>

          {(paymentMethod === 'yape' || paymentMethod === 'izipay') && (
            <div className="animate-slide-up" style={{ ...glassCard({ padding: '1.3rem', marginBottom: '1.5rem' }) }}>
              <h4 style={{ margin: '0 0 0.8rem', fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.95rem' }}>Comprobante</h4>
              <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '0.8rem' }}>
                {['boleta', 'factura'].map(t => (
                  <label key={t} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input type="radio" name="receiptType" value={t} checked={receiptType === t} onChange={() => setReceiptType(t)} /> {t.charAt(0).toUpperCase() + t.slice(1)}
                  </label>
                ))}
              </div>
              <input type="text" placeholder={receiptType === 'boleta' ? 'DNI (Opcional)' : 'RUC (Requerido)'} value={docNum} onChange={e => setDocNum(e.target.value)} className="input w-full" style={{ marginBottom: '0.6rem', borderRadius: '0.75rem' }} />
              {receiptType === 'factura' && (<>
                <input type="text" placeholder="Razón Social" value={razonSocial} onChange={e => setRazonSocial(e.target.value)} className="input w-full" style={{ marginBottom: '0.6rem', borderRadius: '0.75rem' }} />
                <input type="text" placeholder="Dirección Fiscal" value={fiscalAddress} onChange={e => setFiscalAddress(e.target.value)} className="input w-full" style={{ borderRadius: '0.75rem' }} />
              </>)}
            </div>
          )}

          {paymentMethod === 'yape' && (
            <div className="animate-slide-up" style={{ ...glassCard({ padding: '1.5rem', borderColor: 'rgba(116,35,132,0.3)' }) }}>
              <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
                <div style={{ width: '140px', height: '140px', background: '#fff', padding: '0.5rem', borderRadius: '1rem', margin: '0 auto 0.8rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <QrCode size={120} color="#742384" />
                </div>
                <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.95rem' }}>Yapea a: <span style={{ color: '#742384' }}>987 654 321</span></p>
              </div>
              <input type="tel" placeholder="Tu celular" value={yapePhone} onChange={e => setYapePhone(e.target.value)} className="input w-full" style={{ marginBottom: '0.6rem', borderRadius: '0.75rem' }} />
              <input type="text" placeholder="N° de Operación" value={yapeOp} onChange={e => setYapeOp(e.target.value)} className="input w-full" style={{ marginBottom: '1rem', borderRadius: '0.75rem' }} />
              <button onClick={() => payingOrderId ? handlePayApprovedDelivery(payingOrderId, 'yape') : submitPaidOrder()} style={{ width: '100%', padding: '1rem', borderRadius: '0.85rem', border: 'none', background: '#742384', color: 'white', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 8px 24px rgba(116,35,132,0.3)' }}>Confirmar Pago Yape</button>
            </div>
          )}

          {paymentMethod === 'izipay' && (
            <div className="animate-slide-up" style={{ ...glassCard({ padding: '1.5rem', borderColor: 'rgba(226,0,26,0.3)' }) }}>
              <h4 style={{ margin: '0 0 1rem', fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)', fontWeight: 700 }}>Datos de Tarjeta</h4>
              <input type="text" placeholder="Número de Tarjeta" value={cardNum} onChange={e => setCardNum(e.target.value)} className="input w-full" style={{ marginBottom: '0.6rem', borderRadius: '0.75rem' }} />
              <input type="text" placeholder="Nombre en la Tarjeta" value={cardName} onChange={e => setCardName(e.target.value)} className="input w-full" style={{ marginBottom: '0.6rem', borderRadius: '0.75rem' }} />
              <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem' }}>
                <input type="text" placeholder="MM/YY" value={cardExp} onChange={e => setCardExp(e.target.value)} className="input w-full" style={{ borderRadius: '0.75rem' }} />
                <input type="text" placeholder="CVV" value={cardCvv} onChange={e => setCardCvv(e.target.value)} className="input w-full" style={{ borderRadius: '0.75rem' }} />
              </div>
              <button onClick={() => payingOrderId ? handlePayApprovedDelivery(payingOrderId, 'izipay') : submitPaidOrder()} style={{ width: '100%', padding: '1rem', borderRadius: '0.85rem', border: 'none', background: '#e2001a', color: 'white', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 8px 24px rgba(226,0,26,0.3)' }}>Pagar S/ {amountToPay.toFixed(2)}</button>
            </div>
          )}

          {paymentMethod === 'cash' && (
            <button className="animate-slide-up" onClick={() => payingOrderId ? handlePayApprovedDelivery(payingOrderId, 'cash') : submitPaidOrder()}
              style={{ width: '100%', padding: '1.1rem', borderRadius: '0.85rem', border: 'none', background: 'linear-gradient(135deg, var(--success-color), #059669)', color: 'white', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 8px 24px rgba(16,217,144,0.3)' }}>
              Confirmar (Pago en el local) ✓
            </button>
          )}
        </div>
      </div>
    );
  };

  // ── SUCCESS ──
  const renderSuccess = () => (
    <div className="animate-fade-in" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', backgroundImage: 'var(--bg-gradient)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
      <Confetti />
      {/* Glow bg */}
      <div style={{ position: 'absolute', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(16,217,144,0.2) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
        <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, #10d990, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', boxShadow: '0 0 40px rgba(16,217,144,0.4), 0 0 80px rgba(16,217,144,0.15)', animation: 'checkPop 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards', border: '3px solid rgba(255,255,255,0.15)' }}>
          <Check size={48} color="white" strokeWidth={3} />
        </div>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.8rem', lineHeight: 1.1, letterSpacing: '-0.03em' }}>¡Pedido Exitoso!</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '340px', margin: '0 auto 2.5rem', fontSize: '1.05rem', lineHeight: 1.5 }}>
          {deliveryMethod === 'delivery'
            ? 'Tu pedido ha sido enviado. Te avisaremos cuando lo aprueben para que realices el pago.'
            : '¡Tu pedido está confirmado! Pasa por el local a recogerlo.'}
        </p>
        <button onClick={() => setCurrentScreen('dashboard')}
          style={{ padding: '1rem 2.5rem', borderRadius: '99px', border: 'none', fontSize: '1.05rem', fontWeight: 700, cursor: 'pointer', color: 'white', background: 'linear-gradient(135deg, #10d990, #059669)', boxShadow: '0 8px 32px rgba(16,217,144,0.3)', transition: 'all 0.3s ease' }}
          onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(16,217,144,0.45)'; }}
          onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(16,217,144,0.3)'; }}>
          Ir al Dashboard →
        </button>
      </div>
    </div>
  );

  switch (currentScreen) {
    case 'login': return renderLogin();
    case 'dashboard': return renderDashboard();
    case 'scanner': return renderScanner();
    case 'location_select': return renderLocationSelect();
    case 'menu': return renderMenu();
    case 'checkout_method': return renderCheckoutMethod();
    case 'checkout_payment': return renderCheckoutPayment();
    case 'checkout_success': return renderSuccess();
    default: return renderLogin();
  }
}

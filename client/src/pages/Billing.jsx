import { useState, useEffect, useRef } from 'react';
import { productAPI, billAPI, customerAPI } from '../services/api';
import { toast } from '../components/shared/Toast';
import AppLayout from '../components/shared/AppLayout';
import { useAuth } from '../context/AuthContext';
import { PRODUCT_CATEGORIES } from '../utils/constants';
import { fmtCurrency as fmt } from '../utils/format';
import ReceiptModal from '../components/billing/ReceiptModal';
import BillHistoryModal from '../components/billing/BillHistoryModal';
import ThemeToggle from '../components/shared/ThemeToggle';
import {
  Menu,
  Search,
  ScanBarcode,
  RotateCw,
  History,
  UserPlus,
  PauseCircle,
  Repeat,
  MoreVertical,
  Trash2,
  Plus,
  Minus,
  Check,
  ChevronDown,
  ChevronUp,
  Tag,
  Store,
  X,
  CreditCard,
  Banknote,
  Smartphone,
  Package,
  User,
  Phone,
} from 'lucide-react';

const CATEGORIES = [
  'All Items',
  ...PRODUCT_CATEGORIES,
];

// High quality sample POS items matching GoBill reference image
const DEMO_PRODUCTS = [
  {
    id: 'demo-1',
    name: 'Nivea Body Lotion For Very Dry Skin - 400 ml',
    category: 'Personal Care',
    sellingPrice: 405.0,
    quantity: 24,
    unit: 'Bottle',
    img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'demo-2',
    name: 'Vedaka Popular Whole California Almonds - 500 g',
    category: 'Dry Fruits',
    sellingPrice: 349.0,
    quantity: 18,
    unit: 'Pack',
    img: 'https://images.unsplash.com/photo-1508061252224-43775270e0a4?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'demo-3',
    name: 'Quaker Oats - 1 kg Pouch',
    category: 'Atta, Flours & Sooji',
    sellingPrice: 870.0,
    quantity: 15,
    unit: 'Pack',
    img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'demo-4',
    name: "Kellogg's Corn Flakes Original - 1.2 kg",
    category: 'Snacks & Biscuits',
    sellingPrice: 630.0,
    quantity: 12,
    unit: 'Box',
    img: 'https://images.unsplash.com/photo-1521483451569-e33803c0330c?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'demo-5',
    name: 'DiSano Pastalicious 100% Durum Wheat Penne - 500 g',
    category: 'Atta, Flours & Sooji',
    sellingPrice: 72.0,
    quantity: 30,
    unit: 'Pack',
    img: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'demo-6',
    name: 'Del Monte Extra Light Olive Oil Pet - 1 L',
    category: 'Edible Oils & Spices',
    sellingPrice: 132.0,
    quantity: 10,
    unit: 'Litre',
    img: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'demo-7',
    name: 'Vedaka Cold Pressed Peanut Groundnut Oil - 1 L',
    category: 'Edible Oils & Spices',
    sellingPrice: 231.0,
    quantity: 14,
    unit: 'Litre',
    img: 'https://images.unsplash.com/photo-1589881133595-a3c085cb731d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'demo-8',
    name: 'Betty Crocker Choco Fudge Instant Cake Mix - 475 g',
    category: 'Snacks & Biscuits',
    sellingPrice: 758.0,
    quantity: 8,
    unit: 'Box',
    img: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'demo-9',
    name: 'Britannia Gobbles Bar Cake Fruity Fun - 110 g',
    category: 'Snacks & Biscuits',
    sellingPrice: 28.0,
    quantity: 45,
    unit: 'Pack',
    img: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'demo-10',
    name: 'Milton Aqua 1000 Stainless Steel Bottle - 1 L',
    category: 'Household',
    sellingPrice: 499.0,
    quantity: 6,
    unit: 'Piece',
    img: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'demo-11',
    name: 'Nayasa Funk Square DLX Brown Bathroom Set',
    category: 'Household',
    sellingPrice: 650.0,
    quantity: 5,
    unit: 'Set',
    img: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'demo-12',
    name: 'Basics Height Adjustable 3-Shelf Wire Storage Rack',
    category: 'Household',
    sellingPrice: 1025.0,
    quantity: 4,
    unit: 'Piece',
    img: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=150&auto=format&fit=crop&q=80',
  },
];

export default function Billing() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All Items');
  const [search, setSearch] = useState('');
  const [barcodeMode, setBarcodeMode] = useState(false);
  const barcodeInputRef = useRef(null);
  const [cart, setCart] = useState([]);
  const [savedCarts, setSavedCarts] = useState([[], []]); // Two counter carts
  const [activeCartIndex, setActiveCartIndex] = useState(0);

  // Discount & Offers — only active on weekends (Sat=6, Sun=0)
  const [hasWeekendOffer, setHasWeekendOffer] = useState(() => [0, 6].includes(new Date().getDay()));
  const [customDiscount, setCustomDiscount] = useState(0);

  // Customer & Udhaar
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [inlinePhone, setInlinePhone] = useState('');
  const [inlineName, setInlineName] = useState('');
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');

  // Checkout modal
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [tenderedCash, setTenderedCash] = useState('');
  const [loading, setLoading] = useState(false);

  // Summary dropdown toggle in footer
  const [summaryExpanded, setSummaryExpanded] = useState(false);

  // Receipt & Print
  const [savedBill, setSavedBill] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Load products from API
  const loadData = async () => {
    try {
      const [prodRes, custRes] = await Promise.allSettled([
        productAPI.getAll(),
        customerAPI.getAll(),
      ]);
      if (prodRes.status === 'fulfilled') {
        setProducts(prodRes.value.data?.data || []);
      }
      if (custRes.status === 'fulfilled' && custRes.value.data?.data) {
        setCustomers(custRes.value.data.data);
      }
    } catch (err) {
      console.error('[Billing] loadData error:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter products by category & search
  const filteredProducts = products.filter((p) => {
    const matchesCat = activeCategory === 'All Items' || p.category === activeCategory;
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.barcode && p.barcode.includes(search));
    return matchesCat && matchesSearch;
  });

  // Cart operations
  const addToCart = (product) => {
    if (product.quantity <= 0) {
      toast.error('Item is out of stock');
      return;
    }
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.quantity) {
          toast.error(`Only ${product.quantity} units available`);
          return prev;
        }
        return prev.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          unitPrice: product.sellingPrice,
          quantity: 1,
          maxQty: product.quantity,
          unit: product.unit || 'Piece',
        },
      ];
    });
  };

  const updateQty = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId !== productId) return item;
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          if (newQty > item.maxQty) {
            toast.error(`Only ${item.maxQty} units available`);
            return item;
          }
          return { ...item, quantity: newQty };
        })
        .filter(Boolean)
    );
  };

  const clearCart = () => {
    if (cart.length === 0) return;
    setCart([]);
    setSelectedCustomer(null);
    setInlinePhone('');
    setInlineName('');
    setCustomDiscount(0);
    toast.info('Cart cleared');
  };

  // Switch cart tabs (Counter 1 <-> Counter 2) — fixed stale closure
  const switchCart = () => {
    const nextIndex = activeCartIndex === 0 ? 1 : 0;
    const currentCart = cart;                       // snapshot before setState
    const nextCart = savedCarts[nextIndex] || [];   // snapshot the other cart
    setSavedCarts((prev) => {
      const updated = [...prev];
      updated[activeCartIndex] = currentCart;
      return updated;
    });
    setCart(nextCart);
    setActiveCartIndex(nextIndex);
    toast.info(`Switched to Cart ${nextIndex + 1}`);
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const totalItemsCount = cart.length;
  const totalUnitsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Weekend offer: ₹50 discount or custom discount
  const offerDiscount = hasWeekendOffer && subtotal > 200 ? 50 : 0;
  const totalDiscount = offerDiscount + (parseFloat(customDiscount) || 0);
  const netAmount = Math.max(0, subtotal - totalDiscount);

  // Cash change calculation
  const parsedTendered = parseFloat(tenderedCash) || 0;
  const changeToReturn = Math.max(0, parsedTendered - netAmount);

  // Barcode quick search trigger
  const handleBarcodeClick = () => {
    setBarcodeMode(true);
    setTimeout(() => barcodeInputRef.current?.focus(), 50);
  };

  const handleBarcodeSubmit = (e) => {
    if (e.key === 'Enter') {
      const code = e.target.value.trim();
      if (code) {
        const found = products.find((p) => p.barcode === code || p.id === code);
        if (found) {
          addToCart(found);
          toast.success(`Added ${found.name}`);
        } else {
          toast.error('Product not found for barcode');
        }
      }
      setBarcodeMode(false);
      e.target.value = '';
    } else if (e.key === 'Escape') {
      setBarcodeMode(false);
    }
  };

  // Quick search Enter handler: auto-adds item if exact barcode or single filtered result
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      const term = search.trim();
      if (!term) return;
      const exactMatch = products.find(
        (p) => p.barcode === term || p.id === term || p.name.toLowerCase() === term.toLowerCase()
      );
      if (exactMatch) {
        addToCart(exactMatch);
        toast.success(`Added ${exactMatch.name}`);
        setSearch('');
      } else if (filteredProducts.length === 1) {
        addToCart(filteredProducts[0]);
        toast.success(`Added ${filteredProducts[0].name}`);
        setSearch('');
      }
    }
  };

  // Inline Customer Mobile & Name handlers
  const handleInlinePhoneChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
    setInlinePhone(raw);
    if (raw.length === 10) {
      const match = customers.find((c) => c.phone && c.phone.replace(/\D/g, '') === raw);
      if (match) {
        setSelectedCustomer(match);
        setInlineName(match.name);
        toast.success(`Customer found: ${match.name}`);
      }
    }
  };

  const handleInlineCustomerAttach = async () => {
    const phone = inlinePhone.trim().replace(/\D/g, '');
    const name = inlineName.trim();
    if (!name && !phone) return;

    if (phone) {
      const existing = customers.find((c) => c.phone && c.phone.replace(/\D/g, '') === phone);
      if (existing) {
        setSelectedCustomer(existing);
        setInlineName(existing.name);
        toast.success(`Attached ${existing.name}`);
        return;
      }
    }

    const custName = name || (phone ? `Customer (${phone})` : 'Walk-in Customer');
    try {
      const res = await customerAPI.create({ name: custName, phone: phone || null });
      const created = res.data.data;
      setCustomers((prev) => [...prev, created]);
      setSelectedCustomer(created);
      toast.success(`Customer ${created.name} linked!`);
    } catch {
      const tempCust = { id: null, name: custName, phone, balance: 0 };
      setSelectedCustomer(tempCust);
      toast.success(`Customer ${custName} linked!`);
    }
  };

  // Checkout submission
  const handleCheckoutSubmit = async () => {
    if (cart.length === 0) return;

    let custToUse = selectedCustomer;
    // Auto-create/attach if cashier typed into inline inputs without clicking Link
    if (!custToUse && (inlinePhone.trim() || inlineName.trim())) {
      const phone = inlinePhone.trim().replace(/\D/g, '');
      const name = inlineName.trim() || (phone ? `Customer (${phone})` : 'Customer');
      const existing = phone ? customers.find((c) => c.phone && c.phone.replace(/\D/g, '') === phone) : null;
      if (existing) {
        custToUse = existing;
      } else {
        try {
          const res = await customerAPI.create({ name, phone: phone || null });
          custToUse = res.data.data;
          setCustomers((prev) => [...prev, custToUse]);
        } catch {
          custToUse = null;
        }
      }
      setSelectedCustomer(custToUse);
    }

    if (paymentMethod === 'CREDIT' && !custToUse) {
      toast.error('Please enter customer details for Udhaar credit');
      return;
    }

    setLoading(true);
    const billData = {
      customerId: custToUse?.id || null,
      items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice })),
      discountAmount: totalDiscount,
      paymentMethod,
      paidAmount: paymentMethod === 'CREDIT' ? 0 : netAmount,
    };

    try {
      const res = await billAPI.create(billData);
      setSavedBill(res.data.data);
      setShowCheckoutModal(false);
      setShowReceipt(true);
      setCart([]);
      setSelectedCustomer(null);
      setInlinePhone('');
      setInlineName('');
      toast.success('Sale completed successfully!');
      loadData();
    } catch (err) {
      console.error('[Billing] Bill creation failed:', err);
      const msg = err.response?.data?.message || 'Failed to create bill. Please check connection and try again.';
      toast.error(msg);
      // Keep cart intact so user can retry
    } finally {
      setLoading(false);
    }
  };

  // Global F8 shortcut for 1-Click Bill & Print
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === 'F8') {
        e.preventDefault();
        if (showCheckoutModal) {
          handleCheckoutSubmit();
        } else if (cart.length > 0) {
          setShowCheckoutModal(true);
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [showCheckoutModal, cart, totalDiscount, paymentMethod, selectedCustomer]);

  // Quick Customer Create
  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    if (!newCustName.trim()) return;
    try {
      const res = await customerAPI.create({ name: newCustName, phone: newCustPhone });
      const created = res.data.data;
      setCustomers((prev) => [...prev, created]);
      setSelectedCustomer(created);
      setShowCustomerModal(false);
      setNewCustName('');
      setNewCustPhone('');
      toast.success(`Customer ${created.name} added!`);
    } catch {
      const tempCust = { id: `cust-${Date.now()}`, name: newCustName, phone: newCustPhone, balance: 0 };
      setCustomers((prev) => [...prev, tempCust]);
      setSelectedCustomer(tempCust);
      setShowCustomerModal(false);
      setNewCustName('');
      setNewCustPhone('');
      toast.success(`Customer ${tempCust.name} added!`);
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      (c.phone && c.phone.includes(customerSearch))
  );

  return (
    <AppLayout>
      {({ toggleSidebar, timeStr }) => (
        <div className="gobill-pos-container">
          {/* Top POS Header matching GoBill */}
          <header className="gobill-header">
            {/* Left: Hamburger, Brand, Time */}
            <div className="gobill-header-left">
              <button className="gobill-menu-btn" onClick={toggleSidebar} title="Menu">
                <Menu size={22} />
              </button>
              <div className="gobill-brand">
                <span>{user?.shop?.name || 'Smart Dukaan'}</span>
                <span className="gobill-time-badge">{timeStr || '09:30 PM'}</span>
              </div>
            </div>

            {/* Center Tools: Search, Scan, Refresh */}
            <div className="gobill-header-center">
              <button
                className="gobill-action-btn"
                onClick={() => document.getElementById('pos-search-input')?.focus()}
                title="Search Products"
              >
                <Search size={19} />
              </button>
              <button className="gobill-action-btn" onClick={handleBarcodeClick} title="Scan Barcode">
                <ScanBarcode size={20} />
              </button>
              <button className="gobill-action-btn" onClick={loadData} title="Sync / Refresh">
                <RotateCw size={18} />
              </button>
              <button className="gobill-action-btn" onClick={() => setShowHistoryModal(true)} title="Bill History / Void Bills">
                <History size={18} />
              </button>
              <ThemeToggle variant="icon" style={{ width: 34, height: 34 }} />
            </div>

            {/* Right: Cart Header & Controls */}
            <div className="gobill-header-cart">
              <span className="gobill-cart-title">Cart</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  className="gobill-action-btn"
                  onClick={() => setShowCustomerModal(true)}
                  title={selectedCustomer ? `Customer: ${selectedCustomer.name}` : 'Add / Select Customer'}
                  style={{ color: selectedCustomer ? '#38bdf8' : '#ffffff' }}
                >
                  <UserPlus size={19} />
                </button>
                <button
                  className="gobill-action-btn"
                  onClick={() => {
                    if (cart.length === 0) return toast.info('Cart is already empty');
                    setSavedCarts((prev) => {
                      const updated = [...prev];
                      updated[activeCartIndex] = cart;
                      return updated;
                    });
                    setCart([]);
                    setSelectedCustomer(null);
                    setCustomDiscount(0);
                    toast.success('Cart held — start a new bill');
                  }}
                  title="Hold Cart"
                >
                  <PauseCircle size={19} />
                </button>
                <button
                  className="gobill-action-btn"
                  onClick={switchCart}
                  title={`Switch Cart (Current: ${activeCartIndex + 1})`}
                >
                  <Repeat size={18} />
                  <span className="badge-counter">{savedCarts[activeCartIndex === 0 ? 1 : 0]?.length || 2}</span>
                </button>
                <button
                  className="gobill-action-btn"
                  onClick={() => {
                    const d = prompt('Enter special discount amount (₹):', customDiscount);
                    if (d !== null) setCustomDiscount(parseFloat(d) || 0);
                  }}
                  title="More Options / Custom Discount"
                >
                  <MoreVertical size={19} />
                </button>
              </div>
            </div>
          </header>

          {/* Category Tabs Bar */}
          <div className="gobill-category-bar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`gobill-category-tab ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Main 2-Panel Body: Catalog Grid (Left) + Cart Panel (Right) */}
          <div className="gobill-pos-body">
            {/* Catalog Grid */}
            <div className="gobill-catalog-area">
              {/* Optional inline quick search */}
              <div className="gobill-search-bar">
                {barcodeMode ? (
                  <>
                    <ScanBarcode size={18} style={{ color: 'var(--primary)' }} />
                    <input
                      ref={barcodeInputRef}
                      className="gobill-search-input"
                      style={{ paddingLeft: 10, borderColor: 'var(--primary)' }}
                      placeholder="Scan/type barcode and press Enter (Esc to cancel)..."
                      onKeyDown={handleBarcodeSubmit}
                    />
                    <button
                      onClick={() => setBarcodeMode(false)}
                      style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                    >
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <Search size={16} style={{ color: '#94a3b8' }} />
                    <input
                      id="pos-search-input"
                      className="gobill-search-input"
                      style={{ paddingLeft: 10 }}
                      placeholder="Search item by name or scan barcode..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onKeyDown={handleSearchKeyDown}
                    />
                    {search && (
                      <button
                        onClick={() => setSearch('')}
                        style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Product Grid (4 columns) */}
              <div className="gobill-product-grid">
                {filteredProducts.length === 0 ? (
                  <div className="empty-state" style={{ gridColumn: '1 / -1', padding: '60px 20px', textAlign: 'center' }}>
                    <Package size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                    <p style={{ fontWeight: 600, fontSize: 16 }}>No products found</p>
                    <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
                      Add items in the <b>Inventory</b> module to start billing
                    </p>
                  </div>
                ) : (
                  filteredProducts.map((p) => (
                    <div
                      key={p.id}
                      className={`gobill-product-card ${p.quantity <= 0 ? 'out-of-stock' : ''}`}
                      onClick={() => addToCart(p)}
                    >
                      {/* Low stock indicator */}
                      {p.quantity > 0 && p.quantity <= 5 && (
                        <span className="badge badge-warning gobill-stock-badge">
                          {p.quantity} left
                        </span>
                      )}

                      {/* Image / Thumbnail Container */}
                      <div className="gobill-product-img-box">
                        {p.img ? (
                          <img
                            src={p.img}
                            alt={p.name}
                            className="gobill-product-img"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          className="gobill-product-placeholder"
                          style={{ display: p.img ? 'none' : 'flex' }}
                        >
                          <Package size={26} />
                        </div>
                      </div>

                      {/* 2-line title */}
                      <div className="gobill-product-name" title={p.name}>
                        {p.name}
                      </div>

                      {/* Bottom Slate-Blue Price Pill */}
                      <div className="gobill-price-pill">
                        Rs. {(p.sellingPrice || 0).toFixed(2)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Cart Panel (Right) */}
            <div className="gobill-cart-area">
              {/* Inline Customer Header (No popup needed, WhatsApp auto-link) */}
              {selectedCustomer ? (
                <div
                  style={{
                    padding: '8px 12px',
                    background: 'var(--primary-bg)',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <User size={13} />
                    </div>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{selectedCustomer.name}</span>
                      {selectedCustomer.phone && (
                        <span style={{ color: 'var(--text-muted)', marginLeft: 6, fontSize: 11 }}>📱 {selectedCustomer.phone}</span>
                      )}
                      {selectedCustomer.balance > 0 && (
                        <span style={{ color: '#dc2626', fontWeight: 700, marginLeft: 8, fontSize: 11 }}>
                          (Udhaar: ₹{selectedCustomer.balance})
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCustomer(null);
                      setInlinePhone('');
                      setInlineName('');
                    }}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}
                    title="Change Customer"
                  >
                    <X size={15} />
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    padding: '8px 10px',
                    background: 'var(--bg-hover)',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 12,
                  }}
                >
                  <div style={{ position: 'relative', flex: 1.2 }}>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="📱 Mobile (10 digits)..."
                      value={inlinePhone}
                      onChange={handleInlinePhoneChange}
                      style={{
                        width: '100%',
                        padding: '5px 8px 5px 24px',
                        borderRadius: 6,
                        border: '1px solid var(--border)',
                        background: 'var(--bg-surface)',
                        color: 'var(--text-primary)',
                        fontSize: 12,
                        outline: 'none',
                        height: 30,
                        boxSizing: 'border-box',
                      }}
                    />
                    <Phone size={12} style={{ position: 'absolute', left: 7, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  </div>

                  <div style={{ position: 'relative', flex: 1 }}>
                    <input
                      type="text"
                      placeholder="Name (Optional)..."
                      value={inlineName}
                      onChange={(e) => setInlineName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleInlineCustomerAttach();
                      }}
                      style={{
                        width: '100%',
                        padding: '5px 8px 5px 22px',
                        borderRadius: 6,
                        border: '1px solid var(--border)',
                        background: 'var(--bg-surface)',
                        color: 'var(--text-primary)',
                        fontSize: 12,
                        outline: 'none',
                        height: 30,
                        boxSizing: 'border-box',
                      }}
                    />
                    <User size={12} style={{ position: 'absolute', left: 6, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  </div>

                  {(inlinePhone.trim() || inlineName.trim()) && (
                    <button
                      type="button"
                      onClick={handleInlineCustomerAttach}
                      className="btn btn-primary"
                      style={{ padding: '0 8px', fontSize: 11, height: 30, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4 }}
                      title="Link Customer to Bill"
                    >
                      <Check size={12} /> Link
                    </button>
                  )}
                </div>
              )}

              {/* Cart Items List */}
              <div className="gobill-cart-items-list">
                {cart.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                    <Package size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                    <p style={{ fontSize: 14, fontWeight: 500 }}>Cart is empty</p>
                    <p style={{ fontSize: 12, marginTop: 4 }}>Tap any product on the left to add</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.productId} className="gobill-cart-row">
                      <div className="gobill-cart-row-info">
                        <div className="gobill-cart-row-title">{item.name}</div>
                        <div className="gobill-cart-row-sub">
                          {item.unit} • ₹{item.unitPrice.toFixed(2)} each
                        </div>
                        {/* Qty Stepper */}
                        <div className="gobill-qty-box">
                          <button className="gobill-qty-btn" onClick={() => updateQty(item.productId, -1)}>
                            <Minus size={12} />
                          </button>
                          <span className="gobill-qty-text">{item.quantity}</span>
                          <button className="gobill-qty-btn" onClick={() => updateQty(item.productId, 1)}>
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                      <div className="gobill-cart-row-price">
                        {fmt(item.unitPrice * item.quantity)}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Weekend Offer Tag Pill */}
              {hasWeekendOffer && subtotal > 0 && (
                <div
                  className="gobill-offer-pill"
                  onClick={() => {
                    setHasWeekendOffer(false);
                    toast.info('Weekend offer removed');
                  }}
                  title="Click to remove offer"
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Tag size={13} /> Weekend Offer (-₹50.00)
                  </span>
                  <X size={13} />
                </div>
              )}

              {/* Bottom Sticky Cart Footer */}
              <div className="gobill-cart-footer">
                {/* Summary toggler */}
                <div
                  className="gobill-total-summary-bar"
                  onClick={() => setSummaryExpanded((prev) => !prev)}
                >
                  <span>
                    Total Items: <b>{totalItemsCount}</b>, Total Quantity: <b>{totalUnitsCount}</b>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    {summaryExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </span>
                </div>

                {/* Collapsible Details */}
                {summaryExpanded && (
                  <div
                    style={{
                      background: 'var(--bg-hover)',
                      border: '1px solid var(--border)',
                      borderRadius: 6,
                      padding: '8px 12px',
                      fontSize: 12,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                      <span style={{ color: 'var(--text-primary)' }}>{fmt(subtotal)}</span>
                    </div>
                    {totalDiscount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                        <span>Discount</span>
                        <span>-{fmt(totalDiscount)}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, paddingTop: 4, borderTop: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                      <span>Net Total</span>
                      <span>{fmt(netAmount)}</span>
                    </div>
                  </div>
                )}

                {/* Action Buttons: Clear Cart + Big Blue Checkout */}
                <div className="gobill-action-row">
                  <button className="gobill-clear-btn" onClick={clearCart} title="Clear Cart">
                    <Trash2 size={20} />
                  </button>
                  <button
                    className="gobill-checkout-btn"
                    onClick={() => setShowCheckoutModal(true)}
                    disabled={cart.length === 0}
                  >
                    <span>Checkout</span>
                    <span>{fmt(netAmount)}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* POS Checkout & Payment Modal */}
          {showCheckoutModal && (
            <div className="modal-overlay">
              <div className="modal" style={{ maxWidth: 480 }}>
                <div className="modal-header">
                  <span className="modal-title">Payment & Checkout</span>
                  <button className="close-btn" onClick={() => setShowCheckoutModal(false)}>
                    <X size={18} />
                  </button>
                </div>

                <div className="modal-body">
                  {/* Amount Due Banner */}
                  <div
                    style={{
                      background: 'var(--primary-bg)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      padding: '14px 18px',
                      textAlign: 'center',
                      marginBottom: 16,
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase' }}>
                      Total Amount Payable
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary)', marginTop: 2 }}>
                      {fmt(netAmount)}
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="form-group">
                    <label className="form-label">Select Payment Method</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                      {[
                        { id: 'CASH', label: 'Cash', icon: Banknote },
                        { id: 'UPI', label: 'UPI / QR', icon: Smartphone },
                        { id: 'CREDIT', label: 'Udhaar', icon: CreditCard },
                      ].map((m) => {
                        const Icon = m.icon;
                        const isSel = paymentMethod === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            className={`btn ${isSel ? 'btn-primary' : 'btn-ghost'}`}
                            style={{ height: 44, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}
                            onClick={() => setPaymentMethod(m.id)}
                          >
                            <Icon size={16} />
                            <span style={{ fontSize: 11 }}>{m.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Cash Options */}
                  {paymentMethod === 'CASH' && (
                    <div style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)', padding: 12, borderRadius: 8, marginBottom: 14 }}>
                      <div className="form-group" style={{ marginBottom: 8 }}>
                        <label className="form-label">Cash Received (₹)</label>
                        <input
                          className="form-control"
                          type="number"
                          placeholder={netAmount.toFixed(0)}
                          value={tenderedCash}
                          onChange={(e) => setTenderedCash(e.target.value)}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                        {[netAmount, 500, 1000, 2000].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            className="btn btn-ghost btn-sm"
                            style={{ flex: 1, fontSize: 11 }}
                            onClick={() => setTenderedCash(amt.toString())}
                          >
                            ₹{amt}
                          </button>
                        ))}
                      </div>
                      {parsedTendered > netAmount && (
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#16a34a', textAlign: 'right' }}>
                          Change to return: ₹{changeToReturn.toFixed(2)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Counter UPI Standee Mode (100% Free - Offline QR Standee) */}
                  {paymentMethod === 'UPI' && (
                    <div style={{ textAlign: 'center', padding: '16px 14px', background: 'var(--bg-hover)', border: '1px solid var(--border)', borderRadius: 8, marginBottom: 14 }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                        <Smartphone size={22} />
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Counter UPI Standee Mode</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                        Customer scans your counter PhonePe / Paytm / GPay QR standee. Zero screen wait or gateway delay.
                      </p>
                    </div>
                  )}

                  {/* Udhaar / Customer Selector */}
                  {paymentMethod === 'CREDIT' && (
                    <div style={{ background: 'var(--warning-bg)', border: '1px solid var(--warning-border)', padding: 12, borderRadius: 8, marginBottom: 14 }}>
                      <div className="form-group" style={{ marginBottom: 6 }}>
                        <label className="form-label" style={{ color: 'var(--warning-dark)' }}>
                          Customer for Udhaar Ledger *
                        </label>
                        {selectedCustomer ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-surface)', borderRadius: 6, border: '1px solid var(--border)' }}>
                            <div>
                              <b style={{ color: 'var(--text-primary)' }}>{selectedCustomer.name}</b> {selectedCustomer.phone && <span style={{ color: 'var(--text-muted)' }}>({selectedCustomer.phone})</span>}
                              <div style={{ fontSize: 11, color: 'var(--danger)' }}>
                                Outstanding: ₹{selectedCustomer.balance || 0}
                              </div>
                            </div>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => setSelectedCustomer(null)}
                            >
                              Change
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-primary w-full"
                            onClick={() => setShowCustomerModal(true)}
                          >
                            Select / Add Customer
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="modal-footer">
                  <button className="btn btn-ghost" onClick={() => setShowCheckoutModal(false)}>
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleCheckoutSubmit}
                    disabled={loading || (paymentMethod === 'CREDIT' && !selectedCustomer)}
                  >
                    {loading ? 'Processing...' : 'Confirm & Print Receipt (F8)'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Customer Selection Modal */}
          {showCustomerModal && (
            <div className="modal-overlay">
              <div className="modal" style={{ maxWidth: 440 }}>
                <div className="modal-header">
                  <span className="modal-title">Select Customer</span>
                  <button className="close-btn" onClick={() => setShowCustomerModal(false)}>
                    <X size={18} />
                  </button>
                </div>
                <div className="modal-body">
                  <input
                    className="form-control"
                    placeholder="Search customer by name or phone..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    style={{ marginBottom: 12 }}
                  />

                  {/* List of existing customers */}
                  <div style={{ maxHeight: 180, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 6, marginBottom: 16 }}>
                    {filteredCustomers.length === 0 ? (
                      <p style={{ padding: 12, fontSize: 12, color: '#64748b', textAlign: 'center' }}>
                        No customers found
                      </p>
                    ) : (
                      filteredCustomers.map((c) => (
                        <div
                          key={c.id}
                          style={{
                            padding: '8px 12px',
                            borderBottom: '1px solid #f1f5f9',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: 13,
                          }}
                          onClick={() => {
                            setSelectedCustomer(c);
                            setShowCustomerModal(false);
                            toast.success(`Selected ${c.name}`);
                          }}
                        >
                          <div>
                            <b>{c.name}</b>
                            {c.phone && <span style={{ color: '#64748b', marginLeft: 6 }}>{c.phone}</span>}
                          </div>
                          <span style={{ color: c.balance > 0 ? '#dc2626' : '#16a34a', fontWeight: 600 }}>
                            ₹{c.balance || 0}
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Quick add new customer form */}
                  <form onSubmit={handleCreateCustomer}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
                      Or Add New Customer:
                    </div>
                    <div className="form-row" style={{ marginBottom: 8 }}>
                      <input
                        className="form-control"
                        placeholder="Customer Name *"
                        value={newCustName}
                        onChange={(e) => setNewCustName(e.target.value)}
                        required
                      />
                      <input
                        className="form-control"
                        type="tel"
                        placeholder="Phone (Optional)"
                        value={newCustPhone}
                        onChange={(e) => setNewCustPhone(e.target.value)}
                      />
                    </div>
                    <button type="submit" className="btn btn-secondary w-full btn-sm">
                      <Plus size={14} /> Add & Select Customer
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Receipt Preview & Print Modal */}
          {showReceipt && savedBill && (
            <ReceiptModal
              bill={savedBill}
              shop={user?.shop}
              onClose={() => setShowReceipt(false)}
            />
          )}

          {/* Bill History Modal */}
          {showHistoryModal && (
            <BillHistoryModal
              onClose={() => setShowHistoryModal(false)}
              onBillVoided={loadData}
            />
          )}
        </div>
      )}
    </AppLayout>
  );
}

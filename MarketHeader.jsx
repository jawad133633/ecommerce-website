import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function MarketHeader() {
  const [count, setCount] = useState(() => Number(localStorage.getItem('markethub-cart') || 0));
  useEffect(() => { const sync = () => setCount(Number(localStorage.getItem('markethub-cart') || 0)); window.addEventListener('market-cart-updated', sync); window.addEventListener('storage', sync); return () => { window.removeEventListener('market-cart-updated', sync); window.removeEventListener('storage', sync); }; }, []);
  return <><div className="announcement">A little more you. A little less ordinary. <span>Thoughtful finds from independent shops</span></div><header className="site-header"><Link className="brand" to="/" aria-label="MarketHub home">market<span>hub</span><i>®</i></Link><nav className="main-nav" aria-label="Main navigation"><Link to="/discover">Discover</Link><Link to="/shops">Shops</Link><Link to="/#our-story">Our story</Link></nav><div className="header-actions"><Link className="header-login" to={localStorage.getItem('token') ? '/dashboard' : '/login'}>{localStorage.getItem('token') ? 'My account' : 'Log in'}</Link>{localStorage.getItem('token') && <Link className="header-login" to="/orders">Orders</Link>}<Link className="bag-button" to="/cart">Bag <span>{count}</span></Link></div></header></>;
}

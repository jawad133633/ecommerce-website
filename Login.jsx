import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const handleChange = (event) => setFormData({ ...formData, [event.target.name]: event.target.value });
  const handleSubmit = async (event) => {
    event.preventDefault(); setError(''); setLoading(true);
    try {
      const { data } = await api.post('/auth/login', formData);
      if (!data.token || !data.user) throw new Error('Invalid login response from server');
      localStorage.setItem('token', data.token); localStorage.setItem('user', JSON.stringify(data.user)); navigate(location.state?.next || '/');
    } catch (err) { setError(err.response?.data?.message || err.message || 'Login failed. Please try again.'); }
    finally { setLoading(false); }
  };
  return <div className="auth-page"><header className="auth-topbar"><Link className="brand" to="/">market<span>hub</span><i>®</i></Link><Link className="auth-back" to="/">← Back to marketplace</Link></header><main className="auth-layout"><section className="auth-story"><span className="eyebrow">A MARKETPLACE WITH A LITTLE MORE MEANING</span><h2>Find your corner<br /><em>of the market.</em></h2><p>Good things are made by good people. Come back and discover what the independent shops are making.</p><small>INDEPENDENT SHOPS · THOUGHTFUL FINDS</small></section><section className="auth-form-wrap"><h1>Welcome back.</h1><p>Log in to your MarketHub account.</p>{error && <div role="alert" className="form-alert">{error}</div>}<form onSubmit={handleSubmit} className="auth-form"><label htmlFor="email">Email address<input id="email" name="email" type="email" value={formData.email} onChange={handleChange} autoComplete="email" placeholder="you@example.com" required /></label><label htmlFor="password">Password<input id="password" name="password" type="password" value={formData.password} onChange={handleChange} autoComplete="current-password" placeholder="Enter your password" required /></label><button type="submit" disabled={loading} className="auth-submit">{loading ? 'Logging in...' : 'Log in to your account'}</button></form><p className="auth-foot">New around here? <Link to="/signup" state={{ next: location.state?.next }}>Create an account</Link></p></section></main></div>;
}

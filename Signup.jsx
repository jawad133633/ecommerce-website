import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';

export default function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false); const [error, setError] = useState(''); const [success, setSuccess] = useState('');
  const handleChange = (event) => setFormData({ ...formData, [event.target.name]: event.target.value });
  const handleSubmit = async (event) => {
    event.preventDefault(); setError(''); setSuccess(''); setLoading(true);
    try { const { data } = await api.post('/auth/signup', formData); setSuccess(data.message); setTimeout(() => navigate('/login', { state: { next: searchParams.get('next') || location.state?.next || '/' } }), 1100); }
    catch (err) { setError(err.response?.data?.message || 'Signup failed. Check your backend connection.'); }
    finally { setLoading(false); }
  };
  return <div className="auth-page"><header className="auth-topbar"><Link className="brand" to="/">market<span>hub</span><i>®</i></Link><Link className="auth-back" to="/">← Back to marketplace</Link></header><main className="auth-layout"><section className="auth-story"><span className="eyebrow">GOOD THINGS START SOMEWHERE</span><h2>Come for a find.<br /><em>Stay for the people.</em></h2><p>Browse one-of-a-kind finds today, or set up a shop of your own when you're ready to share something with the world.</p><small>YOUR PEOPLE ARE HERE</small></section><section className="auth-form-wrap"><h1>Join the market.</h1><p>Create your free account and find your people.</p>{error && <div role="alert" className="form-alert">{error}</div>}{success && <div role="status" className="form-success">{success}</div>}<form onSubmit={handleSubmit} className="auth-form"><label htmlFor="name">Your name<input id="name" name="name" value={formData.name} onChange={handleChange} autoComplete="name" placeholder="What should we call you?" required /></label><label htmlFor="email">Email address<input id="email" name="email" type="email" value={formData.email} onChange={handleChange} autoComplete="email" placeholder="you@example.com" required /></label><label htmlFor="password">Create a password<input id="password" name="password" type="password" value={formData.password} onChange={handleChange} autoComplete="new-password" minLength={6} placeholder="At least 6 characters" required /></label><button type="submit" disabled={loading} className="auth-submit">{loading ? 'Creating your account...' : 'Create your account'}</button></form><p className="auth-foot">Already part of the market? <Link to="/login" state={{ next: searchParams.get('next') || location.state?.next }}>Log in</Link></p></section></main></div>;
}

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Skull, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      login(res.data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login. Brain machine broke.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] bg-noise flex flex-col items-center justify-center text-white font-inter p-4 relative overflow-hidden">
      
      <div className="w-full max-w-md bg-yellow-400 text-black p-8 border-4 border-black brutalist-shadow transform rotate-1">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Skull className="w-16 h-16 text-black" strokeWidth={2.5} />
          </div>
          <h1 className="text-5xl font-black font-space uppercase" style={{ textShadow: '4px 4px 0px #fff' }}>
            RESUME BRAINROT
          </h1>
          <p className="text-black font-bold mt-2 text-sm border-2 border-black bg-white inline-block px-2">"I'll just make one more meme before bed" - Liar</p>
        </div>

        {error && (
          <div className="bg-red-500 border-4 border-black text-white px-4 py-3 mb-6 text-sm text-center font-black uppercase brutalist-shadow transform -rotate-1">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="transform -rotate-1">
            <label className="block text-black text-sm font-black mb-2 uppercase tracking-widest font-space">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border-4 border-black focus:bg-cyan-100 text-black px-4 py-3 outline-none font-bold brutalist-shadow"
              placeholder="youremail@maybe.com"
              required
            />
          </div>

          <div className="transform rotate-1">
            <label className="block text-black text-sm font-black mb-2 uppercase tracking-widest font-space">
              Secret Handshake (Password)
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border-4 border-black focus:bg-cyan-100 text-black px-4 py-3 outline-none font-bold pr-12 brutalist-shadow"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-black hover:scale-110 transition-transform"
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={24} strokeWidth={3} /> : <Eye size={24} strokeWidth={3} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-500 text-white border-4 border-black font-black py-4 px-6 font-space text-2xl tracking-wider transition-transform hover-brutalist brutalist-shadow flex items-center justify-center gap-2 group disabled:opacity-50 mt-8 transform -rotate-1"
          >
            {loading ? 'LOADING CHUNKS...' : 'LET ME IN'}
            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" strokeWidth={3} />
          </button>
        </form>

        <p className="mt-8 text-center text-black text-sm flex flex-col gap-3 font-bold">
          <span>
            Don't have an account?{' '}
            <Link to="/signup" className="text-black hover:text-pink-600 font-black underline decoration-4 underline-offset-4 bg-white px-1">
              Enter The Memeverse
            </Link>
          </span>
          <Link to="/" className="text-black hover:text-pink-600 transition-colors inline-block mt-4 font-black font-space tracking-widest border-2 border-black bg-white px-3 py-1 self-center brutalist-shadow">
            ← CONTINUE AS GUEST
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMemeById, reactToMeme } from '../services/communityService';
import { useAuth } from '../context/AuthContext';
import { ThumbsUp, ThumbsDown, Copy, CheckCircle, ArrowLeft } from 'lucide-react';

const MemeDetailsScreen = () => {
  const { id } = useParams();
  const { user, token } = useAuth();
  const [meme, setMeme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchMeme();
  }, [id]);

  const fetchMeme = async () => {
    try {
      const data = await getMemeById(id);
      setMeme(data.meme);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to load meme. Maybe it was too cursed?');
      setLoading(false);
    }
  };

  const handleReact = async (reactionType) => {
    if (!user) {
      alert("You must ENTER THE MEMEVERSE (sign in) to react to this masterpiece!");
      return;
    }
    
    try {
      const data = await reactToMeme(id, reactionType, token);
      setMeme(prev => ({
        ...prev,
        likes: data.likes > prev.likes.length ? [...prev.likes, user._id] : prev.likes.filter(uid => uid !== user._id),
        dislikes: data.dislikes > prev.dislikes.length ? [...prev.dislikes, user._id] : prev.dislikes.filter(uid => uid !== user._id)
      }));
      // Re-fetch to ensure exact state if needed, or we can just rely on the above optimistic/merged update
      fetchMeme();
    } catch (err) {
      console.error(err);
      alert('Failed to react.');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111111] bg-noise flex items-center justify-center">
        <h1 className="text-5xl text-white font-space font-black animate-pulse" style={{ textShadow: '4px 4px 0px #000' }}>
          LOADING CHAOS...
        </h1>
      </div>
    );
  }

  if (error || !meme) {
    return (
      <div className="min-h-screen bg-[#111111] bg-noise flex flex-col items-center justify-center gap-6 text-white p-6">
        <div className="bg-red-500 border-4 border-black p-6 brutalist-shadow-lg transform -rotate-2">
          <h1 className="text-4xl text-white font-space font-black uppercase">{error}</h1>
        </div>
        <Link to="/" className="bg-white text-black border-4 border-black px-6 py-3 font-black font-space text-xl tracking-widest hover-brutalist brutalist-shadow transition-transform">
          RETURN TO SAFETY
        </Link>
      </div>
    );
  }

  const userHasLiked = user && meme.likes?.includes(user._id);
  const userHasDisliked = user && meme.dislikes?.includes(user._id);

  return (
    <div className="min-h-screen bg-[#111111] bg-noise text-white p-6 pt-24 font-inter relative overflow-hidden">
      <div className="max-w-4xl mx-auto flex flex-col gap-12 items-center">
        <div className="w-full flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 bg-white text-black border-4 border-black px-4 py-2 font-black font-space tracking-wider hover-brutalist transition-transform brutalist-shadow">
            <ArrowLeft size={24} strokeWidth={3} /> HOME
          </Link>
          <button 
            onClick={handleCopyLink}
            className="flex items-center gap-2 bg-lime-400 text-black border-4 border-black px-4 py-2 font-black font-space tracking-wider hover-brutalist transition-transform brutalist-shadow"
          >
            {copied ? <CheckCircle size={20} strokeWidth={3} className="text-black"/> : <Copy size={20} strokeWidth={3} />}
            {copied ? 'COPIED!' : 'SHARE LINK'}
          </button>
        </div>

        <div className="w-full bg-white border-4 border-black p-4 brutalist-shadow-lg flex flex-col items-center transform rotate-1">
          <img src={meme.imageData} alt="Shared Meme" className="w-full max-w-2xl object-contain border-4 border-black bg-gray-200" />
          
          <div className="w-full max-w-2xl mt-8 flex flex-col md:flex-row justify-between items-center bg-yellow-400 p-6 border-4 border-black brutalist-shadow transform -rotate-1 gap-4">
            <div className="text-black">
              <h2 className="text-sm font-black tracking-widest uppercase bg-white border-2 border-black inline-block px-2">Creator</h2>
              <p className="text-3xl font-black font-space mt-2">
                @{meme.creator?.username || 'Anonymous Meme Lord'}
              </p>
              <p className="text-xs font-bold text-black/60 mt-1">{new Date(meme.createdAt).toLocaleString()}</p>
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={() => handleReact('like')}
                className={`flex flex-col items-center justify-center p-3 border-4 border-black transition-transform brutalist-shadow hover-brutalist min-w-[80px] ${userHasLiked ? 'bg-pink-500 text-white translate-x-[2px] translate-y-[2px] shadow-[2px_2px_0px_#000]' : 'bg-white text-black'}`}
              >
                <ThumbsUp size={24} strokeWidth={3} />
                <span className="font-black font-space text-lg mt-1">{meme.likes?.length || 0}</span>
              </button>
              
              <button 
                onClick={() => handleReact('dislike')}
                className={`flex flex-col items-center justify-center p-3 border-4 border-black transition-transform brutalist-shadow hover-brutalist min-w-[80px] ${userHasDisliked ? 'bg-cyan-400 text-black translate-x-[2px] translate-y-[2px] shadow-[2px_2px_0px_#000]' : 'bg-white text-black'}`}
              >
                <ThumbsDown size={24} strokeWidth={3} />
                <span className="font-black font-space text-lg mt-1">{meme.dislikes?.length || 0}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemeDetailsScreen;

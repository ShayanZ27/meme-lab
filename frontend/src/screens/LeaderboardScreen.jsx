import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTrendingMemes } from '../services/communityService';
import { ThumbsUp, Flame, Calendar, Clock, Trophy, ArrowLeft } from 'lucide-react';

const timeframes = [
  { id: 'today', label: 'TODAY', icon: Flame },
  { id: 'week', label: 'THIS WEEK', icon: Calendar },
  { id: 'month', label: 'THIS MONTH', icon: Clock },
  { id: 'all_time', label: 'ALL TIME', icon: Trophy }
];

const LeaderboardScreen = () => {
  const [activeTab, setActiveTab] = useState('today');
  const [memes, setMemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrending(activeTab);
  }, [activeTab]);

  const fetchTrending = async (timeframe) => {
    setLoading(true);
    try {
      const data = await getTrendingMemes(timeframe);
      setMemes(data.memes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] bg-noise text-white p-6 pt-24 font-inter relative overflow-hidden">

      <div className="max-w-6xl mx-auto flex flex-col gap-12">
        <div className="w-full flex justify-start">
          <Link to="/" className="flex items-center gap-2 bg-white text-black border-4 border-black px-4 py-2 font-black font-space tracking-wider hover-brutalist transition-transform brutalist-shadow">
            <ArrowLeft size={24} strokeWidth={3} /> HOME
          </Link>
        </div>
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-space font-black text-white mb-6 uppercase" style={{ textShadow: '6px 6px 0px #000' }}>
            MEMEVERSE
            <span className="bg-pink-500 text-black border-4 border-black px-4 py-1 ml-4 inline-block rotate-2 brutalist-shadow">
              LEADERBOARD
            </span>
          </h1>
          <p className="text-xl font-bold bg-white text-black border-2 border-black inline-block px-4 py-2 brutalist-shadow">The most cursed creations of the internet.</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-6 my-6">
          {timeframes.map(tf => {
            const Icon = tf.icon;
            const isActive = activeTab === tf.id;
            return (
              <button
                key={tf.id}
                onClick={() => setActiveTab(tf.id)}
                className={`flex items-center gap-2 px-6 py-3 font-black text-lg tracking-wider transition-transform border-4 border-black ${isActive ? 'bg-cyan-400 text-black brutalist-shadow scale-105 -rotate-1' : 'bg-white text-black hover-brutalist brutalist-shadow'}`}
                style={{ fontFamily: 'Space Grotesk' }}
              >
                <Icon size={24} strokeWidth={3} />
                {tf.label}
              </button>
            )
          })}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
             <h2 className="text-5xl text-white font-space font-black animate-pulse" style={{ textShadow: '4px 4px 0px #000' }}>FETCHING DANKNESS...</h2>
          </div>
        ) : memes.length === 0 ? (
          <div className="flex justify-center items-center h-64 border-4 border-black bg-white brutalist-shadow">
            <h2 className="text-3xl text-black font-black font-space tracking-widest">NO MEMES FOUND. BE THE FIRST!</h2>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {memes.map((meme, index) => {
              // Add some random rotation to the cards for chaos
              const rotation = [-2, -1, 0, 1, 2][index % 5];
              return (
                <Link 
                  to={`/meme/${meme._id}`} 
                  key={meme._id}
                  className={`group relative bg-white border-4 border-black overflow-hidden hover-brutalist brutalist-shadow transition-transform`}
                  style={{ transform: `rotate(${rotation}deg)` }}
                >
                  {/* Rank Badge */}
                  <div className="absolute top-3 left-3 bg-yellow-400 border-2 border-black text-black px-3 py-1 font-black text-xl z-10 brutalist-shadow font-space">
                    #{index + 1}
                  </div>
                  
                  {/* Likes Badge */}
                  <div className="absolute top-3 right-3 bg-lime-400 border-2 border-black text-black px-3 py-1 flex gap-1.5 items-center font-black text-lg z-10 brutalist-shadow">
                    <ThumbsUp size={20} strokeWidth={3} /> {meme.likeCount || 0}
                  </div>

                  <div className="w-full pt-[100%] relative bg-gray-200 border-b-4 border-black">
                    <img src={meme.imageData} alt="Meme" className="absolute top-0 left-0 w-full h-full object-contain" />
                  </div>

                  <div className="p-4 bg-white text-black">
                    <p className="text-lg font-black truncate font-space uppercase">@{meme.creator?.username || 'Anonymous'}</p>
                    <p className="text-sm font-bold text-gray-500 mt-1">{new Date(meme.createdAt).toLocaleDateString()}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardScreen;

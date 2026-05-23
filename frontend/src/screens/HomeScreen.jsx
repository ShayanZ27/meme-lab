import { useState, useRef, useCallback, useEffect } from 'react'
import { generateMemeTemplates, generateEditorData } from '../services/memeService'
import { useAuth } from '../context/AuthContext'
import { LogOut } from 'lucide-react'
import { Link } from 'react-router-dom'
import dogeImage from '../assets/doge.jpg'
import pepeImage from '../assets/pepe.jpg'
import smudgeImage from '../assets/smudge.jpg'

function HomeScreen({ onOpenEditor }) {
  const [image, setImage] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [showWebcam, setShowWebcam] = useState(false)
  const [templates, setTemplates] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingTemplateIndex, setLoadingTemplateIndex] = useState(null)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const { user, logout } = useAuth()

  const handleFile = useCallback((file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => setImage(e.target.result)
      reader.readAsDataURL(file)
    }
  }, [])

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }

  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items
      if (!items) return
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          handleFile(file)
          break
        }
      }
    }
    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [handleFile])

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 1280, height: 720 }
      })
      streamRef.current = stream
      setShowWebcam(true)
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      }, 100)
    } catch (err) {
      alert('Could not access camera. Please check permissions.')
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/png')
    setImage(dataUrl)
    stopWebcam()
  }

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setShowWebcam(false)
  }

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const removeImage = () => {
    setImage(null)
    setTemplates(null)
    setError(null)
  }

  const handleGenerate = async () => {
    if (!image) return
    setIsLoading(true)
    setError(null)
    setTemplates(null)
    try {
      const result = await generateMemeTemplates(image)
      setTemplates(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectMeme = async (meme, index) => {
    if (!image) return
    setLoadingTemplateIndex(index)
    setError(null)
    try {
      const editorData = await generateEditorData(image, meme.format)
      onOpenEditor(editorData, image)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingTemplateIndex(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#111111] bg-noise text-white relative overflow-hidden px-4 py-10 font-inter">

      {/* ── Auth Buttons / User Profile (Top Right) ── */}
      <div className="relative md:absolute w-full md:w-auto top-0 md:top-4 right-0 md:right-4 z-50 flex flex-wrap justify-center md:justify-end items-center gap-2 sm:gap-3 mb-10 md:mb-0">
        <Link
          to="/leaderboard"
          className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black border-2 border-black px-4 py-2 font-space font-bold tracking-widest hover-brutalist brutalist-shadow transition-transform"
        >
          <span className="text-lg">🔥</span> LEADERBOARD
        </Link>
        {user ? (
          <>
            <div className="bg-white text-black border-2 border-black px-4 py-2 font-space font-bold tracking-widest brutalist-shadow">
              {user.username}
            </div>
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-400 text-white border-2 border-black p-2 hover-brutalist brutalist-shadow transition-transform"
              title="Log Out (Touch Grass)"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="bg-transparent text-white hover:bg-white hover:text-black border-2 border-white px-4 py-2 font-space font-bold tracking-widest brutalist-shadow transition-colors"
            >
              RESUME BRAINROT
            </Link>
            <Link
              to="/signup"
              className="bg-pink-500 hover:bg-pink-400 text-white border-2 border-black px-4 py-2 font-space font-bold tracking-widest hover-brutalist brutalist-shadow transition-transform"
            >
              ENTER THE MEMEVERSE
            </Link>
          </>
        )}
      </div>

      {/* ── Decorative stickers (left side) ── */}
      <div className="hidden xl:flex absolute top-12 left-8 flex-col items-center animate-[float_4s_ease-in-out_infinite]">
        <div className="relative">
          <svg className="absolute inset-0 w-full h-full -z-10" preserveAspectRatio="none" viewBox="0 0 100 100">
            <path d="M5,10 Q10,0 20,0 L80,0 Q95,0 95,20 L95,80 Q95,95 80,95 L40,95 L10,120 L20,90 Q5,85 5,80 Z" fill="none" stroke="#a855f7" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div className="p-6 text-center font-bold tracking-widest leading-tight" style={{ fontFamily: 'Permanent Marker' }}>
            <span className="text-white text-sm">MAKE 'EM</span><br />
            <span className="text-yellow-400 text-lg">LAUGH.</span><br />
            <span className="text-white text-sm">MAKE 'EM</span><br />
            <span className="text-pink-500 text-lg">REGRET.</span>
          </div>
        </div>
      </div>

      <div className="hidden xl:flex absolute top-[32%] left-10 flex-col items-center animate-[float-reverse_5s_ease-in-out_infinite]">
        <div className="relative rotate-[-5deg]">
          <img src={dogeImage} alt="Doge" className="w-28 h-28 object-cover object-top rounded-full border-[5px] border-white shadow-[0_0_15px_rgba(255,255,255,0.15)]" />
          <span className="absolute -top-2 -right-4 text-3xl">😎</span>
          <svg className="absolute -left-10 bottom-0 w-10 h-10 -rotate-12" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2">
            <path d="M20 12 Q12 0 4 12 M4 12 L10 6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="text-gray-400 text-xs text-center mt-3 tracking-widest font-bold rotate-[2deg] uppercase" style={{ fontFamily: 'Space Grotesk' }}>
          MUCH MEME<br />VERY WOW
        </p>
      </div>

      <div className="hidden xl:flex absolute bottom-[22%] left-10 flex-col items-center animate-[float_6s_ease-in-out_infinite]">
        <div className="relative rotate-[5deg]">
          <img src={pepeImage} alt="Pepe" className="w-24 h-24 object-cover object-top rounded-full border-[5px] border-white shadow-[0_0_15px_rgba(255,255,255,0.15)]" />
          <svg className="absolute -right-8 bottom-4 w-8 h-8 rotate-180" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
            <path d="M20 12 Q12 0 4 12 M4 12 L10 6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="text-gray-400 text-[11px] text-center mt-3 uppercase tracking-widest font-bold rotate-[-3deg]" style={{ fontFamily: 'Space Grotesk' }}>
          Feeling cute,<br />might delete<br />later idk
        </p>
      </div>

      <div className="hidden xl:flex absolute bottom-8 left-12 flex-col items-center animate-[bounce-subtle_2s_ease-in-out_infinite]">
        <div className="bg-yellow-400 text-black px-4 py-2 border-[3px] border-dashed border-red-500 rotate-[-2deg] rounded-sm brutalist-shadow relative">
          <p className="text-red-600 font-bold text-sm text-center tracking-widest" style={{ fontFamily: 'Space Grotesk' }}>WARNING:</p>
          <p className="text-xs font-black text-center" style={{ fontFamily: 'Space Grotesk' }}>HIGH CHANCE OF<br/>ADDICTION</p>
          <span className="text-pink-500 text-4xl absolute -bottom-4 -right-6 rotate-12 drop-shadow-md">⚡</span>
        </div>
      </div>

      {/* ── Decorative stickers (right side) ── */}
      <div className="hidden xl:flex absolute top-12 right-8 flex-col items-center animate-[float_5s_ease-in-out_infinite]">
        <div className="relative">
          <svg className="absolute inset-0 w-full h-full -z-10" preserveAspectRatio="none" viewBox="0 0 100 100">
             <path d="M5,10 Q10,0 20,0 L80,0 Q95,0 95,20 L95,80 Q95,95 80,95 L40,95 L80,120 L60,95 Q5,95 5,80 Z" fill="none" stroke="#22d3ee" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div className="p-6 text-center font-bold tracking-widest leading-tight" style={{ fontFamily: 'Permanent Marker' }}>
            <span className="text-white text-sm">I CAME.</span><br />
            <span className="text-white text-sm">I SAW.</span><br />
            <span className="text-yellow-400 text-lg">I MEMED.</span>
          </div>
        </div>
      </div>

      <div className="hidden xl:flex absolute top-[32%] right-10 flex-col items-center animate-[float-reverse_4s_ease-in-out_infinite]">
        <div className="relative rotate-[4deg]">
          <img src={smudgeImage} alt="Cat" className="w-32 h-24 object-cover rounded-xl border-[5px] border-white shadow-[0_0_15px_rgba(255,255,255,0.15)] object-right" />
          <span className="absolute -top-3 -right-3 text-pink-500 text-2xl">✨</span>
          <svg className="absolute -bottom-8 -left-2 w-8 h-8 rotate-90" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
            <path d="M20 12 Q12 0 4 12 M4 12 L10 6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="text-gray-400 text-xs text-center mt-6 uppercase tracking-widest font-bold rotate-[-2deg]" style={{ fontFamily: 'Space Grotesk' }}>
          NOT FUNNY<br />DIDN'T LAUGH
        </p>
      </div>

      <div className="hidden xl:flex absolute bottom-[25%] right-8 flex-col items-center animate-[wiggle_3s_ease-in-out_infinite]">
        <div className="relative flex items-center justify-center px-8 py-6">
          <svg className="absolute inset-0 w-full h-full -z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M50 0 L60 20 L80 10 L75 30 L100 40 L80 55 L90 80 L65 75 L50 100 L35 75 L10 80 L20 55 L0 40 L25 30 L20 10 L40 20 Z" fill="#ec4899" stroke="#000" strokeWidth="3" strokeLinejoin="round" />
          </svg>
          <p className="text-center font-black text-black z-10" style={{ fontFamily: 'Space Grotesk' }}>
            <span className="text-xs">YOUR FACE</span><br />
            <span className="text-xs">+ OUR AI</span><br />
            <span className="text-sm text-yellow-300">= MEME MAGIC</span>
          </p>
        </div>
        <span className="absolute -bottom-2 -right-2 text-4xl rotate-12 drop-shadow-lg">🪄</span>
      </div>

      <div className="hidden xl:flex absolute bottom-8 right-12 flex-col items-center animate-[float_4s_ease-in-out_infinite_1s]">
        <div className="relative flex items-center justify-center px-8 py-5">
          <svg className="absolute inset-0 w-full h-full -z-10 text-[#60a5fa]" viewBox="0 0 100 100" preserveAspectRatio="none" fill="currentColor">
            <path d="M20 50 Q10 50 10 65 Q10 80 25 80 L75 80 Q90 80 90 65 Q90 50 80 50 Q80 30 50 30 Q30 30 20 50 Z" stroke="#000" strokeWidth="3" />
          </svg>
          <span className="absolute -top-6 text-pink-500 text-3xl drop-shadow-md">📶</span>
          <p className="text-center text-black font-black z-10 mt-1 rotate-[-2deg]" style={{ fontFamily: 'Space Grotesk' }}>
            <span className="text-[11px] uppercase">POWERED BY</span><br />
            <span className="text-sm text-white drop-shadow-[2px_2px_0_#000]">CHAOS & WIFI</span>
          </p>
        </div>
      </div>

      {/* ── Hand-drawn stars/sparkles scattered ── */}
      <div className="hidden lg:block absolute top-20 left-52 text-yellow-400 text-xl animate-[wiggle_2s_ease-in-out_infinite]">✦</div>
      <div className="hidden lg:block absolute top-40 right-52 text-pink-400 text-lg animate-[wiggle_3s_ease-in-out_infinite]">★</div>
      <div className="hidden lg:block absolute bottom-28 left-48 text-cyan-400 text-xl animate-[wiggle_2.5s_ease-in-out_infinite]">✶</div>
      <div className="hidden lg:block absolute bottom-60 right-48 text-yellow-300 text-lg animate-[wiggle_2s_ease-in-out_infinite]">⚡</div>

      {/* ══════════ Main Content ══════════ */}
      <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center pt-4 md:pt-4">

        {/* ── Title ── */}
        <div className="text-center mb-8 relative">
          <h1 className="text-6xl md:text-8xl tracking-tight mb-2 font-space font-black text-white" style={{ textShadow: '6px 6px 0px #000' }}>
            MEME
            <span className="bg-lime-400 text-black px-2 ml-3 border-4 border-black inline-block -rotate-2 hover:rotate-2 transition-transform">
              LAB
            </span>
          </h1>
          {/* Crown on top */}
          <div className="text-yellow-400 text-4xl absolute -top-8 right-4 animate-[bounce-subtle_2s_ease-in-out_infinite]">👑</div>
          <p className="text-sm md:text-base font-bold bg-white text-black inline-block px-3 py-1 border-2 border-black brutalist-shadow tracking-widest uppercase">
            Turn your photos into internet gold
          </p>
        </div>

        {/* ── Upload Area ── */}
        <div className="w-full">
          {!image && !showWebcam && (
            <>
              {/* Drop zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  relative border-4 border-black p-10 md:p-14 text-center cursor-pointer
                  transition-transform bg-white text-black brutalist-shadow-lg
                  ${isDragging
                    ? 'scale-[1.02] bg-yellow-100'
                    : 'hover-brutalist hover:bg-gray-50'
                  }
                `}
              >
                {/* Cute cloud icon */}
                <div className="mx-auto mb-5 text-6xl animate-[bounce-subtle_3s_ease-in-out_infinite]">
                  ☁️
                </div>
                <div className="mx-auto w-14 h-14 -mt-10 mb-4 bg-pink-500 border-2 border-black brutalist-shadow flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                </div>

                <p className="text-2xl md:text-3xl font-black tracking-wider mb-2 font-space">
                  DROP YOUR PIC HERE
                </p>
                <p className="text-sm font-bold text-gray-600">
                  or click to <span className="text-pink-600 underline">browse</span> · supports JPG, PNG, WebP
                </p>
                <p className="text-xs font-bold mt-4 bg-yellow-300 border-2 border-black inline-block px-2 py-1">
                  You can also paste an image (Ctrl+V)
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFile(e.target.files[0])}
                  className="hidden"
                />
              </div>

              {/* OR divider */}
              <div className="flex items-center gap-4 my-8">
                <div className="flex-1 border-t-4 border-black" />
                <span
                  className="bg-black text-white font-black px-4 py-1 border-2 border-black text-xl"
                  style={{ fontFamily: 'Bangers' }}
                >
                  OR
                </span>
                <div className="flex-1 border-t-4 border-black" />
              </div>

              {/* Webcam button */}
              <button
                onClick={startWebcam}
                className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-cyan-400 border-4 border-black text-black brutalist-shadow hover-brutalist transition-transform cursor-pointer group"
              >
                <span className="text-3xl group-hover:animate-[wiggle_0.5s_ease-in-out_infinite]">📷</span>
                <div className="text-left">
                  <span className="text-xl font-black tracking-wider block font-space">
                    SNAP IT REAL QUICK
                  </span>
                  <span className="text-sm font-bold opacity-80">Use camera and become a meme instantly</span>
                </div>
              </button>
            </>
          )}

          {/* Webcam view */}
          {showWebcam && (
            <div className="rounded-2xl overflow-hidden bg-[#1a1a2e] border-2 border-dashed border-cyan-500/50">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full aspect-video object-cover bg-black"
              />
              <div className="flex gap-3 p-4">
                <button
                  onClick={capturePhoto}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-400 hover:to-red-400 text-white font-bold tracking-wider transition-all cursor-pointer shadow-lg shadow-pink-500/25"
                  style={{ fontFamily: 'Bangers' }}
                >
                  📸 SNAP!
                </button>
                <button
                  onClick={stopWebcam}
                  className="py-3 px-6 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}

          {/* Image preview */}
          {image && (
            <div className="overflow-hidden bg-white border-4 border-black brutalist-shadow-lg p-2 mt-4">
              <img
                src={image}
                alt="Uploaded preview"
                className="w-full max-h-96 object-contain bg-gray-200 border-2 border-black"
              />
              <div className="flex gap-4 mt-4">
                <button
                  onClick={handleGenerate}
                  disabled={isLoading}
                  className="flex-1 py-4 bg-pink-500 text-white border-4 border-black font-space font-black text-xl hover-brutalist brutalist-shadow transition-transform cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? '⏳ COOKING...' : '🍳 COOK MEMES'}
                </button>
                <button
                  onClick={removeImage}
                  disabled={isLoading}
                  className="py-4 px-6 bg-white hover:bg-red-500 hover:text-white text-black border-4 border-black font-black text-xl hover-brutalist brutalist-shadow transition-colors cursor-pointer disabled:opacity-50"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
          {/* Error message */}
          {error && (
            <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-center" style={{ fontFamily: 'Permanent Marker' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Loading animation */}
          {isLoading && (
            <div className="mt-8 text-center">
              <div className="text-5xl animate-[bounce-subtle_1s_ease-in-out_infinite]">🧪</div>
              <p className="mt-3 text-lg text-pink-400 tracking-wider" style={{ fontFamily: 'Bangers' }}>
                ANALYZING YOUR PIC...
              </p>
              <p className="text-xs text-gray-500 mt-1">Our meme scientists are hard at work</p>
            </div>
          )}

          {/* Meme template results */}
          {templates && templates.length > 0 && (
            <div className="mt-12">
              <div className="inline-block bg-yellow-400 border-4 border-black px-6 py-2 brutalist-shadow mb-8 transform -rotate-1">
                <h2 className="text-3xl text-black font-space font-black uppercase">
                  🎯 CHOOSE YOUR WEAPON
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {templates.map((meme, index) => {
                  const categoryColors = {
                    relatable: 'bg-blue-400',
                    absurd: 'bg-yellow-400',
                    genz: 'bg-pink-400',
                    corporate: 'bg-gray-300',
                    dark: 'bg-red-500 text-white',
                    classic: 'bg-lime-400',
                  }
                  const colors = categoryColors[meme.category] || 'bg-white'

                  return (
                    <div
                      key={index}
                      onClick={() => handleSelectMeme(meme, index)}
                      className={`relative border-4 border-black p-6 ${colors} text-black hover-brutalist brutalist-shadow transition-transform cursor-pointer overflow-hidden`}
                    >
                      {loadingTemplateIndex === index && (
                         <div className="absolute inset-0 bg-white/90 z-10 flex flex-col items-center justify-center border-4 border-black">
                           <div className="text-5xl animate-[bounce-subtle_1s_ease-in-out_infinite]">🍳</div>
                           <p className="text-black font-black tracking-wider mt-4 font-space text-2xl">COOKING...</p>
                         </div>
                      )}
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-xs uppercase tracking-widest text-black bg-white border-2 border-black px-2 py-1 font-bold">
                          {meme.category}
                        </span>
                      </div>
                      <p className="text-2xl font-black mb-2 font-space">
                        {meme.format}
                      </p>
                      {meme.topText && (
                        <p className="text-black/80 text-sm font-bold mb-1">"{meme.topText}"</p>
                      )}
                      {meme.bottomText && (
                        <p className="text-black/80 text-sm font-bold">"{meme.bottomText}"</p>
                      )}
                      <div className="mt-4 pt-4 border-t-2 border-black/20">
                         <p className="text-xs font-bold opacity-70 uppercase">{meme.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default HomeScreen

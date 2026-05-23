import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import HomeScreen from './screens/HomeScreen'
import EditorScreen from './screens/EditorScreen'
import Login from './pages/Login'
import Signup from './pages/Signup'

// The main application interface (Home + Editor)
function MainApp() {
  const [editorData, setEditorData] = useState(null)
  const [imageBase64, setImageBase64] = useState(null)

  const handleOpenEditor = (data, image) => {
    setEditorData(data)
    setImageBase64(image)
  }

  const handleCloseEditor = () => {
    setEditorData(null)
    setImageBase64(null)
  }

  const isEditorOpen = editorData && imageBase64;

  return (
    <>
      {/* Hide HomeScreen when editor is open to preserve its state (image, templates, etc) */}
      <div className={isEditorOpen ? 'hidden' : 'block'}>
        <HomeScreen onOpenEditor={handleOpenEditor} />
      </div>
      
      {/* Conditionally render EditorScreen */}
      {isEditorOpen && (
        <EditorScreen 
          editorData={editorData} 
          imageBase64={imageBase64} 
          onBack={handleCloseEditor} 
        />
      )}
    </>
  )
}

import MemeDetailsScreen from './screens/MemeDetailsScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#0a0a0a]">
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<MainApp />} />
            <Route path="/meme/:id" element={<MemeDetailsScreen />} />
            <Route path="/leaderboard" element={<LeaderboardScreen />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App

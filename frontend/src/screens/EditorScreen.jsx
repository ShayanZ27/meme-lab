import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Text, Transformer } from 'react-konva';
import useImage from 'use-image';
import { Download, Plus, ArrowLeft, Type, Palette, Move, Trash2, Shuffle, Cloud } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { uploadMeme } from '../services/communityService';

const FONTS = ['Impact', 'Arial', 'Comic Sans MS', 'Bangers', 'Permanent Marker', 'Times New Roman'];
const COLORS = ['#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];

const EditorScreen = ({ editorData, imageBase64, onBack }) => {
  const [image] = useImage(imageBase64);
  const [textLayers, setTextLayers] = useState(editorData.textLayers || []);
  const [selectedId, setSelectedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const stageRef = useRef(null);
  const trRef = useRef(null);
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  
  // Calculate scaling to fit the canvas within the container
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  const containerRef = useRef(null);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Compute stage dimensions and scaling to fit image
  const imageWidth = image ? image.width : 800;
  const imageHeight = image ? image.height : 600;
  
  // Fit image into container while maintaining aspect ratio
  const scale = Math.min(
    containerSize.width / imageWidth,
    containerSize.height / imageHeight
  );
  
  const stageWidth = imageWidth * scale;
  const stageHeight = imageHeight * scale;

  useEffect(() => {
    // Handle keyboard delete
    const handleKeyDown = (e) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        // Only delete if we are not typing in an input
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
          setTextLayers(layers => layers.filter(layer => layer.id !== selectedId));
          setSelectedId(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId]);

  const checkDeselect = (e) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    const clickedOnImage = e.target.name() === 'background-image';
    if (clickedOnEmpty || clickedOnImage) {
      setSelectedId(null);
      setEditingId(null);
    }
  };

  const handleExport = () => {
    if (!stageRef.current) return;
    
    // Deselect before export to hide transformer
    setSelectedId(null);
    setEditingId(null);
    
    setTimeout(() => {
      // Create a temporary stage at full resolution for high-quality export
      const dataURL = stageRef.current.toDataURL({ 
        pixelRatio: 1 / scale // Export at original image resolution
      });
      
      const link = document.createElement('a');
      link.download = `meme-${Date.now()}.png`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 50);
  };

  const handleUploadToMemeverse = async () => {
    if (!stageRef.current) return;
    if (!user) {
      alert("Please sign in to upload to the Memeverse!");
      navigate('/login');
      return;
    }
    
    setIsUploading(true);
    setSelectedId(null);
    setEditingId(null);
    
    setTimeout(async () => {
      try {
        const dataURL = stageRef.current.toDataURL({ 
          pixelRatio: 1 / scale 
        });
        const result = await uploadMeme(dataURL, token);
        if (result.success) {
          navigate(`/meme/${result.memeId}`);
        }
      } catch (err) {
        console.error(err);
        alert('Failed to upload meme.');
      } finally {
        setIsUploading(false);
      }
    }, 50);
  };

  const addNewText = () => {
    const newId = `caption-${Date.now()}`;
    setTextLayers([
      ...textLayers,
      {
        id: newId,
        text: 'NEW TEXT',
        x: imageWidth / 2 - 100,
        y: imageHeight / 2 - 30,
        fontSize: Math.max(40, imageHeight / 10),
        fontFamily: 'Impact',
        fill: '#ffffff',
        stroke: '#000000',
        strokeWidth: 3,
        rotation: 0,
        width: 200,
        align: 'center'
      }
    ]);
    setSelectedId(newId);
  };

  const updateSelectedText = (key, value) => {
    const idToUpdate = editingId || selectedId;
    if (!idToUpdate) return;
    setTextLayers(layers => 
      layers.map(layer => 
        layer.id === idToUpdate ? { ...layer, [key]: value } : layer
      )
    );
  };

  const selectedLayer = textLayers.find(l => l.id === selectedId);
  const editingLayer = textLayers.find(l => l.id === editingId);

  return (
    <div className="min-h-screen bg-[#111111] bg-noise text-white flex flex-col md:flex-row font-inter overflow-hidden">
      
      {/* LEFT SIDEBAR: Controls */}
      <div className="w-full md:w-80 bg-[#111111] border-r-4 border-black p-6 flex flex-col h-auto md:h-screen overflow-y-auto shrink-0 z-20 brutalist-shadow">
        <div className="flex items-center gap-3 mb-8 cursor-pointer group" onClick={onBack}>
          <div className="bg-white text-black border-2 border-black p-2 hover-brutalist transition-transform brutalist-shadow">
            <ArrowLeft size={20} />
          </div>
          <span className="font-bold tracking-widest text-white uppercase font-space">
            BACK TO MEMES
          </span>
        </div>

        <h2 className="text-4xl mb-6 font-space font-black tracking-widest bg-lime-400 text-black border-2 border-black inline-block px-3 py-1 transform -rotate-2">
          TWEAK IT
        </h2>

        {selectedLayer ? (
          <div className="space-y-6 bg-white text-black p-4 border-4 border-black brutalist-shadow">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs uppercase tracking-widest font-black flex items-center gap-2">
                <Type size={14} /> Text
              </label>
              <button onClick={() => {
                setTextLayers(layers => layers.filter(l => l.id !== selectedId));
                setSelectedId(null);
              }} className="bg-red-500 text-white border-2 border-black p-1 hover-brutalist transition-transform">
                <Trash2 size={16} />
              </button>
            </div>
            
            <textarea
              className="w-full bg-white border-4 border-black p-3 text-black focus:outline-none focus:bg-yellow-100 resize-none font-bold brutalist-shadow"
              rows={3}
              value={selectedLayer.text}
              onChange={(e) => updateSelectedText('text', e.target.value)}
            />

            <div>
              <label className="text-xs uppercase tracking-widest font-black mb-2 flex items-center gap-2">
                <Palette size={14} /> Font Family
              </label>
              <select
                className="w-full bg-white border-4 border-black p-2 text-black focus:outline-none focus:bg-yellow-100 font-bold brutalist-shadow"
                value={selectedLayer.fontFamily}
                onChange={(e) => updateSelectedText('fontFamily', e.target.value)}
              >
                {FONTS.map(font => (
                  <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs uppercase tracking-widest font-black mb-2 block">Fill Color</label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map(color => (
                    <button
                      key={`fill-${color}`}
                      className={`w-8 h-8 border-2 border-black ${selectedLayer.fill === color ? 'ring-4 ring-pink-500 scale-110' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => updateSelectedText('fill', color)}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs uppercase tracking-widest font-black mb-2 block">Stroke Color</label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map(color => (
                    <button
                      key={`stroke-${color}`}
                      className={`w-8 h-8 border-2 border-black ${selectedLayer.stroke === color ? 'ring-4 ring-cyan-500 scale-110' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => updateSelectedText('stroke', color)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-widest font-black mb-2 flex items-center justify-between">
                <span>Stroke Width ({selectedLayer.strokeWidth}px)</span>
              </label>
              <input
                type="range"
                min="0"
                max="10"
                className="w-full accent-black h-2 bg-gray-200 rounded-none appearance-none"
                value={selectedLayer.strokeWidth}
                onChange={(e) => updateSelectedText('strokeWidth', parseInt(e.target.value))}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-black p-8 border-4 border-black bg-yellow-400 brutalist-shadow">
            <Move size={48} className="mb-4 animate-bounce" />
            <p className="text-center font-black tracking-widest font-space text-xl">
              CLICK A LAYER TO EDIT
            </p>
          </div>
        )}
      </div>

      {/* MAIN EDITOR AREA */}
      <div className="flex-1 flex flex-col relative h-screen bg-[#111111] bg-noise">
        
        {/* Background decorations */}
        <div className="absolute top-10 right-10 text-6xl rotate-12">🔥</div>
        <div className="absolute bottom-20 left-10 text-6xl -rotate-12">💯</div>
        
        {/* Konva Canvas Container */}
        <div className="flex-1 flex items-center justify-center p-8 relative" ref={containerRef}>
          <div 
            className="border-4 border-black overflow-hidden bg-gray-200 relative brutalist-shadow-lg"
            style={{ width: stageWidth, height: stageHeight }}
          >
            <Stage
              width={stageWidth}
              height={stageHeight}
              scaleX={scale}
              scaleY={scale}
              onMouseDown={checkDeselect}
              onTouchStart={checkDeselect}
              ref={stageRef}
            >
              <Layer>
                {/* Background Image */}
                {image && (
                  <KonvaImage
                    image={image}
                    name="background-image"
                    width={imageWidth}
                    height={imageHeight}
                  />
                )}
                
                {/* Text Layers */}
                {textLayers.map((layer) => (
                  <React.Fragment key={layer.id}>
                    <Text
                      id={layer.id}
                      visible={layer.id !== editingId}
                      text={layer.text}
                      x={layer.x}
                      y={layer.y}
                      width={layer.width}
                      fill={layer.fill}
                      fontFamily={layer.fontFamily}
                      fontSize={layer.fontSize}
                      stroke={layer.stroke}
                      strokeWidth={layer.strokeWidth}
                      rotation={layer.rotation}
                      align={layer.align}
                      draggable
                      onClick={() => {
                        if (editingId !== layer.id) {
                          setSelectedId(layer.id);
                        }
                      }}
                      onTap={() => {
                        if (editingId !== layer.id) {
                          setSelectedId(layer.id);
                        }
                      }}
                      onDblClick={() => {
                        setEditingId(layer.id);
                        setSelectedId(layer.id);
                      }}
                      onDblTap={() => {
                        setEditingId(layer.id);
                        setSelectedId(layer.id);
                      }}
                      onDragEnd={(e) => {
                        setTextLayers(layers => layers.map(l => 
                          l.id === layer.id ? { ...l, x: e.target.x(), y: e.target.y() } : l
                        ));
                      }}
                      onTransform={(e) => {
                        const node = e.target;
                        const scaleX = node.scaleX();
                        const scaleY = node.scaleY();
                        
                        // We reset the scale back to 1 to prevent text stretching
                        node.scaleX(1);
                        node.scaleY(1);

                        // If scaleY is very close to 1, it's a side resize (middle-left or middle-right)
                        const isHorizontal = Math.abs(scaleY - 1) < 0.001;
                        
                        if (isHorizontal) {
                          // Change width only, wrapping text to new width
                          node.width(Math.max(50, node.width() * scaleX));
                        } else {
                          // Corner resize: change width and font size uniformly
                          node.width(Math.max(50, node.width() * scaleX));
                          node.fontSize(Math.max(10, node.fontSize() * scaleX));
                        }
                      }}
                      onTransformEnd={(e) => {
                        const node = e.target;
                        setTextLayers(layers => layers.map(l => 
                          l.id === layer.id ? { 
                            ...l, 
                            x: node.x(), 
                            y: node.y(),
                            rotation: node.rotation(),
                            width: node.width(),
                            fontSize: node.fontSize()
                          } : l
                        ));
                      }}
                    />
                  </React.Fragment>
                ))}
                
                {/* Transformer (Bounding Box) */}
                <TransformerComponent selectedId={selectedId} stageRef={stageRef} hidden={!!editingId} />
              </Layer>
            </Stage>
            
            {/* Inline Editor Overlay */}
            {editingId && editingLayer && (
              <textarea
                value={editingLayer.text}
                onChange={(e) => updateSelectedText('text', e.target.value)}
                onBlur={() => setEditingId(null)}
                autoFocus
                className="absolute bg-transparent outline-none resize-none overflow-hidden m-0 p-0"
                style={{
                  top: editingLayer.y * scale,
                  left: editingLayer.x * scale,
                  width: editingLayer.width * scale,
                  // Auto height based on text content approximation
                  minHeight: editingLayer.fontSize * 1.2 * scale,
                  fontSize: editingLayer.fontSize * scale,
                  fontFamily: editingLayer.fontFamily,
                  color: editingLayer.fill,
                  textAlign: editingLayer.align,
                  transform: `rotate(${editingLayer.rotation}deg)`,
                  transformOrigin: 'top left',
                  lineHeight: 1.2,
                  WebkitTextStroke: `${editingLayer.strokeWidth * scale}px ${editingLayer.stroke}`,
                  border: '1px dashed #ec4899',
                  zIndex: 50,
                  boxShadow: '0 0 10px rgba(0,0,0,0.5)'
                }}
                onKeyDown={(e) => {
                  // Adjust height dynamically while typing
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
              />
            )}
          </div>
        </div>

        {/* BOTTOM TOOLBAR */}
        <div className="h-28 bg-white border-t-4 border-black flex items-center justify-between px-8 z-20 brutalist-shadow">
          <div className="flex gap-4">
            <button
              onClick={addNewText}
              className="flex items-center gap-2 bg-yellow-400 text-black border-4 border-black px-5 py-3 font-black text-xl font-space hover-brutalist brutalist-shadow transition-transform"
            >
              <Plus size={24} strokeWidth={3} /> ADD TEXT
            </button>
            <button
              onClick={() => {
                // Randomize positions slightly for chaos
                setTextLayers(layers => layers.map(l => ({
                  ...l,
                  rotation: (Math.random() - 0.5) * 20,
                  fill: COLORS[Math.floor(Math.random() * COLORS.length)]
                })));
              }}
              className="hidden md:flex items-center gap-2 bg-black text-white border-4 border-black px-5 py-3 font-black text-xl font-space hover:bg-gray-800 hover-brutalist brutalist-shadow transition-transform"
            >
              <Shuffle size={20} strokeWidth={3} /> CHAOS MODE
            </button>
          </div>

          <div className="flex gap-4 items-center">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 bg-pink-500 text-white border-4 border-black px-8 py-3 font-black text-2xl font-space tracking-wider hover-brutalist brutalist-shadow transition-transform"
            >
              <Download size={28} strokeWidth={3} /> EXPORT
            </button>
            
            {/* Optional Auth Cloud Save */}
            {!user ? (
              <div className="hidden lg:flex items-center gap-3 ml-4 bg-lime-400 border-4 border-black px-4 py-2 brutalist-shadow transform rotate-1">
                <span className="font-bold text-black font-space">Save creations?</span>
                <Link to="/signup" className="text-black hover:text-pink-600 font-black tracking-widest text-lg underline">
                  ENTER THE MEMEVERSE
                </Link>
              </div>
            ) : (
              <button
                onClick={handleUploadToMemeverse}
                disabled={isUploading}
                className="flex items-center gap-2 bg-cyan-400 text-black border-4 border-black px-6 py-3 font-black text-xl font-space tracking-wider hover-brutalist brutalist-shadow transition-transform ml-2"
              >
                <Cloud size={24} strokeWidth={3} /> {isUploading ? 'UPLOADING...' : 'RELEASE INTO THE WILD'}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

// Extracted Transformer component to ensure it updates correctly when selection changes
const TransformerComponent = ({ selectedId, stageRef, hidden }) => {
  const trRef = useRef(null);

  useEffect(() => {
    if (selectedId && stageRef.current && !hidden) {
      const stage = stageRef.current;
      const selectedNode = stage.findOne(`#${selectedId}`);
      if (selectedNode && trRef.current) {
        trRef.current.nodes([selectedNode]);
        trRef.current.getLayer().batchDraw();
      }
    } else if (trRef.current) {
      trRef.current.nodes([]);
      trRef.current.getLayer().batchDraw();
    }
  }, [selectedId, stageRef, hidden]);

  return (
    <Transformer
      ref={trRef}
      boundBoxFunc={(oldBox, newBox) => {
        // limit resize
        if (newBox.width < 50 || newBox.height < 20) {
          return oldBox;
        }
        return newBox;
      }}
      enabledAnchors={[
        'top-left', 'top-right', 'bottom-left', 'bottom-right',
        'middle-left', 'middle-right'
      ]}
      borderStroke="#ec4899"
      anchorStroke="#ec4899"
      anchorFill="#ffffff"
      anchorSize={10}
      borderStrokeWidth={2}
    />
  );
};

export default EditorScreen;

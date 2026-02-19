import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Upload, RefreshCcw, Check, ScanLine, X, ImageOff, ZoomIn, ZoomOut, MousePointerClick, Crosshair, Sparkles, Loader2 } from 'lucide-react';
import { WindowSelection, Fabric, ShapeType, RoomAnalysis } from '../types';
import { getFabricUrl, SHAPE_CONFIGS } from '../constants';
import { analyzeRoomImage } from '../utils/ai';
import { useLanguage } from '../LanguageContext';

interface VisualizerProps {
  imageSrc: string;
  onImageChange: (src: string) => void;
  onConfirmSelection: (analysis?: RoomAnalysis) => void;
  onSelectionChange: (sel: WindowSelection | null) => void;
  selection: WindowSelection | null;
  selectedFabric: Fabric | null;
  shape?: ShapeType; 
  isCollapsed?: boolean;
}

const Visualizer: React.FC<VisualizerProps> = ({
  imageSrc,
  onImageChange,
  onConfirmSelection,
  onSelectionChange,
  selection,
  selectedFabric,
  shape = 'Standard',
  isCollapsed = false
}) => {
  const { t } = useLanguage();
  const [isDrawing, setIsDrawing] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  
  // startPoint stores Relative Coordinates (0.0 - 1.0)
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [fabricPatternImage, setFabricPatternImage] = useState<HTMLImageElement | HTMLCanvasElement | null>(null);
  
  // Polygon State: Stores points as Image-Relative Coordinates (0.0 - 1.0)
  const [polyPoints, setPolyPoints] = useState<{x: number, y: number}[]>([]);
  
  const [imageError, setImageError] = useState(false);
  const [textureScale, setTextureScale] = useState(0.15);
  const [retryWithoutCors, setRetryWithoutCors] = useState(false);
  const [hasAutoSelected, setHasAutoSelected] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Image Aspect Ratio
  const [imgAspect, setImgAspect] = useState<number>(1);
  const [containerHeight, setContainerHeight] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isSystemImage = imageSrc.startsWith('http');

  // FIX: Flip image for Right Triangle (Right) to match geometry
  const shouldFlipImage = isSystemImage && shape === 'Right Triangle (Right)';

  // Track container height for dynamic UI hiding and proportional scaling
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        const newHeight = entry.contentRect.height;
        setContainerHeight(prev => Math.abs(prev - newHeight) > 5 ? newHeight : prev);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const getShapeName = (s: string) => {
    const key = `shape.${s.replace(/[^a-zA-Z]/g, '').toLowerCase()}`;
    return t(key) || s;
  };

  // Helper: Calculate where the image is actually rendered inside the container (object-fit: contain logic)
  const getImageMetrics = useCallback(() => {
    if (!containerRef.current) return null;
    const cW = containerRef.current.clientWidth;
    const cH = containerRef.current.clientHeight;
    if (cW === 0 || cH === 0) return null;

    const containerAspect = cW / cH;
    let renderW, renderH, offsetX, offsetY;

    if (containerAspect > imgAspect) {
      // Image is taller than container: height matches container, width is scaled
      renderH = cH;
      renderW = cH * imgAspect;
      offsetX = (cW - renderW) / 2;
      offsetY = 0;
    } else {
      // Image is wider than container: width matches container, height is scaled
      renderW = cW;
      renderH = cW / imgAspect;
      offsetX = 0;
      offsetY = (cH - renderH) / 2;
    }

    return { renderW, renderH, offsetX, offsetY, cW, cH };
  }, [imgAspect, containerHeight]);

  // Reset state when inputs change
  useEffect(() => {
    setRetryWithoutCors(false);
    setImageError(false);
    setHasAutoSelected(false);
    setPolyPoints([]); 
    // Reset selection locally to ensure clean state before auto-select runs
    onSelectionChange(null);
  }, [imageSrc, shape]);

  useEffect(() => {
    if (!selection) {
      setPolyPoints([]);
    }
  }, [selection]);

  // --- AUTO-SELECTION LOGIC (Now uses Image-Relative Points) ---
  useEffect(() => {
    if (!isSystemImage) return;
    
    // If Specialty, we check if we should auto-draw points.
    if (!hasAutoSelected) {
       if (shape !== 'Standard') {
            // Defined relative points (0.0-1.0) for standard images
            const SHAPE_DEFAULTS: Record<string, {x: number, y: number}[]> = {
                    // Calibrated from Screenshots
                    'Right Triangle (Left)':    [
                        {x: 0.815, y: 0.197}, 
                        {x: 0.810, y: 0.837}, 
                        {x: 0.172, y: 0.837}, 
                        {x: 0.170, y: 0.746}
                    ],
                    'Pentagon':                 [
                        {x: 0.507, y: 0.132}, 
                        {x: 0.227, y: 0.288}, 
                        {x: 0.225, y: 0.826}, 
                        {x: 0.778, y: 0.826}, 
                        {x: 0.778, y: 0.288}
                    ],
                    'Flat Top Hexagon':         [
                        {x: 0.342, y: 0.186}, // Top Left
                        {x: 0.663, y: 0.186}, // Top Right
                        {x: 0.773, y: 0.319}, // Right Angle
                        {x: 0.773, y: 0.798}, // Bottom Right
                        {x: 0.231, y: 0.798}, // Bottom Left
                        {x: 0.231, y: 0.312}  // Left Angle
                    ],
                    'Flat Top Trapezoid Right': [
                        {x: 0.222, y: 0.113}, 
                        {x: 0.405, y: 0.113}, 
                        {x: 0.762, y: 0.507}, 
                        {x: 0.767, y: 0.872}, 
                        {x: 0.218, y: 0.874}
                    ],
                    'Trapezoid Right A':        [
                        {x: 0.229, y: 0.152}, 
                        {x: 0.229, y: 0.844}, 
                        {x: 0.778, y: 0.848}, 
                        {x: 0.771, y: 0.410}
                    ],
                    'Trapezoid Left':           [
                        {x: 0.739, y: 0.143}, 
                        {x: 0.270, y: 0.323}, 
                        {x: 0.268, y: 0.846}, 
                        {x: 0.732, y: 0.852}
                    ],
                    'Acute Triangle':           [
                        {x: 0.502, y: 0.197}, 
                        {x: 0.192, y: 0.772}, 
                        {x: 0.806, y: 0.770}
                    ],
                    'Right Triangle (Right)':   [
                        {x: 0.789, y: 0.243}, 
                        {x: 0.789, y: 0.785}, 
                        {x: 0.179, y: 0.785}
                    ],
            };

            const defaultPoints = SHAPE_DEFAULTS[shape];
            if (defaultPoints) {
                setPolyPoints(defaultPoints);
                onSelectionChange({ 
                    x: 0, y: 0, w: 0, h: 0, // Not used for specialty
                    points: defaultPoints 
                });
                setHasAutoSelected(true);
            }
       } else {
           // Standard Box Default (Relative) - Calibrated
           const defX = 0.257;
           const defY = 0.158;
           const defW = 0.540;
           const defH = 0.393;
           
           onSelectionChange({ x: defX, y: defY, w: defW, h: defH });
           setHasAutoSelected(true);
       }
    }
  }, [imageSrc, shape, hasAutoSelected, isSystemImage]);

  // Texture Tiling
  const createSeamlessTile = (img: HTMLImageElement) => {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth * 2;
    canvas.height = img.naturalHeight * 2;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      try {
        ctx.drawImage(img, 0, 0);
        ctx.save();
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, img.naturalWidth, img.naturalHeight);
        ctx.restore();
        ctx.save();
        ctx.translate(0, canvas.height);
        ctx.scale(1, -1);
        ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, img.naturalWidth, img.naturalHeight);
        ctx.restore();
        ctx.save();
        ctx.translate(canvas.width, canvas.height);
        ctx.scale(-1, -1);
        ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, img.naturalWidth, img.naturalHeight);
        ctx.restore();
      } catch (e) {
        console.error("Error creating seamless tile:", e);
        // Return blank canvas or partial to avoid crash
      }
    }
    return canvas;
  };

  useEffect(() => {
    if (selectedFabric && selectedFabric.cloudinaryId) {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      
      const url = getFabricUrl(selectedFabric.cloudinaryId, 'texture');
      
      if (url) {
          // Robust query param appendage
          const separator = url.includes('?') ? '&' : '?';
          img.src = `${url}${separator}t=${Date.now()}`;
          
          img.onload = () => {
            const seamlessCanvas = createSeamlessTile(img);
            setFabricPatternImage(seamlessCanvas);
          };
          img.onerror = () => {
            console.error("Failed to load fabric texture:", url);
            setFabricPatternImage(null);
          };
      } else {
          setFabricPatternImage(null);
      }
    } else {
      setFabricPatternImage(null);
    }
  }, [selectedFabric]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setMediaStream(stream);
      setIsCameraOpen(true);
      setImageError(false);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please ensure permissions are granted.");
    }
  };

  useEffect(() => {
    if (isCameraOpen && videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
      videoRef.current.play().catch(e => console.error("Error playing video:", e));
    }
  }, [isCameraOpen, mediaStream]);

  const stopCamera = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg');
      onImageChange(dataUrl);
      stopCamera();
      onSelectionChange(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Use FileReader to get base64 string directly for AI analysis
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        onImageChange(result);
        onSelectionChange(null);
        setImageError(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageError = () => {
    if (!retryWithoutCors) {
      setRetryWithoutCors(true);
    } else {
      setImageError(true);
    }
  };

  // --- INTERACTION LOGIC (RELATIVE COORDS) ---

  const getMousePos = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e) {
       clientX = e.touches[0].clientX;
       clientY = e.touches[0].clientY;
    } else {
       clientX = (e as React.MouseEvent).clientX;
       clientY = (e as React.MouseEvent).clientY;
    }
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (isCameraOpen || imageError || isSystemImage) return;
    const metrics = getImageMetrics();
    if (!metrics) return;

    const pos = getMousePos(e);
    
    // Convert screen pixel to Image Relative Coordinate (0.0 - 1.0)
    // Formula: (ClickPos - ImageOffset) / ImageDimension
    const relX = (pos.x - metrics.offsetX) / metrics.renderW;
    const relY = (pos.y - metrics.offsetY) / metrics.renderH;

    // --- POLYGON MODE ---
    if (shape !== 'Standard') {
        const newPoint = { x: relX, y: relY };
        const newPoints = [...polyPoints, newPoint];
        setPolyPoints(newPoints);

        onSelectionChange({ 
            x: 0, y: 0, w: 0, h: 0,
            points: newPoints
        });
        return;
    }

    // --- STANDARD BOX MODE ---
    setIsDrawing(true);
    setStartPoint({ x: relX, y: relY }); // Store start point as RELATIVE
    onSelectionChange({ x: relX, y: relY, w: 0, h: 0 }); // Initial selection is 0 size
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (shape !== 'Standard' || isSystemImage) return; 

    if (!isDrawing || !startPoint) return;
    if ('touches' in e) e.preventDefault(); 
    
    const metrics = getImageMetrics();
    if (!metrics) return;

    const pos = getMousePos(e);
    const currRelX = (pos.x - metrics.offsetX) / metrics.renderW;
    const currRelY = (pos.y - metrics.offsetY) / metrics.renderH;

    const w = currRelX - startPoint.x;
    const h = currRelY - startPoint.y;

    onSelectionChange({ x: startPoint.x, y: startPoint.y, w: w, h: h });
  };

  const handleMouseUp = () => {
    if (shape === 'Standard') {
        setIsDrawing(false);
    }
  };

  const handleConfirm = async () => {
    // If it's a user uploaded image, perform AI analysis
    if (!isSystemImage) {
        setIsAnalyzing(true);
        const analysis = await analyzeRoomImage(imageSrc);
        setIsAnalyzing(false);
        if (analysis) {
            onConfirmSelection(analysis);
        } else {
            // Fallback if AI fails
            onConfirmSelection();
        }
    } else {
        onConfirmSelection(); 
    }
  };

  // --- CANVAS RENDERING (RELATIVE -> PIXEL) ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const metrics = getImageMetrics();
    if (!metrics) return;

    canvas.width = metrics.cW;
    canvas.height = metrics.cH;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (selection) {
      ctx.save();
      ctx.beginPath();

      // --- DRAW POLYGON ---
      if (selection.points && selection.points.length > 0) {
          const startX = metrics.offsetX + (selection.points[0].x * metrics.renderW);
          const startY = metrics.offsetY + (selection.points[0].y * metrics.renderH);
          
          ctx.moveTo(startX, startY);
          
          selection.points.forEach((p, i) => {
              if (i > 0) {
                  const px = metrics.offsetX + (p.x * metrics.renderW);
                  const py = metrics.offsetY + (p.y * metrics.renderH);
                  ctx.lineTo(px, py);
              }
          });
          ctx.closePath();
      } 
      // --- DRAW STANDARD BOX ---
      else {
          // Convert Relative Selection to Pixels for Drawing
          const px = metrics.offsetX + (selection.x * metrics.renderW);
          const py = metrics.offsetY + (selection.y * metrics.renderH);
          const pw = selection.w * metrics.renderW;
          const ph = selection.h * metrics.renderH;
          
          ctx.rect(px, py, pw, ph);
      }
      
      ctx.clip();

      // --- TEXTURE FILL ---
      if (fabricPatternImage) {
         ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
         ctx.fill();
         
         try {
             const pattern = ctx.createPattern(fabricPatternImage, 'repeat');
             if (pattern) {
                const matrix = new DOMMatrix();
                // Calculate pixel start point for pattern alignment
                let startX, startY;
                
                if (selection.points && selection.points.length > 0) {
                     startX = metrics.offsetX + (selection.points[0].x * metrics.renderW);
                     startY = metrics.offsetY + (selection.points[0].y * metrics.renderH);
                } else {
                     startX = metrics.offsetX + (selection.x * metrics.renderW);
                     startY = metrics.offsetY + (selection.y * metrics.renderH);
                }
                
                matrix.translateSelf(startX, startY);
                matrix.scaleSelf(textureScale, textureScale);
                pattern.setTransform(matrix);
                
                const category = selectedFabric?.category || '';
                if (category === 'Light Filtering') {
                    ctx.globalAlpha = 0.9;
                } else {
                    ctx.globalAlpha = 1.0;
                }
                ctx.fillStyle = pattern;
                ctx.fill();
             }
         } catch (e) {
             console.warn("Pattern fill failed (security/taint)", e);
             // Fallback
             ctx.fillStyle = 'rgba(14, 165, 233, 0.4)';
             ctx.fill();
         }
      } else {
         ctx.fillStyle = 'rgba(14, 165, 233, 0.4)';
         ctx.fill();
      }
      ctx.restore(); 
    }
  }, [selection, imageSrc, isCameraOpen, fabricPatternImage, selectedFabric, imageError, textureScale, shape, polyPoints, imgAspect, getImageMetrics, containerHeight]); 

  // Option 3 Logic: Define strip mode for hiding UI elements on mobile
  const isStripMode = isCollapsed || (containerHeight < 120 && window.innerWidth < 768);

  return (
    <div className="flex flex-col gap-4 flex-1 min-h-0">
      {/* Dynamic Header Controls - Hidden on mobile when collapsed */}
      <div className={`${isCollapsed ? 'hidden md:flex' : 'flex'} flex-wrap gap-3 justify-between items-center pb-3 relative shrink-0 transition-all duration-300`}>
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            {t('visualizer.title')}
            {isAnalyzing && (
                <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-[10px] font-bold animate-pulse flex items-center gap-1">
                    <Sparkles size={10} /> {t('visualizer.analyzing')}
                </span>
            )}
        </h2>
        
        <div className="flex gap-2 items-center">
          {/* Allow user to reset auto-selection and draw manually - ONLY VISIBLE FOR UPLOADED PHOTOS */}
          {!isSystemImage && (
            <button 
                    onClick={() => {
                        setHasAutoSelected(true); 
                        onSelectionChange(null);
                        setPolyPoints([]);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-700 bg-yellow-100 hover:bg-yellow-200 rounded-md transition-colors"
                    title={t('actions.clear')}
                >
                    <Crosshair size={14} />
                    {t('actions.clear')}
            </button>
          )}

          {selectedFabric && selection && (
            <div className="flex items-center gap-2 mr-2 border-r border-gray-200 pr-4 group relative">
              <ZoomOut size={14} className="text-gray-400" />
              <input 
                type="range" 
                min="0.05" 
                max="0.5" 
                step="0.01" 
                value={textureScale} 
                onChange={(e) => setTextureScale(parseFloat(e.target.value))}
                className="w-20 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-slate-800"
              />
              <ZoomIn size={14} className="text-gray-400" />
            </div>
          )}

          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            <Upload size={14} />
            {t('visualizer.upload')}
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileUpload}
          />
          <button 
            onClick={startCamera}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
          >
            <Camera size={14} />
            {t('visualizer.camera')}
          </button>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="relative w-full flex-1 rounded-xl overflow-hidden group touch-none min-h-0 transition-all duration-500"
      >
        {isCameraOpen ? (
          <div className="absolute inset-0 bg-black flex flex-col items-center justify-center z-30">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              onLoadedMetadata={() => videoRef.current?.play()}
              className="absolute inset-0 w-full h-full object-cover"
            />
             <div className="absolute bottom-6 flex gap-4 z-40">
                <button 
                  onClick={capturePhoto}
                  className="bg-white text-slate-900 px-6 py-2 rounded-full font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
                >
                  <Camera size={18} /> {t('visualizer.capture')}
                </button>
                <button 
                  onClick={stopCamera}
                  className="bg-red-500 text-white px-4 py-2 rounded-full font-bold shadow-lg hover:bg-red-600 transition-colors"
                >
                  <X size={18} />
                </button>
             </div>
          </div>
        ) : (
          <>
             {imageError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 bg-gray-100">
                   <ImageOff size={48} className="mb-2 opacity-50" />
                   <p className="text-sm font-medium">{t('visualizer.error')}</p>
                   <p className="text-xs mt-1">{t('visualizer.errorAction')}</p>
                </div>
             ) : (
               <img 
                 key={`${imageSrc}-${retryWithoutCors}`}
                 src={imageSrc} 
                 alt="Room" 
                 crossOrigin={retryWithoutCors ? undefined : "anonymous"}
                 onLoad={(e) => setImgAspect(e.currentTarget.naturalWidth / e.currentTarget.naturalHeight)}
                 onError={handleImageError}
                 referrerPolicy="no-referrer"
                 className="absolute inset-0 w-full h-full object-contain select-none bg-transparent pointer-events-none z-0"
                 style={{ 
                    transform: shouldFlipImage ? 'scaleX(-1)' : 'none' 
                 }}
               />
             )}
            
            <canvas
              ref={canvasRef}
              onMouseDown={isSystemImage ? undefined : handleMouseDown}
              onMouseMove={isSystemImage ? undefined : handleMouseMove}
              onMouseUp={isSystemImage ? undefined : handleMouseUp}
              onMouseLeave={isSystemImage ? undefined : handleMouseUp}
              onTouchStart={isSystemImage ? undefined : handleMouseDown}
              onTouchMove={isSystemImage ? undefined : handleMouseMove}
              onTouchEnd={isSystemImage ? undefined : handleMouseUp}
              className={`absolute inset-0 z-20 ${!isSystemImage && shape !== 'Standard' ? 'cursor-crosshair' : 'cursor-default'}`}
            />
            
            {!selection && !imageError && !isStripMode && (
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900/80 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs pointer-events-none flex items-center gap-2 shadow-lg z-30 w-max max-w-[90%] text-center justify-center animate-in fade-in zoom-in duration-500 delay-500">
                {shape === 'Standard' ? (
                    <>
                        <ScanLine size={14} className="shrink-0" />
                        {t('visualizer.drawPrompt')}
                    </>
                ) : (
                    <>
                        <MousePointerClick size={14} className="shrink-0" />
                        {t('visualizer.clickPrompt').replace('{shape}', getShapeName(shape))}
                    </>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {!isCameraOpen && !isStripMode && (
        <div className="hidden md:flex gap-3 shrink-0 transition-all duration-300">
           <button
            onClick={handleConfirm}
            disabled={isAnalyzing || !selection || (selection.w === 0 && selection.h === 0 && (!selection.points || selection.points.length < 3))}
            className="flex-1 bg-slate-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-medium shadow-sm hover:bg-slate-700 transition-colors flex justify-center items-center gap-2"
          >
            {isAnalyzing ? (
                <>
                    <Loader2 size={16} className="animate-spin" />
                    {t('visualizer.analyzingRoom')}
                </>
            ) : (
                <>
                    <Check size={16} />
                    {t('visualizer.confirm')}
                </>
            )}
          </button>
          {!isSystemImage && (
            <button
                onClick={() => onSelectionChange(null)}
                disabled={!selection || isAnalyzing}
                className="px-4 border border-gray-300 text-slate-600 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                title={t('actions.reset')}
            >
                <RefreshCcw size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Visualizer;
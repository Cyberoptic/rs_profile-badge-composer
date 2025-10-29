import React, { useState, useRef, useEffect } from 'react';
import Pica from 'pica';

const UnifiedProfileComposer = () => {
  // State for images
  const [profileImage, setProfileImage] = useState(null);
  const [frameImage, setFrameImage] = useState(null);
  
  // State for profile image transforms
  const [profileTransform, setProfileTransform] = useState({
    x: 0,
    y: 0,
    scale: 0.75,
    rotation: 0
  });
  
  // State for frame image transforms
  const [frameTransform, setFrameTransform] = useState({
    x: 0,
    y: 0,
    scale: 1.0
  });
  
  // State for output settings
  const [outputSize, setOutputSize] = useState(413);
  const [outputFormat, setOutputFormat] = useState('png');
  const [jpgQuality, setJpgQuality] = useState(95);
  
  // State for UI controls
  const [showGrid, setShowGrid] = useState(true);
  const [showSafeArea, setShowSafeArea] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeLayer, setActiveLayer] = useState('profile'); // 'profile' or 'frame'
  
  // Refs
  const canvasRef = useRef(null);
  const profileImgRef = useRef(null);
  const frameImgRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  
  const CANVAS_SIZE = 500;
  const SAFE_AREA_RATIO = 0.9;
  
  // Pica instance
  const picaRef = useRef(new Pica());

  // Handle profile image upload
  const handleProfileImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.match(/image\/(jpeg|png|webp)/)) {
      alert('JPEG, PNG, WebP形式の画像をアップロードしてください');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setProfileImage(img);
        setActiveLayer('profile');
        // Reset transform for new image
        setProfileTransform({
          x: 0,
          y: 0,
          scale: 0.75,
          rotation: 0
        });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Handle frame image upload
  const handleFrameImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.match(/image\/(png|webp)/)) {
      alert('透過PNGまたはWebP形式の画像をアップロードしてください');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setFrameImage(img);
        setActiveLayer('frame');
        // Reset transform for new image
        setFrameTransform({
          x: 0,
          y: 0,
          scale: 1.0
        });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    
    // Create a fake event object
    const fakeEvent = {
      target: {
        files: [file]
      }
    };
    
    if (type === 'profile') {
      handleProfileImageUpload(fakeEvent);
    } else {
      handleFrameImageUpload(fakeEvent);
    }
  };

  // Canvas mouse handlers
  const handleCanvasMouseDown = (e) => {
    if (!profileImage && !frameImage) return;
    
    isDraggingRef.current = true;
    const rect = canvasRef.current.getBoundingClientRect();
    dragStartRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleCanvasMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    const deltaX = currentX - dragStartRef.current.x;
    const deltaY = currentY - dragStartRef.current.y;
    
    if (activeLayer === 'profile' && profileImage) {
      setProfileTransform(prev => ({
        ...prev,
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
    } else if (activeLayer === 'frame' && frameImage) {
      setFrameTransform(prev => ({
        ...prev,
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
    }
    
    dragStartRef.current = { x: currentX, y: currentY };
  };

  const handleCanvasMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Mouse wheel zoom for profile image
  const handleCanvasWheel = (e) => {
    if (!profileImage || activeLayer !== 'profile') return;
    
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    
    setProfileTransform(prev => ({
      ...prev,
      scale: Math.max(0.1, Math.min(3.0, prev.scale + delta))
    }));
  };

  // Reset functions
  const resetProfileTransform = () => {
    setProfileTransform({
      x: 0,
      y: 0,
      scale: 0.75,
      rotation: 0
    });
  };

  const resetFrameTransform = () => {
    setFrameTransform({
      x: 0,
      y: 0,
      scale: 1.0
    });
  };

  // Center functions
  const centerProfileImage = () => {
    setProfileTransform(prev => ({
      ...prev,
      x: 0,
      y: 0
    }));
  };

  const centerFrameImage = () => {
    setFrameTransform(prev => ({
      ...prev,
      x: 0,
      y: 0
    }));
  };

  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // Draw background
    ctx.fillStyle = '#f4f4f5';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = '#e4e4e7';
      ctx.lineWidth = 1;
      const gridSize = CANVAS_SIZE / 10;
      for (let i = 1; i < 10; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, CANVAS_SIZE);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(CANVAS_SIZE, i * gridSize);
        ctx.stroke();
      }
    }
    
    // Draw safe area
    if (showSafeArea) {
      const safeSize = CANVAS_SIZE * SAFE_AREA_RATIO;
      const safeOffset = (CANVAS_SIZE - safeSize) / 2;
      
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(safeOffset, safeOffset, safeSize, safeSize);
      ctx.setLineDash([]);
    }
    
    const centerX = CANVAS_SIZE / 2;
    const centerY = CANVAS_SIZE / 2;
    
    // Draw profile image
    if (profileImage) {
      ctx.save();
      ctx.translate(centerX + profileTransform.x, centerY + profileTransform.y);
      ctx.rotate((profileTransform.rotation * Math.PI) / 180);
      ctx.scale(profileTransform.scale, profileTransform.scale);
      
      const aspectRatio = profileImage.width / profileImage.height;
      let drawWidth, drawHeight;
      
      if (aspectRatio > 1) {
        drawWidth = CANVAS_SIZE;
        drawHeight = CANVAS_SIZE / aspectRatio;
      } else {
        drawWidth = CANVAS_SIZE * aspectRatio;
        drawHeight = CANVAS_SIZE;
      }
      
      ctx.drawImage(
        profileImage,
        -drawWidth / 2,
        -drawHeight / 2,
        drawWidth,
        drawHeight
      );
      ctx.restore();
    }
    
    // Draw frame image
    if (frameImage) {
      ctx.save();
      ctx.translate(centerX + frameTransform.x, centerY + frameTransform.y);
      ctx.scale(frameTransform.scale, frameTransform.scale);
      
      const frameSize = CANVAS_SIZE;
      ctx.drawImage(
        frameImage,
        -frameSize / 2,
        -frameSize / 2,
        frameSize,
        frameSize
      );
      ctx.restore();
    }
    
    // Draw active layer indicator
    if (profileImage && activeLayer === 'profile') {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 5]);
      ctx.strokeRect(5, 5, CANVAS_SIZE - 10, CANVAS_SIZE - 10);
      ctx.setLineDash([]);
    } else if (frameImage && activeLayer === 'frame') {
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 5]);
      ctx.strokeRect(5, 5, CANVAS_SIZE - 10, CANVAS_SIZE - 10);
      ctx.setLineDash([]);
    }
    
  }, [profileImage, frameImage, profileTransform, frameTransform, showGrid, showSafeArea, activeLayer]);

  // Export function with Pica.js
  const handleExport = async () => {
    if (!profileImage) {
      alert('プロフィール画像をアップロードしてください');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Create a temporary canvas at full size
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = CANVAS_SIZE;
      tempCanvas.height = CANVAS_SIZE;
      const tempCtx = tempCanvas.getContext('2d');
      
      // Draw profile image
      const centerX = CANVAS_SIZE / 2;
      const centerY = CANVAS_SIZE / 2;
      
      tempCtx.save();
      tempCtx.translate(centerX + profileTransform.x, centerY + profileTransform.y);
      tempCtx.rotate((profileTransform.rotation * Math.PI) / 180);
      tempCtx.scale(profileTransform.scale, profileTransform.scale);
      
      const aspectRatio = profileImage.width / profileImage.height;
      let drawWidth, drawHeight;
      
      if (aspectRatio > 1) {
        drawWidth = CANVAS_SIZE;
        drawHeight = CANVAS_SIZE / aspectRatio;
      } else {
        drawWidth = CANVAS_SIZE * aspectRatio;
        drawHeight = CANVAS_SIZE;
      }
      
      tempCtx.drawImage(
        profileImage,
        -drawWidth / 2,
        -drawHeight / 2,
        drawWidth,
        drawHeight
      );
      tempCtx.restore();
      
      // Draw frame image if exists
      if (frameImage) {
        tempCtx.save();
        tempCtx.translate(centerX + frameTransform.x, centerY + frameTransform.y);
        tempCtx.scale(frameTransform.scale, frameTransform.scale);
        
        const frameSize = CANVAS_SIZE;
        tempCtx.drawImage(
          frameImage,
          -frameSize / 2,
          -frameSize / 2,
          frameSize,
          frameSize
        );
        tempCtx.restore();
      }
      
      // Resize with Pica
      const outputCanvas = document.createElement('canvas');
      outputCanvas.width = outputSize;
      outputCanvas.height = outputSize;
      
      await picaRef.current.resize(tempCanvas, outputCanvas, {
        quality: 3,
        alpha: outputFormat === 'png'
      });
      
      // Convert to blob and download
      const mimeType = outputFormat === 'png' ? 'image/png' : 'image/jpeg';
      const quality = outputFormat === 'png' ? undefined : jpgQuality / 100;
      
      outputCanvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const timestamp = new Date().getTime();
        link.download = `profile_${outputSize}px_${timestamp}.${outputFormat}`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        setIsProcessing(false);
      }, mimeType, quality);
      
    } catch (error) {
      console.error('Export error:', error);
      alert('画像の書き出しに失敗しました');
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Upload Controls */}
        <div className="space-y-6">
          {/* Profile Image Upload */}
          <div className="bg-white rounded-lg border border-zinc-200 p-6">
            <h3 className="text-lg font-semibold mb-4">① プロフィール画像</h3>
            <div
              className="border-2 border-dashed border-zinc-300 rounded-lg p-8 text-center hover:border-zinc-400 transition-colors cursor-pointer"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'profile')}
              onClick={() => document.getElementById('profile-upload').click()}
            >
              {profileImage ? (
                <div>
                  <img
                    src={profileImage.src}
                    alt="Profile preview"
                    className="w-20 h-20 object-cover rounded-lg mx-auto mb-2"
                  />
                  <p className="text-sm text-zinc-600">クリックまたはドロップで変更</p>
                </div>
              ) : (
                <div>
                  <div className="text-4xl mb-2">📸</div>
                  <p className="text-sm text-zinc-600">
                    クリックまたは画像をドロップ
                  </p>
                </div>
              )}
            </div>
            <input
              id="profile-upload"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleProfileImageUpload}
              className="hidden"
            />
            {profileImage && (
              <button
                onClick={() => {
                  setProfileImage(null);
                  resetProfileTransform();
                }}
                className="mt-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                削除
              </button>
            )}
          </div>

          {/* Frame Image Upload */}
          <div className="bg-white rounded-lg border border-zinc-200 p-6">
            <h3 className="text-lg font-semibold mb-4">② フレーム画像（オプション）</h3>
            <div
              className="border-2 border-dashed border-zinc-300 rounded-lg p-8 text-center hover:border-zinc-400 transition-colors cursor-pointer"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'frame')}
              onClick={() => document.getElementById('frame-upload').click()}
            >
              {frameImage ? (
                <div>
                  <img
                    src={frameImage.src}
                    alt="Frame preview"
                    className="w-20 h-20 object-cover rounded-lg mx-auto mb-2"
                  />
                  <p className="text-sm text-zinc-600">クリックまたはドロップで変更</p>
                </div>
              ) : (
                <div>
                  <div className="text-4xl mb-2">🖼️</div>
                  <p className="text-sm text-zinc-600">
                    透過PNGをアップロード
                  </p>
                </div>
              )}
            </div>
            <input
              id="frame-upload"
              type="file"
              accept="image/png,image/webp"
              onChange={handleFrameImageUpload}
              className="hidden"
            />
            {frameImage && (
              <button
                onClick={() => {
                  setFrameImage(null);
                  resetFrameTransform();
                }}
                className="mt-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                削除
              </button>
            )}
          </div>
        </div>

        {/* Center Panel - Canvas Preview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg border border-zinc-200 p-6">
            <h3 className="text-lg font-semibold mb-4">③ プレビュー</h3>
            
            {/* Active Layer Selection */}
            {profileImage && frameImage && (
              <div className="mb-4 flex gap-2">
                <button
                  onClick={() => setActiveLayer('profile')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeLayer === 'profile'
                      ? 'bg-blue-500 text-white'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  プロフィール画像を編集
                </button>
                <button
                  onClick={() => setActiveLayer('frame')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeLayer === 'frame'
                      ? 'bg-green-500 text-white'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  フレームを編集
                </button>
              </div>
            )}
            
            <div className="flex justify-center">
              <canvas
                ref={canvasRef}
                width={CANVAS_SIZE}
                height={CANVAS_SIZE}
                className="border border-zinc-300 rounded-lg cursor-move shadow-lg"
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
                onWheel={handleCanvasWheel}
              />
            </div>
            
            <div className="mt-4 text-sm text-zinc-600 space-y-1">
              <p>💡 操作方法：</p>
              <ul className="list-disc list-inside pl-2 space-y-1">
                <li>ドラッグ：画像を移動</li>
                <li>マウスホイール：プロフィール画像をズーム（プロフィール編集モード時）</li>
                <li>スライダー：回転・スケール調整</li>
              </ul>
            </div>
          </div>

          {/* Control Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Profile Controls */}
            {profileImage && (
              <div className="bg-white rounded-lg border border-zinc-200 p-6">
                <h4 className="text-md font-semibold mb-4 text-blue-600">プロフィール画像の調整</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                      拡大率: {(profileTransform.scale * 100).toFixed(0)}%
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="300"
                      value={profileTransform.scale * 100}
                      onChange={(e) =>
                        setProfileTransform(prev => ({
                          ...prev,
                          scale: parseFloat(e.target.value) / 100
                        }))
                      }
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                      回転: {profileTransform.rotation}°
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={profileTransform.rotation}
                      onChange={(e) =>
                        setProfileTransform(prev => ({
                          ...prev,
                          rotation: parseFloat(e.target.value)
                        }))
                      }
                      className="w-full"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={centerProfileImage}
                      className="flex-1 px-3 py-2 text-sm bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
                    >
                      中央揃え
                    </button>
                    <button
                      onClick={resetProfileTransform}
                      className="flex-1 px-3 py-2 text-sm bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
                    >
                      リセット
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Frame Controls */}
            {frameImage && (
              <div className="bg-white rounded-lg border border-zinc-200 p-6">
                <h4 className="text-md font-semibold mb-4 text-green-600">フレームの調整</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                      スケール: {(frameTransform.scale * 100).toFixed(0)}%
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="200"
                      value={frameTransform.scale * 100}
                      onChange={(e) =>
                        setFrameTransform(prev => ({
                          ...prev,
                          scale: parseFloat(e.target.value) / 100
                        }))
                      }
                      className="w-full"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={centerFrameImage}
                      className="flex-1 px-3 py-2 text-sm bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
                    >
                      中央揃え
                    </button>
                    <button
                      onClick={resetFrameTransform}
                      className="flex-1 px-3 py-2 text-sm bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
                    >
                      リセット
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* View Options */}
          <div className="bg-white rounded-lg border border-zinc-200 p-6">
            <h4 className="text-md font-semibold mb-4">表示オプション</h4>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm">グリッド表示</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showSafeArea}
                  onChange={(e) => setShowSafeArea(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm">セーフエリア表示</span>
              </label>
            </div>
          </div>

          {/* Output Settings */}
          <div className="bg-white rounded-lg border border-zinc-200 p-6">
            <h3 className="text-lg font-semibold mb-4">④ 出力設定</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  出力サイズ
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setOutputSize(120)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      outputSize === 120
                        ? 'bg-zinc-900 text-white'
                        : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                    }`}
                  >
                    120px (Peer-Ring用)
                  </button>
                  <button
                    onClick={() => setOutputSize(413)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      outputSize === 413
                        ? 'bg-zinc-900 text-white'
                        : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                    }`}
                  >
                    413px (SNS用)
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  出力形式
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setOutputFormat('png')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      outputFormat === 'png'
                        ? 'bg-zinc-900 text-white'
                        : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                    }`}
                  >
                    PNG (推奨)
                  </button>
                  <button
                    onClick={() => setOutputFormat('jpg')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      outputFormat === 'jpg'
                        ? 'bg-zinc-900 text-white'
                        : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                    }`}
                  >
                    JPG
                  </button>
                </div>
              </div>
              
              {outputFormat === 'jpg' && (
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    JPG品質: {jpgQuality}%
                  </label>
                  <input
                    type="range"
                    min="80"
                    max="100"
                    value={jpgQuality}
                    onChange={(e) => setJpgQuality(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              )}
              
              <button
                onClick={handleExport}
                disabled={!profileImage || isProcessing}
                className="w-full px-6 py-3 bg-zinc-900 text-white rounded-lg font-medium hover:bg-zinc-800 disabled:bg-zinc-300 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? '処理中...' : '画像を出力'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedProfileComposer;

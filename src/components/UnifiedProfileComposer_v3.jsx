import React, { useState, useRef, useEffect } from 'react';
import Pica from 'pica';

const UnifiedProfileComposer = () => {
  // State for images
  const [profileImage, setProfileImage] = useState(null);
  const [frameImage, setFrameImage] = useState(null);
  const [badgeImage, setBadgeImage] = useState(null);
  
  // State for saved assets (localStorage)
  const [savedFrames, setSavedFrames] = useState([]);
  const [savedBadges, setSavedBadges] = useState([]);
  
  // State for save dialogs
  const [showFrameSaveDialog, setShowFrameSaveDialog] = useState(false);
  const [showBadgeSaveDialog, setShowBadgeSaveDialog] = useState(false);
  const [saveFrameName, setSaveFrameName] = useState('');
  const [saveBadgeName, setSaveBadgeName] = useState('');
  
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
  
  // State for badge image transforms
  const [badgeTransform, setBadgeTransform] = useState({
    x: 0,
    y: 0,
    scale: 0.15, // 30px / 500px ≈ 0.06, but make it visible
    position: 'bottom-right' // 'top-left', 'top-right', 'bottom-left', 'bottom-right'
  });
  
  // State for output settings
  const [outputSize, setOutputSize] = useState(413);
  const [outputFormat, setOutputFormat] = useState('png');
  const [jpgQuality, setJpgQuality] = useState(95);
  
  // State for UI controls
  const [showGrid, setShowGrid] = useState(true);
  const [showSafeArea, setShowSafeArea] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeLayer, setActiveLayer] = useState('profile');
  
  // Refs
  const canvasRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  
  const CANVAS_SIZE = 500;
  const SAFE_AREA_RATIO = 0.9;
  
  // Pica instance
  const picaRef = useRef(new Pica());

  // Load saved assets from localStorage
  useEffect(() => {
    const frames = JSON.parse(localStorage.getItem('savedFrames') || '[]');
    const badges = JSON.parse(localStorage.getItem('savedBadges') || '[]');
    setSavedFrames(frames);
    setSavedBadges(badges);
  }, []);

  // Calculate badge position based on corner
  const getBadgePosition = () => {
    const margin = 20; // Distance from edge
    const positions = {
      'top-left': { x: -CANVAS_SIZE / 2 + margin, y: -CANVAS_SIZE / 2 + margin },
      'top-right': { x: CANVAS_SIZE / 2 - margin, y: -CANVAS_SIZE / 2 + margin },
      'bottom-left': { x: -CANVAS_SIZE / 2 + margin, y: CANVAS_SIZE / 2 - margin },
      'bottom-right': { x: CANVAS_SIZE / 2 - margin, y: CANVAS_SIZE / 2 - margin }
    };
    return positions[badgeTransform.position] || positions['bottom-right'];
  };

  // Save frame to localStorage
  const handleSaveFrame = () => {
    if (!frameImage || !saveFrameName.trim()) {
      alert('フレーム画像と名前を入力してください');
      return;
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = frameImage.width;
    canvas.height = frameImage.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(frameImage, 0, 0);
    
    const imageData = canvas.toDataURL('image/png');
    const newFrame = {
      id: Date.now(),
      name: saveFrameName,
      imageData: imageData
    };
    
    const updated = [...savedFrames, newFrame];
    setSavedFrames(updated);
    localStorage.setItem('savedFrames', JSON.stringify(updated));
    
    setSaveFrameName('');
    setShowFrameSaveDialog(false);
    alert('フレームを保存しました！');
  };

  // Save badge to localStorage
  const handleSaveBadge = () => {
    if (!badgeImage || !saveBadgeName.trim()) {
      alert('バッジ画像と名前を入力してください');
      return;
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = badgeImage.width;
    canvas.height = badgeImage.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(badgeImage, 0, 0);
    
    const imageData = canvas.toDataURL('image/png');
    const newBadge = {
      id: Date.now(),
      name: saveBadgeName,
      imageData: imageData
    };
    
    const updated = [...savedBadges, newBadge];
    setSavedBadges(updated);
    localStorage.setItem('savedBadges', JSON.stringify(updated));
    
    setSaveBadgeName('');
    setShowBadgeSaveDialog(false);
    alert('バッジを保存しました！');
  };

  // Load saved frame
  const handleLoadFrame = (frame) => {
    const img = new Image();
    img.onload = () => {
      setFrameImage(img);
      setActiveLayer('frame');
      setFrameTransform({ x: 0, y: 0, scale: 1.0 });
    };
    img.src = frame.imageData;
  };

  // Load saved badge
  const handleLoadBadge = (badge) => {
    const img = new Image();
    img.onload = () => {
      setBadgeImage(img);
      setActiveLayer('badge');
      setBadgeTransform(prev => ({ ...prev, x: 0, y: 0 }));
    };
    img.src = badge.imageData;
  };

  // Delete frame
  const handleDeleteFrame = (id) => {
    if (!confirm('このフレームを削除しますか？')) return;
    
    const updated = savedFrames.filter(f => f.id !== id);
    setSavedFrames(updated);
    localStorage.setItem('savedFrames', JSON.stringify(updated));
    
    if (frameImage && savedFrames.find(f => f.id === id)) {
      setFrameImage(null);
    }
  };

  // Delete badge
  const handleDeleteBadge = (id) => {
    if (!confirm('このバッジを削除しますか？')) return;
    
    const updated = savedBadges.filter(b => b.id !== id);
    setSavedBadges(updated);
    localStorage.setItem('savedBadges', JSON.stringify(updated));
    
    if (badgeImage && savedBadges.find(b => b.id === id)) {
      setBadgeImage(null);
    }
  };

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
        setProfileTransform({ x: 0, y: 0, scale: 0.75, rotation: 0 });
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
        setFrameTransform({ x: 0, y: 0, scale: 1.0 });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Handle badge image upload
  const handleBadgeImageUpload = (e) => {
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
        setBadgeImage(img);
        setActiveLayer('badge');
        setBadgeTransform(prev => ({ ...prev, x: 0, y: 0 }));
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
    
    const fakeEvent = { target: { files: [file] } };
    
    if (type === 'profile') {
      handleProfileImageUpload(fakeEvent);
    } else if (type === 'frame') {
      handleFrameImageUpload(fakeEvent);
    } else if (type === 'badge') {
      handleBadgeImageUpload(fakeEvent);
    }
  };

  // Canvas mouse handlers
  const handleCanvasMouseDown = (e) => {
    if (!profileImage && !frameImage && !badgeImage) return;
    
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
    } else if (activeLayer === 'badge' && badgeImage) {
      setBadgeTransform(prev => ({
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
    setProfileTransform({ x: 0, y: 0, scale: 0.75, rotation: 0 });
  };

  const resetFrameTransform = () => {
    setFrameTransform({ x: 0, y: 0, scale: 1.0 });
  };

  const resetBadgeTransform = () => {
    setBadgeTransform(prev => ({ ...prev, x: 0, y: 0, scale: 0.15 }));
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
    
    // Layer 1: Draw profile image
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
      
      ctx.drawImage(profileImage, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
      ctx.restore();
    }
    
    // Layer 2: Draw frame image
    if (frameImage) {
      ctx.save();
      ctx.translate(centerX + frameTransform.x, centerY + frameTransform.y);
      ctx.scale(frameTransform.scale, frameTransform.scale);
      
      const frameSize = CANVAS_SIZE;
      ctx.drawImage(frameImage, -frameSize / 2, -frameSize / 2, frameSize, frameSize);
      ctx.restore();
    }
    
    // Layer 3: Draw badge image
    if (badgeImage) {
      ctx.save();
      const basePos = getBadgePosition();
      ctx.translate(
        centerX + basePos.x + badgeTransform.x,
        centerY + basePos.y + badgeTransform.y
      );
      ctx.scale(badgeTransform.scale, badgeTransform.scale);
      
      const badgeSize = CANVAS_SIZE;
      ctx.drawImage(badgeImage, -badgeSize / 2, -badgeSize / 2, badgeSize, badgeSize);
      ctx.restore();
    }
    
    // Draw active layer indicator
    const indicators = {
      'profile': { color: '#3b82f6', label: 'プロフィール' },
      'frame': { color: '#10b981', label: 'フレーム' },
      'badge': { color: '#f59e0b', label: 'バッジ' }
    };
    
    const indicator = indicators[activeLayer];
    if (indicator) {
      ctx.strokeStyle = indicator.color;
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 5]);
      ctx.strokeRect(5, 5, CANVAS_SIZE - 10, CANVAS_SIZE - 10);
      ctx.setLineDash([]);
      
      // Draw label
      ctx.fillStyle = indicator.color;
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(`編集中: ${indicator.label}`, 15, 30);
    }
    
  }, [profileImage, frameImage, badgeImage, profileTransform, frameTransform, badgeTransform, showGrid, showSafeArea, activeLayer]);

  // Export function with Pica.js
  const handleExport = async () => {
    if (!profileImage) {
      alert('プロフィール画像をアップロードしてください');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = CANVAS_SIZE;
      tempCanvas.height = CANVAS_SIZE;
      const tempCtx = tempCanvas.getContext('2d');
      
      const centerX = CANVAS_SIZE / 2;
      const centerY = CANVAS_SIZE / 2;
      
      // Layer 1: Profile image
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
      
      tempCtx.drawImage(profileImage, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
      tempCtx.restore();
      
      // Layer 2: Frame image
      if (frameImage) {
        tempCtx.save();
        tempCtx.translate(centerX + frameTransform.x, centerY + frameTransform.y);
        tempCtx.scale(frameTransform.scale, frameTransform.scale);
        
        const frameSize = CANVAS_SIZE;
        tempCtx.drawImage(frameImage, -frameSize / 2, -frameSize / 2, frameSize, frameSize);
        tempCtx.restore();
      }
      
      // Layer 3: Badge image
      if (badgeImage) {
        tempCtx.save();
        const basePos = getBadgePosition();
        tempCtx.translate(
          centerX + basePos.x + badgeTransform.x,
          centerY + basePos.y + badgeTransform.y
        );
        tempCtx.scale(badgeTransform.scale, badgeTransform.scale);
        
        const badgeSize = CANVAS_SIZE;
        tempCtx.drawImage(badgeImage, -badgeSize / 2, -badgeSize / 2, badgeSize, badgeSize);
        tempCtx.restore();
      }
      
      const outputCanvas = document.createElement('canvas');
      outputCanvas.width = outputSize;
      outputCanvas.height = outputSize;
      
      await picaRef.current.resize(tempCanvas, outputCanvas, {
        quality: 3,
        alpha: outputFormat === 'png'
      });
      
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
      {/* Save Frame Dialog */}
      {showFrameSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">フレームを保存</h3>
            <input
              type="text"
              value={saveFrameName}
              onChange={(e) => setSaveFrameName(e.target.value)}
              placeholder="フレームの名前を入力"
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg mb-4"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveFrame}
                className="flex-1 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800"
              >
                保存
              </button>
              <button
                onClick={() => {
                  setShowFrameSaveDialog(false);
                  setSaveFrameName('');
                }}
                className="flex-1 px-4 py-2 bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Badge Dialog */}
      {showBadgeSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">バッジを保存</h3>
            <input
              type="text"
              value={saveBadgeName}
              onChange={(e) => setSaveBadgeName(e.target.value)}
              placeholder="バッジの名前を入力"
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg mb-4"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveBadge}
                className="flex-1 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800"
              >
                保存
              </button>
              <button
                onClick={() => {
                  setShowBadgeSaveDialog(false);
                  setSaveBadgeName('');
                }}
                className="flex-1 px-4 py-2 bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Upload & Library */}
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
                  <p className="text-sm text-zinc-600">クリックまたは画像をドロップ</p>
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

          {/* Frame Upload & Library */}
          <div className="bg-white rounded-lg border border-zinc-200 p-6">
            <h3 className="text-lg font-semibold mb-4">② フレーム</h3>
            
            {/* Upload */}
            <div
              className="border-2 border-dashed border-zinc-300 rounded-lg p-6 text-center hover:border-zinc-400 transition-colors cursor-pointer mb-4"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'frame')}
              onClick={() => document.getElementById('frame-upload').click()}
            >
              {frameImage ? (
                <div>
                  <img
                    src={frameImage.src}
                    alt="Frame preview"
                    className="w-16 h-16 object-cover rounded-lg mx-auto mb-2"
                  />
                  <p className="text-xs text-zinc-600">クリックで変更</p>
                </div>
              ) : (
                <div>
                  <div className="text-2xl mb-1">🖼️</div>
                  <p className="text-xs text-zinc-600">透過PNGをアップロード</p>
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
            
            {/* Save & Delete buttons */}
            {frameImage && (
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setShowFrameSaveDialog(true)}
                  className="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  保存
                </button>
                <button
                  onClick={() => {
                    setFrameImage(null);
                    resetFrameTransform();
                  }}
                  className="flex-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                >
                  削除
                </button>
              </div>
            )}
            
            {/* Saved frames library */}
            {savedFrames.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-zinc-700 mb-2">保存済みフレーム</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {savedFrames.map((frame) => (
                    <div
                      key={frame.id}
                      className="flex items-center gap-2 p-2 bg-zinc-50 rounded-lg hover:bg-zinc-100"
                    >
                      <img
                        src={frame.imageData}
                        alt={frame.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                      <span className="flex-1 text-sm truncate">{frame.name}</span>
                      <button
                        onClick={() => handleLoadFrame(frame)}
                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        使用
                      </button>
                      <button
                        onClick={() => handleDeleteFrame(frame.id)}
                        className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
                      >
                        削除
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Badge Upload & Library */}
          <div className="bg-white rounded-lg border border-zinc-200 p-6">
            <h3 className="text-lg font-semibold mb-4">③ バッジ</h3>
            
            {/* Upload */}
            <div
              className="border-2 border-dashed border-zinc-300 rounded-lg p-6 text-center hover:border-zinc-400 transition-colors cursor-pointer mb-4"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'badge')}
              onClick={() => document.getElementById('badge-upload').click()}
            >
              {badgeImage ? (
                <div>
                  <img
                    src={badgeImage.src}
                    alt="Badge preview"
                    className="w-16 h-16 object-cover rounded-lg mx-auto mb-2"
                  />
                  <p className="text-xs text-zinc-600">クリックで変更</p>
                </div>
              ) : (
                <div>
                  <div className="text-2xl mb-1">🏅</div>
                  <p className="text-xs text-zinc-600">透過PNGをアップロード</p>
                </div>
              )}
            </div>
            <input
              id="badge-upload"
              type="file"
              accept="image/png,image/webp"
              onChange={handleBadgeImageUpload}
              className="hidden"
            />
            
            {/* Save & Delete buttons */}
            {badgeImage && (
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setShowBadgeSaveDialog(true)}
                  className="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  保存
                </button>
                <button
                  onClick={() => {
                    setBadgeImage(null);
                    resetBadgeTransform();
                  }}
                  className="flex-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                >
                  削除
                </button>
              </div>
            )}
            
            {/* Saved badges library */}
            {savedBadges.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-zinc-700 mb-2">保存済みバッジ</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {savedBadges.map((badge) => (
                    <div
                      key={badge.id}
                      className="flex items-center gap-2 p-2 bg-zinc-50 rounded-lg hover:bg-zinc-100"
                    >
                      <img
                        src={badge.imageData}
                        alt={badge.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                      <span className="flex-1 text-sm truncate">{badge.name}</span>
                      <button
                        onClick={() => handleLoadBadge(badge)}
                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        使用
                      </button>
                      <button
                        onClick={() => handleDeleteBadge(badge.id)}
                        className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
                      >
                        削除
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center & Right Panels - Preview & Controls */}
        <div className="lg:col-span-2 space-y-4">
          {/* Canvas Preview */}
          <div className="bg-white rounded-lg border border-zinc-200 p-6">
            <h3 className="text-lg font-semibold mb-4">④ プレビュー</h3>
            
            {/* Layer Selection */}
            <div className="mb-4 flex gap-2 flex-wrap">
              <button
                onClick={() => setActiveLayer('profile')}
                disabled={!profileImage}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeLayer === 'profile'
                    ? 'bg-blue-500 text-white'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                プロフィール
              </button>
              <button
                onClick={() => setActiveLayer('frame')}
                disabled={!frameImage}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeLayer === 'frame'
                    ? 'bg-green-500 text-white'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                フレーム
              </button>
              <button
                onClick={() => setActiveLayer('badge')}
                disabled={!badgeImage}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeLayer === 'badge'
                    ? 'bg-amber-500 text-white'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                バッジ
              </button>
            </div>
            
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
                <li>マウスホイール：プロフィール画像をズーム</li>
                <li>スライダー：位置・回転・スケール調整</li>
              </ul>
            </div>
          </div>

          {/* Control Panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Profile Controls */}
            {profileImage && (
              <div className="bg-white rounded-lg border border-zinc-200 p-6">
                <h4 className="text-md font-semibold mb-4 text-blue-600">プロフィール画像の調整</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                      X位置: {profileTransform.x.toFixed(0)}px
                    </label>
                    <input
                      type="range"
                      min="-250"
                      max="250"
                      value={profileTransform.x}
                      onChange={(e) =>
                        setProfileTransform(prev => ({
                          ...prev,
                          x: parseFloat(e.target.value)
                        }))
                      }
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                      Y位置: {profileTransform.y.toFixed(0)}px
                    </label>
                    <input
                      type="range"
                      min="-250"
                      max="250"
                      value={profileTransform.y}
                      onChange={(e) =>
                        setProfileTransform(prev => ({
                          ...prev,
                          y: parseFloat(e.target.value)
                        }))
                      }
                      className="w-full"
                    />
                  </div>
                  
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
                  
                  <button
                    onClick={resetProfileTransform}
                    className="w-full px-3 py-2 text-sm bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
                  >
                    リセット
                  </button>
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
                      X位置: {frameTransform.x.toFixed(0)}px
                    </label>
                    <input
                      type="range"
                      min="-250"
                      max="250"
                      value={frameTransform.x}
                      onChange={(e) =>
                        setFrameTransform(prev => ({
                          ...prev,
                          x: parseFloat(e.target.value)
                        }))
                      }
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                      Y位置: {frameTransform.y.toFixed(0)}px
                    </label>
                    <input
                      type="range"
                      min="-250"
                      max="250"
                      value={frameTransform.y}
                      onChange={(e) =>
                        setFrameTransform(prev => ({
                          ...prev,
                          y: parseFloat(e.target.value)
                        }))
                      }
                      className="w-full"
                    />
                  </div>
                  
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
                  
                  <button
                    onClick={resetFrameTransform}
                    className="w-full px-3 py-2 text-sm bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
                  >
                    リセット
                  </button>
                </div>
              </div>
            )}

            {/* Badge Controls */}
            {badgeImage && (
              <div className="bg-white rounded-lg border border-zinc-200 p-6 md:col-span-2">
                <h4 className="text-md font-semibold mb-4 text-amber-600">バッジの調整</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-2">
                        配置位置
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: 'top-left', label: '左上' },
                          { value: 'top-right', label: '右上' },
                          { value: 'bottom-left', label: '左下' },
                          { value: 'bottom-right', label: '右下' }
                        ].map((pos) => (
                          <button
                            key={pos.value}
                            onClick={() =>
                              setBadgeTransform(prev => ({
                                ...prev,
                                position: pos.value,
                                x: 0,
                                y: 0
                              }))
                            }
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              badgeTransform.position === pos.value
                                ? 'bg-amber-500 text-white'
                                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                            }`}
                          >
                            {pos.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-2">
                        スケール: {(badgeTransform.scale * 100).toFixed(0)}%
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="50"
                        value={badgeTransform.scale * 100}
                        onChange={(e) =>
                          setBadgeTransform(prev => ({
                            ...prev,
                            scale: parseFloat(e.target.value) / 100
                          }))
                        }
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-2">
                        X微調整: {badgeTransform.x.toFixed(0)}px
                      </label>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        value={badgeTransform.x}
                        onChange={(e) =>
                          setBadgeTransform(prev => ({
                            ...prev,
                            x: parseFloat(e.target.value)
                          }))
                        }
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-2">
                        Y微調整: {badgeTransform.y.toFixed(0)}px
                      </label>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        value={badgeTransform.y}
                        onChange={(e) =>
                          setBadgeTransform(prev => ({
                            ...prev,
                            y: parseFloat(e.target.value)
                          }))
                        }
                        className="w-full"
                      />
                    </div>
                    
                    <button
                      onClick={resetBadgeTransform}
                      className="w-full px-3 py-2 text-sm bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
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
            <h3 className="text-lg font-semibold mb-4">⑤ 出力設定</h3>
            
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

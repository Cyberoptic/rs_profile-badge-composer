import React, { useState, useRef, useEffect } from 'react';
import Pica from 'pica';

// API設定
const API_CONFIG = {
  baseURL: 'https://sb78e62as9.execute-api.us-east-1.amazonaws.com/prod',
  apiKey: 'iFA09iK4ke8Z1Bgrfhla8pJWYujguex9JwEuaVp3'
};

// API通信ヘルパー関数
const apiRequest = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_CONFIG.apiKey,
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
};

const UnifiedProfileComposer = () => {
  const pica = new Pica();
  const canvasRef = useRef(null);
  const profileCanvasRef = useRef(null);
  const frameCanvasRef = useRef(null);
  const badgeCanvasRef = useRef(null);

  // プロフィール画像の状態
  const [profileImage, setProfileImage] = useState(null);
  const [profileX, setProfileX] = useState(0);
  const [profileY, setProfileY] = useState(0);
  const [profileScale, setProfileScale] = useState(0.75);
  const [profileRotation, setProfileRotation] = useState(0);

  // フレームの状態
  const [frameImage, setFrameImage] = useState(null);
  const [frameX, setFrameX] = useState(0);
  const [frameY, setFrameY] = useState(0);
  const [frameScale, setFrameScale] = useState(1.0);

  // バッジの状態
  const [badgeImage, setBadgeImage] = useState(null);
  const [badgePosition, setBadgePosition] = useState('bottom-right');
  const [badgeX, setBadgeX] = useState(30);
  const [badgeY, setBadgeY] = useState(30);

  // UI状態
  const [outputSize, setOutputSize] = useState(413);
  const [showGuides, setShowGuides] = useState(true);
  const [isDragging, setIsDragging] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [apiStatus, setApiStatus] = useState('checking'); // checking, online, offline
  const [customAssets, setCustomAssets] = useState({ frames: [], badges: [] });

  // API接続チェック
  useEffect(() => {
    checkApiConnection();
    loadCustomAssets();
  }, []);

  const checkApiConnection = async () => {
    try {
      await apiRequest('/frames');
      setApiStatus('online');
      console.log('API connected successfully');
    } catch (error) {
      setApiStatus('offline');
      console.warn('API offline, using localStorage fallback');
    }
  };

  const loadCustomAssets = async () => {
    try {
      if (apiStatus === 'online') {
        const [framesData, badgesData] = await Promise.all([
          apiRequest('/frames'),
          apiRequest('/badges')
        ]);
        setCustomAssets({
          frames: framesData.assets || [],
          badges: badgesData.assets || []
        });
      } else {
        // localStorageフォールバック
        const localFrames = JSON.parse(localStorage.getItem('customFrames') || '[]');
        const localBadges = JSON.parse(localStorage.getItem('customBadges') || '[]');
        setCustomAssets({ frames: localFrames, badges: localBadges });
      }
    } catch (error) {
      console.error('Failed to load custom assets:', error);
      // localStorageフォールバック
      const localFrames = JSON.parse(localStorage.getItem('customFrames') || '[]');
      const localBadges = JSON.parse(localStorage.getItem('customBadges') || '[]');
      setCustomAssets({ frames: localFrames, badges: localBadges });
    }
  };

  // カスタムアセットのアップロード
  const uploadCustomAsset = async (type, name, imageData) => {
    try {
      if (apiStatus === 'online') {
        const endpoint = type === 'frame' ? '/frames' : '/badges';
        const result = await apiRequest(endpoint, {
          method: 'POST',
          body: JSON.stringify({ name, imageData })
        });
        await loadCustomAssets();
        return result;
      } else {
        // localStorageフォールバック
        const storageKey = type === 'frame' ? 'customFrames' : 'customBadges';
        const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const newAsset = {
          assetId: `${type}-${Date.now()}`,
          name,
          url: imageData,
          createdAt: new Date().toISOString()
        };
        existing.push(newAsset);
        localStorage.setItem(storageKey, JSON.stringify(existing));
        await loadCustomAssets();
        return newAsset;
      }
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  };

  // カスタムフレームのアップロード
  const handleCustomFrameUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const name = prompt('フレームに名前をつけてください:', file.name.replace(/\.[^/.]+$/, ''));
        if (!name) return;

        await uploadCustomAsset('frame', name, event.target.result);
        alert('フレームをアップロードしました!');
      } catch (error) {
        alert('アップロードに失敗しました: ' + error.message);
      }
    };
    reader.readAsDataURL(file);
  };

  // カスタムバッジのアップロード
  const handleCustomBadgeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const name = prompt('バッジに名前をつけてください:', file.name.replace(/\.[^/.]+$/, ''));
        if (!name) return;

        await uploadCustomAsset('badge', name, event.target.result);
        alert('バッジをアップロードしました!');
      } catch (error) {
        alert('アップロードに失敗しました: ' + error.message);
      }
    };
    reader.readAsDataURL(file);
  };

  // プロフィール画像の読み込み
  const handleProfileImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setProfileImage(img);
        setProfileX(0);
        setProfileY(0);
        setProfileScale(0.75);
        setProfileRotation(0);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // フレーム画像の読み込み
  const loadFrameImage = (url) => {
    const img = new Image();
    img.onload = () => {
      setFrameImage(img);
      setFrameX(0);
      setFrameY(0);
      setFrameScale(1.0);
    };
    img.crossOrigin = 'anonymous';
    img.src = url;
  };

  // バッジ画像の読み込み
  const loadBadgeImage = (url) => {
    const img = new Image();
    img.onload = () => {
      setBadgeImage(img);
      updateBadgePosition(badgePosition);
    };
    img.crossOrigin = 'anonymous';
    img.src = url;
  };

  // バッジ位置の更新
  const updateBadgePosition = (position) => {
    setBadgePosition(position);
    const defaultOffset = 30;
    
    switch (position) {
      case 'top-left':
        setBadgeX(-outputSize / 2 + defaultOffset);
        setBadgeY(-outputSize / 2 + defaultOffset);
        break;
      case 'top-right':
        setBadgeX(outputSize / 2 - defaultOffset);
        setBadgeY(-outputSize / 2 + defaultOffset);
        break;
      case 'bottom-left':
        setBadgeX(-outputSize / 2 + defaultOffset);
        setBadgeY(outputSize / 2 - defaultOffset);
        break;
      case 'bottom-right':
        setBadgeX(outputSize / 2 - defaultOffset);
        setBadgeY(outputSize / 2 - defaultOffset);
        break;
    }
  };

  // キャンバス描画
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 背景
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // セーフエリア
    const safeArea = outputSize * 0.9;
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);

    if (showGuides) {
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.strokeRect(-safeArea / 2, -safeArea / 2, safeArea, safeArea);
    }

    // プロフィール画像
    if (profileImage) {
      ctx.save();
      ctx.translate(profileX, profileY);
      ctx.rotate((profileRotation * Math.PI) / 180);
      ctx.scale(profileScale, profileScale);
      ctx.drawImage(
        profileImage,
        -profileImage.width / 2,
        -profileImage.height / 2
      );
      ctx.restore();
    }

    // フレーム
    if (frameImage) {
      ctx.save();
      ctx.translate(frameX, frameY);
      ctx.scale(frameScale, frameScale);
      ctx.drawImage(
        frameImage,
        -frameImage.width / 2,
        -frameImage.height / 2
      );
      ctx.restore();
    }

    // バッジ
    if (badgeImage) {
      ctx.save();
      ctx.translate(badgeX, badgeY);
      ctx.drawImage(
        badgeImage,
        -badgeImage.width / 2,
        -badgeImage.height / 2
      );
      ctx.restore();
    }

    ctx.restore();

    if (showGuides) {
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);
    }
  }, [profileImage, profileX, profileY, profileScale, profileRotation, frameImage, frameX, frameY, frameScale, badgeImage, badgeX, badgeY, outputSize, showGuides]);

  // マウスイベント
  const handleMouseDown = (e, layer) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - canvas.width / 2;
    const y = e.clientY - rect.top - canvas.height / 2;

    setIsDragging(layer);
    setDragStart({ x, y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - canvas.width / 2;
    const y = e.clientY - rect.top - canvas.height / 2;

    const dx = x - dragStart.x;
    const dy = y - dragStart.y;

    if (isDragging === 'profile') {
      setProfileX(profileX + dx);
      setProfileY(profileY + dy);
    } else if (isDragging === 'frame') {
      setFrameX(frameX + dx);
      setFrameY(frameY + dy);
    } else if (isDragging === 'badge') {
      setBadgeX(badgeX + dx);
      setBadgeY(badgeY + dy);
    }

    setDragStart({ x, y });
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    setProfileScale(Math.max(0.1, Math.min(5, profileScale + delta)));
  };

  // 保存
  const handleSave = async () => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = outputSize;
    tempCanvas.height = outputSize;
    const tempCtx = tempCanvas.getContext('2d');

    // 描画ロジックをコピー
    tempCtx.fillStyle = '#f0f0f0';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    tempCtx.save();
    tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);

    const scale = outputSize / 500;

    if (profileImage) {
      tempCtx.save();
      tempCtx.translate(profileX * scale, profileY * scale);
      tempCtx.rotate((profileRotation * Math.PI) / 180);
      tempCtx.scale(profileScale * scale, profileScale * scale);
      tempCtx.drawImage(
        profileImage,
        -profileImage.width / 2,
        -profileImage.height / 2
      );
      tempCtx.restore();
    }

    if (frameImage) {
      tempCtx.save();
      tempCtx.translate(frameX * scale, frameY * scale);
      tempCtx.scale(frameScale * scale, frameScale * scale);
      tempCtx.drawImage(
        frameImage,
        -frameImage.width / 2,
        -frameImage.height / 2
      );
      tempCtx.restore();
    }

    if (badgeImage) {
      tempCtx.save();
      tempCtx.translate(badgeX * scale, badgeY * scale);
      tempCtx.drawImage(
        badgeImage,
        -badgeImage.width / 2,
        -badgeImage.height / 2
      );
      tempCtx.restore();
    }

    tempCtx.restore();

    // Picaでリサイズ
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = outputSize;
    finalCanvas.height = outputSize;

    await pica.resize(tempCanvas, finalCanvas, {
      quality: 3,
      alpha: true
    });

    finalCanvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `profile_${outputSize}x${outputSize}.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Profile Composer v4.0 (AWS Backend)</h1>
      
      {/* API接続状態 */}
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: apiStatus === 'online' ? '#d4edda' : '#fff3cd', borderRadius: '5px' }}>
        <strong>API状態:</strong> {apiStatus === 'online' ? '🟢 オンライン (AWS S3)' : '🟡 オフライン (localStorage)'}
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        {/* プレビューキャンバス */}
        <div>
          <canvas
            ref={canvasRef}
            width={500}
            height={500}
            style={{ border: '2px solid #333', cursor: isDragging ? 'grabbing' : 'grab' }}
            onMouseDown={(e) => handleMouseDown(e, 'profile')}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          />
        </div>

        {/* コントロールパネル */}
        <div style={{ width: '400px' }}>
          {/* プロフィール画像 */}
          <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h3>1. プロフィール画像</h3>
            <input type="file" accept="image/*" onChange={handleProfileImageUpload} />
            
            {profileImage && (
              <>
                <div style={{ marginTop: '10px' }}>
                  <label>X位置: {profileX.toFixed(0)}px</label>
                  <input
                    type="range"
                    min="-250"
                    max="250"
                    value={profileX}
                    onChange={(e) => setProfileX(Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label>Y位置: {profileY.toFixed(0)}px</label>
                  <input
                    type="range"
                    min="-250"
                    max="250"
                    value={profileY}
                    onChange={(e) => setProfileY(Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label>ズーム: {(profileScale * 100).toFixed(0)}%</label>
                  <input
                    type="range"
                    min="0.1"
                    max="3"
                    step="0.01"
                    value={profileScale}
                    onChange={(e) => setProfileScale(Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label>回転: {profileRotation}°</label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={profileRotation}
                    onChange={(e) => setProfileRotation(Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
              </>
            )}
          </div>

          {/* フレーム */}
          <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h3>2. フレーム</h3>
            <input type="file" accept="image/*" onChange={handleCustomFrameUpload} />
            
            <div style={{ marginTop: '10px', maxHeight: '150px', overflowY: 'auto' }}>
              {customAssets.frames.map((frame) => (
                <button
                  key={frame.assetId}
                  onClick={() => loadFrameImage(frame.url)}
                  style={{ display: 'block', width: '100%', marginBottom: '5px', padding: '8px', textAlign: 'left' }}
                >
                  {frame.name}
                </button>
              ))}
            </div>

            {frameImage && (
              <>
                <div style={{ marginTop: '10px' }}>
                  <label>X位置: {frameX.toFixed(0)}px</label>
                  <input
                    type="range"
                    min="-250"
                    max="250"
                    value={frameX}
                    onChange={(e) => setFrameX(Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label>Y位置: {frameY.toFixed(0)}px</label>
                  <input
                    type="range"
                    min="-250"
                    max="250"
                    value={frameY}
                    onChange={(e) => setFrameY(Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label>スケール: {(frameScale * 100).toFixed(0)}%</label>
                  <input
                    type="range"
                    min="0.1"
                    max="2"
                    step="0.01"
                    value={frameScale}
                    onChange={(e) => setFrameScale(Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
              </>
            )}
          </div>

          {/* バッジ */}
          <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h3>3. バッジ</h3>
            <input type="file" accept="image/*" onChange={handleCustomBadgeUpload} />
            
            <div style={{ marginTop: '10px', maxHeight: '150px', overflowY: 'auto' }}>
              {customAssets.badges.map((badge) => (
                <button
                  key={badge.assetId}
                  onClick={() => loadBadgeImage(badge.url)}
                  style={{ display: 'block', width: '100%', marginBottom: '5px', padding: '8px', textAlign: 'left' }}
                >
                  {badge.name}
                </button>
              ))}
            </div>

            {badgeImage && (
              <>
                <div style={{ marginTop: '10px' }}>
                  <label>配置位置:</label>
                  <select
                    value={badgePosition}
                    onChange={(e) => updateBadgePosition(e.target.value)}
                    style={{ width: '100%', padding: '5px' }}
                  >
                    <option value="top-left">左上</option>
                    <option value="top-right">右上</option>
                    <option value="bottom-left">左下</option>
                    <option value="bottom-right">右下</option>
                  </select>
                </div>
                <div>
                  <label>X微調整: {badgeX.toFixed(0)}px</label>
                  <input
                    type="range"
                    min="-250"
                    max="250"
                    value={badgeX}
                    onChange={(e) => setBadgeX(Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label>Y微調整: {badgeY.toFixed(0)}px</label>
                  <input
                    type="range"
                    min="-250"
                    max="250"
                    value={badgeY}
                    onChange={(e) => setBadgeY(Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
              </>
            )}
          </div>

          {/* 出力設定 */}
          <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h3>出力設定</h3>
            <label>
              <input
                type="radio"
                value="120"
                checked={outputSize === 120}
                onChange={() => setOutputSize(120)}
              />
              120x120px
            </label>
            <label style={{ marginLeft: '20px' }}>
              <input
                type="radio"
                value="413"
                checked={outputSize === 413}
                onChange={() => setOutputSize(413)}
              />
              413x413px
            </label>
            <div style={{ marginTop: '10px' }}>
              <label>
                <input
                  type="checkbox"
                  checked={showGuides}
                  onChange={(e) => setShowGuides(e.target.checked)}
                />
                ガイド表示
              </label>
            </div>
          </div>

          {/* 保存ボタン */}
          <button
            onClick={handleSave}
            style={{
              width: '100%',
              padding: '15px',
              fontSize: '16px',
              fontWeight: 'bold',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            画像を保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnifiedProfileComposer;

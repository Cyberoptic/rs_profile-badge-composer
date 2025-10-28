import React, { useEffect, useRef, useState } from "react";
import Pica from "pica";

const pica = Pica();

export default function ProfileComposer({
  frameSrc,
  initialImage,
  defaultScale = 0.75,
  onComposed,
  className = ""
}) {
  // 内部座標は 1024x1024 固定
  const BASE = 1024;

  // 出力サイズ (120 | 413)
  const [outSize, setOutSize] = useState(120);

  // 位置・拡大・回転
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [scale, setScale] = useState(defaultScale);
  const [rotate, setRotate] = useState(0);

  // UI補助
  const [showGuides, setShowGuides] = useState(true);
  const [bgMode, setBgMode] = useState("transparent");

  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const frameRef = useRef(null);
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const posStart = useRef({ x: 0, y: 0 });

  // 画像ロード
  useEffect(() => {
    if (!initialImage) return;
    const im = new Image();
    im.crossOrigin = "anonymous";
    im.onload = () => {
      imgRef.current = im;
      draw();
    };
    im.src = initialImage;
  }, [initialImage]);

  useEffect(() => {
    const fr = new Image();
    fr.crossOrigin = "anonymous";
    fr.onload = () => {
      frameRef.current = fr;
      draw();
    };
    fr.src = frameSrc;
  }, [frameSrc]);

  // 再描画
  useEffect(() => {
    draw();
  }, [x, y, scale, rotate, showGuides, bgMode]);

  const clampPan = (nx, ny) => {
    // セーフエリア拘束：回転後AABBを大雑把に計算し、枠から欠けない範囲に制限
    if (!imgRef.current) return { x: nx, y: ny };
    const half = BASE / 2;
    const safeR = half;
    const r = (Math.min(imgRef.current.width, imgRef.current.height) / Math.max(imgRef.current.width, imgRef.current.height)) * half * scale + 50;
    const limit = Math.max(0, safeR - r);
    const cx = Math.max(-limit, Math.min(limit, nx));
    const cy = Math.max(-limit, Math.min(limit, ny));
    return { x: cx, y: cy };
  };

  const onWheel = (e) => {
    e.preventDefault();
    const delta = -e.deltaY;
    const next = Math.max(0.6, Math.min(1.2, scale + (delta > 0 ? 0.02 : -0.02)));
    setScale(next);
  };

  const onPointerDown = (e) => {
    dragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    posStart.current = { x, y };
    e.target.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!dragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    const { x: nx, y: ny } = clampPan(posStart.current.x + dx, posStart.current.y + dy);
    setX(nx);
    setY(ny);
  };

  const onPointerUp = () => {
    dragging.current = false;
  };

  const draw = () => {
    const cvs = canvasRef.current;
    const img = imgRef.current;
    const frame = frameRef.current;
    if (!cvs || !img || !frame) return;

    cvs.width = BASE;
    cvs.height = BASE;
    const ctx = cvs.getContext("2d");

    // 背景
    if (bgMode === "white") {
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, BASE, BASE);
    } else {
      ctx.clearRect(0, 0, BASE, BASE);
    }

    // 画像を中心基準で配置
    ctx.save();
    ctx.translate(BASE / 2 + x, BASE / 2 + y);
    ctx.rotate((Math.PI / 180) * rotate);
    // cover相当で描く：短辺基準を広げる
    const drawW = img.width * (BASE / Math.min(img.width, img.height)) * scale;
    const drawH = img.height * (BASE / Math.min(img.width, img.height)) * scale;
    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    // ガイド
    if (showGuides) {
      ctx.save();
      ctx.strokeStyle = "rgba(0,0,0,.25)";
      ctx.lineWidth = 1;
      // 中央
      ctx.beginPath();
      ctx.moveTo(BASE / 2, 0);
      ctx.lineTo(BASE / 2, BASE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, BASE / 2);
      ctx.lineTo(BASE, BASE / 2);
      ctx.stroke();
      // 三分割
      const t = BASE / 3;
      ctx.setLineDash([6, 6]);
      [t, 2 * t].forEach((px) => {
        ctx.beginPath();
        ctx.moveTo(px, 0);
        ctx.lineTo(px, BASE);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, px);
        ctx.lineTo(BASE, px);
        ctx.stroke();
      });
      ctx.restore();
    }

    // フレーム
    ctx.drawImage(frame, 0, 0, BASE, BASE);
  };

  const handleDownload = async () => {
    const cvs = canvasRef.current;
    if (!cvs) return;

    // 最終合成用の新しいcanvasを作成（1024x1024）
    const finalCanvas = document.createElement("canvas");
    finalCanvas.width = BASE;
    finalCanvas.height = BASE;
    const finalCtx = finalCanvas.getContext("2d");

    // 現在のプレビューと同じ内容を描画（ガイドなし）
    const img = imgRef.current;
    const frame = frameRef.current;
    
    if (bgMode === "white") {
      finalCtx.fillStyle = "#fff";
      finalCtx.fillRect(0, 0, BASE, BASE);
    }

    finalCtx.save();
    finalCtx.translate(BASE / 2 + x, BASE / 2 + y);
    finalCtx.rotate((Math.PI / 180) * rotate);
    const drawW = img.width * (BASE / Math.min(img.width, img.height)) * scale;
    const drawH = img.height * (BASE / Math.min(img.width, img.height)) * scale;
    finalCtx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    finalCtx.restore();

    // フレーム合成
    finalCtx.drawImage(frame, 0, 0, BASE, BASE);

    // 出力サイズに高品質縮小（pica使用 - Lanczos3相当）
    const outputCanvas = document.createElement("canvas");
    outputCanvas.width = outSize;
    outputCanvas.height = outSize;

    try {
      // picaで高品質リサイズ
      await pica.resize(finalCanvas, outputCanvas, {
        quality: 3, // Lanczos3
        alpha: bgMode === "transparent",
        unsharpAmount: 80,
        unsharpRadius: 0.6,
        unsharpThreshold: 2
      });

      // Blobに変換してダウンロード
      outputCanvas.toBlob((blob) => {
        const filename = `profile_${outSize}.png`;
        
        if (onComposed) {
          onComposed(blob, filename);
        }

        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
        URL.revokeObjectURL(a.href);
      }, "image/png");

    } catch (error) {
      console.error("縮小処理に失敗しました:", error);
      alert("画像の出力に失敗しました。もう一度お試しください。");
    }
  };

  const reset = () => {
    setX(0);
    setY(0);
    setScale(defaultScale);
    setRotate(0);
  };

  return (
    <div className={className}>
      {/* プレビュー */}
      <div
        className="preview-container border rounded p-3 flex justify-center items-center bg-gray-50"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{ touchAction: "none", minHeight: "400px" }}
      >
        <div
          className="preview-canvas-wrapper"
          style={{
            width: `${outSize}px`,
            height: `${outSize}px`,
            transform: outSize === 413 ? "scale(0.8)" : "scale(1)",
            transformOrigin: "center center"
          }}
        >
          <canvas
            ref={canvasRef}
            width={BASE}
            height={BASE}
            style={{
              width: "100%",
              height: "100%",
              imageRendering: "high-quality"
            }}
          />
        </div>
      </div>

      {/* コントロール */}
      <div className="controls mt-4 grid gap-4 md:grid-cols-2">
        <div className="panel border rounded p-4 bg-white">
          <h3 className="font-bold mb-3 text-brand-navy">出力設定</h3>
          <div className="field mb-3">
            <label className="block text-sm font-medium mb-2">出力サイズ</label>
            <div className="flex gap-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="out"
                  checked={outSize === 120}
                  onChange={() => setOutSize(120)}
                  className="mr-2"
                />
                120px（Peer-Ring）
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="out"
                  checked={outSize === 413}
                  onChange={() => setOutSize(413)}
                  className="mr-2"
                />
                413px（SNS）
              </label>
            </div>
          </div>
          <div className="field mb-3">
            <label className="block text-sm font-medium mb-2">背景</label>
            <select
              value={bgMode}
              onChange={(e) => setBgMode(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="transparent">透過</option>
              <option value="white">白</option>
            </select>
          </div>
          <div className="field">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showGuides}
                onChange={(e) => setShowGuides(e.target.checked)}
                className="mr-2"
              />
              ガイド表示
            </label>
          </div>
        </div>

        <div className="panel border rounded p-4 bg-white">
          <h3 className="font-bold mb-3 text-brand-navy">位置・回転調整</h3>
          <div className="field mb-3">
            <label className="block text-sm font-medium mb-1">
              ズーム: {scale.toFixed(2)}
            </label>
            <input
              type="range"
              min={0.6}
              max={1.2}
              step={0.01}
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="field mb-3">
            <label className="block text-sm font-medium mb-1">
              回転: {rotate.toFixed(1)}°
            </label>
            <input
              type="range"
              min={-5}
              max={5}
              step={0.1}
              value={rotate}
              onChange={(e) => setRotate(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="field mb-3 grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium mb-1">X位置</label>
              <input
                type="number"
                value={x}
                onChange={(e) => setX(parseInt(e.target.value || "0", 10))}
                className="w-full border rounded px-2 py-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Y位置</label>
              <input
                type="number"
                value={y}
                onChange={(e) => setY(parseInt(e.target.value || "0", 10))}
                className="w-full border rounded px-2 py-1"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={reset}
              className="flex-1 px-3 py-2 border rounded hover:bg-gray-100 transition"
            >
              リセット
            </button>
            <button
              type="button"
              onClick={() => {
                setX(0);
                setY(0);
              }}
              className="flex-1 px-3 py-2 border rounded hover:bg-gray-100 transition"
            >
              中央揃え
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <button
          className="w-full md:w-auto px-6 py-3 bg-brand-navy text-white rounded-lg hover:opacity-90 transition font-medium"
          onClick={handleDownload}
        >
          この設定で出力
        </button>
      </div>
    </div>
  );
}

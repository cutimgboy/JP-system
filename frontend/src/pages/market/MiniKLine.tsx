interface MiniKLineProps {
  isPositive: boolean;
}

export function MiniKLine({ isPositive }: MiniKLineProps) {
  // 生成更平滑的折线图点
  const points = Array.from({ length: 12 }, (_, i) => {
    const x = (i / 11) * 100;
    const baseY = 50;
    // 使用正弦波创建更自然的波动
    const wave = Math.sin(i * 0.8) * 15;
    const trend = isPositive ? -i * 2.5 : i * 2.5;
    const noise = (Math.random() - 0.5) * 8;
    const y = Math.max(15, Math.min(85, baseY + wave + trend + noise));
    return { x, y };
  });

  // 生成平滑的贝塞尔曲线路径
  let pathData = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpX = (prev.x + curr.x) / 2;
    pathData += ` Q ${cpX} ${prev.y}, ${curr.x} ${curr.y}`;
  }

  const gradientId = `gradient-${isPositive ? 'up' : 'down'}-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full h-6 flex items-center justify-center px-4">
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        {/* 折线 */}
        <path
          d={pathData}
          fill="none"
          stroke={isPositive ? '#10b981' : '#ef4444'}
          strokeWidth="2.27"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

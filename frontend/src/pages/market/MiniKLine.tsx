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

  // 创建渐变填充区域
  const fillPathData = `${pathData} L ${points[points.length - 1].x} 100 L ${points[0].x} 100 Z`;

  const gradientId = `gradient-${isPositive ? 'up' : 'down'}-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-20 h-10 flex items-center justify-center">
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop
              offset="0%"
              stopColor={isPositive ? '#f87171' : '#5eead4'}
              stopOpacity="0.3"
            />
            <stop
              offset="100%"
              stopColor={isPositive ? '#f87171' : '#5eead4'}
              stopOpacity="0"
            />
          </linearGradient>
        </defs>

        {/* 填充区域 */}
        <path
          d={fillPathData}
          fill={`url(#${gradientId})`}
        />

        {/* 折线 */}
        <path
          d={pathData}
          fill="none"
          stroke={isPositive ? '#f87171' : '#5eead4'}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

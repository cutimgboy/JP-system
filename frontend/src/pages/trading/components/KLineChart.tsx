import { useEffect, useRef, useState } from 'react';

export interface KLineData {
  time: number; // 时间戳（秒）
  price: number; // 价格
  volume?: number; // 成交量（可选）
}

interface KLineChartProps {
  data: KLineData[]; // K线数据数组
  width?: number; // 画布宽度
  height?: number; // 画布高度
  currentPrice?: number; // 当前价格
  countdownTime?: number; // 倒计时时间（秒）
  entryPrice?: number; // 买入价
  entryTime?: number; // 买入时间（秒）
}

export function KLineChart({
  data,
  width = 420,
  height = 300,
  currentPrice,
  countdownTime,
  entryPrice,
  entryTime,
}: KLineChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [animationFrame, setAnimationFrame] = useState(0);
  const [canvasSize, setCanvasSize] = useState({ width: width, height: height });
  const [currentRealTime, setCurrentRealTime] = useState(() => Date.now() / 1000); // 当前实际时间（秒）
  
  // 记录倒计时开始的时间和初始倒计时值，用于固定倒计时线位置
  const countdownStartRef = useRef<{ startTime: number; initialCountdown: number } | null>(null);

  // 响应式调整画布尺寸
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        if (rect.width > 0 && rect.height > 0) {
          setCanvasSize({
            width: rect.width * dpr,
            height: rect.height * dpr,
          });
        }
      }
    };

    // 延迟一下确保 DOM 已渲染
    const timer = setTimeout(updateSize, 0);
    window.addEventListener('resize', updateSize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  // 动画循环 - 更新实际时间用于逐步绘制
  useEffect(() => {
    let animationId: number;
    const animate = () => {
      setAnimationFrame(prev => prev + 1);
      setCurrentRealTime(Date.now() / 1000); // 更新实际时间
      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const actualWidth = canvasSize.width;
    const actualHeight = canvasSize.height;

    // 设置画布尺寸（考虑设备像素比）
    canvas.width = actualWidth;
    canvas.height = actualHeight;
    
    // 缩放上下文以匹配设备像素比
    ctx.scale(dpr, dpr);
    
    // 计算逻辑尺寸
    const logicalWidth = actualWidth / dpr;
    const logicalHeight = actualHeight / dpr;

    // 清空画布
    ctx.clearRect(0, 0, logicalWidth, logicalHeight);

    // 限制显示的时间窗口（只显示最近的数据，避免堆叠）
    const maxDisplayDuration = 20 * 60; // 最多显示20分钟的数据
    const displayData = data.length > maxDisplayDuration 
      ? data.slice(-maxDisplayDuration) 
      : data;

    if (displayData.length === 0) return;

    // 计算价格范围
    const prices = displayData.map(d => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;
    const padding = priceRange * 0.1; // 10% 的边距
    const priceMin = minPrice - padding;
    const priceMax = maxPrice + padding;
    const priceRangeWithPadding = priceMax - priceMin;

    // 计算时间范围 - 让当前点在屏幕中央
    const lastData = displayData[displayData.length - 1];
    const currentTime = lastData.time;
    const firstData = displayData[0];
    const dataStartTime = firstData.time;
    const dataDuration = currentTime - dataStartTime;
    
    // 处理倒计时：记录开始时间和初始倒计时值，用于固定倒计时线位置
    if (countdownTime !== undefined && countdownTime > 0) {
      // 如果倒计时开始（之前没有记录），记录开始时间和初始值
      // 或者如果倒计时值突然增加（说明是新的倒计时），也更新记录
      if (!countdownStartRef.current) {
        // 第一次设置倒计时，记录开始时间和初始值
        countdownStartRef.current = {
          startTime: currentTime,
          initialCountdown: countdownTime,
        };
      } else if (countdownTime > countdownStartRef.current.initialCountdown) {
        // 倒计时值增加，说明是新的倒计时，更新记录
        countdownStartRef.current = {
          startTime: currentTime,
          initialCountdown: countdownTime,
        };
      }
      // 如果倒计时在进行中（递减），保持记录不变
    } else {
      // countdownTime 为 0 或 undefined
      // 只有当倒计时真正结束时（目标时间已过）才清除记录
      if (countdownStartRef.current) {
        const targetTime = countdownStartRef.current.startTime + countdownStartRef.current.initialCountdown;
        if (currentTime >= targetTime) {
          // 倒计时已结束，清除记录
          countdownStartRef.current = null;
        }
        // 否则保持记录，继续显示倒计时线
      }
    }
    
    // 计算固定的倒计时目标时间
    const countdownTargetTime = countdownStartRef.current
      ? countdownStartRef.current.startTime + countdownStartRef.current.initialCountdown
      : null;
    
    // 计算显示的时间窗口：当前时间在中央，向前和向后各显示一定时间
    // 向前显示的时间（历史数据）- 显示30秒
    const forwardDuration = Math.min(dataDuration, 30); // 向前显示已有数据或30秒，取较小值

    // 向后显示的时间：如果有倒计时目标时间，确保能显示到目标时间；否则显示30秒
    let backwardDuration = 30; // 默认30秒
    if (countdownTargetTime !== null) {
      // 计算从当前时间到目标时间需要显示多少时间
      const timeToTarget = countdownTargetTime - currentTime;
      // 向后显示的时间应该至少能显示到目标时间，再加上一些余量
      backwardDuration = Math.max(timeToTarget + 10, 30); // 至少显示到目标时间+10秒，或30秒
    }
    
    const minTime = currentTime - forwardDuration;
    const maxTime = currentTime + backwardDuration;
    const timeRange = maxTime - minTime;

    // 绘制区域
    const chartPadding = {
      top: 20,
      right: 50,
      bottom: 40,
      left: 20,
    };
    const chartWidth = logicalWidth - chartPadding.left - chartPadding.right;
    const chartHeight = logicalHeight - chartPadding.top - chartPadding.bottom;

    // 辅助函数：将价格转换为 Y 坐标
    const priceToY = (price: number) => {
      const normalizedPrice = (price - priceMin) / priceRangeWithPadding;
      return chartPadding.top + chartHeight - normalizedPrice * chartHeight;
    };

    // 辅助函数：将时间转换为 X 坐标（当前时间在中央）
    const timeToX = (time: number) => {
      if (timeRange === 0) return chartPadding.left + chartWidth / 2;
      const normalizedTime = (time - minTime) / timeRange;
      return chartPadding.left + normalizedTime * chartWidth;
    };

    // 绘制网格线
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    // 垂直网格线（每四分钟一格）
    const fourMinutes = 4 * 60; // 4分钟 = 240秒
    const gridStartTimeForGrid = Math.floor(minTime / fourMinutes) * fourMinutes;
    for (let time = gridStartTimeForGrid; time <= maxTime; time += fourMinutes) {
      const x = timeToX(time);
      if (x >= chartPadding.left && x <= logicalWidth - chartPadding.right) {
        ctx.beginPath();
        ctx.moveTo(x, chartPadding.top);
        ctx.lineTo(x, logicalHeight - chartPadding.bottom);
        ctx.stroke();
      }
    }

    // 水平网格线（价格线）
    const priceGridCount = 4;
    for (let i = 0; i <= priceGridCount; i++) {
      const price = priceMin + (priceRangeWithPadding * i) / priceGridCount;
      const y = priceToY(price);
      ctx.beginPath();
      ctx.moveTo(chartPadding.left, y);
      ctx.lineTo(logicalWidth - chartPadding.right, y);
      ctx.stroke();
    }

    ctx.setLineDash([]);

    // 过滤出在时间范围内的数据点
    const visibleData = displayData.filter(d => d.time >= minTime && d.time <= maxTime);
    
    // 绘制渐变填充区域
    if (visibleData.length > 1) {
      const gradient = ctx.createLinearGradient(
        chartPadding.left,
        chartPadding.top,
        chartPadding.left,
        logicalHeight - chartPadding.bottom
      );
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      const firstX = timeToX(visibleData[0].time);
      const firstY = priceToY(visibleData[0].price);
      ctx.moveTo(firstX, firstY);
      for (let i = 1; i < visibleData.length; i++) {
        ctx.lineTo(timeToX(visibleData[i].time), priceToY(visibleData[i].price));
      }
      const lastX = timeToX(visibleData[visibleData.length - 1].time);
      ctx.lineTo(lastX, logicalHeight - chartPadding.bottom);
      ctx.lineTo(firstX, logicalHeight - chartPadding.bottom);
      ctx.closePath();
      ctx.fill();
    }

    // 绘制 K 线（使用平滑曲线，逐步绘制）
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1; // 更细的线条
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (visibleData.length > 0) {
      ctx.beginPath();
      
      if (visibleData.length === 1) {
        // 只有一个点时，只画一个点
        const point = visibleData[0];
        ctx.arc(timeToX(point.time), priceToY(point.price), 1, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      } else {
        // 计算最后一个数据点的绘制进度
        const lastIndex = visibleData.length - 1;
        const lastPoint = visibleData[lastIndex];
        const secondLastPoint = visibleData[lastIndex - 1];
        
        // 计算从倒数第二个点到最后一个点的绘制进度
        // 如果最后一个点的时间是20秒，当前实际时间是20.5秒，那么应该绘制到50%的位置
        const segmentDuration = lastPoint.time - secondLastPoint.time;
        const timeSinceLastPoint = currentRealTime - lastPoint.time;
        
        // 计算绘制进度：0 表示还没开始绘制，1 表示完全绘制完成
        // 如果当前时间已经超过最后一个点的时间，则完全绘制
        let drawProgress = 1;
        if (timeSinceLastPoint < 0) {
          // 当前时间还没到最后一个点的时间，计算进度
          const timeSinceSecondLast = currentRealTime - secondLastPoint.time;
          if (timeSinceSecondLast >= 0 && segmentDuration > 0) {
            drawProgress = Math.min(1, Math.max(0, timeSinceSecondLast / segmentDuration));
          } else {
            drawProgress = 0;
          }
        }
        
        // 开始绘制
        ctx.moveTo(timeToX(visibleData[0].time), priceToY(visibleData[0].price));
        
        // 绘制完整的线段（除了最后一段）
        for (let i = 0; i < visibleData.length - 1; i++) {
          const current = visibleData[i];
          const next = visibleData[i + 1];
          
          // 如果是最后一段，需要根据进度部分绘制
          if (i === lastIndex - 1) {
            // 最后一段，根据进度绘制
            const prev = i > 0 ? visibleData[i - 1] : current;
            const afterNext = i < visibleData.length - 2 ? visibleData[i + 2] : next;
            
            const currentX = timeToX(current.time);
            const currentY = priceToY(current.price);
            const nextX = timeToX(next.time);
            const nextY = priceToY(next.price);
            
            // 计算平滑的控制点
            const tension = 0.3;
            const cp1x = currentX + (nextX - timeToX(prev.time)) * tension;
            const cp1y = currentY + (nextY - priceToY(prev.price)) * tension;
            const cp2x = nextX - (timeToX(afterNext.time) - currentX) * tension;
            const cp2y = nextY - (priceToY(afterNext.price) - currentY) * tension;
            
            if (drawProgress > 0) {
              // 使用三次贝塞尔曲线，但只绘制到进度位置
              // 计算目标点位置
              const t = drawProgress;
              // 三次贝塞尔曲线公式：B(t) = (1-t)³P₀ + 3(1-t)²tP₁ + 3(1-t)t²P₂ + t³P₃
              const targetX = Math.pow(1 - t, 3) * currentX + 
                              3 * Math.pow(1 - t, 2) * t * cp1x + 
                              3 * (1 - t) * Math.pow(t, 2) * cp2x + 
                              Math.pow(t, 3) * nextX;
              const targetY = Math.pow(1 - t, 3) * currentY + 
                              3 * Math.pow(1 - t, 2) * t * cp1y + 
                              3 * (1 - t) * Math.pow(t, 2) * cp2y + 
                              Math.pow(t, 3) * nextY;
              
              // 调整控制点以匹配进度
              const adjustedCp1x = currentX + (cp1x - currentX) * t;
              const adjustedCp1y = currentY + (cp1y - currentY) * t;
              const adjustedCp2x = cp1x + (cp2x - cp1x) * t;
              const adjustedCp2y = cp1y + (cp2y - cp1y) * t;
              
              ctx.bezierCurveTo(adjustedCp1x, adjustedCp1y, adjustedCp2x, adjustedCp2y, targetX, targetY);
            }
          } else {
            // 其他线段，完整绘制
            const prev = i > 0 ? visibleData[i - 1] : current;
            const afterNext = i < visibleData.length - 2 ? visibleData[i + 2] : next;
            
            const currentX = timeToX(current.time);
            const currentY = priceToY(current.price);
            const nextX = timeToX(next.time);
            const nextY = priceToY(next.price);
            
            const tension = 0.3;
            const cp1x = currentX + (nextX - timeToX(prev.time)) * tension;
            const cp1y = currentY + (nextY - priceToY(prev.price)) * tension;
            const cp2x = nextX - (timeToX(afterNext.time) - currentX) * tension;
            const cp2y = nextY - (priceToY(afterNext.price) - currentY) * tension;
            
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, nextX, nextY);
          }
        }
        
        ctx.stroke();
      }
    }

    // 绘制当前价格指示器（当前时间点在屏幕中央）
    if (currentPrice !== undefined && visibleData.length > 0) {
      const currentX = timeToX(currentTime); // 使用 currentTime，确保在中央
      const currentY = priceToY(currentPrice);

      // 绘制水平虚线到右侧
      ctx.strokeStyle = 'rgba(249, 115, 22, 0.6)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(currentX, currentY);
      ctx.lineTo(logicalWidth - chartPadding.right, currentY);
      ctx.stroke();
      ctx.setLineDash([]);

      // 绘制价格标签
      ctx.fillStyle = 'rgba(251, 146, 60, 0.25)';
      const labelWidth = 96;
      const labelHeight = 24;
      const labelX = logicalWidth - chartPadding.right - labelWidth / 2;
      const labelY = currentY - labelHeight / 2;
      ctx.beginPath();
      // 使用兼容的方式绘制圆角矩形
      const radius = 12;
      ctx.moveTo(labelX + radius, labelY);
      ctx.lineTo(labelX + labelWidth - radius, labelY);
      ctx.quadraticCurveTo(labelX + labelWidth, labelY, labelX + labelWidth, labelY + radius);
      ctx.lineTo(labelX + labelWidth, labelY + labelHeight - radius);
      ctx.quadraticCurveTo(labelX + labelWidth, labelY + labelHeight, labelX + labelWidth - radius, labelY + labelHeight);
      ctx.lineTo(labelX + radius, labelY + labelHeight);
      ctx.quadraticCurveTo(labelX, labelY + labelHeight, labelX, labelY + labelHeight - radius);
      ctx.lineTo(labelX, labelY + radius);
      ctx.quadraticCurveTo(labelX, labelY, labelX + radius, labelY);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '9.5px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        logicalWidth - chartPadding.right,
        currentY
      );

      // 绘制呼吸动画的橙色点
      const animateTime = animationFrame / 60; // 假设 60fps
      const pulse = Math.sin(animateTime * Math.PI) * 0.3 + 0.7;
      
      // 外层光晕
      ctx.fillStyle = `rgba(249, 115, 22, ${0.3 * pulse})`;
      ctx.beginPath();
      ctx.arc(currentX, currentY, 8 * pulse, 0, Math.PI * 2);
      ctx.fill();

      // 中层光晕
      ctx.fillStyle = `rgba(249, 115, 22, ${0.5 * pulse})`;
      ctx.beginPath();
      ctx.arc(currentX, currentY, 5 * pulse, 0, Math.PI * 2);
      ctx.fill();

      // 核心点
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(currentX, currentY, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // 绘制买入价标记
    if (entryPrice !== undefined && entryTime !== undefined && displayData.length > 0) {
      const entryX = timeToX(entryTime);
      const entryY = priceToY(entryPrice);

      // 检查买入价标记是否在可见范围内
      const isEntryVisible = entryX >= chartPadding.left && entryX <= logicalWidth - chartPadding.right;

      if (isEntryVisible) {
        // 绘制垂直虚线
        ctx.strokeStyle = '#3b82f6'; // 蓝色
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(entryX, chartPadding.top);
        ctx.lineTo(entryX, logicalHeight - chartPadding.bottom);
        ctx.stroke();
        ctx.setLineDash([]);

        // 绘制水平虚线
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)'; // 蓝色半透明
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(chartPadding.left, entryY);
        ctx.lineTo(logicalWidth - chartPadding.right, entryY);
        ctx.stroke();
        ctx.setLineDash([]);

        // 绘制买入价标签
        ctx.fillStyle = 'rgba(59, 130, 246, 0.25)';
        const entryLabelWidth = 96;
        const entryLabelHeight = 24;
        const entryLabelX = logicalWidth - chartPadding.right - entryLabelWidth / 2;
        const entryLabelY = entryY - entryLabelHeight / 2;
        ctx.beginPath();
        const radius = 12;
        ctx.moveTo(entryLabelX + radius, entryLabelY);
        ctx.lineTo(entryLabelX + entryLabelWidth - radius, entryLabelY);
        ctx.quadraticCurveTo(entryLabelX + entryLabelWidth, entryLabelY, entryLabelX + entryLabelWidth, entryLabelY + radius);
        ctx.lineTo(entryLabelX + entryLabelWidth, entryLabelY + entryLabelHeight - radius);
        ctx.quadraticCurveTo(entryLabelX + entryLabelWidth, entryLabelY + entryLabelHeight, entryLabelX + entryLabelWidth - radius, entryLabelY + entryLabelHeight);
        ctx.lineTo(entryLabelX + radius, entryLabelY + entryLabelHeight);
        ctx.quadraticCurveTo(entryLabelX, entryLabelY + entryLabelHeight, entryLabelX, entryLabelY + entryLabelHeight - radius);
        ctx.lineTo(entryLabelX, entryLabelY + radius);
        ctx.quadraticCurveTo(entryLabelX, entryLabelY, entryLabelX + radius, entryLabelY);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = '9.5px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          entryPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          logicalWidth - chartPadding.right,
          entryY
        );

        // 绘制买入点标记
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(entryX, entryY, 5, 0, Math.PI * 2);
        ctx.fill();

        // 绘制白色边框
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(entryX, entryY, 5, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // 绘制倒计时标记（固定在目标时间位置）
    if (countdownTargetTime !== null && displayData.length > 0) {
      // 使用固定的目标时间，而不是当前时间 + 剩余倒计时
      const countdownX = timeToX(countdownTargetTime);
      
      // 计算当前剩余倒计时（用于显示）
      const remainingCountdown = Math.max(0, Math.ceil(countdownTargetTime - currentTime));

      // 检查倒计时线是否在可见范围内（放宽条件，允许稍微超出边界）
      const isVisible = countdownX >= chartPadding.left - 10 && countdownX <= logicalWidth - chartPadding.right + 10;
      
      if (isVisible) {
        // 绘制垂直虚线
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(countdownX, chartPadding.top);
        ctx.lineTo(countdownX, logicalHeight - chartPadding.bottom);
        ctx.stroke();
        ctx.setLineDash([]);

        // 绘制旗帜图标（简化版）
        const flagY = chartPadding.top + 10;
        ctx.strokeStyle = '#999';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(countdownX, flagY);
        ctx.lineTo(countdownX, flagY + 22);
        ctx.stroke();

        // 绘制方格旗
        ctx.fillStyle = 'white';
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.rect(countdownX + 1, flagY, 12, 8);
        ctx.fill();
        ctx.stroke();

        // 绘制黑色方格
        ctx.fillStyle = '#2d2d2d';
        ctx.fillRect(countdownX + 1, flagY, 3, 4);
        ctx.fillRect(countdownX + 7, flagY, 3, 4);
        ctx.fillRect(countdownX + 4, flagY + 4, 3, 4);
        ctx.fillRect(countdownX + 10, flagY + 4, 3, 4);

        // 绘制倒计时圆圈
        const circleY = logicalHeight - chartPadding.bottom - 20;
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(countdownX, circleY, 9, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'white';
        ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${remainingCountdown}s`, countdownX, circleY);
      }
    }

    // 绘制 Y 轴价格标签
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'end';
    ctx.textBaseline = 'middle';
    for (let i = 0; i <= priceGridCount; i++) {
      const price = priceMin + (priceRangeWithPadding * i) / priceGridCount;
      const y = priceToY(price);
      ctx.fillText(Math.round(price).toString(), logicalWidth - chartPadding.right + 5, y);
    }

    // 绘制 X 轴时间标签（每四分钟一格）
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    // 计算网格起始时间（从 minTime 开始，每4分钟一格）
    const gridStartTimeForLabels = Math.floor(minTime / fourMinutes) * fourMinutes;
    for (let time = gridStartTimeForLabels; time <= maxTime; time += fourMinutes) {
      const x = timeToX(time);
      if (x >= chartPadding.left && x <= logicalWidth - chartPadding.right) {
        const date = new Date(time * 1000);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        ctx.fillText(`${hours}:${minutes}`, x, logicalHeight - chartPadding.bottom + 5);
      }
    }
    
    // 绘制当前时间点的标记（在屏幕中央）
    const currentX = timeToX(currentTime);
    if (currentX >= chartPadding.left && currentX <= logicalWidth - chartPadding.right) {
      // 绘制垂直参考线（更明显）
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(currentX, chartPadding.top);
      ctx.lineTo(currentX, logicalHeight - chartPadding.bottom);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // 绘制当前时间标签
      const currentDate = new Date(currentTime * 1000);
      const currentHours = currentDate.getHours().toString().padStart(2, '0');
      const currentMinutes = currentDate.getMinutes().toString().padStart(2, '0');
      const currentSeconds = currentDate.getSeconds().toString().padStart(2, '0');
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(`${currentHours}:${currentMinutes}:${currentSeconds}`, currentX, logicalHeight - chartPadding.bottom + 5);
    }
  }, [data, canvasSize, currentPrice, countdownTime, animationFrame, currentRealTime]);

  return (
    <div ref={containerRef} className="w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ 
          width: '100%', 
          height: '100%',
          display: 'block'
        }}
      />
    </div>
  );
}

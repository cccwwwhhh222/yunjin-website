// 云锦页面脚本
window.addEventListener('DOMContentLoaded', function() {
    // 云锦制作工艺步骤动画
    const stepItems = document.querySelectorAll('.step-item');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });

    stepItems.forEach((item, index) => {
        item.style.opacity = 0;
        item.style.transform = 'translateY(30px)';
        item.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(item);
    });

    // 云锦图案悬停效果
    const patternItems = document.querySelectorAll('.pattern-item');
    patternItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // 云锦特性卡片动画
    const featureItems = document.querySelectorAll('.feature-item');
    featureItems.forEach((item, index) => {
        item.style.opacity = 0;
        item.style.transform = 'translateX(-30px)';
        item.style.transition = `opacity 0.6s ease ${index * 0.15}s, transform 0.6s ease ${index * 0.15}s`;
        
        observer.observe(item);
    });

    // 滚动到顶部按钮
    const scrollToTopBtn = document.createElement('button');
    scrollToTopBtn.textContent = '↑';
    scrollToTopBtn.style.position = 'fixed';
    scrollToTopBtn.style.bottom = '30px';
    scrollToTopBtn.style.right = '30px';
    scrollToTopBtn.style.width = '50px';
    scrollToTopBtn.style.height = '50px';
    scrollToTopBtn.style.borderRadius = '50%';
    scrollToTopBtn.style.backgroundColor = 'var(--brocade-red)';
    scrollToTopBtn.style.color = 'var(--text-light)';
    scrollToTopBtn.style.border = 'none';
    scrollToTopBtn.style.fontSize = '24px';
    scrollToTopBtn.style.cursor = 'pointer';
    scrollToTopBtn.style.boxShadow = '0 4px 15px rgba(157, 41, 51, 0.3)';
    scrollToTopBtn.style.opacity = '0';
    scrollToTopBtn.style.visibility = 'hidden';
    scrollToTopBtn.style.transition = 'opacity 0.3s ease, visibility 0.3s ease';
    document.body.appendChild(scrollToTopBtn);

    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            scrollToTopBtn.style.opacity = '1';
            scrollToTopBtn.style.visibility = 'visible';
        } else {
            scrollToTopBtn.style.opacity = '0';
            scrollToTopBtn.style.visibility = 'hidden';
        }
    });

    scrollToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // 画布绘图功能
    const canvas = document.getElementById('draw-canvas');
    if (canvas) {
        initDrawingCanvas();
    }

    function initDrawingCanvas() {
        const canvas = document.getElementById('draw-canvas');
        const ctx = canvas.getContext('2d');
        
        // 画布设置
        ctx.fillStyle = '#F5F1E9';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 默认画笔设置
        let isDrawing = false;
        let lastX = 0;
        let lastY = 0;
        let currentColor = '#9D2933';
        let currentSize = 20;
        
        // 颜色选择
        const colorOptions = document.querySelectorAll('.color-option');
        colorOptions.forEach(option => {
            option.addEventListener('click', function() {
                // 移除所有active类
                colorOptions.forEach(opt => opt.classList.remove('active'));
                // 添加active类到当前选中的颜色
                this.classList.add('active');
                // 更新当前颜色
                currentColor = this.dataset.color;
            });
        });
        
        // 默认选中第一个颜色
        colorOptions[0].classList.add('active');
        
        // 画笔粗细调节
        const sizeSlider = document.getElementById('size-slider');
        const sizeValue = document.getElementById('size-value');
        
        sizeSlider.addEventListener('input', function() {
            currentSize = parseInt(this.value);
            sizeValue.textContent = `${currentSize}px`;
        });
        
        // 鼠标事件
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);
        
        function startDrawing(e) {
            isDrawing = true;
            [lastX, lastY] = getMousePos(canvas, e);
        }
        
        function draw(e) {
            if (!isDrawing) return;
            const [x, y] = getMousePos(canvas, e);
            
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(x, y);
            ctx.strokeStyle = currentColor;
            ctx.lineWidth = currentSize;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();
            
            [lastX, lastY] = [x, y];
        }
        
        function stopDrawing() {
            isDrawing = false;
        }
        
        function getMousePos(canvas, e) {
            const rect = canvas.getBoundingClientRect();
            return [e.clientX - rect.left, e.clientY - rect.top];
        }
        
        // 清空画布
        const clearBtn = document.getElementById('clear-btn');
        clearBtn.addEventListener('click', function() {
            ctx.fillStyle = '#F5F1E9';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // 隐藏结果区域，恢复到初始涂鸦界面
            resultArea.style.display = 'none';
        });
        
        // 生成云锦
        const generateBtn = document.getElementById('generate-btn');
        const resultArea = document.getElementById('result-area');
        const resultDisplay = document.getElementById('result-display');
        
        // 云锦图片素材列表
        const brocadeImages = Array.from({length: 51}, (_, i) => `assets/images/brocadePicture/x (${i+1}).jpg`);
        
        // 上一次生成的图片编号
        let lastGeneratedImageNumber = null;
        
        // 云锦特色颜色数据库 - 包含传统云锦的典型颜色
        const brocadeColorDatabase = {
            reds: [
                { name: '朱红', rgb: [220, 53, 69], weight: 1.2 },
                { name: '绛红', rgb: [157, 41, 51], weight: 1.3 },
                { name: '珊瑚红', rgb: [255, 127, 80], weight: 1.1 },
                { name: '胭脂红', rgb: [157, 41, 51], weight: 1.2 }
            ],
            blues: [
                { name: '靛蓝', rgb: [30, 68, 96], weight: 1.3 },
                { name: '宝蓝', rgb: [0, 102, 204], weight: 1.2 },
                { name: '天青', rgb: [100, 149, 237], weight: 1.1 },
                { name: '藏蓝', rgb: [0, 51, 102], weight: 1.2 }
            ],
            golds: [
                { name: '金黄', rgb: [212, 175, 55], weight: 1.4 },
                { name: '赤金', rgb: [255, 215, 0], weight: 1.3 },
                { name: '古铜金', rgb: [184, 134, 11], weight: 1.2 }
            ],
            greens: [
                { name: '翠绿', rgb: [46, 90, 76], weight: 1.2 },
                { name: '松花绿', rgb: [0, 128, 128], weight: 1.1 },
                { name: '豆绿', rgb: [150, 180, 90], weight: 1.0 }
            ],
            purples: [
                { name: '紫檀', rgb: [74, 46, 46], weight: 1.2 },
                { name: '葡萄紫', rgb: [111, 45, 93], weight: 1.1 },
                { name: '藕荷', rgb: [227, 169, 169], weight: 1.0 }
            ]
        };
        
        // 颜色精度参数（用户可调节）
        let colorPrecision = 0.8; // 默认精度 0.8 (0-1范围)
        
        // 颜色提取函数（优化版）
        function extractColors(canvas) {
            const ctx = canvas.getContext('2d');
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            const colorCount = {};
            const pixelStep = 2; // 每2个像素采样一次，提高准确性
            
            for (let i = 0; i < data.length; i += 4 * pixelStep) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const alpha = data[i + 3];
                
                // 忽略透明像素和背景色
                if (alpha > 128 && !(r === 245 && g === 241 && b === 233)) {
                    // 更精细的颜色量化，根据精度参数调整
                    const quantizeStep = Math.max(8, Math.round(32 * (1 - colorPrecision)));
                    const quantizedR = Math.round(r / quantizeStep) * quantizeStep;
                    const quantizedG = Math.round(g / quantizeStep) * quantizeStep;
                    const quantizedB = Math.round(b / quantizeStep) * quantizeStep;
                    const color = `${quantizedR},${quantizedG},${quantizedB}`;
                    colorCount[color] = (colorCount[color] || 0) + 1;
                }
            }
            
            // 按出现次数排序，取前5种主颜色（增加辅助色）
            const sortedColors = Object.entries(colorCount)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([color, count]) => {
                    const rgb = color.split(',').map(Number);
                    return { rgb, count, weight: count };
                });
            
            return sortedColors;
        }
        
        // 颜色相似度计算（优化版 - 使用CIEDE2000算法简化版）
        function colorDistance(color1, color2) {
            const r1 = color1[0], g1 = color1[1], b1 = color1[2];
            const r2 = color2[0], g2 = color2[1], b2 = color2[2];
            
            // RGB转Lab色彩空间的简化计算
            function rgbToLab(r, g, b) {
                // RGB转XYZ
                let rn = r / 255;
                let gn = g / 255;
                let bn = b / 255;
                
                rn = rn > 0.04045 ? Math.pow((rn + 0.055) / 1.055, 2.4) : rn / 12.92;
                gn = gn > 0.04045 ? Math.pow((gn + 0.055) / 1.055, 2.4) : gn / 12.92;
                bn = bn > 0.04045 ? Math.pow((bn + 0.055) / 1.055, 2.4) : bn / 12.92;
                
                const x = (rn * 0.4124 + gn * 0.3576 + bn * 0.1805) / 0.95047;
                const y = (rn * 0.2126 + gn * 0.7152 + bn * 0.0722) / 1.00000;
                const z = (rn * 0.0193 + gn * 0.1192 + bn * 0.9505) / 1.08883;
                
                // XYZ转Lab
                const fx = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
                const fy = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
                const fz = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;
                
                return {
                    L: (116 * fy) - 16,
                    a: 500 * (fx - fy),
                    b: 200 * (fy - fz)
                };
            }
            
            const lab1 = rgbToLab(r1, g1, b1);
            const lab2 = rgbToLab(r2, g2, b2);
            
            // CIE76色差公式
            const deltaL = lab1.L - lab2.L;
            const deltaA = lab1.a - lab2.a;
            const deltaB = lab1.b - lab2.b;
            
            return Math.sqrt(deltaL * deltaL + deltaA * deltaA + deltaB * deltaB);
        }
        
        // 匹配云锦特色颜色
        function matchBrocadeColor(rgb) {
            let bestMatch = null;
            let minDistance = Infinity;
            
            // 遍历所有云锦特色颜色
            Object.values(brocadeColorDatabase).forEach(colorGroup => {
                colorGroup.forEach(brocadeColor => {
                    const distance = colorDistance(rgb, brocadeColor.rgb);
                    const weightedDistance = distance / brocadeColor.weight;
                    
                    if (weightedDistance < minDistance) {
                        minDistance = weightedDistance;
                        bestMatch = {
                            ...brocadeColor,
                            distance: distance,
                            weightedDistance: weightedDistance
                        };
                    }
                });
            });
            
            return bestMatch;
        }
        
        // 颜色匹配校验机制
        function validateColorMatch(userColors, matchedImageColor) {
            if (!userColors || userColors.length === 0) return { valid: false, score: 0 };
            
            let totalScore = 0;
            let validCount = 0;
            
            userColors.forEach(userColor => {
                const distance = colorDistance(userColor.rgb, matchedImageColor);
                // 距离越小，得分越高（最大100分）
                const score = Math.max(0, 100 - distance);
                totalScore += score;
                validCount++;
            });
            
            const avgScore = validCount > 0 ? totalScore / validCount : 0;
            
            return {
                valid: avgScore >= 50, // 50分以上为有效匹配
                score: avgScore,
                details: `平均匹配得分: ${avgScore.toFixed(1)}分`
            };
        }
        
        // 预加载图片并计算颜色特征（优化版）
        const imageColorMap = new Map();
        const imageColorHistogramMap = new Map(); // 存储颜色直方图
        let imagesLoaded = 0;
        
        function preloadImages() {
            brocadeImages.forEach((imageUrl, index) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = function() {
                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = 300;
                    tempCanvas.height = 300;
                    const tempCtx = tempCanvas.getContext('2d');
                    tempCtx.imageSmoothingEnabled = true;
                    tempCtx.imageSmoothingQuality = 'high';
                    tempCtx.drawImage(img, 0, 0, 300, 300);
                    
                    const imageData = tempCtx.getImageData(0, 0, 300, 300);
                    const data = imageData.data;
                    
                    // 计算平均颜色
                    let r = 0, g = 0, b = 0, count = 0;
                    
                    // 计算颜色直方图
                    const colorHistogram = {};
                    
                    for (let i = 0; i < data.length; i += 4) {
                        const pr = data[i];
                        const pg = data[i + 1];
                        const pb = data[i + 2];
                        
                        r += pr;
                        g += pg;
                        b += pb;
                        count++;
                        
                        // 构建颜色直方图（量化到32级）
                        const qr = Math.floor(pr / 8);
                        const qg = Math.floor(pg / 8);
                        const qb = Math.floor(pb / 8);
                        const colorKey = `${qr},${qg},${qb}`;
                        colorHistogram[colorKey] = (colorHistogram[colorKey] || 0) + 1;
                    }
                    
                    const avgColor = [r / count, g / count, b / count];
                    imageColorMap.set(imageUrl, avgColor);
                    imageColorHistogramMap.set(imageUrl, colorHistogram);
                    
                    imagesLoaded++;
                    if (imagesLoaded === brocadeImages.length) {
                        console.log('所有云锦图片预加载完成，颜色特征已计算');
                    }
                };
                img.src = imageUrl;
            });
        }
        
        // 预加载图片
        preloadImages();
        
        // 生成云锦按钮点击事件
        generateBtn.addEventListener('click', function() {
            resultArea.style.display = 'block';
            resultDisplay.innerHTML = '<p>正在分析图案颜色...</p><div style="width: 100%; height: 4px; background: rgba(255,255,255,0.2); margin: 20px 0; border-radius: 2px;"><div id="loading-bar" style="width: 0%; height: 100%; background: var(--brocade-red); border-radius: 2px; transition: width 0.3s ease;"></div></div>';
            
            // 分析颜色面积占比
            const colorAreaData = analyzeColorAreas(canvas);
            
            if (colorAreaData.totalPaintedPixels === 0) {
                resultDisplay.innerHTML = '<p>请先在画布上绘制图案</p>';
                return;
            }
            
            // 显示颜色面积信息
            console.log('颜色面积分析结果:', colorAreaData);
            
            // 模拟加载进度
            let progress = 0;
            const loadingInterval = setInterval(() => {
                progress += 10;
                const loadingBar = document.getElementById('loading-bar');
                if (loadingBar) {
                    loadingBar.style.width = `${progress}%`;
                }
                if (progress >= 100) {
                    clearInterval(loadingInterval);
                }
            }, 150);
            
            // 基于颜色面积占比生成图片
            setTimeout(() => {
                const matchedImage = generateImageByColorArea(colorAreaData);
                displayResult(matchedImage, colorAreaData);
            }, 1500);
        });
        
        // 分析颜色面积占比
        function analyzeColorAreas(canvas) {
            const ctx = canvas.getContext('2d');
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            // 颜色定义及其RGB值
            const colorDefinitions = {
                red: { name: '红色', rgb: [157, 41, 51], hex: '#9D2933' },
                green: { name: '绿色', rgb: [46, 90, 76], hex: '#2E5A4C' },
                blue: { name: '蓝色', rgb: [30, 68, 96], hex: '#1E4460' },
                yellow: { name: '黄色', rgb: [212, 175, 55], hex: '#D4AF37' },
                brown: { name: '深褐色', rgb: [74, 46, 46], hex: '#4A2E2E' }
            };
            
            // 颜色面积计数
            const colorCounts = {
                red: 0,
                green: 0,
                blue: 0,
                yellow: 0,
                brown: 0
            };
            
            let totalPaintedPixels = 0;
            
            // 遍历像素数据，使用步长为4提高性能
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const alpha = data[i + 3];
                
                // 忽略透明像素和背景色
                if (alpha > 128 && !(r === 245 && g === 241 && b === 233)) {
                    totalPaintedPixels++;
                    
                    // 计算与每种颜色的距离
                    let minDistance = Infinity;
                    let closestColor = null;
                    
                    for (const [color, definition] of Object.entries(colorDefinitions)) {
                        const distance = colorDistance([r, g, b], definition.rgb);
                        if (distance < minDistance) {
                            minDistance = distance;
                            closestColor = color;
                        }
                    }
                    
                    // 只有当距离小于阈值时才计数，确保颜色匹配的准确性
                    if (minDistance < 50) {
                        colorCounts[closestColor]++;
                    }
                }
            }
            
            // 计算每种颜色的面积占比
            const colorAreas = {};
            for (const [color, count] of Object.entries(colorCounts)) {
                colorAreas[color] = totalPaintedPixels > 0 ? (count / totalPaintedPixels) * 100 : 0;
            }
            
            // 找出面积占比最高的颜色
            let maxColor = null;
            let maxArea = 0;
            for (const [color, area] of Object.entries(colorAreas)) {
                if (area > maxArea) {
                    maxArea = area;
                    maxColor = color;
                }
            }
            
            return {
                colorCounts,
                colorAreas,
                totalPaintedPixels,
                maxColor,
                maxArea,
                colorDefinitions
            };
        }
        
        // 基于颜色面积占比生成图片
        function generateImageByColorArea(colorAreaData) {
            const { maxColor, colorAreas } = colorAreaData;
            let imageNumber;
            let attempts = 0;
            const maxAttempts = 10;
            
            // 处理边界情况：如果多种颜色面积相等且最高
            if (!maxColor) {
                // 找出所有面积相等且最高的颜色
                const maxArea = Math.max(...Object.values(colorAreas));
                const topColors = Object.keys(colorAreas).filter(color => colorAreas[color] === maxArea);
                
                if (topColors.length > 0) {
                    // 从最高面积的颜色中随机选择一个
                    const randomIndex = Math.floor(Math.random() * topColors.length);
                    maxColor = topColors[randomIndex];
                } else {
                    // 默认情况，随机选择一张图片
                    do {
                        imageNumber = Math.floor(Math.random() * 50) + 1;
                        attempts++;
                    } while (imageNumber === lastGeneratedImageNumber && attempts < maxAttempts);
                    lastGeneratedImageNumber = imageNumber;
                    return `assets/images/brocadePicture/x (${imageNumber}).jpg`;
                }
            }
            
            do {
                switch (maxColor) {
                    case 'red':
                        // X1至X9
                        imageNumber = Math.floor(Math.random() * 9) + 1;
                        break;
                    case 'green':
                        // X10、X11、X12
                        imageNumber = Math.floor(Math.random() * 3) + 10;
                        break;
                    case 'blue':
                        // X24、X25、X34、X35、X36、X37、X38、X39、X41、X42、X43、X44
                        const blueImages = [24, 25, 34, 35, 36, 37, 38, 39, 41, 42, 43, 44];
                        imageNumber = blueImages[Math.floor(Math.random() * blueImages.length)];
                        break;
                    case 'yellow':
                        // X26、X33
                        const yellowImages = [26, 33];
                        imageNumber = yellowImages[Math.floor(Math.random() * yellowImages.length)];
                        break;
                    case 'brown':
                        // X45至X50
                        imageNumber = Math.floor(Math.random() * 6) + 45;
                        break;
                    default:
                        // 默认情况，随机选择一张图片
                        imageNumber = Math.floor(Math.random() * 50) + 1;
                }
                attempts++;
            } while (imageNumber === lastGeneratedImageNumber && attempts < maxAttempts);
            
            lastGeneratedImageNumber = imageNumber;
            return `assets/images/brocadePicture/x (${imageNumber}).jpg`;
        }
        
        // 展示结果（优化版 - 包含颜色面积分析信息）
        function displayResult(matchedImage, colorAreaData) {
            if (!matchedImage) {
                resultDisplay.innerHTML = '<p>未找到匹配的云锦图案</p>';
                return;
            }
            
            // 构建颜色面积分析信息
            let colorAreaInfo = '';
            if (colorAreaData) {
                colorAreaInfo = '<div style="margin-top: 15px; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 8px;">';
                colorAreaInfo += '<h5 style="color: var(--brocade-red); margin-bottom: 10px; font-size: 0.9rem;">颜色面积分析</h5>';
                
                // 显示每种颜色的面积占比
                for (const [color, area] of Object.entries(colorAreaData.colorAreas)) {
                    if (area > 0) {
                        const colorDef = colorAreaData.colorDefinitions[color];
                        const colorBox = `<div style="display: inline-block; width: 20px; height: 20px; background: ${colorDef.hex}; border-radius: 4px; margin-right: 8px; vertical-align: middle;"></div>`;
                        colorAreaInfo += `<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; color: var(--text-light); font-size: 0.85rem;">`;
                        colorAreaInfo += `${colorBox}<span>${colorDef.name}</span><span>${area.toFixed(1)}%</span>`;
                        colorAreaInfo += `</div>`;
                    }
                }
                
                // 显示面积最大的颜色
                if (colorAreaData.maxColor) {
                    const maxColorDef = colorAreaData.colorDefinitions[colorAreaData.maxColor];
                    colorAreaInfo += `<div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.2); color: var(--text-light); font-size: 0.85rem;">`;
                    colorAreaInfo += `<span>面积最大的颜色: ${maxColorDef.name} (${colorAreaData.maxArea.toFixed(1)}%)</span>`;
                    colorAreaInfo += `</div>`;
                }
                
                colorAreaInfo += '</div>';
            }
            
            // 构建单张图片展示，包含调整选项
            let html = `
                <div class="result-container" style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%;">
                    <div class="image-wrapper" style="position: relative; overflow: hidden; border-radius: 10px; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4); transition: all 0.3s ease; max-width: 100%; max-height: 500px; display: flex; align-items: center; justify-content: center;">
                        <img src="${matchedImage}" alt="云锦图案" class="generated-image" style="width: 100%; max-width: 100%; height: auto; max-height: 500px; object-fit: contain; transition: transform 0.3s ease;">
                        <div class="image-controls" style="position: absolute; top: 10px; right: 10px; display: flex; gap: 5px; opacity: 0; transition: opacity 0.3s ease;">
                            <button class="control-btn" data-action="zoom-in" style="background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 4px; width: 30px; height: 30px; cursor: pointer; display: flex; align-items: center; justify-content: center;">+</button>
                            <button class="control-btn" data-action="zoom-out" style="background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 4px; width: 30px; height: 30px; cursor: pointer; display: flex; align-items: center; justify-content: center;">-</button>
                            <button class="control-btn" data-action="reset" style="background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 4px; width: 30px; height: 30px; cursor: pointer; display: flex; align-items: center; justify-content: center;">R</button>
                        </div>
                    </div>
                    <p style="margin-top: 20px; color: var(--text-light); font-size: 1.1rem; text-align: center; font-weight: 500; letter-spacing: 0.3px;">基于颜色面积占比生成的云锦图案</p>
                    ${colorAreaInfo}
                    <div class="adjustment-options" style="margin-top: 20px; width: 100%; max-width: 500px;">
                        <h4 style="color: var(--brocade-red); margin-bottom: 10px; font-size: 1rem; font-weight: 600;">图片调整</h4>
                        <div style="display: flex; flex-direction: column; gap: 15px;">
                            <div style="display: flex; flex-direction: column; gap: 5px;">
                                <label style="color: var(--text-light); font-size: 0.9rem;">位置调整</label>
                                <div style="display: flex; gap: 10px;">
                                    <button class="position-btn" data-direction="left" style="flex: 1; padding: 8px; background: transparent; border: 1px solid var(--brocade-red); color: var(--brocade-red); border-radius: 4px; cursor: pointer; transition: all 0.3s ease;">←</button>
                                    <button class="position-btn" data-direction="center" style="flex: 1; padding: 8px; background: transparent; border: 1px solid var(--brocade-red); color: var(--brocade-red); border-radius: 4px; cursor: pointer; transition: all 0.3s ease;">居中</button>
                                    <button class="position-btn" data-direction="right" style="flex: 1; padding: 8px; background: transparent; border: 1px solid var(--brocade-red); color: var(--brocade-red); border-radius: 4px; cursor: pointer; transition: all 0.3s ease;">→</button>
                                </div>
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 5px;">
                                <label style="color: var(--text-light); font-size: 0.9rem;">尺寸调整</label>
                                <input type="range" id="image-size" min="50" max="100" value="90" style="width: 100%;">
                                <div style="display: flex; justify-content: space-between; color: var(--text-light); font-size: 0.8rem;">
                                    <span>小</span>
                                    <span>大</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            resultDisplay.innerHTML = html;
            
            // 添加悬停效果和控制功能
            const imageWrapper = resultDisplay.querySelector('.image-wrapper');
            const imageControls = resultDisplay.querySelector('.image-controls');
            const generatedImage = resultDisplay.querySelector('.generated-image');
            const sizeSlider = resultDisplay.querySelector('#image-size');
            
            // 显示/隐藏控制按钮
            if (imageWrapper && imageControls) {
                imageWrapper.addEventListener('mouseenter', function() {
                    imageControls.style.opacity = '1';
                });
                imageWrapper.addEventListener('mouseleave', function() {
                    imageControls.style.opacity = '0';
                });
            }
            
            // 控制按钮功能
            const controlButtons = resultDisplay.querySelectorAll('.control-btn');
            controlButtons.forEach(btn => {
                btn.addEventListener('click', function() {
                    const action = this.dataset.action;
                    if (generatedImage) {
                        let currentWidth = parseFloat(generatedImage.style.width) || 100;
                        
                        switch (action) {
                            case 'zoom-in':
                                currentWidth = Math.min(currentWidth + 10, 150);
                                break;
                            case 'zoom-out':
                                currentWidth = Math.max(currentWidth - 10, 50);
                                break;
                            case 'reset':
                                currentWidth = 100;
                                if (sizeSlider) sizeSlider.value = 90;
                                break;
                        }
                        
                        generatedImage.style.width = `${currentWidth}%`;
                    }
                });
            });
            
            // 位置调整按钮
            const positionButtons = resultDisplay.querySelectorAll('.position-btn');
            positionButtons.forEach(btn => {
                btn.addEventListener('click', function() {
                    const direction = this.dataset.direction;
                    if (imageWrapper) {
                        switch (direction) {
                            case 'left':
                                imageWrapper.style.alignSelf = 'flex-start';
                                break;
                            case 'center':
                                imageWrapper.style.alignSelf = 'center';
                                break;
                            case 'right':
                                imageWrapper.style.alignSelf = 'flex-end';
                                break;
                        }
                    }
                });
            });
            
            // 尺寸滑块
            if (sizeSlider && generatedImage) {
                sizeSlider.addEventListener('input', function() {
                    const value = parseInt(this.value);
                    const width = 50 + (value * 1); // 50% 到 150%
                    generatedImage.style.width = `${width}%`;
                });
            }
            
            // 悬停效果
            if (imageWrapper) {
                imageWrapper.addEventListener('mouseenter', function() {
                    this.style.transform = 'scale(1.02)';
                });
                imageWrapper.addEventListener('mouseleave', function() {
                    this.style.transform = 'scale(1)';
                });
            }
            
            // 响应式调整
            function adjustForScreenSize() {
                if (generatedImage && imageWrapper) {
                    const screenWidth = window.innerWidth;
                    const screenHeight = window.innerHeight;
                    
                    if (screenWidth < 768) {
                        // 移动设备
                        generatedImage.style.maxWidth = '100%';
                        imageWrapper.style.maxHeight = '350px';
                        generatedImage.style.maxHeight = '350px';
                    } else if (screenWidth < 1024) {
                        // 平板设备
                        generatedImage.style.maxWidth = '100%';
                        imageWrapper.style.maxHeight = '400px';
                        generatedImage.style.maxHeight = '400px';
                    } else {
                        // 桌面设备
                        generatedImage.style.maxWidth = '100%';
                        imageWrapper.style.maxHeight = '500px';
                        generatedImage.style.maxHeight = '500px';
                    }
                }
            }
            
            // 初始调整
            adjustForScreenSize();
            
            // 窗口大小变化时调整
            window.addEventListener('resize', adjustForScreenSize);
        }
    }
});
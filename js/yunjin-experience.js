// 绘画体验云锦纹样功能模块
(function() {
    // 配置常量
    const STORAGE_KEY = 'yunjin_last_generated_id';
    const IMAGE_PATH = 'assets/images/experiencePicture/';
    const MAX_RETRY = 5;
    const INACTIVITY_TIMEOUT = 3000; // 3秒无操作自动生成
    
    // 颜色定义
    const COLORS = {
        red: '#FF0000',
        blue: '#0000FF',
        brown: '#8B4513'
    };
    
    // 图片集合定义
    const IMAGE_SETS = {
        red: ['m0.jpg', 'm1.jpg', 'm2.jpg', 'm3.jpg', 'm15.jpg'],
        blue: ['m5.jpg', 'm6.jpg', 'm7.jpg', 'm8.jpg', 'm9.jpg', 'm10.jpg', 'm11.jpg', 'm12.jpg', 'm13.jpg'],
        brown: ['m16.jpg', 'm17.jpg', 'm18.jpg', 'm19.jpg', 'm20.jpg', 'm21.jpg', 'm22.jpg', 'm23.jpg', 'm24.jpg', 'm25.jpg', 'm26.jpg']
    };
    
    // 状态变量
    let canvas, ctx;
    let isDrawing = false;
    let currentColor = COLORS.red;
    let currentSize = 10;
    let undoStack = [];
    let redoStack = [];
    let inactivityTimer = null;
    let isGenerating = false;
    
    // DOM元素
    let elements = {};
    
    // 初始化
    function init() {
        // 获取DOM元素
        elements = {
            canvas: document.getElementById('experience-draw-canvas'),
            loadingIndicator: document.getElementById('experience-loading-indicator'),
            colorOptions: document.querySelectorAll('.experience-color-option'),
            sizeSlider: document.getElementById('experience-size-slider'),
            sizeValue: document.getElementById('experience-size-value'),
            undoBtn: document.getElementById('experience-undo-btn'),
            redoBtn: document.getElementById('experience-redo-btn'),
            clearBtn: document.getElementById('experience-clear-btn'),
            generateBtn: document.getElementById('experience-generate-btn'),
            resultArea: document.getElementById('experience-result-area'),
            resultImage: document.getElementById('experience-generated-image'),
            downloadBtn: document.getElementById('experience-download-btn'),
            statusMessage: document.getElementById('experience-status-message'),
            redArea: document.getElementById('red-area'),
            blueArea: document.getElementById('blue-area'),
            brownArea: document.getElementById('brown-area')
        };
        
        // 检查元素是否存在
        if (!elements.canvas) {
            console.log('绘画体验云锦纹样功能未找到，跳过初始化');
            return;
        }
        
        canvas = elements.canvas;
        ctx = canvas.getContext('2d');
        
        // 初始化画布
        initCanvas();
        
        // 绑定事件
        bindEvents();
        
        // 保存初始状态
        saveState();
        
        // 预加载图片
        preloadImages();
        
        console.log('绘画体验云锦纹样功能初始化完成');
    }
    
    // 初始化画布
    function initCanvas() {
        ctx.fillStyle = '#F5F1E9';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // 设置默认颜色选中
        elements.colorOptions.forEach(opt => {
            if (opt.dataset.color === COLORS.red) {
                opt.classList.add('active');
            }
        });
    }
    
    // 绑定事件
    function bindEvents() {
        // 鼠标事件
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);
        
        // 触摸事件（移动端支持）
        canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
        canvas.addEventListener('touchend', stopDrawing);
        
        // 颜色选择
        elements.colorOptions.forEach(opt => {
            opt.addEventListener('click', () => selectColor(opt));
        });
        
        // 画笔大小调节
        elements.sizeSlider.addEventListener('input', (e) => {
            currentSize = parseInt(e.target.value);
            elements.sizeValue.textContent = currentSize;
        });
        
        // 按钮事件
        elements.undoBtn.addEventListener('click', undo);
        elements.redoBtn.addEventListener('click', redo);
        elements.clearBtn.addEventListener('click', clearCanvas);
        elements.generateBtn.addEventListener('click', generatePattern);
        elements.downloadBtn.addEventListener('click', downloadImage);
    }
    
    // 获取鼠标/触摸位置
    function getPosition(e) {
        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;
        
        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        
        return [
            (clientX - rect.left) * (canvas.width / rect.width),
            (clientY - rect.top) * (canvas.height / rect.height)
        ];
    }
    
    // 开始绘画
    function startDrawing(e) {
        e.preventDefault();
        isDrawing = true;
        const [x, y] = getPosition(e);
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = currentSize;
        ctx.stroke();
        
        resetInactivityTimer();
    }
    
    // 绘画
    function draw(e) {
        e.preventDefault();
        if (!isDrawing) return;
        
        const [x, y] = getPosition(e);
        
        ctx.lineTo(x, y);
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = currentSize;
        ctx.stroke();
        
        resetInactivityTimer();
        updateAreaStats();
    }
    
    // 停止绘画
    function stopDrawing() {
        if (isDrawing) {
            isDrawing = false;
            saveState();
            updateAreaStats();
        }
    }
    
    // 处理触摸开始
    function handleTouchStart(e) {
        e.preventDefault();
        startDrawing(e);
    }
    
    // 处理触摸移动
    function handleTouchMove(e) {
        e.preventDefault();
        draw(e);
    }
    
    // 选择颜色
    function selectColor(opt) {
        elements.colorOptions.forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        currentColor = opt.dataset.color;
    }
    
    // 保存状态用于撤销/重做
    function saveState() {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        undoStack.push(imageData);
        redoStack = [];
        updateButtonStates();
    }
    
    // 撤销
    function undo() {
        if (undoStack.length <= 1) return;
        
        const current = undoStack.pop();
        redoStack.push(current);
        const previous = undoStack[undoStack.length - 1];
        ctx.putImageData(previous, 0, 0);
        updateButtonStates();
        updateAreaStats();
    }
    
    // 重做
    function redo() {
        if (redoStack.length === 0) return;
        
        const next = redoStack.pop();
        undoStack.push(next);
        ctx.putImageData(next, 0, 0);
        updateButtonStates();
        updateAreaStats();
    }
    
    // 更新按钮状态
    function updateButtonStates() {
        elements.undoBtn.disabled = undoStack.length <= 1;
        elements.redoBtn.disabled = redoStack.length === 0;
    }
    
    // 清空画布
    function clearCanvas() {
        ctx.fillStyle = '#F5F1E9';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        undoStack = [];
        redoStack = [];
        saveState();
        updateAreaStats();
        elements.resultArea.style.display = 'none';
        hideStatusMessage();
    }
    
    // 重置无操作计时器
    function resetInactivityTimer() {
        if (inactivityTimer) {
            clearTimeout(inactivityTimer);
        }
        inactivityTimer = setTimeout(() => {
            if (!isGenerating && !isDrawing) {
                console.log('3秒无操作，准备生成云锦纹样');
            }
        }, INACTIVITY_TIMEOUT);
    }
    
    // 更新颜色面积统计
    function updateAreaStats() {
        const areas = calculateColorAreas();
        elements.redArea.textContent = areas.red;
        elements.blueArea.textContent = areas.blue;
        elements.brownArea.textContent = areas.brown;
    }
    
    // 计算颜色面积
    function calculateColorAreas() {
        const startTime = performance.now();
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        let redCount = 0, blueCount = 0, brownCount = 0;
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];
            
            if (a < 128) continue; // 忽略透明像素
            if (r === 245 && g === 241 && b === 233) continue; // 忽略背景色
            
            const closestColor = findClosestColor(r, g, b);
            switch (closestColor) {
                case 'red': redCount++; break;
                case 'blue': blueCount++; break;
                case 'brown': brownCount++; break;
            }
        }
        
        const endTime = performance.now();
        console.log(`面积计算耗时: ${(endTime - startTime).toFixed(2)}ms`);
        
        return {
            red: redCount,
            blue: blueCount,
            brown: brownCount
        };
    }
    
    // 找到最接近的颜色
    function findClosestColor(r, g, b) {
        function colorDistance(c1, c2) {
            return Math.sqrt(
                Math.pow(c1[0] - c2[0], 2) +
                Math.pow(c1[1] - c2[1], 2) +
                Math.pow(c1[2] - c2[2], 2)
            );
        }
        
        const targetRgb = {
            red: [255, 0, 0],
            blue: [0, 0, 255],
            brown: [139, 69, 19]
        };
        
        let minDist = Infinity;
        let closest = null;
        
        for (const [color, rgb] of Object.entries(targetRgb)) {
            const dist = colorDistance([r, g, b], rgb);
            if (dist < minDist) {
                minDist = dist;
                closest = color;
            }
        }
        
        return closest;
    }
    
    // 预加载图片
    function preloadImages() {
        elements.loadingIndicator.style.display = 'block';
        
        const allImages = [...IMAGE_SETS.red, ...IMAGE_SETS.blue, ...IMAGE_SETS.brown];
        let loadedCount = 0;
        const totalCount = allImages.length;
        
        allImages.forEach(imgName => {
            const img = new Image();
            img.onload = img.onerror = () => {
                loadedCount++;
                if (loadedCount >= totalCount) {
                    elements.loadingIndicator.style.display = 'none';
                    console.log('所有图片资源预加载完成');
                }
            };
            img.src = IMAGE_PATH + imgName;
        });
    }
    
    // 生成云锦纹样
    async function generatePattern() {
        if (isGenerating) return;
        isGenerating = true;
        elements.generateBtn.disabled = true;
        
        try {
            showStatusMessage('正在生成云锦纹样...', 'loading');
            
            const areas = calculateColorAreas();
            const maxColor = findMaxColor(areas);
            
            await simulateProgress();
            
            showStatusMessage('纹样即将生成完成...', 'loading');
            
            const selectedImage = selectRandomImage(maxColor);
            
            await new Promise(resolve => setTimeout(resolve, 300));
            
            displayResult(selectedImage);
            showStatusMessage('生成成功！', 'success');
            
        } catch (error) {
            console.error('生成失败:', error);
            showStatusMessage('生成超时，请重试', 'error');
        } finally {
            isGenerating = false;
            elements.generateBtn.disabled = false;
        }
    }
    
    // 找到面积最大的颜色
    function findMaxColor(areas) {
        let maxColor = 'red';
        let maxArea = areas.red;
        
        if (areas.blue > maxArea) {
            maxColor = 'blue';
            maxArea = areas.blue;
        }
        if (areas.brown > maxArea) {
            maxColor = 'brown';
        }
        
        return maxColor;
    }
    
    // 模拟进度
    function simulateProgress() {
        return new Promise(resolve => {
            let progress = 0;
            const interval = setInterval(() => {
                progress += 10;
                if (progress >= 50) {
                    clearInterval(interval);
                    resolve();
                }
            }, 100);
        });
    }
    
    // 安全的随机数生成
    function getSecureRandomInt(max) {
        if (window.crypto && window.crypto.getRandomValues) {
            const array = new Uint32Array(1);
            window.crypto.getRandomValues(array);
            return array[0] % max;
        }
        return Math.floor(Math.random() * max);
    }
    
    // 选择随机图片（防重复）
    function selectRandomImage(color) {
        const imageSet = IMAGE_SETS[color];
        const lastId = localStorage.getItem(STORAGE_KEY);
        
        let attempts = 0;
        let selectedIndex;
        
        do {
            selectedIndex = getSecureRandomInt(imageSet.length);
            attempts++;
        } while (
            imageSet[selectedIndex] === lastId && 
            attempts < MAX_RETRY && 
            imageSet.length > 1
        );
        
        if (attempts >= MAX_RETRY) {
            localStorage.removeItem(STORAGE_KEY);
        }
        
        const selectedImage = imageSet[selectedIndex];
        localStorage.setItem(STORAGE_KEY, selectedImage);
        
        return selectedImage;
    }
    
    // 显示结果
    function displayResult(imageName) {
        elements.resultImage.src = IMAGE_PATH + imageName;
        elements.resultArea.style.display = 'block';
        elements.resultArea.scrollIntoView({ behavior: 'smooth' });
    }
    
    // 下载图片
    function downloadImage() {
        const link = document.createElement('a');
        link.download = 'yunjin-pattern.jpg';
        link.href = elements.resultImage.src;
        link.click();
    }
    
    // 显示状态消息
    function showStatusMessage(message, type) {
        elements.statusMessage.textContent = message;
        elements.statusMessage.className = '';
        elements.statusMessage.classList.add(type);
        elements.statusMessage.style.display = 'block';
    }
    
    // 隐藏状态消息
    function hideStatusMessage() {
        elements.statusMessage.style.display = 'none';
    }
    
    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

// 文化体验页面脚本
window.addEventListener('DOMContentLoaded', function() {
    // 文化体验页面的动画效果
    const featureItems = document.querySelectorAll('.feature-item');
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

    featureItems.forEach((item, index) => {
        item.style.opacity = 0;
        item.style.transform = 'translateY(30px)';
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

    // 背景图片切换效果
    const sections = document.querySelectorAll('.experience-intro, .experience-features, .experience-placeholder');
    sections.forEach(section => {
        section.addEventListener('mouseenter', function() {
            this.style.backgroundPosition = 'center 10%';
        });
        section.addEventListener('mouseleave', function() {
            this.style.backgroundPosition = 'center';
        });
    });

    // 交互式绘画功能
    const canvas = document.getElementById('drawingCanvas');
    const ctx = canvas.getContext('2d');
    const colorButtons = document.querySelectorAll('.color-btn');
    const sizeSlider = document.getElementById('brushSize');
    const sizeValue = document.getElementById('sizeValue');
    const clearBtn = document.getElementById('clearCanvas');
    const resultImage = document.getElementById('resultImage');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const fullscreenOverlay = document.getElementById('fullscreenOverlay');
    const fullscreenImage = document.getElementById('fullscreenImage');

    // 初始化绘画参数
    let isDrawing = false;
    let currentColor = '#FF0000'; // 默认红色
    // 从本地存储获取画笔粗细，如果没有则使用默认值13
    let brushSize = parseInt(localStorage.getItem('brushSize')) || 13;
    let lastX = 0;
    let lastY = 0;
    let animationId = null;
    let lastGeneratedImage = null; // 记录上一张生成的图片

    // 设置画布尺寸
    function resizeCanvas() {
        const container = document.querySelector('.drawing-container');
        canvas.width = container.clientWidth - 40; // 减去padding
        canvas.height = Math.max(600, container.clientHeight - 100); // 增大画布面积
        clearCanvas();
    }

    // 初始化画布
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // 初始化画笔大小滑块和显示值
    sizeSlider.value = brushSize;
    sizeValue.textContent = brushSize;

    // 颜色选择
    colorButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 移除所有按钮的活跃状态
            colorButtons.forEach(btn => btn.classList.remove('active'));
            // 添加当前按钮的活跃状态
            this.classList.add('active');
            // 设置当前颜色
            currentColor = this.dataset.color;
        });
    });

    // 画笔大小调节
    sizeSlider.addEventListener('input', function() {
        brushSize = parseInt(this.value);
        sizeValue.textContent = brushSize;
        // 保存画笔粗细到本地存储
        localStorage.setItem('brushSize', brushSize);
    });

    // 绘画功能
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // 移动端触摸事件支持
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', stopDrawing);

    function startDrawing(e) {
        isDrawing = true;
        // 修复坐标校准问题
        const rect = canvas.getBoundingClientRect();
        // 计算画布的缩放比例，确保坐标精确匹配
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        lastX = (e.clientX - rect.left) * scaleX;
        lastY = (e.clientY - rect.top) * scaleY;
    }

    function handleTouchStart(e) {
        e.preventDefault(); // 防止页面滚动
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        startDrawing(mouseEvent);
    }

    function handleMouseMove(e) {
        if (!isDrawing) return;
        
        // 修复坐标校准问题
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        
        // 使用requestAnimationFrame优化绘画
        if (!animationId) {
            animationId = requestAnimationFrame(() => {
                draw(lastX, lastY, x, y);
                lastX = x;
                lastY = y;
                animationId = null;
            });
        }
    }

    function handleTouchMove(e) {
        e.preventDefault(); // 防止页面滚动
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        handleMouseMove(mouseEvent);
    }

    function draw(startX, startY, endX, endY) {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.lineWidth = brushSize * 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = currentColor;
        ctx.stroke();
        ctx.closePath();
    }

    function stopDrawing() {
        isDrawing = false;
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        // 移除自动生成行为，改为由按钮触发
    }

    // 清空画布
    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        resultImage.style.display = 'none';
    }

    clearBtn.addEventListener('click', clearCanvas);

    // 生成图片按钮点击事件
    const generateImageBtn = document.getElementById('generateImage');
    generateImageBtn.addEventListener('click', function() {
        analyzeColors();
    });

    // 颜色面积分析（优化版）
    function analyzeColors() {
        // 使用requestAnimationFrame延迟执行，避免阻塞主线程
        requestAnimationFrame(() => {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            const colorCounts = {
                '#FF0000': 0, // 红色
                '#D4AF37': 0, // 金色
                '#228B22': 0, // 绿色
                '#87CEEB': 0, // 天蓝色
                '#808080': 0  // 灰色
            };

            // 遍历像素数据
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const a = data[i + 3];

                // 只计算不透明的像素
                if (a > 0) {
                    // 将RGB转换为十六进制颜色
                    const hex = rgbToHex(r, g, b);
                    // 检查是否是我们使用的颜色之一
                    if (colorCounts.hasOwnProperty(hex)) {
                        colorCounts[hex]++;
                    }
                }
            }

            // 找出面积最大的颜色
            let maxColor = null;
            let maxCount = 0;

            for (const color in colorCounts) {
                if (colorCounts[color] > maxCount) {
                    maxCount = colorCounts[color];
                    maxColor = color;
                }
            }

            // 根据最大面积颜色生成图片
            if (maxColor) {
                generateImage(maxColor);
            }
        });
    }

    // RGB转十六进制
    function rgbToHex(r, g, b) {
        // 确保颜色值在0-255范围内
        r = Math.max(0, Math.min(255, r));
        g = Math.max(0, Math.min(255, g));
        b = Math.max(0, Math.min(255, b));
        
        // 将RGB值转换为十六进制，确保格式一致
        return '#' + (
            (1 << 24) +
            (r << 16) +
            (g << 8) +
            b
        ).toString(16).slice(1).toUpperCase();
    }

    // 生成图片（修复路径问题）
    function generateImage(color) {
        loadingIndicator.style.display = 'block';
        resultImage.style.display = 'none';

        // 模拟图片加载延迟，增加到1.5秒以提升用户体验
        setTimeout(() => {
            let imageNumber;
            let imagePath;

            // 生成与上一张不同的图片
            switch (color) {
                case '#FF0000': // 红色
                    imageNumber = generateDifferentImage(1, 12, lastGeneratedImage);
                    imagePath = `assets/images/experiencePicture/x${imageNumber.toString().padStart(2, '0')}.jpg`;
                    break;
                case '#D4AF37': // 金色
                    imageNumber = generateDifferentImage(13, 20, lastGeneratedImage);
                    imagePath = `assets/images/experiencePicture/x${imageNumber.toString().padStart(2, '0')}.jpg`;
                    break;
                case '#228B22': // 绿色
                    // 从两个区间中随机选择一个
                    if (Math.random() < 0.5) {
                        // X21-X24
                        imageNumber = generateDifferentImage(21, 24, lastGeneratedImage);
                    } else {
                        // X29-X35
                        imageNumber = generateDifferentImage(29, 35, lastGeneratedImage);
                    }
                    imagePath = `assets/images/experiencePicture/x${imageNumber.toString().padStart(2, '0')}.jpg`;
                    break;
                case '#87CEEB': // 天蓝色
                    // X25-X28
                    imageNumber = generateDifferentImage(25, 28, lastGeneratedImage);
                    imagePath = `assets/images/experiencePicture/x${imageNumber.toString().padStart(2, '0')}.jpg`;
                    break;
                case '#808080': // 灰色
                    imageNumber = generateDifferentImage(36, 39, lastGeneratedImage);
                    imagePath = `assets/images/experiencePicture/x${imageNumber.toString().padStart(2, '0')}.jpg`;
                    break;
                default:
                    return;
            }

            // 记录当前生成的图片
            lastGeneratedImage = imageNumber;

            // 修复图片加载问题
            resultImage.onload = function() {
                resultImage.style.display = 'block';
                loadingIndicator.style.display = 'none';
            };
            
            resultImage.onerror = function() {
                console.error('图片加载失败:', imagePath);
                loadingIndicator.style.display = 'none';
                alert('图片加载失败，请稍后重试');
            };

            resultImage.src = imagePath;
        }, 1500);
    }

    // 生成与上一张不同的图片
    function generateDifferentImage(min, max, lastImage) {
        let imageNumber;
        const range = max - min + 1;
        
        // 生成一个与上一张不同的图片编号
        do {
            imageNumber = Math.floor(Math.random() * range) + min;
        } while (imageNumber === lastImage && range > 1); // 确保至少有一个不同的图片
        
        return imageNumber;
    }

    // 图片点击放大全屏功能
    resultImage.addEventListener('click', function() {
        fullscreenImage.src = this.src;
        fullscreenOverlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });

    // 关闭全屏
    document.getElementById('closeFullscreen').addEventListener('click', closeFullscreen);
    fullscreenOverlay.addEventListener('click', function(e) {
        if (e.target === this) {
            closeFullscreen();
        }
    });

    // 键盘ESC键退出全屏
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeFullscreen();
        }
    });

    function closeFullscreen() {
        fullscreenOverlay.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // 声音可视化体验功能
    const video = document.getElementById('audioVisualizationVideo');
    const visualizationCanvas = document.getElementById('visualizationCanvas');
    const visualizationCtx = visualizationCanvas.getContext('2d');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const progressBar = document.getElementById('progressBar');
    const timeDisplay = document.getElementById('timeDisplay');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const videoWrapper = document.querySelector('.video-wrapper');

    // 音频分析器
    let audioContext;
    let analyser;
    let dataArray;
    let bufferLength;

    // 初始化画布
    function resizeVisualizationCanvas() {
        visualizationCanvas.width = videoWrapper.clientWidth;
        visualizationCanvas.height = videoWrapper.clientHeight;
    }

    // 初始化音频分析器
    function initAudioAnalyser() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContext.createMediaElementSource(video);
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);
            analyser.connect(audioContext.destination);
            bufferLength = analyser.frequencyBinCount;
            dataArray = new Uint8Array(bufferLength);
        }
    }

    // 绘制声音可视化效果
    function drawVisualization() {
        if (!analyser) return;

        requestAnimationFrame(drawVisualization);

        analyser.getByteFrequencyData(dataArray);

        visualizationCtx.clearRect(0, 0, visualizationCanvas.width, visualizationCanvas.height);

        // 绘制频谱
        const barWidth = (visualizationCanvas.width / bufferLength) * 2.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * visualizationCanvas.height;

            // 使用渐变颜色
            const gradient = visualizationCtx.createLinearGradient(0, visualizationCanvas.height, 0, visualizationCanvas.height - barHeight);
            gradient.addColorStop(0, 'rgba(157, 41, 51, 0.8)');
            gradient.addColorStop(1, 'rgba(212, 175, 55, 0.8)');

            visualizationCtx.fillStyle = gradient;
            visualizationCtx.fillRect(x, visualizationCanvas.height - barHeight, barWidth, barHeight);

            x += barWidth + 1;
        }
    }

    // 播放/暂停控制
    playPauseBtn.addEventListener('click', function() {
        if (video.paused) {
            video.play();
            playPauseBtn.textContent = '暂停';
            // 恢复音频上下文
            if (audioContext && audioContext.state === 'suspended') {
                audioContext.resume();
            }
        } else {
            video.pause();
            playPauseBtn.textContent = '播放';
        }
    });

    // 视频播放事件
    video.addEventListener('play', function() {
        playPauseBtn.textContent = '暂停';
        initAudioAnalyser();
        drawVisualization();
    });

    // 视频暂停事件
    video.addEventListener('pause', function() {
        playPauseBtn.textContent = '播放';
    });

    // 视频结束事件
    video.addEventListener('ended', function() {
        playPauseBtn.textContent = '播放';
        progressBar.value = 0;
        timeDisplay.textContent = '0:00 / ' + formatTime(video.duration);
    });

    // 视频时间更新事件
    video.addEventListener('timeupdate', function() {
        const progress = (video.currentTime / video.duration) * 100;
        progressBar.value = progress;
        timeDisplay.textContent = formatTime(video.currentTime) + ' / ' + formatTime(video.duration);
    });

    // 视频元数据加载完成事件
    video.addEventListener('loadedmetadata', function() {
        timeDisplay.textContent = '0:00 / ' + formatTime(video.duration);
    });

    // 进度条控制
    progressBar.addEventListener('input', function() {
        const seekTime = (this.value / 100) * video.duration;
        video.currentTime = seekTime;
    });

    // 全屏功能
    fullscreenBtn.addEventListener('click', function() {
        if (!document.fullscreenElement) {
            if (videoWrapper.requestFullscreen) {
                videoWrapper.requestFullscreen();
            } else if (videoWrapper.mozRequestFullScreen) {
                videoWrapper.mozRequestFullScreen();
            } else if (videoWrapper.webkitRequestFullscreen) {
                videoWrapper.webkitRequestFullscreen();
            } else if (videoWrapper.msRequestFullscreen) {
                videoWrapper.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    });

    // 全屏状态变化事件
    document.addEventListener('fullscreenchange', updateFullscreenButton);
    document.addEventListener('webkitfullscreenchange', updateFullscreenButton);
    document.addEventListener('mozfullscreenchange', updateFullscreenButton);
    document.addEventListener('MSFullscreenChange', updateFullscreenButton);

    function updateFullscreenButton() {
        if (document.fullscreenElement) {
            fullscreenBtn.textContent = '退出全屏';
        } else {
            fullscreenBtn.textContent = '全屏';
        }
    }

    // 时间格式化函数
    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return mins + ':' + (secs < 10 ? '0' : '') + secs;
    }

    // 窗口大小变化时调整画布
    window.addEventListener('resize', resizeVisualizationCanvas);

    // 初始化画布尺寸
    resizeVisualizationCanvas();

    console.log('文化体验页面脚本加载完成');
});
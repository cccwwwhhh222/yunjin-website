// 金箔页面脚本
window.addEventListener('DOMContentLoaded', function() {
    // 金箔制作工艺步骤动画
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

    // 金箔应用领域悬停效果
    const applicationItems = document.querySelectorAll('.application-item');
    applicationItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // 金箔特性卡片动画
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
    scrollToTopBtn.style.backgroundColor = 'var(--gold-primary)';
    scrollToTopBtn.style.color = 'var(--text-dark)';
    scrollToTopBtn.style.border = 'none';
    scrollToTopBtn.style.fontSize = '24px';
    scrollToTopBtn.style.cursor = 'pointer';
    scrollToTopBtn.style.boxShadow = '0 4px 15px rgba(212, 175, 55, 0.3)';
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

    // 初始化金箔交互效果 - 千锤成莲
    const canvasContainer = document.getElementById('canvas-container');
    if (canvasContainer) {
        initGoldFoilInteractive();
    }

    function initGoldFoilInteractive() {
        // 图片资源路径
        const imagePath = 'assets/images/goldPicture/';
        const imageCount = 8;
        let currentImageIndex = 0;
        
        // 图片预加载
        const images = [];
        const imageNames = [];
        
        for (let i = 1; i <= imageCount; i++) {
            const imageName = `e0${i}.jpg`;
            imageNames.push(imageName);
            const img = new Image();
            img.src = imagePath + imageName;
            images.push(img);
        }

        // 创建图片容器
        const imageContainer = document.createElement('div');
        imageContainer.style.width = '100%';
        imageContainer.style.height = '100%';
        imageContainer.style.position = 'relative';
        imageContainer.style.overflow = 'hidden';
        imageContainer.style.borderRadius = '10px';
        
        // 创建当前显示的图片
        let currentImage = document.createElement('img');
        currentImage.src = imagePath + imageNames[currentImageIndex];
        currentImage.style.width = '100%';
        currentImage.style.height = '100%';
        currentImage.style.objectFit = 'contain';
        currentImage.style.position = 'absolute';
        currentImage.style.top = '0';
        currentImage.style.left = '0';
        currentImage.style.transition = 'opacity 0.5s ease-in-out, transform 0.5s ease-in-out';
        currentImage.style.opacity = '1';
        currentImage.style.transform = 'scale(1)';
        
        imageContainer.appendChild(currentImage);
        canvasContainer.appendChild(imageContainer);

        // 更新UI元素
        const hitCountElement = document.getElementById('hit-count');
        const progressFillElement = document.getElementById('progress-fill');
        const messageElement = document.getElementById('message');
        const resetBtn = document.getElementById('reset-btn');

        // 初始化UI
        hitCountElement.textContent = currentImageIndex;
        progressFillElement.style.width = `${(currentImageIndex / (imageCount - 1)) * 100}%`;
        messageElement.textContent = '点击金箔，开始捶打';

        // 点击事件处理
        imageContainer.addEventListener('click', function() {
            if (currentImageIndex < imageCount - 1) {
                // 增加点击计数
                currentImageIndex++;
                
                // 更新UI
                hitCountElement.textContent = currentImageIndex;
                progressFillElement.style.width = `${(currentImageIndex / (imageCount - 1)) * 100}%`;
                
                // 创建新图片元素
                const newImage = document.createElement('img');
                newImage.src = imagePath + imageNames[currentImageIndex];
                newImage.style.width = '100%';
                newImage.style.height = '100%';
                newImage.style.objectFit = 'contain';
                newImage.style.position = 'absolute';
                newImage.style.top = '0';
                newImage.style.left = '0';
                newImage.style.transition = 'opacity 0.5s ease-in-out, transform 0.5s ease-in-out';
                newImage.style.opacity = '0';
                newImage.style.transform = 'scale(1.1)';
                
                imageContainer.appendChild(newImage);
                
                // 触发过渡动画
                setTimeout(() => {
                    currentImage.style.opacity = '0';
                    currentImage.style.transform = 'scale(0.9)';
                    newImage.style.opacity = '1';
                    newImage.style.transform = 'scale(1)';
                }, 10);
                
                // 移除旧图片
                setTimeout(() => {
                    imageContainer.removeChild(currentImage);
                    currentImage = newImage;
                }, 500);
                
                // 检查是否完成
                if (currentImageIndex === imageCount - 1) {
                    messageElement.textContent = '莲花已成！';
                    showToast('金箔莲花制作成功！', 'success');
                } else {
                    messageElement.textContent = `继续捶打，已完成 ${currentImageIndex}/${imageCount - 1}`;
                }
            }
        });

        // 重置功能
        resetBtn.addEventListener('click', function() {
            currentImageIndex = 0;
            
            // 更新UI
            hitCountElement.textContent = currentImageIndex;
            progressFillElement.style.width = '0%';
            messageElement.textContent = '点击金箔，开始捶打';
            
            // 切换到第一张图片
            const newImage = document.createElement('img');
            newImage.src = imagePath + imageNames[currentImageIndex];
            newImage.style.width = '100%';
            newImage.style.height = '100%';
            newImage.style.objectFit = 'contain';
            newImage.style.position = 'absolute';
            newImage.style.top = '0';
            newImage.style.left = '0';
            newImage.style.transition = 'opacity 0.5s ease-in-out, transform 0.5s ease-in-out';
            newImage.style.opacity = '0';
            newImage.style.transform = 'scale(1.1)';
            
            imageContainer.appendChild(newImage);
            
            // 触发过渡动画
            setTimeout(() => {
                currentImage.style.opacity = '0';
                currentImage.style.transform = 'scale(0.9)';
                newImage.style.opacity = '1';
                newImage.style.transform = 'scale(1)';
            }, 10);
            
            // 移除旧图片
            setTimeout(() => {
                imageContainer.removeChild(currentImage);
                currentImage = newImage;
            }, 500);
            
            showToast('已重置金箔莲花', 'info');
        });

        // 响应窗口大小变化
        window.addEventListener('resize', function() {
            // 确保图片容器尺寸正确
            imageContainer.style.width = '100%';
            imageContainer.style.height = '100%';
        });
    }
});
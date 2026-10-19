// Three.js 公共配置模块
class ThreeSetup {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.stats = null;
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // 初始化场景
    initScene(backgroundColor = 0x121212, fog = null) {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(backgroundColor);
        
        if (fog) {
            this.scene.fog = fog;
        }
        
        return this.scene;
    }

    // 初始化相机
    initCamera(position = { x: 0, y: 2, z: 8 }, fov = 75) {
        const aspect = this.container.offsetWidth / this.container.offsetHeight;
        this.camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 1000);
        this.camera.position.set(position.x, position.y, position.z);
        
        return this.camera;
    }

    // 初始化渲染器
    initRenderer(antialias = true) {
        const pixelRatio = this.isMobile ? 1 : window.devicePixelRatio;
        
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: antialias,
            alpha: true
        });
        
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
        this.renderer.setPixelRatio(pixelRatio);
        this.renderer.shadowMap.enabled = true;
        
        this.container.appendChild(this.renderer.domElement);
        
        return this.renderer;
    }

    // 初始化轨道控制器
    initControls() {
        if (!this.camera || !this.renderer) {
            console.error('Camera and renderer must be initialized first');
            return null;
        }
        
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enableZoom = true;
        this.controls.enablePan = true;
        
        return this.controls;
    }

    // 添加灯光
    addLights() {
        if (!this.scene) {
            console.error('Scene must be initialized first');
            return;
        }
        
        // 环境光
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        // 方向光
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 7.5);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
        
        return { ambientLight, directionalLight };
    }

    // 添加地面
    addGround(size = 20, color = 0x222233) {
        if (!this.scene) {
            console.error('Scene must be initialized first');
            return null;
        }
        
        const planeGeometry = new THREE.PlaneGeometry(size, size);
        const planeMaterial = new THREE.MeshPhongMaterial({
            color: color,
            shininess: 100,
            specular: 0xffffff
        });
        
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotation.x = -Math.PI / 2;
        plane.position.y = -3;
        plane.receiveShadow = true;
        
        this.scene.add(plane);
        
        return plane;
    }

    // 添加粒子效果
    addParticles(count = 100, size = 0.05, color = 0x9999cc) {
        if (!this.scene) {
            console.error('Scene must be initialized first');
            return null;
        }
        
        // 根据设备调整粒子数量
        const particleCount = this.isMobile ? count / 2 : count;
        
        const particlesGeometry = new THREE.BufferGeometry();
        const posArray = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 20;
        }
        
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        
        const particlesMaterial = new THREE.PointsMaterial({
            size: size,
            color: color,
            transparent: true,
            opacity: 0.6
        });
        
        const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        this.scene.add(particlesMesh);
        
        return particlesMesh;
    }

    // 添加性能监控
    addStats() {
        if (typeof Stats === 'undefined') {
            console.warn('Stats.js not loaded');
            return null;
        }
        
        this.stats = new Stats();
        this.stats.domElement.style.position = 'absolute';
        this.stats.domElement.style.top = '0';
        this.stats.domElement.style.left = '0';
        this.container.appendChild(this.stats.domElement);
        
        return this.stats;
    }

    // 处理窗口大小调整
    handleResize() {
        if (!this.camera || !this.renderer) {
            console.error('Camera and renderer must be initialized first');
            return;
        }
        
        const width = this.container.offsetWidth;
        const height = this.container.offsetHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
    }

    // 开始动画循环
    startAnimationLoop(callback) {
        if (!this.renderer || !this.scene || !this.camera) {
            console.error('Renderer, scene, and camera must be initialized first');
            return;
        }
        
        const animate = () => {
            requestAnimationFrame(animate);
            
            if (this.stats) {
                this.stats.begin();
            }
            
            if (this.controls) {
                this.controls.update();
            }
            
            if (callback) {
                callback();
            }
            
            this.renderer.render(this.scene, this.camera);
            
            if (this.stats) {
                this.stats.end();
            }
        };
        
        animate();
    }

    // 销毁场景
    dispose() {
        if (this.renderer) {
            this.renderer.dispose();
            if (this.renderer.domElement.parentNode) {
                this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
            }
        }
        
        if (this.scene) {
            // 递归清理场景中的所有对象
            const clearScene = (object) => {
                if (object.geometry) {
                    object.geometry.dispose();
                }
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
                if (object.children) {
                    object.children.forEach(child => clearScene(child));
                }
            };
            
            clearScene(this.scene);
        }
        
        if (this.controls) {
            this.controls.dispose();
        }
        
        if (this.stats && this.stats.domElement.parentNode) {
            this.stats.domElement.parentNode.removeChild(this.stats.domElement);
        }
        
        console.log('Three.js scene disposed');
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThreeSetup;
} else {
    window.ThreeSetup = ThreeSetup;
}
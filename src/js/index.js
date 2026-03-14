class Generator {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = options.width || 1080;
        this.height = options.height || 1080;
        
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.userImg = null;
        this.overlayImg = null;

        // Transformasi
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;

        // Touch Tracking
        this.lastTouchX = 0;
        this.lastTouchY = 0;
        this.lastDist = 0;

        this.initEvents();
    }

    setUserImage(image) {
        this.userImg = image;
        // Auto-fit scale di awal
        const ratio = Math.max(this.width / image.width, this.height / image.height);
        this.scale = ratio;
        this.offsetX = 0;
        this.offsetY = 0;
        this.draw();
    }

    setOverlayImage(image) {
        this.overlayImg = image;
        this.draw();
    }

    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // 1. Gambar Background Putih
        this.ctx.fillStyle = "#fafafa";
        this.ctx.fillRect(0, 0, this.width, this.height);

        // 2. Gambar Foto User (dengan Transformasi)
        if (this.userImg) {
            this.ctx.save();
            // Pindah ke titik tengah untuk zoom pusat tengah
            this.ctx.translate(this.width / 2 + this.offsetX, this.height / 2 + this.offsetY);
            this.ctx.scale(this.scale, this.scale);
            this.ctx.drawImage(
                this.userImg, 
                -this.userImg.width / 2, 
                -this.userImg.height / 2
            );
            this.ctx.restore();
        }

        // 3. Gambar Twibbon (Overlay) selalu di atas
        if (this.overlayImg) {
            this.ctx.drawImage(this.overlayImg, 0, 0, this.width, this.height);
        }
    }

    initEvents() {
        const handleStart = (e) => {
            if (e.touches.length === 1) {
                this.lastTouchX = e.touches[0].clientX;
                this.lastTouchY = e.touches[0].clientY;
            } else if (e.touches.length === 2) {
                this.lastDist = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
            }
        };

        const handleMove = (e) => {
            e.preventDefault();
            const touches = e.touches;

            if (touches.length === 1) {
                // Drag / Geser
                const dx = touches[0].clientX - this.lastTouchX;
                const dy = touches[0].clientY - this.lastTouchY;
                
                // Menyesuaikan pergerakan dengan resolusi canvas
                const factor = this.width / this.canvas.offsetWidth;
                this.offsetX += dx * factor;
                this.offsetY += dy * factor;

                this.lastTouchX = touches[0].clientX;
                this.lastTouchY = touches[0].clientY;
            } 
            else if (touches.length === 2) {
                // Pinch Zoom
                const dist = Math.hypot(
                    touches[0].clientX - touches[1].clientX,
                    touches[0].clientY - touches[1].clientY
                );
                if (this.lastDist > 0) {
                    const ratio = dist / this.lastDist;
                    this.scale *= ratio;
                }
                this.lastDist = dist;
            }
            this.draw();
        };

        const handleEnd = () => {
            this.lastDist = 0;
        };

        this.canvas.addEventListener('touchstart', handleStart, { passive: false });
        this.canvas.addEventListener('touchmove', handleMove, { passive: false });
        this.canvas.addEventListener('touchend', handleEnd);
    }

    render() {
        return this.canvas.toDataURL('image/png');
    }
}
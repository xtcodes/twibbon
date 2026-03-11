class Generator {
    static defaults = {
        width: 200,
        height: 200,
        backgroundColor: '#ffffff'
    };

    constructor(options) {
        // Inisialisasi canvas
        this.renderCanvas = document.createElement('canvas');
        this.renderCanvas.width = options.width || Generator.defaults.width;
        this.renderCanvas.height = options.height || Generator.defaults.height;
        this.renderContext = this.renderCanvas.getContext('2d');

        // Isi latar belakang
        this.renderContext.fillStyle = options.backgroundColor || Generator.defaults.backgroundColor;
        this.renderContext.fillRect(0, 0, this.renderCanvas.width, this.renderCanvas.height);
    }

    /**
     * Menambahkan layer dengan fitur Auto-Crop agar proporsional
     * @param {HTMLImageElement} image 
     * @param {Object} options - Jika kosong, gambar akan di-crop otomatis memenuhi canvas
     */
    addLayer(image, options = {}) {
        const canvasW = this.renderCanvas.width;
        const canvasH = this.renderCanvas.height;
        const imgW = image.width;
        const imgH = image.height;

        // Hitung aspek rasio
        const canvasAspect = canvasW / canvasH;
        const imgAspect = imgW / imgH;

        let sX, sY, sW, sH;

        // Logika Center Crop (Menjaga proporsi agar tidak gepeng)
        if (imgAspect > canvasAspect) {
            // Gambar lebih lebar dari canvas (potong sisi kiri & kanan)
            sH = imgH;
            sW = imgH * canvasAspect;
            sY = 0;
            sX = (imgW - sW) / 2;
        } else {
            // Gambar lebih tinggi dari canvas (potong sisi atas & bawah)
            sW = imgW;
            sH = imgW / canvasAspect;
            sX = 0;
            sY = (imgH - sH) / 2;
        }

        // Jika ini adalah layer overlay/twibbon (biasanya PNG transparan), 
        // kita mungkin ingin menggambar full tanpa crop. 
        // Tapi untuk foto profil user, logika di atas adalah yang terbaik.
        
        if (options.isOverlay) {
            // Khusus twibbon: Gambar langsung memenuhi seluruh canvas
            this.renderContext.drawImage(image, 0, 0, canvasW, canvasH);
        } else {
            // Untuk foto profil: Gambar dengan hasil crop proporsional
            this.renderContext.drawImage(image, sX, sY, sW, sH, 0, 0, canvasW, canvasH);
        }
    }

    render() {
        return this.renderCanvas.toDataURL('image/png');
    }
			}

let config;
let generatorInstance;

addEventListener('load', function() {  
    fetch('config/config.json')
        .then(res => res.json())
        .then(json => {
            config = json;
            
            // ISI HEADER DARI JSON DENGAN ANIMASI
            const titleEl = document.getElementById('title-text');
            const subEl = document.getElementById('subtitle-text');
            
            titleEl.textContent = config.appTitle;
            subEl.textContent = config.appSubtitle;
            
            document.getElementById('header-box').classList.add('fade-in');
            
            initApp();
        })
        .catch(err => console.error("Gagal memuat config:", err));
});

function initApp() {
    const container = document.getElementById('dynamic-content');
    
    // Fade Out konten lama sebelum diganti
    container.style.opacity = "0";

    setTimeout(() => {
        container.innerHTML = "";
        container.className = "fade-in"; // Terapkan efek fade-in
        
        // Buat Drop Area
        const dropArea = document.createElement('div');
        dropArea.className = 'drop-area-square';
        dropArea.id = 'drop-zone';
        dropArea.innerHTML = `
            <div class="status-overlay">
                <i data-lucide="image-plus"></i>
                <span>${config.messages.status.startup}</span>
            </div>
        `;

        // Input file tersembunyi
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';

        // Group Tombol (tersembunyi diawal)
        const btnGroup = document.createElement('div');
        btnGroup.className = 'btn-group';
        btnGroup.id = 'ui-group';
        btnGroup.style.display = 'none';

        container.appendChild(dropArea);
        container.appendChild(fileInput);
        container.appendChild(btnGroup);

        lucide.createIcons();
        container.style.opacity = "1";

        // Event Klik
        dropArea.onclick = () => fileInput.click();

        fileInput.onchange = function() {
            if(this.files && this.files[0]) {
                processImage(this.files[0]);
            }
        };
    }, 100); 
}

function processImage(file) {
    const zone = document.getElementById('drop-zone');
    const uiGroup = document.getElementById('ui-group');

    // Matikan klik dan tampilkan loading
    zone.onclick = null; 
    zone.style.opacity = "0.6";
    zone.innerHTML = `
        <div class="status-overlay">
            <i data-lucide="loader-2" class="animate-spin"></i>
            <span>${config.messages.status.processing}</span>
        </div>
    `;
    lucide.createIcons();

    const reader = new FileReader();
    reader.onload = (e) => {
        const userImg = new Image();
        userImg.src = e.target.result;

        userImg.onload = () => {
            const overlayImg = new Image();
            overlayImg.src = config.overlaySource;

            overlayImg.onload = () => {
                // Tampilkan canvas dengan transisi halus
                zone.style.opacity = "1";
                zone.classList.add('no-border');
                zone.innerHTML = "";
                
                const canvas = document.createElement('canvas');
                canvas.className = 'fade-in';
                zone.appendChild(canvas);

                // Jalankan Generator
                generatorInstance = new Generator(canvas, { width: 1080, height: 1080 });
                generatorInstance.setUserImage(userImg);
                generatorInstance.setOverlayImage(overlayImg);

                // Tampilkan Kontrol
                uiGroup.style.display = 'flex';
                uiGroup.className = 'btn-group fade-in';
                uiGroup.innerHTML = "";

                // Tombol Unduh
                const btnDl = document.createElement('button');
                btnDl.className = 'btn-download';
                btnDl.innerHTML = `<i data-lucide="download"></i> ${config.messages.buttons.download}`;
                btnDl.onclick = () => {
                    const link = document.createElement('a');
                    link.download = config.profilePictureName;
                    link.href = generatorInstance.render();
                    link.click();
                };

                // Tombol Reset
                const btnRe = document.createElement('button');
                btnRe.className = 'btn-reset';
                btnRe.innerHTML = `<i data-lucide="refresh-cw"></i> ${config.messages.buttons.newImage}`;
                btnRe.onclick = () => initApp(); 

                uiGroup.appendChild(btnDl);
                uiGroup.appendChild(btnRe);
                lucide.createIcons();
            };
        };
    };
    reader.readAsDataURL(file);
}
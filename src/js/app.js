let config;
let generatorInstance;

// Ambil elemen yang sudah ada di HTML
const container = document.getElementById('dynamic-content');
const titleText = document.getElementById('title-text');
const subtitleText = document.getElementById('subtitle-text');
const dropZone = document.getElementById('drop-zone');
const startupMsg = document.getElementById('startup-msg');
const fileInput = document.getElementById('file-input');
const uiGroup = document.getElementById('ui-group');

addEventListener('load', function() {  
    fetch('config/config.json')
        .then(res => res.json())
        .then(json => {
            config = json;
            
            // Isi teks dari config
            titleText.textContent = config.appTitle;
            subtitleText.textContent = config.appSubtitle;
            startupMsg.textContent = config.messages.status.startup;
            
            // Munculkan semua dengan halus setelah teks siap
            titleText.classList.add('fade-active');
            subtitleText.classList.add('fade-active');
            container.classList.add('fade-active');
            
            lucide.createIcons();
            initAppLogic();
        })
        .catch(err => console.error("Gagal memuat config:", err));
});

function initAppLogic() {
    // Reset state jika dipanggil dari tombol reset
    dropZone.classList.remove('no-border');
    dropZone.onclick = () => fileInput.click();
    
    // Tampilkan kembali overlay startup
    dropZone.innerHTML = `
        <div class="status-overlay">
            <i data-lucide="image-plus"></i>
            <span>${config.messages.status.startup}</span>
        </div>
    `;
    lucide.createIcons();
    
    uiGroup.style.display = 'none';
    uiGroup.innerHTML = "";

    fileInput.onchange = function() {
        if(this.files && this.files[0]) processImage(this.files[0]);
    };
}

function processImage(file) {
    // Feedback proses
    dropZone.onclick = null; 
    dropZone.innerHTML = `
        <div class="status-overlay">
            <i data-lucide="loader-2" class="spin"></i>
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
                // Bersihkan zone dan masukkan canvas
                dropZone.classList.add('no-border');
                dropZone.innerHTML = "";
                
                const canvas = document.createElement('canvas');
                dropZone.appendChild(canvas);

                // Jalankan Generator Interaktif
                generatorInstance = new Generator(canvas, { width: 1080, height: 1080 });
                generatorInstance.setUserImage(userImg);
                generatorInstance.setOverlayImage(overlayImg);

                // Setup Tombol dengan halus
                uiGroup.style.display = 'flex';
                uiGroup.innerHTML = "";

                const btnDl = document.createElement('button');
                btnDl.className = 'btn-download';
                btnDl.innerHTML = `<i data-lucide="download"></i> ${config.messages.buttons.download}`;
                btnDl.onclick = () => {
                    const link = document.createElement('a');
                    link.download = config.profilePictureName;
                    link.href = generatorInstance.render();
                    link.click();
                };

                const btnRe = document.createElement('button');
                btnRe.className = 'btn-reset';
                btnRe.innerHTML = `<i data-lucide="refresh-cw"></i> ${config.messages.buttons.newImage}`;
                btnRe.onclick = () => {
                    // Animasi transisi saat reset
                    container.classList.remove('fade-active');
                    setTimeout(() => {
                        initAppLogic();
                        container.classList.add('fade-active');
                    }, 300);
                }; 

                uiGroup.appendChild(btnDl);
                uiGroup.appendChild(btnRe);
                lucide.createIcons();
            };
        };
    };
    reader.readAsDataURL(file);
}
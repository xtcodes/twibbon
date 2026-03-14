let config;
let generatorInstance;

// Ambil elemen satu kali di awal
const titleText = document.getElementById('title-text');
const subtitleText = document.getElementById('subtitle-text');
const dropZone = document.getElementById('drop-zone');
const statusUI = document.getElementById('status-ui');
const fileInput = document.getElementById('file-input');
const uiGroup = document.getElementById('ui-group');

// Jalankan fetch saat script dimuat
fetch('config/config.json')
    .then(res => res.json())
    .then(json => {
        config = json;
        titleText.textContent = config.appTitle;
        subtitleText.textContent = config.appSubtitle;
        initApp();
    })
    .catch(err => {
        console.error("Gagal memuat config:", err);
        statusUI.innerHTML = `<span>Gagal memuat sistem. Periksa koneksi.</span>`;
    });

function initApp() {
    // Kembalikan ke tampilan standby
    dropZone.classList.remove('no-border');
    dropZone.classList.add('fade-active');
    
    statusUI.innerHTML = `
        <i data-lucide="image-plus"></i>
        <span>${config.messages.status.startup}</span>
    `;
    lucide.createIcons();

    uiGroup.style.display = 'none';
    uiGroup.innerHTML = "";
    fileInput.value = ""; // Reset input

    // Pasang event klik (Hanya setelah config siap)
    dropZone.onclick = () => fileInput.click();
    
    fileInput.onchange = function() {
        if (this.files && this.files[0]) {
            processImage(this.files[0]);
        }
    };
}

function processImage(file) {
    // Loading State
    dropZone.onclick = null; 
    statusUI.innerHTML = `
        <i data-lucide="loader-2" class="spin"></i>
        <span>${config.messages.status.processing}</span>
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
                // Bersihkan tampilan untuk Canvas
                dropZone.classList.add('no-border');
                dropZone.innerHTML = ""; 
                
                const canvas = document.createElement('canvas');
                dropZone.appendChild(canvas);

                // Inisialisasi Generator
                generatorInstance = new Generator(canvas, { width: 1080, height: 1080 });
                generatorInstance.setUserImage(userImg);
                generatorInstance.setOverlayImage(overlayImg);

                // Munculkan Tombol
                renderUI();
            };
        };
    };
    reader.readAsDataURL(file);
}

function renderUI() {
    uiGroup.style.display = 'flex';
    uiGroup.innerHTML = "";

    const btnDl = document.createElement('button');
    btnDl.className = 'btn-download';
    btnDl.innerHTML = `<i data-lucide="download"></i> ${config.messages.buttons.download}`;
    btnDl.onclick = () => {
        const dataUrl = generatorInstance.render();
        const link = document.createElement('a');
        link.download = config.profilePictureName || 'twibbon.png';
        link.href = dataUrl;
        link.click();
    };

    const btnRe = document.createElement('button');
    btnRe.className = 'btn-reset';
    btnRe.innerHTML = `<i data-lucide="refresh-cw"></i> ${config.messages.buttons.newImage}`;
    btnRe.onclick = () => initApp(); 

    uiGroup.appendChild(btnDl);
    uiGroup.appendChild(btnRe);
    lucide.createIcons();
}
let config;
let generatorInstance;

// Ambil elemen dari DOM sekali saja
const dropZone = document.getElementById('drop-zone');
const statusText = document.getElementById('status-text');
const statusContent = document.getElementById('status-content');
const fileInput = document.getElementById('file-input');
const uiGroup = document.getElementById('ui-group');
const titleText = document.getElementById('title-text');
const subtitleText = document.getElementById('subtitle-text');

addEventListener('load', function() {  
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
            statusText.textContent = "Gagal memuat konfigurasi.";
        });
});

function initApp() {
    // Reset Tampilan ke Awal
    dropZone.classList.remove('no-border');
    dropZone.classList.add('fade-in');
    dropZone.onclick = () => fileInput.click();
    
    // Kembalikan Icon & Pesan Awal
    statusContent.innerHTML = `
        <i data-lucide="image-plus"></i>
        <span>${config.messages.status.startup}</span>
    `;
    lucide.createIcons();

    // Sembunyikan tombol & bersihkan input
    uiGroup.style.display = 'none';
    fileInput.value = "";
    
    fileInput.onchange = function() {
        if(this.files && this.files[0]) processImage(this.files[0]);
    };
}

function processImage(file) {
    // Efek Loading
    dropZone.onclick = null; 
    statusContent.innerHTML = `
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
                // Tampilkan Canvas
                dropZone.classList.add('no-border');
                dropZone.innerHTML = ""; // Bersihkan overlay untuk Canvas
                
                const canvas = document.createElement('canvas');
                dropZone.appendChild(canvas);

                generatorInstance = new Generator(canvas, { width: 1080, height: 1080 });
                generatorInstance.setUserImage(userImg);
                generatorInstance.setOverlayImage(overlayImg);

                // Tampilkan Tombol
                renderButtons();
            };
        };
    };
    reader.readAsDataURL(file);
}

function renderButtons() {
    uiGroup.style.display = 'flex';
    uiGroup.innerHTML = "";

    const btnDl = document.createElement('button');
    btnDl.className = 'btn-download';
    btnDl.innerHTML = `<i data-lucide="download"></i> ${config.messages.buttons.download}`;
    btnDl.onclick = () => {
        const link = document.createElement('a');
        link.download = config.profilePictureName || 'result.png';
        link.href = generatorInstance.render();
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
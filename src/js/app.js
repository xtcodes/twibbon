let config;
let generatorInstance;

// Ambil elemen yang sudah ada di HTML
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const statusContainer = document.getElementById('status-container');
const statusText = document.getElementById('status-text');
const uiGroup = document.getElementById('ui-group');
const btnDl = document.getElementById('btn-dl');
const btnRe = document.getElementById('btn-re');

document.addEventListener('DOMContentLoaded', () => {
    fetch('config/config.json')
        .then(res => res.json())
        .then(json => {
            config = json;
            document.getElementById('title-text').textContent = config.appTitle;
            document.getElementById('subtitle-text').textContent = config.appSubtitle;
            statusText.textContent = config.messages.status.startup;
            document.getElementById('text-dl').textContent = config.messages.buttons.download;
            document.getElementById('text-re').textContent = config.messages.buttons.newImage;
            lucide.createIcons();
        })
        .catch(err => console.error("Config Error:", err));
});

dropZone.onclick = () => fileInput.click();

fileInput.onchange = function(e) {
    if (this.files && this.files[0]) {
        processImage(this.files[0]);
    }
};

function processImage(file) {
    // Tampilkan loader
    statusContainer.innerHTML = `
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
                // Bersihkan isi dropZone dan pasang canvas
                dropZone.innerHTML = "";
                dropZone.classList.add('no-border');
                
                const canvas = document.createElement('canvas');
                canvas.oncontextmenu = (ev) => ev.preventDefault(); // Matikan klik kanan biar gak ganggu drag
                dropZone.appendChild(canvas);

                // Inisialisasi generator
                generatorInstance = new Generator(canvas, { width: 1080, height: 1080 });
                generatorInstance.setUserImage(userImg);
                generatorInstance.setOverlayImage(overlayImg);

                // Tampilkan tombol
                uiGroup.style.display = 'flex';
            };
        };
    };
    reader.readAsDataURL(file);
}

btnDl.onclick = () => {
    const link = document.createElement('a');
    link.download = config.profilePictureName || 'twibbon.png';
    link.href = generatorInstance.render();
    link.click();
};

btnRe.onclick = () => {
    // Reset ke kondisi awal tanpa reload halaman (cepat & stabil)
    location.reload(); 
};
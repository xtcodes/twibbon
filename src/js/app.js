let config;
let generatorInstance;

// Target elemen statis dari HTML
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
            
            // Masukkan teks dari config ke elemen yang sudah tersedia
            titleText.textContent = config.appTitle;
            subtitleText.textContent = config.appSubtitle;
            startupMsg.textContent = config.messages.status.startup;
            
            lucide.createIcons();
            initAppLogic();
        })
        .catch(err => console.error("Gagal memuat config:", err));
});

function initAppLogic() {
    // Kembalikan ke tampilan startup tanpa 'flicker' layout
    dropZone.classList.remove('no-border');
    dropZone.innerHTML = `
        <div class="status-overlay">
            <i data-lucide="image-plus"></i>
            <span>${config.messages.status.startup}</span>
        </div>
    `;
    lucide.createIcons();
    
    uiGroup.style.display = 'none';
    uiGroup.innerHTML = "";
    
    dropZone.onclick = () => fileInput.click();
    fileInput.onchange = function() {
        if(this.files && this.files[0]) processImage(this.files[0]);
    };
}

function processImage(file) {
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
                dropZone.classList.add('no-border');
                dropZone.innerHTML = "";
                
                const canvas = document.createElement('canvas');
                dropZone.appendChild(canvas);

                // Jalankan Generator (Sangat enteng karena CSS statis)
                generatorInstance = new Generator(canvas, { width: 1080, height: 1080 });
                generatorInstance.setUserImage(userImg);
                generatorInstance.setOverlayImage(overlayImg);

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
                btnRe.onclick = () => initAppLogic(); 

                uiGroup.appendChild(btnDl);
                uiGroup.appendChild(btnRe);
                lucide.createIcons();
            };
        };
    };
    reader.readAsDataURL(file);
}
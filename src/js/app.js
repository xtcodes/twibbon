let config;

addEventListener('load', function() {  
    fetch('config/config.json')
        .then(res => res.json())
        .then(json => {
            config = json;
            document.getElementById('main-title').textContent = config.appTitle;
            initApp();
        });
});

function initApp() {
    const container = document.getElementById('dynamic-content');
    const subMsg = document.getElementById('sub-msg');
    
    subMsg.textContent = config.messages.status.startup;
    container.innerHTML = "";

    const dropArea = document.createElement('div');
    dropArea.className = 'drop-area-square';
    dropArea.id = 'drop-zone';
    
    dropArea.innerHTML = `
        <div class="status-overlay" id="status-ui">
            <i data-lucide="image-plus"></i>
            <span>${config.messages.status.startup}</span>
        </div>
    `;
    container.appendChild(dropArea);

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    container.appendChild(fileInput);

    const btnGroup = document.createElement('div');
    btnGroup.className = 'btn-group';
    btnGroup.id = 'ui-group';
    btnGroup.style.display = 'none';
    container.appendChild(btnGroup);

    lucide.createIcons();
    
    // Aktifkan klik hanya di awal
    dropArea.onclick = () => fileInput.click();

    fileInput.onchange = function() {
        if(this.files && this.files[0]) processImage(this.files[0]);
    };

    function processImage(file) {
        const statusUI = document.getElementById('status-ui');
        const uiGroup = document.getElementById('ui-group');
        const subMsg = document.getElementById('sub-msg');
        const zone = document.getElementById('drop-zone');

        subMsg.textContent = config.messages.status.processing;
        statusUI.innerHTML = `
            <i data-lucide="loader-2" class="spinning"></i>
            <span>${config.messages.status.processing}</span>
        `;
        lucide.createIcons();

        setTimeout(() => {
            const overlayImg = new Image();
            overlayImg.src = config.overlaySource;

            overlayImg.onload = () => {
                const userImg = new Image();
                userImg.src = URL.createObjectURL(file);

                userImg.onload = () => {
                    const gen = new Generator({
                        width: overlayImg.width,
                        height: overlayImg.height
                    });

                    gen.addLayer(userImg);
                    gen.addLayer(overlayImg, { isOverlay: true });
                    const result = gen.render();

                    // 1. Matikan fungsi klik pada area gambar (PENTING)
                    zone.onclick = null; 
                    zone.style.cursor = 'default';
                    
                    // 2. Hilangkan border & tampilkan hasil
                    zone.classList.add('no-border'); 
                    zone.innerHTML = `<img src="${result}" class="preview-img">`;
                    
                    subMsg.textContent = config.messages.status.done;
                    uiGroup.innerHTML = "";
                    uiGroup.style.display = 'flex';

                    // Tombol Download
                    const btnDl = document.createElement('button');
                    btnDl.className = 'btn-download';
                    btnDl.innerHTML = `<i data-lucide="download"></i> ${config.messages.buttons.download}`;
                    btnDl.onclick = () => {
                        const a = document.createElement('a');
                        a.href = result; a.download = config.profilePictureName; a.click();
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
        }, 300);
    }
}
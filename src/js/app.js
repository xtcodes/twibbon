let config;

addEventListener('load', function() {  
    fetch('config/config.json')
        .then(res => res.json())
        .then(json => {
            config = json;
            initApp();
        });
});

function initApp() {
    const container = document.getElementById('dynamic-content');
    const subMsg = document.getElementById('sub-msg');
    
    subMsg.textContent = "Silakan pilih foto profil";
    container.innerHTML = "";

    const dropArea = document.createElement('div');
    dropArea.className = 'drop-area-square';
    dropArea.id = 'drop-zone';
    
    // Status Startup di Tengah Drop Area
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

    dropArea.onclick = () => fileInput.click();

    fileInput.onchange = function() {
        if(this.files && this.files[0]) processImage(this.files[0]);
    };

    function processImage(file) {
        const statusUI = document.getElementById('status-ui');
        const uiGroup = document.getElementById('ui-group');
        const zone = document.getElementById('drop-zone');
        const subMsg = document.getElementById('sub-msg');

        // Render Spinner di Tengah
        statusUI.innerHTML = `
            <i data-lucide="loader-2" class="spinning"></i>
            <span>${config.messages.status.processing}</span>
        `;
        lucide.createIcons();

        // Trik requestAnimationFrame + setTimeout biar spinner nggak beku
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
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

                            // Hasil Final
                            zone.innerHTML = `<img src="${result}" class="preview-img">`;
                            subMsg.textContent = config.messages.status.done;
                            
                            uiGroup.innerHTML = "";
                            uiGroup.style.display = 'flex';

                            const btnDl = document.createElement('button');
                            btnDl.className = 'btn-download';
                            btnDl.innerHTML = `<i data-lucide="download"></i> ${config.messages.buttons.download}`;
                            btnDl.onclick = () => {
                                const a = document.createElement('a');
                                a.href = result; a.download = config.profilePictureName; a.click();
                            };

                            const btnRe = document.createElement('button');
                            btnRe.className = 'btn-reset';
                            btnRe.innerHTML = `<i data-lucide="refresh-cw"></i> ${config.messages.buttons.newImage}`;
                            btnRe.onclick = () => initApp(); 

                            uiGroup.appendChild(btnDl);
                            uiGroup.appendChild(btnRe);
                            lucide.createIcons();
                        };
                    };
                }, 100); // Jeda 100ms agar UI sempat update animasi
            });
        });
    }
}
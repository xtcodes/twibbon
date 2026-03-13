let config;
let genInstance;

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

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';

    const btnGroup = document.createElement('div');
    btnGroup.className = 'btn-group';
    btnGroup.id = 'ui-group';
    btnGroup.style.display = 'none';

    container.appendChild(dropArea);
    container.appendChild(fileInput);
    container.appendChild(btnGroup);

    lucide.createIcons();

    // Aktifkan klik upload di awal
    dropArea.onclick = () => fileInput.click();

    fileInput.onchange = function() {
        if(this.files && this.files[0]) processImage(this.files[0]);
    };

    function processImage(file) {
        const zone = document.getElementById('drop-zone');
        const uiGroup = document.getElementById('ui-group');
        const statusUI = document.getElementById('status-ui');

        // MATIKAN KLIK DROP AREA (Cegah dobel upload)
        zone.onclick = null; 
        
        subMsg.textContent = config.messages.status.processing;
        statusUI.innerHTML = `<i data-lucide="loader-2" class="spinning"></i><span>${config.messages.status.processing}</span>`;
        lucide.createIcons();

        const reader = new FileReader();
        reader.onload = (e) => {
            const userImg = new Image();
            userImg.src = e.target.result;
            userImg.onload = () => {
                const overlayImg = new Image();
                overlayImg.src = config.overlaySource;
                overlayImg.onload = () => {
                    // Masuk ke mode interaktif
                    zone.classList.add('no-border');
                    zone.innerHTML = "";
                    const canvas = document.createElement('canvas');
                    zone.appendChild(canvas);

                    genInstance = new Generator(canvas);
                    genInstance.setUserImage(userImg);
                    genInstance.setOverlayImage(overlayImg);

                    subMsg.textContent = config.messages.status.done;
                    uiGroup.style.display = 'flex';
                    uiGroup.innerHTML = "";

                    // Tombol Unduh
                    const btnDl = document.createElement('button');
                    btnDl.className = 'btn-download';
                    btnDl.innerHTML = `<i data-lucide="download"></i> ${config.messages.buttons.download}`;
                    btnDl.onclick = () => {
                        const link = document.createElement('a');
                        link.download = config.profilePictureName || "twibbon.png";
                        link.href = genInstance.render();
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
}
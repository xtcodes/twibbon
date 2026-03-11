let config;

addEventListener('load', function() {  
    const request = new Request('config/config.json');
  
    fetch(request)
        .then(response => {
            if(response.status == 200) {
                return response.json();
            } else {
                throw new Error("Could not fetch config from server!");
            }
        }).then(json => {
            config = json;
            generateElements();
        }).catch(error => {
            console.error(error);
        });
});

function generateElements() {
    // 1. Bersihkan Root (Reset ke Beranda)
    var mainElement = document.getElementById(config.rootElementId);
    mainElement.innerHTML = "";
    
    // 2. Status Tampilan Awal
    let statusElement = document.createElement('div');
    statusElement.className = 'status-msg';
    statusElement.id = 'status-display';
    statusElement.textContent = config.messages.status.startup;
    mainElement.appendChild(statusElement);

    // 3. Drop Area 1x1 Kotak Sempurna
    let dropArea = document.createElement('div');
    dropArea.className = 'drop-area-square';
    dropArea.id = 'drop-zone';
    dropArea.innerHTML = `
        <div class="placeholder-content">
            <i data-lucide="image-plus"></i>
            <span>Klik atau Seret Foto</span>
        </div>
    `;
    mainElement.appendChild(dropArea);

    // 4. Input File Tersembunyi
    let fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.id = 'user-file-input';
    fileInput.style.display = 'none'; 
    mainElement.appendChild(fileInput);
    
    // 5. Kontainer Tombol (Kosong di awal)
    let btnGroup = document.createElement('div');
    btnGroup.className = 'btn-group';
    btnGroup.id = 'btn-group-ui';
    btnGroup.style.display = 'none';
    mainElement.appendChild(btnGroup);

    // Render Icon Lucide
    lucide.createIcons();

    // Event Klik Box
    dropArea.onclick = () => fileInput.click();

    fileInput.addEventListener('change', function() {
        if(this.files && this.files[0]) processImage(this.files[0]);
    });

    function processImage(file) {
        const statusDisplay = document.getElementById('status-display');
        const zone = document.getElementById('drop-zone');
        const uiGroup = document.getElementById('btn-group-ui');

        statusDisplay.textContent = config.messages.status.uploading;
        
        const overlayImg = new Image();
        overlayImg.src = config.overlaySource;

        overlayImg.onload = function() {
            const userImg = new Image();
            userImg.src = URL.createObjectURL(file);

            userImg.onload = function() {
                statusDisplay.textContent = config.messages.status.processing;
                
                const gen = new Generator({
                    width: overlayImg.width,
                    height: overlayImg.height
                });

                gen.addLayer(userImg); 
                gen.addLayer(overlayImg, { isOverlay: true });
                
                const result = gen.render();

                // Tampilkan Hasil di Kotak 1x1
                zone.innerHTML = `<img src="${result}" class="preview-img">`;
                statusDisplay.textContent = config.messages.status.done;

                // Render Tombol (Unduh & Buat Lagi)
                uiGroup.innerHTML = ""; // Pastikan bersih
                uiGroup.style.display = 'flex';

                // Tombol Unduh
                let btnDl = document.createElement('button');
                btnDl.className = 'btn-download';
                btnDl.innerHTML = `<i data-lucide="download"></i> ${config.messages.buttons.download}`;
                btnDl.onclick = () => {
                    const a = document.createElement('a');
                    a.href = result;
                    a.download = config.profilePictureName;
                    a.click();
                };

                // Tombol Buat Lagi (Balik ke Beranda Sesuai Request)
                let btnRe = document.createElement('button');
                btnRe.className = 'btn-reset';
                btnRe.innerHTML = `<i data-lucide="refresh-cw"></i> ${config.messages.buttons.newImage}`;
                btnRe.onclick = () => {
                    generateElements(); // Panggil ulang fungsi utama untuk reset total
                };

                uiGroup.appendChild(btnDl);
                uiGroup.appendChild(btnRe);
                lucide.createIcons();
            };
        };
    }
}
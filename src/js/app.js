let config;
let generatorInstance;

addEventListener('load', function() {  
    fetch('config/config.json')
        .then(res => res.json())
        .then(json => {
            config = json;
            // Menghapus baris pemanggilan main-title karena sudah tidak ada di HTML
            initApp();
        })
        .catch(err => console.error("Gagal memuat config:", err));
});

function initApp() {
    // Menggunakan rootElementId dari config.json jika diperlukan, 
    // namun di sini kita langsung target dynamic-content di dalam root tersebut
    const container = document.getElementById('dynamic-content');
    container.innerHTML = "";

    // Buat elemen Drop Area
    const dropArea = document.createElement('div');
    dropArea.className = 'drop-area-square';
    dropArea.id = 'drop-zone';
    
    // Pesan startup hanya muncul di sini (Drop Area)
    dropArea.innerHTML = `
        <div class="status-overlay" id="status-ui">
            <i data-lucide="image-plus"></i>
            <span>${config.messages.status.startup}</span>
        </div>
    `;

    // Input file tersembunyi
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

    dropArea.onclick = () => fileInput.click();

    fileInput.onchange = function() {
        if(this.files && this.files[0]) {
            processImage(this.files[0]);
        }
    };

    function processImage(file) {
        const zone = document.getElementById('drop-zone');
        const uiGroup = document.getElementById('ui-group');

        // Ganti pesan di dalam drop zone saat memproses (opsional)
        zone.onclick = null; 
        zone.innerHTML = `<div class="status-overlay"><span>${config.messages.status.processing}</span></div>`;

        const reader = new FileReader();
        reader.onload = (e) => {
            const userImg = new Image();
            userImg.src = e.target.result;

            userImg.onload = () => {
                const overlayImg = new Image();
                overlayImg.src = config.overlaySource;

                overlayImg.onload = () => {
                    // Siapkan Canvas
                    zone.classList.add('no-border');
                    zone.innerHTML = "";
                    const canvas = document.createElement('canvas');
                    zone.appendChild(canvas);

                    // Jalankan Generator Interaktif
                    generatorInstance = new Generator(canvas, { width: 1080, height: 1080 });
                    generatorInstance.setUserImage(userImg);
                    generatorInstance.setOverlayImage(overlayImg);

                    // Tampilkan Tombol Kontrol
                    uiGroup.style.display = 'flex';
                    uiGroup.innerHTML = "";

                    // Tombol Unduh
                    const btnDl = document.createElement('button');
                    btnDl.className = 'btn-download';
                    btnDl.innerHTML = `<i data-lucide="download"></i> ${config.messages.buttons.download}`;
                    btnDl.onclick = () => {
                        const link = document.createElement('a');
                        link.download = config.profilePictureName || "twibbon.png";
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
}
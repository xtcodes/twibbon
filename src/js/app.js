let config;
let isGenerated = false;

addEventListener('load', function() {  
    fetch('config/config.json')
        .then(res => res.json())
        .then(json => {
            config = json;
            initApp();
        });
});

function initApp() {
    const main = document.getElementById(config.rootElementId);
    main.innerHTML = ""; // Clear total
    
    // Status
    const status = document.createElement('div');
    status.className = 'status-msg';
    status.id = 'app-status';
    status.textContent = config.messages.status.startup;
    main.appendChild(status);

    // Canvas/Box Area
    const box = document.createElement('div');
    box.className = 'box-1x1';
    box.id = 'drop-area';
    box.innerHTML = `<div class="placeholder-text"><i data-lucide="image-plus"></i>Ketuk untuk pilih foto</div>`;
    main.appendChild(box);

    // Input File (Hidden)
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    main.appendChild(input);

    // Container Tombol (Biar gak dobel, kita buat satu kali di sini tapi sembunyiin dulu)
    const btnGroup = document.createElement('div');
    btnGroup.className = 'btn-group';
    btnGroup.id = 'btn-container';
    btnGroup.style.display = 'none'; 
    main.appendChild(btnGroup);

    lucide.createIcons();

    // Trigger
    box.onclick = () => input.click();

    input.onchange = function() {
        if(this.files && this.files[0]) {
            handleProcess(this.files[0]);
        }
    };
}

function handleProcess(file) {
    const status = document.getElementById('app-status');
    const box = document.getElementById('drop-area');
    const btnContainer = document.getElementById('btn-container');
    
    status.textContent = config.messages.status.processing;

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
            
            // Update Tampilan (Auto-Replace)
            box.innerHTML = `<img src="${result}">`;
            status.textContent = config.messages.status.done;

            // Render Tombol HANYA jika belum ada
            if (btnContainer.innerHTML === "") {
                btnContainer.style.display = 'flex';
                
                const btnDl = document.createElement('button');
                btnDl.className = 'btn-download';
                btnDl.innerHTML = `<i data-lucide="download"></i> Unduh`;
                btnDl.onclick = () => {
                    const a = document.createElement('a');
                    a.href = result;
                    a.download = config.profilePictureName;
                    a.click();
                };

                const btnRe = document.createElement('button');
                btnRe.className = 'btn-reset';
                btnRe.innerHTML = `<i data-lucide="refresh-cw"></i> Ganti Foto`;
                btnRe.onclick = () => document.querySelector('input[type="file"]').click();

                btnContainer.appendChild(btnDl);
                btnContainer.appendChild(btnRe);
                lucide.createIcons();
            } else {
                // Jika tombol sudah ada, cukup update fungsi download-nya ke gambar baru
                const dlBtn = btnContainer.querySelector('.btn-download');
                dlBtn.onclick = () => {
                    const a = document.createElement('a');
                    a.href = result;
                    a.download = config.profilePictureName;
                    a.click();
                };
            }
        };
    };
}
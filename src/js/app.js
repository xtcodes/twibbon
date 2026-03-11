let config;

addEventListener('load', function() {  
    fetch('config/config.json')
        .then(res => res.json())
        .then(json => {
            config = json;
            generateElements();
        });
});

function generateElements() {
    const mainElement = document.getElementById('app');
    mainElement.innerHTML = `<h1>Twibbon Generator</h1>`;
    
    const statusElement = document.createElement('p');
    statusElement.className = 'status-text';
    statusElement.textContent = config.messages.status.startup;
    mainElement.appendChild(statusElement);

    // Drop Area 1:1
    const dropArea = document.createElement('div');
    dropArea.className = 'drop-area';
    dropArea.innerHTML = `<div><b>Klik/Seret Foto</b><br><small>Format: JPG, PNG, WEBP</small></div>`;
    mainElement.appendChild(dropArea);

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    mainElement.appendChild(fileInput);

    // Event Listeners
    dropArea.onclick = () => fileInput.click();
    
    ['dragover', 'dragenter'].forEach(e => {
        dropArea.addEventListener(e, (ev) => { ev.preventDefault(); dropArea.classList.add('active'); });
    });
    ['dragleave', 'drop'].forEach(e => {
        dropArea.addEventListener(e, (ev) => { ev.preventDefault(); dropArea.classList.remove('active'); });
    });

    dropArea.addEventListener('drop', (e) => {
        if(e.dataTransfer.files.length) handleUpload(e.dataTransfer.files[0]);
    });

    fileInput.onchange = (e) => {
        if(e.target.files.length) handleUpload(e.target.files[0]);
    };

    function handleUpload(file) {
        statusElement.textContent = config.messages.status.uploading;
        
        const overlayImg = new Image();
        overlayImg.src = config.overlaySource;

        overlayImg.onload = () => {
            const userImg = new Image();
            userImg.src = URL.createObjectURL(file);

            userImg.onload = () => {
                statusElement.textContent = config.messages.status.processing;
                
                const gen = new Generator({
                    width: overlayImg.width,
                    height: overlayImg.height
                });

                gen.addLayer(userImg); 
                gen.addLayer(overlayImg, { isOverlay: true });

                const result = gen.render();
                
                // Ganti Drop Area dengan Preview Hasil
                dropArea.innerHTML = `<img src="${result}">`;
                statusElement.textContent = config.messages.status.done;

                // Tombol
                const btnGroup = document.createElement('div');
                btnGroup.className = 'button-group';
                
                const dlBtn = document.createElement('button');
                dlBtn.className = 'btn-download';
                dlBtn.innerText = config.messages.buttons.download;
                dlBtn.onclick = () => {
                    const a = document.createElement('a');
                    a.href = result;
                    a.download = config.profilePictureName;
                    a.click();
                };

                const reBtn = document.createElement('button');
                reBtn.className = 'btn-reset';
                reBtn.innerText = config.messages.buttons.newImage;
                reBtn.onclick = () => generateElements();

                btnGroup.appendChild(dlBtn);
                btnGroup.appendChild(reBtn);
                mainElement.appendChild(btnGroup);
            };
        };
    }
}
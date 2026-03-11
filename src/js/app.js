let config;

addEventListener('load', function() {  
    fetch('config/config.json')
        .then(res => res.status === 200 ? res.json() : Promise.reject())
        .then(json => {
            config = json;
            generateElements();
        }).catch(err => console.error("Config missing"));
});

function generateElements() {
    const mainElement = document.getElementById(config.rootElementId);
    if(!mainElement) return;
    mainElement.innerHTML = "";
    
    let statusElement = document.createElement('p');
    statusElement.className = 'status-text';
    statusElement.textContent = config.messages.status.startup;
    mainElement.appendChild(statusElement);

    let dropArea = document.createElement('div');
    dropArea.className = 'drop-area-square';
    dropArea.innerHTML = `<div class="drop-content"><i data-lucide="image-plus"></i><span>Pilih Foto</span></div>`;
    mainElement.appendChild(dropArea);
    lucide.createIcons();

    let fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none'; 
    mainElement.appendChild(fileInput);
    
    let overlayImg = new Image();
    overlayImg.src = config.overlaySource;

    dropArea.onclick = () => fileInput.click();

    fileInput.onchange = function() {
        if(this.files && this.files[0]) {
            const file = this.files[0];
            statusElement.textContent = config.messages.status.uploading;
            
            let userImg = new Image();
            userImg.src = URL.createObjectURL(file);
            
            userImg.onload = function() {
                statusElement.textContent = config.messages.status.processing;
                
                const gen = new Generator({
                    width: overlayImg.width,
                    height: overlayImg.height
                });
                
                gen.addLayer(userImg); 
                gen.addLayer(overlayImg, { isOverlay: true });
                
                let resultData = gen.render();

                dropArea.innerHTML = "";
                dropArea.style.border = "none";
                
                let finalPreview = document.createElement('img');
                finalPreview.src = resultData;
                finalPreview.className = 'preview-img';
                dropArea.appendChild(finalPreview);

                statusElement.textContent = config.messages.status.done;

                let btnGroup = document.createElement('div');
                btnGroup.className = 'button-group';
                
                let btnDown = document.createElement('button');
                btnDown.className = 'btn-download';
                btnDown.innerHTML = `<i data-lucide="download"></i> Unduh`;
                btnDown.onclick = function() {
                    const a = document.createElement('a');
                    a.href = resultData;
                    a.download = config.profilePictureName;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                };
                
                let btnReset = document.createElement('button');
                btnReset.className = 'btn-reset';
                btnReset.innerHTML = `<i data-lucide="refresh-cw"></i> Ulangi`;
                btnReset.onclick = () => generateElements();

                btnGroup.appendChild(btnDown);
                btnGroup.appendChild(btnReset);
                mainElement.appendChild(btnGroup);
                
                lucide.createIcons();
            };
        }
    };
}
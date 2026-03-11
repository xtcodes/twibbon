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
            console.log(error);
        });
});

function generateElements() {
    // 1. Ambil Root Element
    var mainElement = document.getElementById(config.rootElementId);
    mainElement.innerHTML = "";
    
    // 2. Status Text
    let statusElement = document.createElement('p');
    statusElement.className = 'status-text';
    statusElement.textContent = config.messages.status.startup;
    mainElement.appendChild(statusElement);

    // 3. Drop Area Square 1:1
    let dropArea = document.createElement('div');
    dropArea.className = 'drop-area-square';
    dropArea.innerHTML = `
        <div class="drop-content">
            <span class="icon">📸</span>
            <span class="label">Klik atau Seret Foto Ke Sini</span>
        </div>
    `;
    mainElement.appendChild(dropArea);

    // 4. Input File Tersembunyi
    let fileUploadElement = document.createElement('input');
    fileUploadElement.type = 'file';
    fileUploadElement.accept = 'image/*';
    fileUploadElement.style.display = 'none'; 
    mainElement.appendChild(fileUploadElement);
    
    // 5. Preload Overlay (Twibbon)
    let overlayImageElement = new Image();
    overlayImageElement.src = config.overlaySource;
    overlayImageElement.style.display = 'none';
    mainElement.appendChild(overlayImageElement);

    // --- LOGIKA INTERAKSI ---

    dropArea.onclick = () => fileUploadElement.click();

    ['dragenter', 'dragover'].forEach(name => {
        dropArea.addEventListener(name, (e) => {
            e.preventDefault();
            dropArea.classList.add('active');
        });
    });
    ['dragleave', 'drop'].forEach(name => {
        dropArea.addEventListener(name, (e) => {
            e.preventDefault();
            dropArea.classList.remove('active');
        });
    });

    dropArea.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if(files.length) processImage(files[0]);
    });

    fileUploadElement.addEventListener('change', function() {
        if(this.files && this.files[0]) processImage(this.files[0]);
    });

    function processImage(file) {
        statusElement.textContent = config.messages.status.uploading;
        
        let uploadedImage = document.createElement('img');
        uploadedImage.src = URL.createObjectURL(file);
        
        uploadedImage.onload = function() {
            statusElement.textContent = config.messages.status.processing;
            
            // Setup Generator dengan resolusi asli twibbon
            let setupOptions = {
                width: overlayImageElement.width,
                height: overlayImageElement.height
            }
            const generator = new Generator(setupOptions);
            
            // Render Layer (Logic Auto-Crop)
            generator.addLayer(uploadedImage); 
            generator.addLayer(overlayImageElement, { isOverlay: true });
            
            // Render ke Data URL
            let resultData = generator.render();

            // UPDATE UI: Ganti isi drop area dengan hasil
            dropArea.innerHTML = "";
            dropArea.style.border = "none";
            
            let finalPreview = document.createElement('img');
            finalPreview.src = resultData;
            finalPreview.className = 'preview-img';
            dropArea.appendChild(finalPreview);

            statusElement.textContent = config.messages.status.done;

            // Tombol Kontrol
            let buttonContainer = document.createElement('div');
            buttonContainer.className = 'button-group';
            
            let downloadButtonElement = document.createElement('button');
            downloadButtonElement.className = 'btn-download';
            downloadButtonElement.innerText = config.messages.buttons.download;
            downloadButtonElement.onclick = function() {
                const link = document.createElement('a');
                link.href = resultData;
                link.download = config.profilePictureName;
                link.click();
            };
            
            let renewFormElement = document.createElement('button');
            renewFormElement.className = 'btn-reset';
            renewFormElement.innerText = config.messages.buttons.newImage;
            renewFormElement.onclick = function(){
                generateElements();
            };

            buttonContainer.appendChild(downloadButtonElement);
            buttonContainer.appendChild(renewFormElement);
            mainElement.appendChild(buttonContainer);
        };
    }
}
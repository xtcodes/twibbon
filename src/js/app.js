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
    // 1. Bersihkan struktur DOM utama
    var mainElement = document.getElementById(config.rootElementId);
    mainElement.innerHTML = "";
    
    // 2. Status Element
    let statusElement = document.createElement('p');
    statusElement.className = 'status-text';
    statusElement.textContent = config.messages.status.startup;
    mainElement.appendChild(statusElement);

    // 3. Container Drop Area 1x1 (Biar Responsive & Gak Luber)
    let canvasContainer = document.createElement('div');
    canvasContainer.className = 'canvas-container';
    canvasContainer.innerHTML = '<span>Klik atau Seret Foto Profil ke Sini</span>';
    mainElement.appendChild(canvasContainer);

    // 4. Input file (Hidden)
    let fileUploadElement = document.createElement('input');
    fileUploadElement.type = 'file';
    fileUploadElement.accept = 'image/*';
    fileUploadElement.style.display = 'none'; 
    mainElement.appendChild(fileUploadElement);
    
    // 5. Overlay Image (Twibbon)
    let overlayImageElement = new Image();
    overlayImageElement.src = config.overlaySource;
    overlayImageElement.style.display = 'none';
    mainElement.appendChild(overlayImageElement);

    // --- INTERAKSI ---

    // Klik kotak untuk pilih file
    canvasContainer.onclick = () => fileUploadElement.click();

    // Drag & Drop visual effect
    ['dragenter', 'dragover'].forEach(name => {
        canvasContainer.addEventListener(name, (e) => {
            e.preventDefault();
            canvasContainer.classList.add('active');
        });
    });
    ['dragleave', 'drop'].forEach(name => {
        canvasContainer.addEventListener(name, (e) => {
            e.preventDefault();
            canvasContainer.classList.remove('active');
        });
    });

    // Handle File dari Drop
    canvasContainer.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if(files.length) {
            processImage(files[0]);
        }
    });

    // Handle File dari Input Klik
    fileUploadElement.addEventListener('change', function() {
        if(this.files && this.files[0]) {
            processImage(this.files[0]);
        }
    });

    // 6. Fungsi Pemrosesan Gambar
    function processImage(file) {
        statusElement.textContent = config.messages.status.uploading;
        
        let uploadedImage = document.createElement('img');
        uploadedImage.src = URL.createObjectURL(file);
        
        uploadedImage.addEventListener('load', function() {
            statusElement.textContent = config.messages.status.processing;
            
            // Setup generator berdasarkan ukuran twibbon asli
            let setupOptions = {
                width: overlayImageElement.width,
                height: overlayImageElement.height
            }
            const generator = new Generator(setupOptions);
            
            // Tambahkan layer (Gunakan class Generator dengan logic sX, sY untuk crop)
            generator.addLayer(uploadedImage); 
            generator.addLayer(overlayImageElement, { isOverlay: true });
            
            // Bersihkan tampilan kotak untuk hasil
            canvasContainer.innerHTML = "";
            canvasContainer.style.border = "none";
            
            // Tampilkan hasil preview (Responsive 100% dari container)
            let resultData = generator.render();
            let finalPreview = document.createElement('img');
            finalPreview.src = resultData;
            finalPreview.className = 'result-preview';
            canvasContainer.appendChild(finalPreview);

            statusElement.textContent = config.messages.status.done;

            // 7. Tombol Berdampingan
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
        });
    }
}
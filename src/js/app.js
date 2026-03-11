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

    // 3. Create Drop Area (Box 1:1 Modern)
    let dropArea = document.createElement('div');
    dropArea.className = 'drop-area';
    dropArea.innerHTML = `
        <div class="upload-icon">📸</div>
        <span>Klik atau Seret Foto ke Sini</span>
    `;
    mainElement.appendChild(dropArea);

    // 4. Input file (Hidden, dipicu lewat drop area)
    let fileUploadElement = document.createElement('input');
    fileUploadElement.type = 'file';
    fileUploadElement.accept = 'image/*';
    fileUploadElement.style.display = 'none'; // Sembunyiin input jadul
    mainElement.appendChild(fileUploadElement);
    
    // 5. Overlay Image (Twibbon)
    let overlayImageElement = new Image();
    overlayImageElement.src = config.overlaySource;
    overlayImageElement.style.display = 'none';
    mainElement.appendChild(overlayImageElement);

    // --- LOGIKA INTERAKSI ---

    // Klik kotak untuk pilih file
    dropArea.addEventListener('click', () => fileUploadElement.click());

    // Drag & Drop visual effect
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

    // Handle File dari Drop
    dropArea.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if(files.length) {
            fileUploadElement.files = files;
            processImage(files[0]);
        }
    });

    // Handle File dari Input Klik
    fileUploadElement.addEventListener('change', function() {
        if(this.files && this.files[0]) {
            processImage(this.files[0]);
        }
    });

    // 6. Fungsi utama pemrosesan (Logika asli lu ada di sini)
    function processImage(file) {
        statusElement.textContent = config.messages.status.uploading;
        
        let uploadedImage = document.createElement('img');
        uploadedImage.src = URL.createObjectURL(file);
        
        uploadedImage.addEventListener('load', function() {
            statusElement.textContent = config.messages.status.processing;
            
            // Setup generator
            let setupOptions = {
                width: overlayImageElement.width,
                height: overlayImageElement.height
            }
            const generator = new Generator(setupOptions);
            
            // Tambahkan layer (Gunakan class Generator yang auto-crop kemarin)
            generator.addLayer(uploadedImage); 
            generator.addLayer(overlayImageElement, { isOverlay: true });
            
            // Bersihkan tampilan UI untuk hasil
            dropArea.remove();
            
            // Tampilkan hasil preview
            let downloadImageElement = document.createElement('img');
            downloadImageElement.src = generator.render();
            downloadImageElement.className = 'result-preview';
            mainElement.appendChild(downloadImageElement);

            statusElement.textContent = config.messages.status.done;

            // --- TOMBOL BERDAMPINGAN ---
            let buttonContainer = document.createElement('div');
            buttonContainer.className = 'button-group';
            
            let downloadButtonElement = document.createElement('button');
            downloadButtonElement.className = 'btn-download';
            downloadButtonElement.innerText = config.messages.buttons.download;
            downloadButtonElement.onclick = function() {
                const link = document.createElement('a');
                link.href = generator.render();
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
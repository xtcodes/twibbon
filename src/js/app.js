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
    var mainElement = document.getElementById(config.rootElementId);
    mainElement.innerHTML = "";
    
    let statusElement = document.createElement('p');
    statusElement.className = 'status-text';
    statusElement.textContent = config.messages.status.startup;
    mainElement.appendChild(statusElement);

    // Drop Area Square 1:1 dengan Font Icon Lucide
    let dropArea = document.createElement('div');
    dropArea.className = 'drop-area-square';
    dropArea.innerHTML = `
        <div class="drop-content">
            <i data-lucide="image-plus"></i>
            <span>Klik atau Seret Foto</span>
        </div>
    `;
    mainElement.appendChild(dropArea);
    lucide.createIcons(); // Re-render icons

    let fileUploadElement = document.createElement('input');
    fileUploadElement.type = 'file';
    fileUploadElement.accept = 'image/*';
    fileUploadElement.style.display = 'none'; 
    mainElement.appendChild(fileUploadElement);
    
    let overlayImageElement = new Image();
    overlayImageElement.src = config.overlaySource;

    // Interaction
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
            
            let setupOptions = {
                width: overlayImageElement.width,
                height: overlayImageElement.height
            }
            const generator = new Generator(setupOptions);
            
            // Render (Make sure Generator class handles cropping)
            generator.addLayer(uploadedImage); 
            generator.addLayer(overlayImageElement, { isOverlay: true });
            
            let resultData = generator.render();

            // Clear area for result preview
            dropArea.innerHTML = "";
            dropArea.style.border = "none";
            
            let finalPreview = document.createElement('img');
            finalPreview.src = resultData;
            finalPreview.className = 'preview-img';
            dropArea.appendChild(finalPreview);

            statusElement.textContent = config.messages.status.done;

            // BUTTON GROUP
            let buttonContainer = document.createElement('div');
            buttonContainer.className = 'button-group';
            
            // Tombol Unduh murni Button
            let downloadButtonElement = document.createElement('button');
            downloadButtonElement.className = 'btn-download';
            downloadButtonElement.innerHTML = `<i data-lucide="download"></i> ${config.messages.buttons.download}`;
            downloadButtonElement.onclick = function() {
                const link = document.createElement('a');
                link.href = resultData;
                link.download = config.profilePictureName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            };
            
            // Tombol Reset
            let renewFormElement = document.createElement('button');
            renewFormElement.className = 'btn-reset';
            renewFormElement.innerHTML = `<i data-lucide="refresh-cw"></i> ${config.messages.buttons.newImage}`;
            renewFormElement.onclick = function(){
                generateElements();
            };

            buttonContainer.appendChild(downloadButtonElement);
            buttonContainer.appendChild(renewFormElement);
            mainElement.appendChild(buttonContainer);
            
            lucide.createIcons(); // Re-render icons inside buttons
        };
    }
}
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
    // Bersihkan struktur DOM utama
    var mainElement = document.getElementById(config.rootElementId);
    mainElement.innerHTML = "";
    
    let statusElement = document.createElement('p');
    statusElement.textContent = config.messages.status.startup;
    mainElement.appendChild(statusElement);

    // Input file dengan atribut accept untuk gambar
    let fileUploadElement = document.createElement('input');
    fileUploadElement.type = 'file';
    fileUploadElement.accept = 'image/*'; // Menambahkan filter file gambar
    mainElement.appendChild(fileUploadElement);
    
    let overlayImageElement = new Image();
    overlayImageElement.src = config.overlaySource;
    overlayImageElement.style.display = 'none';
    mainElement.appendChild(overlayImageElement);
    
    fileUploadElement.addEventListener('change', function() {
        if(this.files && this.files[0]) {
            statusElement.textContent = config.messages.status.uploading;
            
            let uploadedImage = document.createElement('img');
            uploadedImage.src = URL.createObjectURL(this.files[0]);
            
            uploadedImage.addEventListener('load', function() {
                statusElement.textContent = config.messages.status.processing;
                
                // Setup generator
                let setupOptions = {
                    width: overlayImageElement.width,
                    height: overlayImageElement.height
                }
                const generator = new Generator(setupOptions);
                
                // Kalkulasi skala gambar profil
                let scale_width = setupOptions.width / uploadedImage.width;
                let scale_height = setupOptions.height / uploadedImage.height;
                let scale = Math.min(scale_width, scale_height);
    
                let renderOptions = {
                    offset: {
                        top: (setupOptions.height - (uploadedImage.height * scale)) / 2,
                        left: (setupOptions.width - (uploadedImage.width * scale)) / 2
                    },
                    scale: scale
                };

                // Tambahkan layer (Hanya foto profil dan overlay twibbon)
                generator.addLayer(uploadedImage, renderOptions);
                generator.addLayer(overlayImageElement, {});
                
                // Tampilkan hasil preview
                let downloadImageElement = document.createElement('img');
                downloadImageElement.src = generator.render();
                downloadImageElement.style.display = 'block';
                downloadImageElement.style.marginBottom = '10px';
                mainElement.appendChild(downloadImageElement);

                statusElement.textContent = config.messages.status.done;

                // --- BAGIAN TOMBOL BERDAMPINGAN ---
                let buttonContainer = document.createElement('div');
                buttonContainer.style.display = 'flex';
                buttonContainer.style.gap = '10px'; // Memberi jarak antar tombol
                
                // Tombol Unduh (diubah dari <a> ke <button> secara visual)
                let downloadButtonElement = document.createElement('button');
                downloadButtonElement.innerText = config.messages.buttons.download;
                downloadButtonElement.onclick = function() {
                    const link = document.createElement('a');
                    link.href = generator.render();
                    link.download = config.profilePictureName;
                    link.click();
                };
                
                // Tombol Ulangi/Baru
                let renewButtonElement = document.createElement('button');
                renewButtonElement.innerText = config.messages.buttons.newImage;
                renewButtonElement.onclick = function() {
                    generateElements();
                };

                // Masukkan ke dalam kontainer
                buttonContainer.appendChild(downloadButtonElement);
                buttonContainer.appendChild(renewButtonElement);
                
                // Hapus input file dan masukkan grup tombol
                mainElement.removeChild(fileUploadElement);
                mainElement.appendChild(buttonContainer);
            });
        }
    });
		}

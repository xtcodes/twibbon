document.getElementById("shared").addEventListener("click", () => {
alert("Bagikan Twibbon ini ke media sosial Anda?");

const dataUrl = preview.toDataURL(); 
fetch(dataUrl)
.then(res => res.blob())
.then(blob => {
//console.log(blob)
const filesArray = [new File([blob], 'image.png', { type: blob.type, lastModified: new Date().getTime() })];
console.log(filesArray);
const shareData = {
title: "FREE AND SIMPLE PFP GENERATOR",
text: "FREE AND SIMPLE PFP GENERATOR",
url: "https://badut.pages.dev/",
files: filesArray
};
console.log(shareData);
if (navigator.share) {
navigator.share(
shareData
)
.then(() => alert("Terima kasih telah berbagi.")) 
.catch(error => alert("Bagikan dibatalkan!", error)); 
} else {
alert('navigator.share not available'); 
}
})
});

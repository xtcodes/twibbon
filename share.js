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
title: "Twibbon Generator",
text: "This is a website where you can add photos to frames.",
url: "https://xtcodes.github.io/twibbon/",
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

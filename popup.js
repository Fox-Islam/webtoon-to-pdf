import './js2pdf.js';

const convertButton = document.getElementById("convert");
const errorMessage = document.getElementById("error-message");
const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
const port = chrome.tabs.connect(tab.id, { name: "connection" });

convertButton.addEventListener("click", () => {
    port.postMessage({ function: "getNaverWebtoonContent" });
});

port.onMessage.addListener(function (message) {
    if (!message) {
        return;
    }

    if (message.status === 200) {
        onReceiveContent(message.data);
        return;
    }

    if (message.status === 202) {
        convertButton.disabled = false;
        return;
    }

    setErrorMessage(message.data);
});

function setErrorMessage(message) {
    errorMessage.textContent = message;
}

async function onReceiveContent(content) {
    let title = content.title;
    let imageUrls = content.imageUrls;
    let doc = null;
    for (let imageUrl of imageUrls) {
        let image = await getDataUri(imageUrl);
        if (doc === null) {
            doc = new jspdf.jsPDF({
                format: [image.width + 6, image.height + 6],
                unit: "px"
            });
        } else {
            doc.addPage([image.width + 6, image.height + 6]);
        }
        doc.addImage(image.uri, 'PNG', 3, 3, image.width, image.height);
    }
    doc.save(title + '.pdf');
}

function getDataUri(url) {
    return new Promise(resolve => {
        const image = new Image();
        image.setAttribute('crossOrigin', 'anonymous');

        image.onload = function () {
            const canvas = document.createElement('canvas');
            canvas.width = this.naturalWidth;
            canvas.height = this.naturalHeight;

            const context = canvas.getContext('2d');
            context.fillStyle = '#fff';
            context.fillRect(0, 0, canvas.width, canvas.height);

            canvas.getContext('2d').drawImage(this, 0, 0);

            resolve({
                height: canvas.height,
                width: canvas.width,
                uri: canvas.toDataURL('image/jpeg')
            });
        };

        image.src = url;
    })
}

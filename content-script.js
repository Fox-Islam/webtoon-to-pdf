chrome.runtime.onConnect.addListener(function (port) {
    console.assert(port.name === "connection");
    port.postMessage({
        status: 202,
        data: "Connection established"
    });

    port.onMessage.addListener(function (message) {
        if (message.function === "getNaverWebtoonContent") {
            port.postMessage({
                status: 200,
                data: getNaverWebtoonContent()
            });
        }
    });
});

function getNaverWebtoonContent() {
    let images = document.getElementsByTagName('img');
    let title = document.getElementsByClassName('title')[0].textContent;
    let chapterTitle = document.getElementsByTagName('h3')[0].textContent;
    let imageUrls = [];
    for (index in images) {
        image = images[index];
        if (image.alt === "comic content") {
            imageUrls.push(image.src);
        }
    }
    return {
        title: title + ' - ' + chapterTitle,
        imageUrls: imageUrls
    }
}

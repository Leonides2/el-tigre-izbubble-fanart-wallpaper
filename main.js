
const headerTitle = document.getElementById("audio-title");
const headerArtist = document.getElementById("audio-artist");
const thumbnailImage = document.getElementById("thumbnail");

const canvas = document.querySelector('#layer-1');
const layer2 = document.querySelector('.layer-2');
const layer3 = document.querySelector('.layer-3');

let ctx = canvas.getContext("2d");

let max_height, startPos, vizWidth, midY;
let glob = { bloom: false, bloomRadius: 10 };
let backgroundColor = "rgb(153, 37, 1)";
let linesColor = "rgb(255, 255, 255)";
let square = true;


// Se define obtener el punto medio, del cual parte el movimiento de las capas
var windowXMidPoint = window.innerWidth / 2;
var windowYMidPoint = window.innerHeight / 2;

// Guardamos posicion del mouse
var mouseX = 0;
var mouseY = 0;

// Factor de movilidad respecto al punto de origen
var offsetFactor = 0.05;

// Pixeles maximos que se pueden mover el elemento respecto al origen (windowXMidPoint y windowYMidPoint)
var maxMovementOffset_X = window.innerWidth * offsetFactor;
var maxMovementOffset_Y = window.innerHeight * offsetFactor;

// Posicion del mouse respecto al punto de origen
var mouseXOffsetPosition = mouseX - windowXMidPoint;
var mouseYOffsetPosition = mouseY - windowYMidPoint;


function getMidPoint() {
    windowXMidPoint = window.innerWidth / 2;
    windowYMidPoint = window.innerHeight / 2;

    maxMovementOffset_X = window.innerWidth * offsetFactor;
    maxMovementOffset_Y = window.innerHeight * offsetFactor;
}

function getMousePosition(event) {
    mouseX = event.clientX;
    mouseY = event.clientY;

    mouseXOffsetPosition = mouseX - windowXMidPoint;
    mouseYOffsetPosition = mouseY - windowYMidPoint;

    console.log(`Position offset: (${mouseXOffsetPosition}, ${mouseYOffsetPosition})`);

    console.log(`Added pixels in X: (${mouseXOffsetPosition / maxMovementOffset_X})`)
}

window.addEventListener('mousemove', (event) => getMousePosition(event));


function setSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    max_height = window.innerHeight * 0.5;
    startPos = 0;
    vizWidth = window.innerWidth
    midY = canvas.height * 0.85;

    gradient = ctx.createLinearGradient(0, midY, 0, max_height);
    gradient.addColorStop(0, backgroundColor);
    gradient.addColorStop(1, linesColor);

}



async function livelyCurrentTrack(data) {
    let obj = JSON.parse(data);

    const Title = obj.Title;
    const Artist = obj.Artist;
    const AlbumArtist = obj.AlbumArtist;
    const Thumbnail = obj.Thumbnail;

    if (obj != null) {
        headerTitle.innerText = `Now playing: ♫ ${Title}`;

        if (Artist) {
            headerArtist.innerText = Artist;

            if (AlbumArtist) headerArtist.innerText += " | " + AlbumArtist
        }
        if (!Artist) {
            if (AlbumArtist ) headerArtist.innerText = AlbumArtist;
            else headerArtist.innerText = "Not found artist name"
        }

        if (Thumbnail) {
            try {
                // Construye el data URI
                const dataUri = `data:image/png;base64,${Thumbnail}`;

                thumbnailImage.setAttribute("style", "display: block");
                // Establece la imagen en el elemento <img>
                thumbnailImage.setAttribute("src", dataUri);

            } catch (err) {
               console.error(err.message);
            }
        } else{
            thumbnailImage.setAttribute("style", "display: none");
        }

    }
    else {
        headerTitle.innerText = "No playing audio"
        headerArtist.innerText = "Waiting for audio..."
    }
}

function livelyWallpaperPlaybackChanged(data) {
    var obj = JSON.parse(data);
    isPaused = obj.IsPaused;

    if (isPaused) {
        headerTitle.innerText = "No playing audio"
        headerArtist.innerText = ""
        thumbnailImage.setAttribute("style", "display: none");
    }
}


function livelyAudioListener(audioArray) {
    maxVal = 1;
    for (var x of audioArray) {
        if (x > maxVal) maxVal = x;
    }

    const offSet = vizWidth / audioArray.length;
    const arrMid = audioArray.length / 2;
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.lineJoin = "round";
    ctx.moveTo(startPos - offSet * 3, midY);
    ctx.lineTo(startPos, midY);
    let posInLine = -1;
    for (var x = 0; x < audioArray.length; x++) {
        posInLine++;
        ctx.lineTo(
            startPos + offSet * posInLine,
            midY - (audioArray[x] / maxVal) * max_height
        );
        if (square)
            ctx.lineTo(
                startPos + offSet * (posInLine + 1),
                midY - (audioArray[x] / maxVal) * max_height
            );
    }
    ctx.lineTo(startPos + offSet * (posInLine + (square ? 1 : 0)), midY);
    ctx.lineTo(startPos + offSet * (posInLine + (square ? 4 : 3)), midY);

    ctx.fillStyle = gradient;
    ctx.fill();
    renderLine(linesColor);
}

function renderLine(color) {
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    if (glob.bloom) {
        ctx.shadowBlur = glob.bloomRadius;
        ctx.shadowColor = color;
    }
    ctx.stroke();
}


function ajustLayers() {
    getMidPoint();

    const normalizedX = (mouseX - windowXMidPoint) / windowXMidPoint; // -1..1
    const normalizedY = (mouseY - windowYMidPoint) / windowYMidPoint; // -1..1

    const offsetX = normalizedX * maxMovementOffset_X;
    const offsetY = normalizedY * maxMovementOffset_Y;

    const targetX = windowXMidPoint + offsetX;
    const targetY = windowYMidPoint + offsetY;

    document.documentElement.style.setProperty('--layer3-position-x', `${targetX}px`);
    document.documentElement.style.setProperty('--layer3-position-y', `${targetY}px`);

    requestAnimationFrame(ajustLayers)
}

setSize()
ajustLayers();
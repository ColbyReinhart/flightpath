const canvas = document.querySelector("#canvas");
const video = document.querySelector("#video");
const infoheader = document.querySelector("#infoheader");
const geoheading = document.querySelector("#geoheading");
const absheading = document.querySelector("#absheading");

const physical_screen_width = 8;
const physical_screen_distance = 20;
const fov = Math.atan2(physical_screen_width/2, physical_screen_distance) * 2
const fov_min = (Math.PI/2)-(fov/2)
const fov_max = (Math.PI/2)+(fov/2)

document.body.style.height = `${window.innerHeight}px`;

const ctx = canvas.getContext("2d");

let lat, lng, heading, alpha, beta, gamma, compass_angle;
let dest_lat, dest_lng, dest_angle;

let updateOrientation = (e) => {
    alpha = torad(e.webkitCompassHeading || (360 - e.alpha));
    beta = torad(e.beta);
    gamma = torad(e.gamma);
    updateCompass();
}

let updatePosition = (position) => {
    lat = position.coords.latitude;
    lng = position.coords.longitude;
    //heading = position.coords.heading;
    dest_angle = Math.atan2(dest_lat - lat, dest_lng - lng);
}

button.addEventListener("click", async () => {
    let event_name;
    if (window.ondeviceorientationabsolute === null) {
        event_name = 'deviceorientationabsolute';
    } else if (window.ondeviceorientationabsolute === undefined) {
        event_name = 'deviceorientation';
    }
    absheading.innerHTML = event_name
    window.addEventListener(event_name, updateOrientation);
    //Geolocation.watchPosition(updatePosition);
    navigator.geolocation.getCurrentPosition(updatePosition);
});

dest_lat = 41.15076441233387;
dest_lng = -81.34724579644329;
let compass_angle_array = [];

let updateCompass = () => {
    let compass_measurement = alpha;
    if (Math.abs(compass_angle-compass_measurement) > Math.PI) {
        compass_angle_array = compass_angle_array.map((elem) => elem + (compass_measurement > compass_angle ? 2*Math.PI : -2*Math.PI));
    }
    compass_angle_array.push(compass_measurement);
    if (compass_angle_array.length > 10) {
        compass_angle_array.shift();
    }
    compass_angle = compass_angle_array.reduce((prev, curr) => prev + curr) / compass_angle_array.length;
    geoheading.innerHTML = compass_angle;
}

let convy = (y) => { return canvas.height-y; }

let torad = (theta) => { return theta / 180 * Math.PI; }
let todeg = (theta) => { return theta * 180 / Math.PI; }

let clamprad = (theta) => { return theta % (2 * Math.PI); }
let clampdeg = (theta) => { return theta % 360; }

let draw = (e) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "#808080";
    ctx.lineWidth = 3;
    
    let location_angle = clamprad(dest_angle+compass_angle);

    infoheader.innerHTML = `compass=${compass_angle} dest=${dest_angle} loc=${location_angle}`;

    ctx.beginPath();
    ctx.strokeStyle = "#ff0000";
    ctx.moveTo(canvas.width/2, convy(canvas.height/2));
    ctx.lineTo((canvas.width/2)+(canvas.width/2)*Math.cos(location_angle), convy((canvas.height/2)+(canvas.width/2)*Math.sin(location_angle)));
    ctx.stroke();
    ctx.closePath();

    ctx.beginPath();
    ctx.strokeStyle = "#00ff00";
    ctx.moveTo(canvas.width/2, convy(canvas.height/2));
    ctx.lineTo((canvas.width/2)+(canvas.width/2)*Math.cos(clamprad(compass_angle)), convy((canvas.height/2)+(canvas.width/2)*Math.sin(clamprad(compass_angle))));
    ctx.stroke();
    ctx.closePath();

    ctx.beginPath();
    ctx.strokeStyle = "#0000ff";
    ctx.moveTo(canvas.width/2, convy(canvas.height/2));
    ctx.lineTo((canvas.width/2)+(canvas.width/2)*Math.cos(clamprad(dest_angle)), convy((canvas.height/2)+(canvas.width/2)*Math.sin(clamprad(dest_angle))));
    ctx.stroke();
    ctx.closePath();

    /*ctx.beginPath();
    ctx.strokeStyle = "#00ffff";
    ctx.moveTo(canvas.width/2, convy(canvas.height/2));
    ctx.lineTo((canvas.width/2)+(canvas.width/2)*Math.cos(clamprad(location_angle-(gamma/500))), convy((canvas.height/2)+(canvas.width/2)*Math.sin(clamprad(location_angle-(gamma/500)))));
    ctx.stroke();
    ctx.closePath();*/

    window.requestAnimationFrame(draw);
}

draw();

var constraints = { audio: false, video: { facingMode: { exact: 'environment' } } };

async function getMedia() {
	mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
	video.srcObject = mediaStream;
    let video_width = mediaStream.getVideoTracks()[0].getSettings().width;
    let video_height = mediaStream.getVideoTracks()[0].getSettings().height;
    canvas.width = video_height;
    canvas.height = video_width;
    button.innerHTML = `${video_width}x${video_height}`;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerWidth*(video_width/video_height)}px`;
    video.style.width = `${window.innerWidth}px`;
    video.style.height = `${window.innerWidth*(video_width/video_height)}px`;
	video.onloadedmetadata = function() {
		video.play();
	};
}

async function stopMedia() {
	video.srcObject = null;
}
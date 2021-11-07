import { Compass } from "/static/js/compass.js";
import { drawTarget } from "/static/js/utils.js"

const compass_button = document.querySelector("#compass-button");
const canvas = document.querySelector("#canvas");
const video = document.querySelector("#video");
const ctx = canvas.getContext("2d");
ctx.lineWidth = 3;
ctx.strokeStyle = "#ff0000";
ctx.fillStyle = "#ff0000";

const angle_header = document.querySelector("#angle-header");
const dest_angle_header = document.querySelector("#dest-angle-header");
const location_angle_header = document.querySelector("#location-angle-header");
const alpha_header = document.querySelector("#alpha-header");
const beta_header = document.querySelector("#beta-header");
const gamma_header = document.querySelector("#gamma-header");

const physical_screen_width = 8;
const physical_screen_distance = 20;
const fov = Math.atan2(physical_screen_width/2, physical_screen_distance) * 2

let compass = new Compass(10);

compass.setDestination(41.1470404, -81.3432744);

let initCamera = async () => {
    const constraints = { audio: false, video: { facingMode: { ideal: 'environment' } } };
    let mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
    video.srcObject = mediaStream;
    let stream_width = mediaStream.getVideoTracks()[0].getSettings().width;
    let stream_height = mediaStream.getVideoTracks()[0].getSettings().height;
    let video_width = Math.min(stream_width, stream_height);
    let video_height = Math.max(stream_width, stream_height);
    let aspect = video_height/video_width;
    canvas.width = video_width;
    canvas.height = video_height;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${Math.round(window.innerWidth*aspect)}px`;
    video.style.width = `${window.innerWidth}px`;
    video.style.height = `${Math.round(window.innerWidth*aspect)}px`;
	video.onloadedmetadata = function() {
		video.play();
	};
}

compass_button.addEventListener("click", (e) => {
    compass.init();
    initCamera();
});

setInterval(() => {
    angle_header.innerHTML = `Angle=${compass.getAngle().toFixed(3)}`;
    dest_angle_header.innerHTML = `Destination Angle=${compass.getDestinationAngle().toFixed(3)}`;
    location_angle_header.innerHTML = `Location Angle=${compass.getLocationAngle().toFixed(3)}`;
    alpha_header.innerHTML = `Alpha=${compass.getAlpha().toFixed(3)}`;
    beta_header.innerHTML = `Beta=${compass.getBeta().toFixed(3)}`;
    gamma_header.innerHTML = `Gamma=${compass.getGamma().toFixed(3)}`;
}, 10);

let draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawTarget(canvas, compass, fov);

    window.requestAnimationFrame(draw);
}

draw();
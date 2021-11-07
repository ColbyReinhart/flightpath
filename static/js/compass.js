import { torad, clamprad } from "/static/js/utils.js";

class Compass {
    constructor(array_buffer_size=20) {
        this.angle = 0;
        this.angle_array = [];
        this.array_buffer_size = array_buffer_size;
    }

    async init() {
        let event_name;
        if (window.ondeviceorientationabsolute === null) {
            event_name = 'deviceorientationabsolute';
        } else if (window.ondeviceorientationabsolute === undefined) {
            event_name = 'deviceorientation';
        }
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            let res = await DeviceOrientationEvent.requestPermission();
            if (res == "granted") {
                window.addEventListener(event_name, this.updateOrientation.bind(this));
            } else {
            }
        } else {
            window.addEventListener(event_name, this.updateOrientation.bind(this));
        }
        navigator.geolocation.getCurrentPosition(this.updatePosition.bind(this));
        navigator.geolocation.watchPosition(this.updatePosition.bind(this));
    }

    updateOrientation(orientation) {
        this.alpha = torad(orientation.webkitCompassHeading || (360 - orientation.alpha));
        this.beta = torad(orientation.beta);
        this.gamma = torad(orientation.gamma);
        this.updateCompass();
    }

    updatePosition(position) {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
    }

    updateCompass() {
        if (Math.abs(this.angle-this.alpha) > Math.PI) {
            this.angle_array = this.angle_array.map((elem) => elem + (this.alpha > this.angle ? 2*Math.PI : -2*Math.PI));
        }
        this.angle_array.push(this.alpha);
        if (this.angle_array.length > this.array_buffer_size) {
            this.angle_array.shift();
        }
        this.angle = this.angle_array.reduce((prev, curr) => prev + curr) / this.angle_array.length;
    }

    setDestination(lat, lng) {
        this.dest_lat = lat;
        this.dest_lng = lng;
    }

    getAngle() {
        return this.angle;
    }

    getDestinationAngle() {
        return Math.atan2(this.dest_lat - this.lat, this.dest_lng - this.lng);
    }

    getLocationAngle() {
        return clamprad(this.getDestinationAngle()+this.getAngle());
    }

    getAlpha() {
        return this.alpha;
    }

    getBeta() {
        return this.beta;
    }

    getGamma() {
        return this.gamma;
    }
}

export { Compass }


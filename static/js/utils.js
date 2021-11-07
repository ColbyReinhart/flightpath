let convy = (canvas, y) => { return canvas.height-y; }

let torad = (theta) => { return theta / 180 * Math.PI; }
let todeg = (theta) => { return theta * 180 / Math.PI; }

let clamprad = (theta) => { return theta % (2 * Math.PI); }
let clampdeg = (theta) => { return theta % 360; }

let drawTarget = (canvas, compass, fov) => {
    let fov_min = (Math.PI/2)-(fov/2)
    let x_offset = (canvas.width/2)-(canvas.width*((compass.getLocationAngle()-fov_min)/fov));
    let y_offset = -(canvas.height)*(compass.getBeta()-Math.PI/2);
    let ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.fillStyle = "#880000";
    ctx.arc((canvas.width/2)+x_offset*1.05, convy(canvas, (canvas.height/2)+y_offset*1.05), 64, 0, 2*Math.PI);
    ctx.fill();
    ctx.closePath();
    ctx.beginPath();
    ctx.fillStyle = "#dd0000";
    ctx.arc((canvas.width/2)+x_offset, convy(canvas, (canvas.height/2)+y_offset), 64, 0, 2*Math.PI);
    ctx.fill();
    ctx.closePath();
    ctx.beginPath();
    ctx.fillStyle = "#ffffff";
    ctx.arc((canvas.width/2)+x_offset, convy(canvas, (canvas.height/2)+y_offset), 48, 0, 2*Math.PI);
    ctx.fill();
    ctx.closePath();
    ctx.beginPath();
    ctx.fillStyle = "#dd0000";
    ctx.arc((canvas.width/2)+x_offset, convy(canvas, (canvas.height/2)+y_offset), 32, 0, 2*Math.PI);
    ctx.fill();
    ctx.closePath();
    ctx.beginPath();
    ctx.fillStyle = "#00ff00";
    ctx.arc((canvas.width/2)+x_offset, convy(canvas, (canvas.height/2)+y_offset), 16, 0, 2*Math.PI);
    ctx.fill();
    ctx.closePath();
}

export { convy, torad, todeg, clamprad, clampdeg, drawTarget }
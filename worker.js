let resolution = location.hash.substr(1) | 0;
console.log(`loaded worker with resolution ${resolution}`);

let canvas = new OffscreenCanvas(resolution, resolution);
let ctx = canvas.getContext("2d");
let buf = ctx.getImageData(0, 0, resolution, resolution);
let data = buf.data;

globalThis.onmessage = function(e) {
    let { f } = e.data;
    try {
        f = eval(f)();

        for (var i = 0; i < data.length; i += 4) {
            let pos = i / 4;
            let x = pos % resolution | 0;
            let y = pos / resolution | 0;
            let { r, g, b } = f(x / resolution, y / resolution);
            data[i + 0] = r;
            data[i + 1] = g;
            data[i + 2] = b;
            data[i + 3] = 255;
        }

        ctx.putImageData(buf, 0, 0);
    } catch (e) {
        let fontsize = resolution / 100;
        ctx.font = `${fontsize}px monospace`;
        ctx.fillText(e.toString(), resolution / 50, resolution / 50);
    }

    let output = canvas.transferToImageBitmap();
    postMessage({ output, resolution });
}

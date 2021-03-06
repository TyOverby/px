function single_impl(ctx, size, content) {
    console.log("single", size);
    let is_dead = false;
    ctx.font = `10px serif`;

    function draw(resolution) {
        let canvas = document.createElement("canvas");
        canvas.width = resolution;
        canvas.height = resolution;
        let ctx2 = canvas.getContext("2d");
        let buf = ctx2.createImageData(resolution, resolution);
        let data = buf.data;
        try {
            f = eval(content)();
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

            console.log("putting at ", { size });
            ctx2.putImageData(buf, 0, 0);
            ctx.drawImage(canvas, 0, 0, size, size);
        } catch (e) {
            ctx.clearRect(0,0,size,size);
            ctx.fillText(e.toString(), 50, 100);
        }
    }

    function spawn(i) {
        if (is_dead) { return; }
        let n = (i == 0) ? size : (size / (2 << (i - 1)) | 0);
        if (n == 0) { return; }
        draw(n);
        requestAnimationFrame(function() { spawn(i - 1) });
    }
    spawn(2);

    return function() {
        is_dead = true;
    }
}

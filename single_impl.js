function single_impl(ctx, size, content) {
    let is_dead = false;
    ctx.font = `100px serif`;

    function draw(resolution) {
        console.log(`drawing at ${resolution}`);
        //ctx.clearRect(0, 0, resolution, resolution);
        let buf = ctx.getImageData(0, 0, resolution, resolution);
        let data = buf.data;
        try {
            f = eval(content)();
            for (var i = 0; i < data.length; i += 4) {
                let pos = i / 4;
                let x = pos % resolution | 0;
                let y = pos / resolution | 0;
                let { r, g, b } = f(x / resolution, y / resolution);
                data[i + 0] = r || 255;
                data[i + 1] = g || 0;
                data[i + 2] = b || 0;
                data[i + 3] = b || 255;
            }

            ctx.putImageData(buf, 0, 0, 0, 0, size, size);
        } catch (e) {
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
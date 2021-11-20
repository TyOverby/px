function worker_impl(ctx, size, content) {
    console.log("new worker impl")

    let is_dead = false;

    function make_worker(i) {
        let n;
        if (i == -2) {
            n = size * 4;
        } else if (i == -1) {
            n = size * 2;
        } else if (i == 0) {
            n = size
        } else {
            n = size / (2 << (i - 1));
        }
        let worker = new Worker(`./worker.js#${n}`);
        return { size: n, worker };
    }

    let workers = [
        make_worker(2),
        make_worker(1),
        make_worker(0),
        //        make_worker(-1),
        //        make_worker(-2),
    ];

    let most_recently_seen_resolution = 0;

    function onmessage(e) {
        let { output, resolution } = e.data;

        if (is_dead) {
            output.close();
            return;
        }

        if (most_recently_seen_resolution > resolution) {
            output.close();
            return;
        }
        most_recently_seen_resolution = resolution;
        ctx.transferFromImageBitmap(output);
    }

    for (let worker of workers) {
        worker.worker.onmessage = onmessage;
    }

    for (let worker of workers) {
        worker.worker.postMessage({ f: content });
    }

    return function() {
        is_dead = true;
        for (let worker of workers) {
            worker.worker.terminate();
        }
    }
}
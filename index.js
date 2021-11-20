let canvas = document.querySelector("canvas");
let textarea = document.querySelector("textarea");
let ctx = canvas.getContext("bitmaprenderer");
let unsub = function() {}
let ob = new ResizeObserver(function(entries) {
    for (let entry of entries) {
        canvas.width = entry.borderBoxSize[0].inlineSize * window.devicePixelRatio;
        canvas.height = entry.borderBoxSize[0].blockSize * window.devicePixelRatio;
    }

    unsub();
    unsub = setup(canvas.width, canvas.height);
});
ob.observe(canvas);

let hash = location.hash.substr(1);
let content = `function (x, y) {
    if (y > 0.5) {
        return {r: 255, g:0, b: 100};
    } else {
        return {r: 0, g:255, b: 100};
    }
}`;


if (hash == "") {
    textarea.value = content;
} else {
    textarea.value = atob(hash);
}

function setup(width, height) {
    console.log("setup");
    let size = Math.max(width, height);
    let is_dead = false;

    function make_worker(i) {
        let n;
        if (i == 0) {
            n = size
        } else {
            n = size / (2 << (i - 1));
        }
        let worker = new Worker(`./worker.js#${n}`);
        return { size: n, worker };
    }

    var workers = [
        make_worker(4),
        make_worker(3),
        make_worker(2),
        make_worker(1),
        make_worker(0),
    ]

    let current_generation = 0;
    let most_recently_seen_generation = 0;
    let most_recently_seen_resolution = 0;

    let most_recently_drawn_image_buffer = null
    let next_image_buffer = null

    let most_recent_text = ""

    function display_loop() {
        if (is_dead) {
            return;
        }
        if (textarea.value !== most_recent_text) {
            most_recent_text = textarea.value;
            dispatch(most_recent_text);
            history.replaceState(null, "", `#${btoa(textarea.value)}`);
        }

        if (next_image_buffer != most_recently_drawn_image_buffer) {
            most_recently_drawn_image_buffer = next_image_buffer;
            ctx.transferFromImageBitmap(next_image_buffer);
            console.log("drawing");
        }
        requestAnimationFrame(display_loop);
    }
    display_loop();

    textarea.onchange = function() {
        //dispatch(textarea.value);
    }

    function onmessage(e) {
        if (is_dead) {
            return;
        }
        let { output, generation, resolution } = e.data;
        if (generation < most_recently_seen_generation) {
            return;
        }
        if (generation > most_recently_seen_generation) {
            most_recently_seen_generation = generation;
        } else if (most_recently_seen_resolution > resolution) {
            return;
        }
        most_recently_seen_resolution = resolution;

        console.log("putting", { generation, resolution });
        next_image_buffer = output;
    }

    for (let worker of workers) {
        worker.worker.onmessage = onmessage;
    }

    function dispatch(f) {
        f = "(" + f + ")";
        current_generation += 1;
        for (let worker of workers) {
            worker.worker.postMessage({ f, generation: current_generation });
        }
    }

    return function() {
        is_dead = true;
        for (let worker of workers) {
            worker.worker.terminate();
        }
    }
}
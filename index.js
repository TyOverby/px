let canvas = document.querySelector("canvas");
let textarea = document.querySelector("textarea");
let ctx = canvas.getContext("bitmaprenderer");
let unsub = function() {}

let latest_size = 0;
let latest_text = "";

function dispatch() {
    unsub();
    unsub = worker_impl(ctx, latest_size, latest_text);
}

let ob = new ResizeObserver(function(entries) {
    for (let entry of entries) {
        canvas.width = entry.borderBoxSize[0].inlineSize * window.devicePixelRatio;
        canvas.height = entry.borderBoxSize[0].blockSize * window.devicePixelRatio;
    }
    latest_size = Math.max(canvas.width, canvas.height);
    dispatch();
});
ob.observe(canvas);

let hash = location.hash.substr(1);
if (hash == "") {
    latest_text = `function (x, y) {
        if (y > 0.5) {
            return {r: 255, g:0, b: 100};
        } else {
            return {r: 0, g:255, b: 100};
        }
    }`;
} else {
    latest_text = atob(hash);
}
textarea.value = latest_text;

textarea.oninput = function() {
    latest_text = textarea.value;
    history.replaceState(null, "", `#${btoa(latest_text)}`);
    dispatch();
}
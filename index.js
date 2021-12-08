let canvas = document.querySelector("canvas");
let textarea = document.querySelector("textarea");
let unsub = function() {}

let ctx, impl;
if (window.ImageBitmap === undefined || window.OffscreenCanvas === undefined) {
    ctx = canvas.getContext("2d");
    impl = single_impl;
} else {
    ctx = canvas.getContext("bitmaprenderer");
    impl = worker_impl;
}

let latest_size = 0;
let latest_text = "";

function dispatch() {
    unsub();
    let fn = "(function(){" + latest_text + "\n})";
    unsub = impl(ctx, latest_size, fn);
}

let ob = new ResizeObserver(function(entries) {
    requestAnimationFrame(() => {
        for (let entry of entries) {
            if (entry.borderBoxSize) {
                canvas.width = 
                    entry.borderBoxSize[0].inlineSize 
                  * window.devicePixelRatio;
                canvas.height = 
                    entry.borderBoxSize[0].blockSize 
                  * window.devicePixelRatio;
            } else {
                canvas.width = 
                    entry.contentRect.width 
                  * window.devicePixelRatio;
                canvas.height = 
                    entry.contentRect.height 
                  * window.devicePixelRatio;
            }
        }
        latest_size = Math.max(canvas.width, canvas.height);
        dispatch();
    });
});
ob.observe(canvas);

let hash = location.hash.substring(1);
if (hash == "") {
    latest_text = `return function (x, y) {
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

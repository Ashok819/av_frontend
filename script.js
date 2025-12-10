let video = document.getElementById("camera");
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

async function startCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // back camera
        audio: false
    });
    video.srcObject = stream;

    video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
    };
}

async function sendFrameToBackend(frameBlob) {
    let formData = new FormData();
    formData.append("file", frameBlob);

    let res = await fetch("https://backend-1-fwik.onrender.com", { // backend URL
        method: "POST",
        body: formData
    });

    return await res.json();
}

async function detectLoop() {
    ctx.drawImage(video, 0, 0);

    let blob = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg"));
    let data = await sendFrameToBackend(blob);

    data.objects.forEach(obj => {
        let [x1, y1, x2, y2] = obj.box;
        ctx.strokeStyle = "#0070ff";
        ctx.lineWidth = 3;
        ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

        ctx.fillStyle = "#0070ff";
        ctx.font = "18px Arial";
        ctx.fillText(obj.class, x1, y1 - 8);
    });

    requestAnimationFrame(detectLoop);
}

// Contact form
document.getElementById("contactForm").addEventListener("submit", function(e) {
    e.preventDefault();
    let email = document.getElementById("email").value;
    if(email) {
        alert(`Thanks! Avaloka will reach out to: ${email}`);
        document.getElementById("contactForm").reset();
    }
});

// Initialize
startCamera().then(detectLoop);



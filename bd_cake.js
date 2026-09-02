// Thực hiện mở khi click vào thư 

document.getElementById("envelope").addEventListener("click", function() {
    this.classList.toggle("open");
});

/* =========================================================
   MUSIC
   ========================================================= */

const LIGHT_SONG = "music.mp3";
const DARK_SONG = "music-dark.mp3";

const audio = document.getElementById('bg-music');
const btn = document.getElementById('music-btn');
const cd = document.querySelector('.cd');

let musicOn = true;
let lightSong = true;

const songTimes = {};

function applyVolume() {
    audio.volume = musicOn ? 0.8 : 0;
}

function startSilently() {
    applyVolume();
    if (audio.paused) {
        audio.play().catch(() => {});
    }
}

function swapThemeSong(light) {
    if (light === lightSong) return;
    songTimes[lightSong ? LIGHT_SONG : DARK_SONG] = audio.currentTime;
    lightSong = light;
    audio.src = light ? LIGHT_SONG : DARK_SONG;
    audio.currentTime = songTimes[light ? LIGHT_SONG : DARK_SONG] || 0;
    startSilently();
}

window.addEventListener('load', () => {
    audio.loop = true;
    audio.src = LIGHT_SONG;
    startSilently();
    document.addEventListener('pointerdown', startSilently, { once: true });
});

btn.addEventListener('click', () => {
    musicOn = !musicOn;
    startSilently();
    cd.classList.toggle('spin', musicOn);
    btn.textContent = musicOn ? 'Tắt nhạc' : 'Bật nhạc';
});

/* =========================================================
   DARK / LIGHT THEME
   ========================================================= */

let isLight = true;

const themeBtn = document.getElementById("theme-toggle");

function setTheme(light) {

    const applyTheme = () => {

        isLight = light;

        document.documentElement.classList.toggle(
            "light",
            light
        );

        // Light thì xóa toàn bộ sao băng
        if (light) {
            meteors = [];
        }

        swapThemeSong(light);
    };


    // Browser không hỗ trợ View Transition
    if (!document.startViewTransition) {

        applyTheme();

        return;
    }


    // Vị trí nút theme
    const rect = themeBtn.getBoundingClientRect();

    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;


    // Tính bán kính đủ phủ toàn màn hình
    const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
    );


    const transition =
        document.startViewTransition(applyTheme);


    transition.ready.then(() => {

        document.documentElement.animate(

            {
                clipPath: [
                    `circle(0px at ${x}px ${y}px)`,

                    `circle(${endRadius}px at ${x}px ${y}px)`
                ]
            },

            {
                duration: 650,

                easing: "ease-in-out",

                pseudoElement:
                    "::view-transition-new(root)"
            }
        );

    });
}


themeBtn.addEventListener("click", () => {

    setTheme(!isLight);

});

/* =========================================================
   SPACE BACKGROUND
   ========================================================= */

const canvas = document.getElementById("bg-canvas");

const ctx = canvas.getContext("2d");

let W;
let H;
let DPR;


/* Resize canvas */
function resize() {

    DPR = Math.min(
        window.devicePixelRatio || 1,
        2
    );

    W = window.innerWidth;

    H = Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight
    );


    canvas.style.width = W + "px";
    canvas.style.height = H + "px";


    canvas.width = W * DPR;
    canvas.height = H * DPR;


    ctx.setTransform(
        DPR,
        0,
        0,
        DPR,
        0,
        0
    );


    buildScene();
}


/* Các object */
let stars = [];

let nebulae = [];

let meteors = [];


/* Tạo scene */
function buildScene() {

    const starCount =
        Math.floor((W * H) / 5500);


    stars = Array.from(
        {
            length: starCount
        },

        () => ({

            x: Math.random() * W,

            y: Math.random() * H,

            r: Math.random() * 1.4 + 0.2,

            baseA:
                Math.random() * 0.6 + 0.25,

            speed:
                Math.random() * 0.015 + 0.004,

            phase:
                Math.random() * Math.PI * 2

        })
    );


    const blobCount =
        Math.max(
            8,
            Math.floor(H / 480)
        );


    const palette = [
        "123,97,255",
        "52,224,196",
        "255,95,168"
    ];


    nebulae = Array.from(
        {
            length: blobCount
        },

        (_, i) => ({

            x: Math.random() * W,

            y:
                (H / blobCount) * i +
                Math.random() * 220,

            r:
                Math.random() * 320 + 260,

            color:
                palette[i % palette.length],

            phase:
                Math.random() * Math.PI * 2

        })
    );
}


/* Tạo sao băng */
function spawnMeteor() {

    const viewTop = window.scrollY;

    const angle =
        (20 + Math.random() * 20)
        * Math.PI / 180;


    meteors.push({

        x:
            Math.random() * W * 0.6 +
            W * 0.05,

        y:
            viewTop +
            Math.random() *
            window.innerHeight *
            0.45,

        dx: Math.cos(angle),

        dy: Math.sin(angle),

        speed:
            10 +
            Math.random() * 6,

        len:
            90 +
            Math.random() * 60,

        life: 0,

        maxLife:
            34 +
            Math.random() * 14

    });
}


/* Wrap */
function wrap(v, max) {

    return (
        (v % max) +
        max
    ) % max;

}


let t = 0;

let driftX = 0;

let driftY = 0;


/* =========================================================
   ANIMATION
   ========================================================= */

function draw() {

    t += 1;

    driftX += 0.1;

    driftY += 0.1;

    ctx.clearRect(
        0,
        0,
        W,
        H
    );

    if (isLight) {
        requestAnimationFrame(draw);
        return;
    }


    /* =========================
       NEBULA
       ========================= */

    ctx.save();

    ctx.globalCompositeOperation =
        "lighter";


    nebulae.forEach(n => {

        const x =
            wrap(
                n.x +
                Math.sin(
                    t * 0.0015 +
                    n.phase
                ) * 50 -
                driftX * 0.3,

                W + n.r * 2
            ) - n.r;


        const y =
            wrap(
                n.y -
                driftY * 0.3,

                H + n.r * 2
            ) - n.r;


        const grad =
            ctx.createRadialGradient(
                x,
                y,
                0,
                x,
                y,
                n.r
            );


        grad.addColorStop(
            0,
            `rgba(${n.color},0.24)`
        );

        grad.addColorStop(
            0.45,
            `rgba(${n.color},0.10)`
        );

        grad.addColorStop(
            1,
            `rgba(${n.color},0)`
        );


        ctx.fillStyle = grad;

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            n.r,
            0,
            Math.PI * 2
        );

        ctx.fill();

    });


    ctx.restore();


    /* =========================
       STARS
       ========================= */

    stars.forEach(s => {

        const a =
            s.baseA +
            Math.sin(
                t * s.speed +
                s.phase
            ) * 0.25;


        /*
         * Dark  -> trắng
         * Light -> đen
         */
        const rgb =
            isLight
                ? "20,18,40"
                : "237,235,247";


        const sx =
            wrap(
                s.x - driftX,
                W
            );


        const sy =
            wrap(
                s.y - driftY,
                H
            );


        ctx.fillStyle =
            `rgba(
                ${rgb},
                ${Math.max(a, 0.05)}
            )`;


        ctx.beginPath();

        ctx.arc(
            sx,
            sy,
            s.r,
            0,
            Math.PI * 2
        );

        ctx.fill();

    });


    /* =========================
       METEOR
       ========================= */

    if (!isLight) {

        if (
            Math.random() < 0.006 &&
            meteors.length < 2
        ) {

            spawnMeteor();

        }

    }
    else if (meteors.length) {

        meteors = [];

    }


    meteors =
        meteors.filter(
            m => m.life < m.maxLife
        );


    meteors.forEach(m => {

        m.x +=
            m.dx * m.speed;

        m.y +=
            m.dy * m.speed;

        m.life++;


        const alpha =
            1 -
            m.life /
            m.maxLife;


        const tailX =
            m.x -
            m.dx * m.len;


        const tailY =
            m.y -
            m.dy * m.len;


        const rgb =
            isLight
                ? "35,30,55"
                : "255,255,255";


        const grad =
            ctx.createLinearGradient(
                m.x,
                m.y,
                tailX,
                tailY
            );


        grad.addColorStop(
            0,
            `rgba(${rgb},${alpha})`
        );


        grad.addColorStop(
            1,
            `rgba(${rgb},0)`
        );


        ctx.strokeStyle = grad;

        ctx.lineWidth = 1.8;

        ctx.lineCap = "round";


        ctx.beginPath();

        ctx.moveTo(
            m.x,
            m.y
        );

        ctx.lineTo(
            tailX,
            tailY
        );

        ctx.stroke();


        /* đầu sao băng */

        ctx.fillStyle =
            `rgba(${rgb},${alpha})`;


        ctx.beginPath();

        ctx.arc(
            m.x,
            m.y,
            1.4,
            0,
            Math.PI * 2
        );

        ctx.fill();

    });


    requestAnimationFrame(draw);

}


/* =========================================================
   START
   ========================================================= */

window.addEventListener(
    "resize",
    resize
);

window.addEventListener(
    "load",
    resize
);


resize();

draw();


setTimeout(
    resize,
    400
);

setTimeout(
    resize,
    1200
);
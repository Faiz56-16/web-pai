const hero = document.querySelector(".hero");
const cards = document.querySelectorAll(".parallax-card");
const world = document.querySelector("#world");

const clamp = gsap.utils.clamp;

/* =========================================
   SETTINGS
========================================= */

const TOTAL = cards.length;

const TRAVEL = 2400;
const START_Z = 1100;

const FADE_IN = 0.45;
const DIM_MAX = 0.45;

const MAX_LEAD = 0.12;

const WHEEL = 0.00016;
const TOUCH = 0.0009;

const KEY_STEP = 0.04;

const SMOOTH = 2.2;

// card dianggap "terlihat" untuk hit-test jika opacity di atas ini
const HIT_MIN_OPACITY = 0.5;

const STRIDE = (1 - START_Z / TRAVEL) / (TOTAL - 1);

const tilts = [-3, 2.5, 2, -2.5, 1.5, -1.5];

/* =========================================
   STATE
========================================= */

let target = 0;
let current = 0;

let mx = 0;
let my = 0;

let smx = 0;
let smy = 0;

/* =========================================
   MEDIA QUERY
========================================= */

const isMobile = window.matchMedia("(max-width: 767px)");

const isLandscape = window.matchMedia(
    "(max-width: 767px) and (orientation: landscape)"
);

const hasHover = window.matchMedia("(hover: hover)").matches;

/* =========================================
   LAYOUT
========================================= */

const applyLayout = () => {
    gsap.set(cards, {
        yPercent: isLandscape.matches ? -50 : 0
    });
};

applyLayout();

isLandscape.addEventListener("change", applyLayout);

/* =========================================
   INITIAL CARD STATE
========================================= */

gsap.set(cards, {
    opacity: 0,
    z: START_Z
});

// state hit-test awal
cards.forEach((card) => {
    card._z = START_Z;
    card._op = 0;
});

/* =========================================
   HIT TEST (CARD PALING DEPAN)
========================================= */

const getTopCard = (x, y) => {
    const hits = document
        .elementsFromPoint(x, y)
        .map((el) => el.closest(".parallax-card"))
        .filter((c) => c && c._op > HIT_MIN_OPACITY);

    if (!hits.length) return null;

    // pilih card paling dekat ke kamera (z terbesar)
    return hits.reduce((a, b) => (b._z > a._z ? b : a));
};

/* =========================================
   PAGE TRANSITION
========================================= */

let leaving = false;

const goToPage = (card) => {
    const page = card?.dataset.page;

    if (!page || leaving) return;

    leaving = true;

    gsap.to("#scene", {
        opacity: 0,
        scale: 1.03,
        duration: 0.5,
        ease: "power2.inOut",
        onComplete: () => {
            window.location.href = page;
        }
    });
};

/* =========================================
   PUSH SCROLL
========================================= */

const push = (amount) => {
    target = clamp(0, 1, target + amount);

    target = clamp(
        current - MAX_LEAD,
        current + MAX_LEAD,
        target
    );

    target = clamp(0, 1, target);
};

/* =========================================
   MOUSE WHEEL
========================================= */

window.addEventListener(
    "wheel",
    (e) => {
        e.preventDefault();

        const unit =
            e.deltaMode === 1
                ? 32
                : e.deltaMode === 2
                    ? 400
                    : 1;

        const delta = clamp(-120, 120, e.deltaY * unit);

        push(delta * WHEEL);
    },
    { passive: false }
);

/* =========================================
   TOUCH STATE
========================================= */

let lastY = null;

let touchStartX = 0;
let touchStartY = 0;

let touchMoved = false;

/* =========================================
   TOUCH START
========================================= */

window.addEventListener(
    "touchstart",
    (e) => {
        if (!e.touches.length) return;

        const touch = e.touches[0];

        lastY = touch.clientY;

        touchStartX = touch.clientX;
        touchStartY = touch.clientY;

        touchMoved = false;
    },
    { passive: true }
);

/* =========================================
   TOUCH MOVE
========================================= */

window.addEventListener(
    "touchmove",
    (e) => {
        e.preventDefault();

        if (lastY === null || !e.touches.length) return;

        const touch = e.touches[0];

        const x = touch.clientX;
        const y = touch.clientY;

        const dx = Math.abs(x - touchStartX);
        const dy = Math.abs(y - touchStartY);

        if (dx > 10 || dy > 10) {
            touchMoved = true;
        }

        push(clamp(-80, 80, lastY - y) * TOUCH);

        lastY = y;
    },
    { passive: false }
);

/* =========================================
   TOUCH END
========================================= */

window.addEventListener(
    "touchend",
    (e) => {
        const touch = e.changedTouches[0];

        // jari bergerak = scroll, bukan tap
        if (!touch || touchMoved) {
            lastY = null;
            return;
        }

        const card = getTopCard(touch.clientX, touch.clientY);

        if (card) goToPage(card);

        lastY = null;
    },
    { passive: true }
);

/* =========================================
   TOUCH CANCEL
========================================= */

window.addEventListener(
    "touchcancel",
    () => {
        lastY = null;
        touchMoved = false;
    },
    { passive: true }
);

/* =========================================
   KEYBOARD
========================================= */

window.addEventListener("keydown", (e) => {
    if (["ArrowDown", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
        push(KEY_STEP);
    }

    if (["ArrowUp", "PageUp"].includes(e.key)) {
        e.preventDefault();
        push(-KEY_STEP);
    }

    if (e.key === "Home") {
        e.preventDefault();
        target = 0;
    }

    if (e.key === "End") {
        e.preventDefault();
        target = 1;
    }
});

/* =========================================
   MOUSE PARALLAX
========================================= */

if (hasHover) {
    window.addEventListener("pointermove", (e) => {
        mx = (e.clientX / innerWidth - 0.5) * 2;
        my = (e.clientY / innerHeight - 0.5) * 2;
    });
}

/* =========================================
   GSAP LOOP
========================================= */

gsap.ticker.add((time, deltaTime) => {
    const dt = Math.min(deltaTime, 50) / 1000;

    const k = 1 - Math.exp(-dt * SMOOTH);

    current += (target - current) * k;

    smx += (mx - smx) * k;
    smy += (my - smy) * k;

    const back = current * TRAVEL;

    /* WORLD ROTATION */

    gsap.set(world, {
        rotationY: smx * 2.5,
        rotationX: smy * -2.5
    });

    /* HERO */

    gsap.set(hero, {
        z: -back,
        opacity: 1 - clamp(0, 1, current / 0.4) * 0.92
    });

    /* CARDS */

    cards.forEach((card, i) => {
        const appearAt = i * STRIDE;

        const rawZ = START_Z - (current - appearAt) * TRAVEL;

        const z = Math.min(rawZ, START_Z);

        const arrive = clamp(
            0,
            1,
            1 - Math.max(z, 0) / START_Z
        );

        const fadeIn = clamp(0, 1, arrive / FADE_IN);

        const receded = clamp(0, 1, -z / (TRAVEL * 0.55));

        const dim = 1 - receded * DIM_MAX;

        const opacity = fadeIn * dim;

        gsap.set(card, {
            z: z,
            rotation: tilts[i] * (2 * arrive - 1),
            opacity: opacity
        });

        // simpan state untuk hit-test
        card._z = z;
        card._op = opacity;

        // card transparan tidak boleh menghalangi hover/klik
        card.style.pointerEvents = opacity > 0.1 ? "auto" : "none";
    });
});

/* =========================================
   DESKTOP CARD CLICK
========================================= */

cards.forEach((card) => {
    card.addEventListener("click", (e) => {
        // mobile memakai touchend
        if (isMobile.matches) return;

        const top = getTopCard(e.clientX, e.clientY);

        if (top) goToPage(top);
    });
});

/* =========================================
   PREVENT IMAGE DRAG
========================================= */

cards.forEach((card) => {
    const image = card.querySelector("img");

    if (!image) return;

    image.addEventListener("dragstart", (e) => {
        e.preventDefault();
    });
});
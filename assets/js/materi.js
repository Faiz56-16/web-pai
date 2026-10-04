document.querySelector("#nextButton").addEventListener("click", () => {
  gsap.to(".page", {
    opacity: 0,

    duration: 0.5,

    ease: "power2.inOut",

    onComplete: () => {
      window.location.href = "rukun-islam.html";
    },
  });
});

const lenis = new Lenis({
  duration: 1.2,
  smoothWheel: true,
  smoothTouch: false,
});

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);


/* =========================
           FADE ANIMATION
        ========================== */

window.addEventListener("load", () => {
  /* HERO */

  gsap.from(".hero .eyebrow", {
    opacity: 0,

    y: 15,

    duration: 0.6,

    ease: "power2.out",
  });

  gsap.from(".hero h1", {
    opacity: 0,

    y: 20,

    duration: 0.8,

    delay: 0.1,

    ease: "power2.out",
  });

  gsap.from(".hero-description", {
    opacity: 0,

    y: 15,

    duration: 0.7,

    delay: 0.25,

    ease: "power2.out",
  });

  gsap.from(".scroll-indicator", {
    opacity: 0,

    duration: 0.6,

    delay: 0.5,
  });

  /* MATERIAL */

  const materials = document.querySelectorAll(".material");

  materials.forEach((material) => {
    const text = material.querySelector(".material-text");

    const image = material.querySelector(".material-image");

    gsap.from(text, {
      opacity: 0,

      y: 30,

      duration: 0.8,

      scrollTrigger: undefined,
    });

    gsap.from(image, {
      opacity: 0,

      duration: 0.8,
    });
  });


});

const cloudSvg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cpath d='M41.1 12.1C38.4 7.8 33.3 5 27.5 5c-7.3 0-13.5 4.8-15.4 11.4C5.4 18.2 1 23.9 1 30.5c0 8.3 6.7 15 15 15h29.5c6.9 0 12.5-5.6 12.5-12.5C58 25.4 50.5 18 41.1 12.1z' fill='%23ffffff'/%3E%3C/svg%3E";

export const particlesOptions = {
  background: {
    color: {
      value: "transparent",
    },
  },
  fpsLimit: 120,
  particles: {
    number: {
      value: 0, // Start with no particles
    },
    color: {
      value: "#ffffff",
    },
    shape: {
      type: "image",
      image: {
        src: cloudSvg,
      },
    },
    opacity: {
      value: { min: 0.6, max: 1 },
      animation: {
        enable: true,
        speed: 1,
        sync: false,
        startValue: "max",
        destroy: "min",
      },
    },
    size: {
      value: { min: 30, max: 50 },
    },
    move: {
      enable: true,
      speed: 2,
      direction: "top",
      straight: false,
      outModes: {
        default: "destroy",
        top: "destroy",
      },
    },
  },
  interactivity: {
    events: {
      onClick: {
        enable: false,
      },
    },
  },
  detectRetina: true,
  emitters: {
    direction: "top",
    life: {
      count: 1, // Emit only once
      duration: 0.1,
      delay: 0.1,
    },
    rate: {
      delay: 0.1,
      quantity: 15, // Number of particles per emission
    },
    size: {
      width: 50,
      height: 50,
    },
    // Position will be set dynamically
  },
};
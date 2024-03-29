import { on } from "@nabilk/bigbro";
import { detatch, enable, handle } from "./src";

function lerp(start: number, end: number, amt: number) {
  return (1 - amt) * start + amt * end;
}

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
const container = <HTMLElement>document.querySelector(".container");

enable({ enableNavigation: true });

const state = {
  total: 0,
  current: 0,
  target: 0,
  last: 0,
  running: false,
};

const app = <HTMLElement>document.querySelector("#app");
const line = <HTMLElement>document.querySelector(".line");
state.total = app.scrollHeight - window.innerHeight;

handle("pointerdown", (e) => {
  console.log(`${e.type} is down`);

  state.last = state.target;
});

handle("pointerup", (e) => {
  console.log(`${e.type} is up`);
  state.last = state.target;
});

handle("pointermove", (e) => {
  console.log(`mouse is moving`);
});

handle("drag", (e) => {
  state.target = state.last - e.dragY;
  state.target = clamp(state.target, 0, state.total);
  if (!state.running) a();
});

handle("wheel", (e) => {
  state.target += e.pixelY;
  state.target = clamp(state.target, 0, state.total);

  if (!state.running) a();
});
handle("keydown", (e) => {
  console.log("keydown");
});
handle("navigation", (e) => {
  const { code, shift, value } = e;

  if (code !== "Tab") {
    state.target += value;
    state.target = clamp(state.target, 0, state.total);

    if (!state.running) a();
  } else {
    requestAnimationFrame(() => {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      document.documentElement.scrollLeft = 0;
      document.body.scrollLeft = 0;

      setTimeout(() => {
        state.target +=
          (document.activeElement?.getBoundingClientRect().top || 0) -
          window.innerHeight / 2;
        state.target = clamp(state.target, 0, state.total);

        if (!state.running) a();
      }, 0);
    });
  }
});

function a() {
  state.running = true;
  state.current = lerp(state.current, state.target, 0.08);

  app.style.transform = `translateY(${-state.current}px) translateZ(0)`;
  line.style.transform = `scaleY(${state.current / state.total})`;

  if (Math.abs(state.target - state.current) > 0.04) {
    requestAnimationFrame(a);
  } else {
    state.running = false;
  }
}

a();

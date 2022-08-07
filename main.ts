import { on } from "@nabilk/bigbro";
import { detatch, enable, handle } from "./src";

function lerp(start: number, end: number, amt: number) {
  return (1 - amt) * start + amt * end;
}

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

enable({ wheelMultiplier: 1, dragMultiplier: 2, touchMultiplier: 2 });

on("wheel", (e) => console.log(e));
on("pointerdown", ({ event: { button } }) => console.log(button));
on("pointermove", ({ event: { button } }) => console.log(button));
const btn = document.querySelector("button");

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
  console.log("p");

  state.last = state.target;
  console.log(state.last);
});

handle("pointerup", (e) => {
  state.last = state.target;
});

handle("pointermove", (e) => {
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
  const { code, value } = e;

  state.target += value;
  state.target = clamp(state.target, 0, state.total);

  if (!state.running) a();
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

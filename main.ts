import { on } from "@nabilk/bigbro";
import * as Virtualizer from "./src";

const v = Virtualizer.enable({});

on("wheel", (e) => console.log(e));
on("pointerdown", ({ event: { button } }) => console.log(button));
on("pointermove", ({ event: { button } }) => console.log(button));
const btn = document.querySelector("button");

btn && on("click", btn, () => Virtualizer.disable());

Virtualizer.handle("wheel", (e) => {
  console.log(e.pixelY, e.spinY);
});
Virtualizer.handle("pointerdown", (e) => {
  console.log("down");
});
Virtualizer.handle("pointermove", (e) => {
  console.log("moving");
});
Virtualizer.handle("pointerup", (e) => {
  console.log("up");
});

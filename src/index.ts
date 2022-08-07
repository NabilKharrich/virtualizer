import { emit, off as _off, on as _on } from "@nabilk/bigbro";
import normalizeWheel from "normalize-wheel";

/**
 * TODO
 * [] add multipliers
 * [] add keyboard support
 */

interface VirtualizerConfig {
  wheelMultiplier: number;
  touchMultiplier: number;
  dragMultiplier: number;
  enableWheel: boolean;
  enableTouch: boolean;
  enableDrag: boolean;
  enableKeyboard: boolean;
  spaceStep: number | string;
  arrowStep: number;
}

interface VirtualizerSetup {
  isActive: boolean;
  config: VirtualizerConfig;
}

interface VirtualizerWheelEventMap {
  spinX: number;
  spinY: number;
  pixelX: number;
  pixelY: number;
  event: WheelEvent;
}

interface VirtualizerPointerDownEventMap {
  pointerX: number;
  pointerY: number;
  type: string;
  event: PointerEvent;
}

interface VirtualizerPointerMoveEventMap {
  dragX: number;
  dragY: number;
  type: string;
  event: PointerEvent;
}
interface VirtualizerPointerUpEventMap {
  pointerX: number;
  pointerY: number;
  type: string;
  event: PointerEvent;
}

interface VirtualizerKeydownEventMap {
  code: string;
  shift: boolean;
  value: number;
  event: KeyboardEvent;
}

interface VirtualizerEventMap {
  wheel: (ev: VirtualizerWheelEventMap) => void;
  pointerdown: (ev: VirtualizerPointerDownEventMap) => void;
  pointermove: (ev: VirtualizerPointerMoveEventMap) => void;
  pointerup: (ev: VirtualizerPointerUpEventMap) => void;
  keydown: (ev: VirtualizerKeydownEventMap) => void;
}

type VirtualizerInternalEvents = {
  [key in
    | "wheel"
    | "pointerdown"
    | "pointermove"
    | "pointerup"
    | "keydown"]: string;
};

type VirtualizerEventHandler = <T extends keyof VirtualizerEventMap>(
  event: T,
  cb: VirtualizerEventMap[T]
) => void;

const EVENTS: VirtualizerInternalEvents = {
  wheel: "virtualizer:wheel",
  pointerdown: "virtualizer:pointerdown",
  pointermove: "virtualizer:pointermove",
  pointerup: "virtualizer:pointerup",
  keydown: "virtualizer:keydown",
};

const defaultConfig: VirtualizerConfig = {
  wheelMultiplier: 1,
  touchMultiplier: 1,
  dragMultiplier: 1,
  enableWheel: true,
  enableTouch: true,
  enableDrag: true,
  enableKeyboard: true,
  spaceStep: "window",
  arrowStep: 120,
};

const setup: VirtualizerSetup = {
  isActive: false,
  config: defaultConfig,
};

const pointer = {
  x: 0,
  y: 0,
};

const handleWheel = (event: WheelEvent) => {
  const normalized = normalizeWheel(event);
  normalized.pixelX *= setup.config.wheelMultiplier;
  normalized.pixelY *= setup.config.wheelMultiplier;

  emit(EVENTS.wheel, <VirtualizerWheelEventMap>{
    ...normalized,
    event,
  });
};

const handlePointerDown = (event: PointerEvent) => {
  const { clientX, clientY, button, pointerType } = event;
  const { enableDrag, enableTouch } = setup.config;

  const disabledGesture =
    (!enableDrag && pointerType === "mouse") ||
    (!enableTouch && pointerType === "touch");

  if (button != 0 || disabledGesture) return;

  pointer.x = clientX || 0;
  pointer.y = clientY || 0;

  emit(EVENTS.pointerdown, <VirtualizerPointerDownEventMap>{
    pointerX: pointer.x,
    pointerY: pointer.y,
    type: pointerType,
    event,
  });
};

const handlePointerMove = (event: PointerEvent) => {
  const { clientX, clientY, buttons, pointerType } = event;
  const { enableDrag, enableTouch } = setup.config;

  const disabledGesture =
    (!enableDrag && pointerType === "mouse") ||
    (!enableTouch && pointerType === "touch");

  if (buttons != 1 || disabledGesture) return;

  event.preventDefault();

  const multiplier =
    pointerType === "mouse"
      ? setup.config.dragMultiplier
      : pointerType === "touch"
      ? setup.config.touchMultiplier
      : 1;

  emit(EVENTS.pointermove, <VirtualizerPointerMoveEventMap>{
    dragX: ((clientX || 0) - pointer.x) * multiplier,
    dragY: ((clientY || 0) - pointer.y) * multiplier,
    type: pointerType,
    event,
  });
};

const handlePointerUp = (event: PointerEvent) => {
  const { clientX, clientY, button, pointerType } = event;
  const { enableDrag, enableTouch } = setup.config;

  const disabledGesture =
    (!enableDrag && pointerType === "mouse") ||
    (!enableTouch && pointerType === "touch");

  if (button != 0 || disabledGesture) return;

  pointer.x = clientX || 0;
  pointer.y = clientY || 0;

  emit(EVENTS.pointerup, <VirtualizerPointerUpEventMap>{
    pointerX: pointer.x,
    pointerY: pointer.y,
    type: pointerType,
    event,
  });
};

const keyCodes = new Map<string, () => number>([
  ["ArrowDown", () => 40],
  ["ArrowRight", () => 40],
  ["ArrowUp", () => -40],
  ["ArrowLeft", () => -40],
  ["Space", () => window.innerHeight],
  ["PageDown", () => window.innerHeight],
  ["PageUp", () => -window.innerHeight],
]);

const handleKeyDown = (event: KeyboardEvent) => {
  const { code, shiftKey } = event;

  if (keyCodes.has(code)) {
    const value: number =
      code === "Space"
        ? keyCodes.get(code)?.() || 0 * (shiftKey ? -1 : 1)
        : keyCodes.get(code)?.() || 0;

    emit(EVENTS.keydown, <VirtualizerKeydownEventMap>{
      code: code,
      shift: shiftKey,
      value,
      event,
    });
  }
};

const enable = (config: VirtualizerConfig | {} = {}) => {
  if (setup.isActive) {
    console.warn(
      `[Virtualizer]: Virtualizer has been already enabled with the following config`,
      setup.config
    );
    return;
  }

  setup.isActive = true;
  setup.config = { ...defaultConfig, ...config } as VirtualizerConfig;

  if (setup.config.enableWheel) {
    _on("wheel", window, handleWheel);
  }

  if (setup.config.enableTouch || setup.config.enableDrag) {
    _on("pointerdown", window, handlePointerDown);
    _on("pointermove", window, handlePointerMove);
    _on("pointerup", window, handlePointerUp);
  }

  if (setup.config.enableKeyboard) {
    _on("keydown", window, handleKeyDown);
  }
};

const disable = () => {
  setup.isActive = false;

  if (setup.config.enableWheel) {
    _off("wheel", window, handleWheel);
  }

  if (setup.config.enableTouch || setup.config.enableDrag) {
    _off("pointerdown", window, handlePointerDown);
    _off("pointermove", window, handlePointerMove);
    _off("pointerup", window, handlePointerUp);
  }

  if (setup.config.enableKeyboard) {
    _off("keydown", window, handleKeyDown);
  }
};

const handle: VirtualizerEventHandler = (event, cb) => {
  _on(EVENTS[event], cb);
};

const detatch: VirtualizerEventHandler = (event, cb) => {
  _off(EVENTS[event], cb);
};

export { enable, disable, handle, detatch };

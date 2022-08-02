import { emit, off as _off, on as _on } from "@nabilk/bigbro";
import normalizeWheel from "normalize-wheel";

interface VirtualizerConfig {
  wheelMultiplier: number;
  touchMultiplier: number;
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

interface VirtualizerEventMap {
  wheel: (ev: VirtualizerWheelEventMap) => void;
  pointerdown: (ev: VirtualizerPointerDownEventMap) => void;
  pointermove: (ev: VirtualizerPointerMoveEventMap) => void;
  pointerup: (ev: VirtualizerPointerUpEventMap) => void;
}

type VirtualizerInternalEvents = {
  [key in "wheel" | "pointerdown" | "pointermove" | "pointerup"]: string;
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
};

const defaultConfig: VirtualizerConfig = {
  wheelMultiplier: 1,
  touchMultiplier: 1,
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
  emit(EVENTS.wheel, <VirtualizerWheelEventMap>{
    ...normalizeWheel(event),
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

  event.preventDefault();

  if (buttons != 1) return;

  emit(EVENTS.pointermove, <VirtualizerPointerMoveEventMap>{
    dragX: (clientX || 0) - pointer.x,
    dragY: (clientY || 0) - pointer.y,
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

  _on("wheel", window, handleWheel);

  if (setup.config.enableTouch || setup.config.enableDrag) {
    _on("pointerdown", window, handlePointerDown);
    _on("pointermove", window, handlePointerMove);
    _on("pointerup", window, handlePointerUp);
  }
};

const disable = () => {
  setup.isActive = false;

  _off("wheel", window, handleWheel);

  if (setup.config.enableTouch || setup.config.enableDrag) {
    _off("pointerdown", window, handlePointerDown);
    _off("pointermove", window, handlePointerMove);
    _off("pointerup", window, handlePointerUp);
  }
};

const handle: VirtualizerEventHandler = (event, cb) => {
  _on(EVENTS[event], cb);
};

const detatch: VirtualizerEventHandler = (event, cb) => {
  _off(EVENTS[event], cb);
};

export { enable, disable, handle, detatch };

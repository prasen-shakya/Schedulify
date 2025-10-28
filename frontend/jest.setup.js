// Polyfill TextEncoder / TextDecoder for react-router et al.
import { TextEncoder, TextDecoder } from "util";

if (!global.TextEncoder) {
  global.TextEncoder = TextEncoder;
}
if (!global.TextDecoder) {
  // @ts-ignore - TextDecoder type may not be in node typings depending on setup
  global.TextDecoder = TextDecoder;
}
import "@testing-library/jest-dom";

// Minimal <dialog> polyfill for showModal/close in jsdom
if (typeof HTMLDialogElement !== "undefined") {
  HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  HTMLDialogElement.prototype.close = function () { this.open = false; };
}

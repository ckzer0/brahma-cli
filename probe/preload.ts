import { JSDOM } from "jsdom";

const {
  window: { document, MutationObserver },
} = new JSDOM();

global.document = document;
global.MutationObserver = MutationObserver;

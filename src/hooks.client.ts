import detectMobile from "ismobilejs";
import { log } from "$lib/utils/logger";

globalThis.log = log;
window.log = log;
window.isMobile = detectMobile(window.navigator).any;

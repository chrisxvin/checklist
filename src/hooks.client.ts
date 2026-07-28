import "@buxton/core/global";
import "@buxton/core/polyfill";
import detectMobile from "ismobilejs";

window.isMobile = detectMobile(window.navigator).any;

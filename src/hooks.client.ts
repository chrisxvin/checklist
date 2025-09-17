import detectMobile from "ismobilejs";
import { installGlobal } from "@cyysummer/core";

installGlobal();
window.isMobile = detectMobile(window.navigator).any;

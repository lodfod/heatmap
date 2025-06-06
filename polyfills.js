// Import polyfills for Node.js modules
import "react-native-url-polyfill/auto";

// Set up global polyfills for crypto and other Node.js modules
import { Buffer } from "@craftzdog/react-native-buffer";
global.Buffer = Buffer;

// Polyfill TextEncoder/TextDecoder if needed
if (typeof global.TextEncoder === "undefined") {
  global.TextEncoder = require("text-encoding").TextEncoder;
}
if (typeof global.TextDecoder === "undefined") {
  global.TextDecoder = require("text-encoding").TextDecoder;
}

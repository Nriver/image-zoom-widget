// If it doesn’t work in the browser, try increasing the delay to better suit your settings.
var executeDelay = 200;

var zoomFactor = 1.3;    // Zoom factor for mouse wheel, large factor results in faster zoom
var minZoomScale = 0.1;  // Minimum zoom scale
var maxZoomScale = 10;    // Maximum zoom scale

module.exports = {
    executeDelay,
    minZoomScale,
    maxZoomScale,
    zoomFactor
}
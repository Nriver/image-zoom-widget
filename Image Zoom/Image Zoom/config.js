// Change language name to anyone you like in the translations file. For example, 'cn' for Chinese, 'en' for English and 'de' for German.
var lang = 'en';

// If it doesn’t work in the browser, try increasing the delay to better suit your settings.
var executeDelay = 200;

var zoomFactor = 1.3;    // Zoom factor for mouse wheel, large factor results in faster zoom
var minZoomScale = 0.2;  // Minimum zoom scale
var maxZoomScale = 5;    // Maximum zoom scale

module.exports = {
    lang,
    executeDelay,
    minZoomScale,
    maxZoomScale,
    zoomFactor
}

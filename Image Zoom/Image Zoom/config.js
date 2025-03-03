// Change language name to anyone you like in the translations file. For example, 'cn' for Chinese, 'en' for english.
var lang = 'en';

// If it doesn’t work in the browser, try increasing the delay to better suit your settings.
var executeDelay = 200;

// Mouse Scroll Settings
var zoomFactor = 1.3;    // Zoom factor for mouse wheel, large factor results in faster zoom
var minZoomScale = 0.2;  // Minimum zoom scale
var maxZoomScale = 5;    // Maximum zoom scale

// Initial image scaling settings  
var initialDisplayMode = 'imageMultiple'; // Defines the scaling mode: 'imageMultiple' (fixed multiplier) or 'screenPercentage' (relative to screen size)
var screenPercentage = 0.3; // Scaling factor for 'screenPercentage' mode (0.3 = 30% of the screen size)  
var imageMultiple = 1.4; // Scaling factor for 'imageMultiple' mode (1.4 = 140% of the original image size)  

// Define how image preview is triggered
var previewTrigger = 'click'; // 'click' (single click) or 'dblclick' (double click)

module.exports = {
    lang,
    executeDelay,
    minZoomScale,
    maxZoomScale,
    zoomFactor,
    initialDisplayMode,
    screenPercentage,
    imageMultiple,
    previewTrigger
}
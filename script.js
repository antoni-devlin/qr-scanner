// General setup
let output = document.getElementById("output");
let isUrl = new RegExp(
  "https?://(www.)?[-a-zA-Z0-9@:%._+~#=]{1,256}.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)"
);

// Function to validate urls
function isValidHttpUrl(string) {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

// Detect whether the current browser supports barcode detection, and let the user know.
let supportMessage = document.getElementById("support-message");

if (!("BarcodeDetector" in window)) {
  supportMessage.innerText =
    "This device/browser does not support barcode detection.";
} else {
  console.log("Barcode detection supported!");
}

// CREATE THE VIDEO STREAM

// Get the video element
const video = document.getElementById("video");

// Check if device has a camera
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  //   Use video without audio
  const constraints = {
    video: { facingMode: "environment" },
    audio: false,
  };

  //   Start video stream
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then((stream) => (video.srcObject = stream));
}

// BARCODE SCANNING

// Create new instance of barcodeDetector class

const barcodeDetector = new BarcodeDetector({ formats: ["qr_code"] });

// Detect barcode function
const detectCode = () => {
  //   Start detecting codes in the video element
  barcodeDetector
    .detect(video)
    .then((codes) => {
      //   If no codes detected, exit function
      if (codes.length === 0) {
        return;
      } else {
        for (const barcode of codes) {
          // Log detected barcode to the console
          console.log(barcode.rawValue);
          output.innerText = barcode.rawValue;
          // Check if barcode value is a url
          if (isValidHttpUrl(barcode.rawValue)) {
            output.innerHTML = `Code value: <a href='${barcode.rawValue}'>${barcode.rawValue}<a>.`;
          } else {
            output.innerText = `Code value: ${barcode.rawValue}`;
          }
        }
      }
    })
    .catch((err) => {
      //     Log any errors
      console.error(err);
    });
};

// Run detect function every 100 milliseconds
setInterval(detectCode, 100);

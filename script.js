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

// if (!("BarcodeDetector" in window)) {
//   supportMessage.innerText =
//     "This device/browser does not support barcode detection.";
// } else {
//   console.log("Barcode detection supported!");
// }

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
function detectCode() {
  //   Start detecting codes in the video element
  barcodeDetector
    .detect(video)
    .then((codes) => {
      //   If a code is detected
      if (codes) {
        output.classList.remove("hidden");
        for (const barcode of codes) {
          // Check if barcode value is a url
          output.innerHTML = formatBarcodeString(barcode);

          saveToHistory(barcode);
        }
      }
    })
    .catch((err) => {
      //     Log any errors
      console.error(err);
    });
  requestAnimationFrame(detectCode);
}
requestAnimationFrame(detectCode);

// Modal logic
let bodyEl = document.getElementsByTagName("body")[0];
let pastScans = document.getElementById("past-scans");

const modal = {
  el: document.getElementById("modal"),
  show: function () {
    this.el.style.bottom = "0";
    return (this.visible = true);
  },
  hide: function () {
    this.el.style.bottom = "-540px";
    return (this.visible = false);
  },
  visible: false,
};

function saveToHistory(barcode) {
  let pastScanList = document.getElementById("past-scans");
  let newListItem = document.createElement("li");
  let latestItem = pastScanList.firstChild;
  newListItem.innerHTML = `${formatBarcodeString(barcode)} - ${getTimestamp()}`;

  pastScanList.insertBefore(newListItem, latestItem);
}

function formatBarcodeString(barcode) {
  let formattedBarcodeData;
  if (isValidHttpUrl(barcode.rawValue)) {
    formattedBarcodeData = `<a href='${barcode.rawValue}'>${barcode.rawValue}<a>.`;
  } else {
    formattedBarcodeData = `${barcode.rawValue}`;
  }
  return formattedBarcodeData;
}

function isDescendant(el, parentId) {
  let isChild = false;
  if (el.id === parentId) {
    isChild = true;
  }

  while ((el = el.parentNode)) {
    if (el.id == parentId) {
      isChild = true;
    }
  }

  return isChild;
}

// Show history modal when clicking on modal
document.addEventListener("click", (e) => {
  if (!modal.visible && isDescendant(e.target, modal.el.id)) {
    modal.show();
  }
});

// Hide history modal on click outside the modal
document.addEventListener("click", (e) => {
  if (modal.visible && !isDescendant(e.target, modal.el.id)) {
    modal.hide();
  }
});

function getTimestamp() {
  let now = new Date();
  let date = new Date().toLocaleDateString().padStart(10, "0");
  let time = new Date().toLocaleTimeString();

  let timestamp = `${date}, ${time}`;
  return timestamp;
}

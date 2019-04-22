// Content script
let beacon = document.createElement("div");
beacon.className = "extension-is-installed";
console.log("BEACON: ", beacon)
document.body.appendChild(beacon);

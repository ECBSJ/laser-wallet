console.log("[LaserProvider] Attempting to inject LaserProvider...");
const script = document.createElement("script");
script.src = chrome.runtime.getURL("injection.js");
script.type = "module";
document.head.prepend(script);

// Create a connection to the background script with the name "content<>background"
const port = chrome.runtime.connect({ name: "content<>background" });

// Listen for messages directly from the popup / doMoreContentScript
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.jsonrpc === "2.0") {
    window.postMessage(message, window.location.origin);
  }
});

// Listen for messages from the document page
document.addEventListener("laserwallet_request", (event) => {
  console.log("[LaserProvider] Request for confirmation received from Document dispatch: ", event);
  console.log("[LaserProvider] Port Info: ", port);

  // Forward message to the background script
  port.postMessage({ type: "FROM_CONTENT_TO_BG", ...event.detail });

  return true;
});

// Listen for messages from the background script
port.onMessage.addListener((message) => {
  console.log("Message from background script back to content:", message.data);
});

let latestNames =  [];

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "notify") {
    const name = msg.name;
    const time = msg.time;

    chrome.notifications.create({
      type: "basic",
      iconUrl: "eye.png",
      title: `${name.charAt(0).toUpperCase() + name.slice(1)} is a lazybones!`,
      message: `${name} has been slacking for ${time}m.`
    });
  }
  if (msg.type === "get_names") {
    sendResponse({ names: latestNames}); // send as array
  }
  if (msg.type === "update_names") {
    latestNames = msg.names;
  }
});

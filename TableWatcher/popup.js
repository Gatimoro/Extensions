let excludedSet = new Set();

// Fetch the excluded set from storage when the popup is opened
chrome.storage.sync.get(['excluded'], async (result) => {
  excludedSet = new Set(result.excluded || []);

  chrome.runtime.sendMessage({ type: "get_names" }, async (response) => {
    const names = response.names || [];
    const container = document.getElementById("name-container");

    names.forEach(name => {
      const pill = document.createElement("div");
      pill.className = "name-pill";
      pill.textContent = name;

      // If the name is in the excluded set, apply the "excluded" style
      if (excludedSet.has(name)) {
        pill.classList.add("excluded");
      }

      pill.onclick = () => {
        // Toggle the exclusion status in the set
        if (excludedSet.has(name)) {
          excludedSet.delete(name);  // Remove from the excluded set
        } else {
          excludedSet.add(name);  // Add to the excluded set
        }

        // Toggle the class for styling based on exclusion status
        pill.classList.toggle("excluded");

        // Save the updated excluded set to storage
        chrome.storage.sync.set({ excluded: Array.from(excludedSet) });

        // Send the updated excluded set to content or wherever needed
        chrome.runtime.sendMessage({ type: "update_excluded", excluded: Array.from(excludedSet) });
      };

      container.appendChild(pill);
    });
  });
});

// Function to get excluded set (from storage)
function getExcluded() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['excluded'], (result) => {
      resolve(new Set(result.excluded || []));  // Resolving with an empty set if none
    });
  });
}

// Listen for the message from content to get excluded names
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "get_excluded") {
    sendResponse({ excluded: Array.from(excludedSet) });  // Send the excluded set as an array
  }
});
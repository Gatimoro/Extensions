const allNames = new Set();
let excludedSet = new Set(); // initially empty

function waitForElement(selector, timeout = 60000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const interval = setInterval(() => {
      const el = document.querySelector(selector);
      if (el) {
        clearInterval(interval);
        resolve(el);
      } else if (Date.now() - start > timeout) {
        clearInterval(interval);
        reject(new Error("Timeout waiting for element"));
      }
    }, 500);
  });
}

function getExcluded() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['excluded'], (result) => {
      resolve(new Set(result.excluded || []));
    });
  });
}

(async function () {
  const kidsDiv = await waitForElement("#kids");

  const observer = new MutationObserver(async () => { // Make this async so you can use await
    const table = kidsDiv.querySelector("table");
    if (!table) return;

    const rows = table.querySelectorAll("tr");
    
    // Wait for the excluded names to be fetched before processing the rows
    excludedSet = await getExcluded();

    rows.forEach((row) => {
      const cells = row.querySelectorAll("td");
      if (cells.length >= 3) {
        const name = cells[0].textContent.trim();
        const time = cells[1].textContent.trim();
        const activity = cells[2].textContent.trim();
        
        if (!allNames.has(name)) {
          allNames.add(name);
          chrome.runtime.sendMessage({
            type: "update_names",
            names: Array.from(allNames),
          });
        }

        // console.log(name, time, activity);

        if (!excludedSet.has(name) && activity === "" && Number(time) >= 3) {
          chrome.runtime.sendMessage({ type: "notify", name: name, time: time });
          console.log("Bad", name);
        }
      }
    });
    // console.log(allNames);
  });

  observer.observe(kidsDiv, { childList: true, subtree: true });
})();
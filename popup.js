/** @format */
// wait for document to load
document.addEventListener("DOMContentLoaded", async () => {
	// get the button element

	const extractButton = document.getElementById("extractButton"); // Replace with your button/link ID

	extractButton.addEventListener("click", () => {
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			const activeTab = tabs[0]; // Get the active tab
			let targetUrl = /https:\/\/www\.myntra\.com\/.*\/buy/i;
			let url = activeTab.url;
			if (url.match(targetUrl)) {
				// Ensure the captured URL matches the pattern
				console.log("Fetching HTML...", url);

				getPdpDataFromMyntra(url)
					.then((pdpData) => {
						if (pdpData) {
							console.log("pdpData:", pdpData);
							// Access and use the extracted data here
							sendResponse({ success: true, data: pdpData });
						} else {
							console.error("pdpData not found");
							sendResponse({ success: false, data: "pdpData not found" });
						}
					})
					.catch((error) => {
						sendResponse({
							success: false,
							error: "Error fetching or parsing HTML: " + error,
						});
					});
			} else {
				sendResponse({
					success: false,
					error: "URL doesn't match the target pattern.",
				});
			}

			async function getPdpDataFromMyntra(url) {
				try {
					const response = await fetch(url);
					const html = await response.text();

					const parser = new DOMParser();

					chrome.runtime.getBackgroundPage((backgroundPage) =>
						backgroundPage.jsontohtml({ hello: "moto" })
					);

					const doc = parser.parseFromString(html, "text/html");

					// Select all script tags
					const scriptTags = doc.querySelectorAll("script");
					const matchingScripts = [];

					for (const script of scriptTags) {
						if (script.textContent.includes("window.__myx ")) {
							matchingScripts.push(script);
						}
					}
					console.log("matchingScripts is ", matchingScripts);

					let startIndex = matchingScripts?.[0].innerText.indexOf("{");
					let jsonString = matchingScripts?.[0].innerText.substring(startIndex);
					let jsonObject = JSON.parse(jsonString);
					let pdpData = jsonObject.pdpData;
					document.getElementById("json").innerHTML = jsontohtml(pdpData);
					return pdpData;
				} catch (error) {
					console.error("Error fetching or parsing HTML:", error);
					return null;
				}
			}
		});
	});
});

const tabs = [...document.querySelectorAll("[data-app-tab]")];
const panels = [...document.querySelectorAll("[data-app-panel]")];
const appIds = new Set(tabs.map(tab => tab.dataset.appTab));
const studioFrame = document.querySelector('[data-app-panel="studio"] iframe');
const converterFrame = document.querySelector('[data-app-panel="audio2ct"] iframe');

function activateApp(appId, updateLocation = true) {
  const selectedApp = appIds.has(appId) ? appId : "studio";

  for (const tab of tabs) {
    const selected = tab.dataset.appTab === selectedApp;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
  }

  for (const panel of panels) {
    const selected = panel.dataset.appPanel === selectedApp;
    panel.classList.toggle("is-active", selected);
    panel.setAttribute("aria-hidden", String(!selected));
  }

  if (updateLocation && location.hash !== `#${selectedApp}`) {
    history.replaceState(null, "", `#${selectedApp}`);
  }
}

for (const [index, tab] of tabs.entries()) {
  tab.addEventListener("click", () => activateApp(tab.dataset.appTab));
  tab.addEventListener("keydown", event => {
    let nextIndex;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = tabs.length - 1;
    else return;

    event.preventDefault();
    tabs[nextIndex].focus();
    activateApp(tabs[nextIndex].dataset.appTab);
  });
}

window.addEventListener("hashchange", () => activateApp(location.hash.slice(1), false));
window.addEventListener("message", event => {
  if (event.source !== converterFrame.contentWindow) return;
  if (event.data?.type !== "chiptune-studio:import-song") return;

  const song = event.data.song;
  if (!song || typeof song !== "object" || Array.isArray(song)) return;

  studioFrame.contentWindow.postMessage({
    type: "chiptune-studio:import-song",
    song
  }, "*");
  activateApp("studio");
});
activateApp(location.hash.slice(1), false);

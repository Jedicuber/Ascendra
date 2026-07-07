const colors = {
    purple: "rgb(127, 0, 255)",
    blue: "rgb(37, 99, 235)",
    green: "rgb(22, 163, 74)",
    pink: "rgb(219, 39, 119)"
};

function applyGlobalSettings() {
    const saved = JSON.parse(localStorage.getItem("ascendraSettings"));

    if (!saved) return;

    document.documentElement.style.setProperty("--accent", colors[saved.accentColor]);

    if (saved.lightMode) {
        document.documentElement.style.setProperty("--bg", "#f6f3ff");
        document.documentElement.style.setProperty("--card", "white");
        document.documentElement.style.setProperty("--text", "#222");
        document.documentElement.style.setProperty("--muted", "#666");
    } else {
        document.documentElement.style.setProperty("--bg", "#111827");
        document.documentElement.style.setProperty("--card", "#1f2937");
        document.documentElement.style.setProperty("--text", "#f9fafb");
        document.documentElement.style.setProperty("--muted", "#cbd5e1");
    }
}

applyGlobalSettings();
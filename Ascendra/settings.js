document.addEventListener("DOMContentLoaded", () => {

    function setupGroup(containerSelector) {
        const container = document.querySelector(containerSelector);
        if (!container) return;

        const buttons = container.querySelectorAll(".option-btn");

        buttons.forEach(btn => {
            btn.addEventListener("click", () => {

                // remove active from siblings
                buttons.forEach(b => b.classList.remove("active"));

                // set active
                btn.classList.add("active");

                // save choice
                const key = container.querySelector("h2").innerText;
                localStorage.setItem(key, btn.innerText);
            });
        });
    }

    // setup each setting block
    document.querySelectorAll(".setting-block").forEach(block => {
        setupGroup(`#${block.id || ""}`);
    });

});

function goTo(page) {
    location.window.href=page;
}
    const buttons = document.querySelectorAll("#nav button");

    const radius = 220;
    let angle = 0;

    function animate() {
        angle += 0.002;

        buttons.forEach((button, i) => {

            const a = angle + i * (Math.PI * 2 / buttons.length);

            const x = Math.cos(a) * radius;
            const y = Math.sin(a) * radius;

            button.style.left = x + "px";
            button.style.top = y + "px";
        });

        requestAnimationFrame(animate);
    }

    animate();

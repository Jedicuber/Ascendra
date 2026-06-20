const form = document.getElementById("login");

form.addEventListener("submit", function(event) {
    event.preventDefault();

    console.log("Login submitted!");
});
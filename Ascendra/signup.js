const form = document.getElementById("signupForm");

form.addEventListener("submit", function(event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const name = document.getElementById("name").value;
    const surname = document.getElementById("surname").value;
    const password = document.getElementById("password").value;

    const user = {
        name: name,
        surname: surname,
        username: username
    };

    console.log("Form submitted!");
    console.log(user);
    console.log("Password entered");
});
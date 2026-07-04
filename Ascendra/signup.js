const signupForm = document.getElementById("signupForm");

signupForm.addEventListener("submit", function(event) {
    event.preventDefault();

   const name = document.getElementById("name").value.trim();
const surname = document.getElementById("surname").value.trim();
const username = document.getElementById("username").value.trim();
const password = document.getElementById("password").value;

localStorage.setItem("name", name);
localStorage.setItem("surname", surname);
localStorage.setItem("username", username);
localStorage.setItem("password", password);
    const user = {
        name: name,
        surname: surname,
        username: username,
        password: password
    };

    localStorage.setItem(username, JSON.stringify(user));

    alert("Account created!");

    window.location.href = "home.html";

    signupForm.reset();
});

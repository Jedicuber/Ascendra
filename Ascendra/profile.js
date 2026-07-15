document.addEventListener("DOMContentLoaded", function () {
    const nameInput = document.getElementById("name-input");
    const surnameInput = document.getElementById("surname-input");
    const usernameInput = document.getElementById("username-input");
    const bioInput = document.getElementById("bio-input");

    const displayName = document.getElementById("display-name");
    const displayUsername = document.getElementById("display-username");
    const displayBio = document.getElementById("display-bio");

    const saveButton = document.getElementById("save-button");
    const saveMessage = document.getElementById("save-message");

    const profileUpload = document.getElementById("profile-upload");
    const profilePicture = document.getElementById("profile-picture");

    const characterCount = document.getElementById("character-count");

    const streakNumber = document.getElementById("streak-number");
    const tasksNumber = document.getElementById("tasks-number");
    const achievementsNumber =
        document.getElementById("achievements-number");

    function loadProfile() {
        const savedName =
            localStorage.getItem("name") || "Ascendra";

        const savedSurname =
            localStorage.getItem("surname") || "User";

        const savedUsername =
            localStorage.getItem("username") || "ascendrauser";

        const savedBio =
            localStorage.getItem("ascendra-profile-bio") ||
            "Becoming better, one day at a time.";

        const savedPicture =
            localStorage.getItem("ascendra-profile-picture");

        nameInput.value = savedName;
        surnameInput.value = savedSurname;
        usernameInput.value = savedUsername;
        bioInput.value = savedBio;

        displayName.textContent =
            savedName + " " + savedSurname;

        displayUsername.textContent =
            "@" + savedUsername;

        displayBio.textContent = savedBio;

        characterCount.textContent =
            savedBio.length + " / 120";

        streakNumber.textContent =
            localStorage.getItem("ascendra-streak") || "0";

        tasksNumber.textContent =
            localStorage.getItem("ascendra-tasks-completed") || "0";

        achievementsNumber.textContent =
            localStorage.getItem("ascendra-achievements") || "0";

        if (savedPicture) {
            profilePicture.src = savedPicture;
        }
    }

    function cleanUsername(username) {
        return username
            .trim()
            .replace(/@/g, "")
            .replace(/\s+/g, "");
    }

    function showMessage(message, type) {
        saveMessage.textContent = message;

        if (type === "success") {
            saveMessage.className = "success-message";
        } else {
            saveMessage.className = "error-message";
        }

        setTimeout(function () {
            saveMessage.textContent = "";
            saveMessage.className = "";
        }, 3000);
    }

    saveButton.addEventListener("click", function () {
        const name = nameInput.value.trim();
        const surname = surnameInput.value.trim();
        const username = cleanUsername(usernameInput.value);
        const bio = bioInput.value.trim();

        if (name === "") {
            showMessage(
                "Please enter your first name.",
                "error"
            );

            return;
        }

        if (surname === "") {
            showMessage(
                "Please enter your surname.",
                "error"
            );

            return;
        }

        if (username === "") {
            showMessage(
                "Please enter a username.",
                "error"
            );

            return;
        }

        const oldUsername =
            localStorage.getItem("username");

        let savedPassword = "";

        if (oldUsername) {
            const oldUserData =
                localStorage.getItem(oldUsername);

            if (oldUserData) {
                try {
                    const oldUser =
                        JSON.parse(oldUserData);

                    savedPassword =
                        oldUser.password || "";
                } catch (error) {
                    console.error(
                        "Could not read saved user:",
                        error
                    );
                }
            }
        }

        const updatedUser = {
            name: name,
            surname: surname,
            username: username,
            password: savedPassword
        };

        localStorage.setItem("name", name);
        localStorage.setItem("surname", surname);
        localStorage.setItem("username", username);

        localStorage.setItem(
            "ascendra-profile-bio",
            bio
        );

        localStorage.setItem(
            username,
            JSON.stringify(updatedUser)
        );

        if (
            oldUsername &&
            oldUsername !== username
        ) {
            localStorage.removeItem(oldUsername);
        }

        displayName.textContent =
            name + " " + surname;

        displayUsername.textContent =
            "@" + username;

        displayBio.textContent =
            bio ||
            "Becoming better, one day at a time.";

        usernameInput.value = username;

        showMessage(
            "Profile saved successfully!",
            "success"
        );
    });

    bioInput.addEventListener("input", function () {
        characterCount.textContent =
            bioInput.value.length + " / 120";
    });

    profileUpload.addEventListener(
        "change",
        function (event) {
            const selectedFile =
                event.target.files[0];

            if (!selectedFile) {
                return;
            }

            if (
                !selectedFile.type.startsWith("image/")
            ) {
                showMessage(
                    "Please choose an image file.",
                    "error"
                );

                profileUpload.value = "";
                return;
            }

            const reader = new FileReader();

            reader.addEventListener(
                "load",
                function () {
                    profilePicture.src =
                        reader.result;

                    try {
                        localStorage.setItem(
                            "ascendra-profile-picture",
                            reader.result
                        );

                        showMessage(
                            "Profile picture updated!",
                            "success"
                        );
                    } catch (error) {
                        showMessage(
                            "That image is too large.",
                            "error"
                        );
                    }
                }
            );

            reader.readAsDataURL(selectedFile);
        }
    );

    loadProfile();
});

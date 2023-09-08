// Import the functions you need from the SDKs you need

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-app.js";
import { getDatabase, get, set, ref as databaseRef, update } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-auth.js";
import { getStorage, uploadBytes, ref as storageRef, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-storage.js";
// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration

const firebaseConfig = {

    apiKey: "AIzaSyBVBIU4r9sAD3F0g-apemzCt5WqpDD_zwU",

    authDomain: "byrch-ctf.firebaseapp.com",

    projectId: "byrch-ctf",

    storageBucket: "byrch-ctf.appspot.com",

    messagingSenderId: "702042955039",

    appId: "1:702042955039:web:7ee253fcf9489c3917642a"

};


// Initialize Firebase

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth();
const storage = getStorage();


// auth.js

if (window.location.href.includes("login")) {
    // This code will run if auth.js is on the login.html page
    console.log("This is the login page.");
    login.addEventListener('click', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in 
                const user = userCredential.user;
                const dt = new Date();

                update(databaseRef(database, 'users/' + user.uid), {
                    onlineStatus: true
                })

                window.location.href = "../challenges";

                // ...
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                alert(errorMessage);
            });
    });
} else if (window.location.href.includes("signup")) {
    // This code will run if auth.js is on the signup.html page
    console.log("This is the signup page.");

    signUp.addEventListener('click', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const username = document.getElementById('username').value;
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in 
                let user = userCredential.user;

                const locationRef = storageRef(storage, `PFP-${user.uid}`);
                const profileUpload = document.getElementById('profile');
                const avatar = document.getElementById('avatar');

                // Upload profile pictures
                const file = profileUpload.files[0];

                let profileURL; // Declare profileURL outside of the callback

                uploadBytes(locationRef, file)
                    .then((snapshot) => {
                        console.log('Uploaded a blob or file!');
                        return getDownloadURL(snapshot.ref);
                    })
                    .then((url) => {
                        console.log(url);
                        profileURL = url; // Assign the URL to profileURL
                    })
                    .then(() => {
                        // After obtaining the URL, you can proceed to set the user's profile
                        set(databaseRef(database, 'users/' + user.uid), {
                            username: username,
                            email: email,
                            score: 0,
                            challenges: {
                                c1: false,
                                c2: false,
                                c3: false,
                                c4: false,
                                c5: false,
                                c6: false,
                                c7: false,
                                c8: false,
                                c9: false
                            },
                            onlineStatus: false,
                            last_login: "Never",
                            profile: profileURL // Use the profileURL here
                        });
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                    });


                // redirect to index
                alert("Account created! Please login to continue.");
                // ...
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorMessage);
                // ..
            });

           
            
            
    });
    
    

} else {
    // This code will run if auth.js is on neither page
    console.log("This is neither the login page nor the signup page.");
}

// Currently in user account (make user-specific things here.)
const user = auth.currentUser;

onAuthStateChanged(auth, (user) => {
    if (user) {
        const uid = user.uid;
        auth.setPersistence('local');

        // Document event listener click on id profile
        // event listener for dom to load
        

        if (window.location.href.includes("challenges")) {

            get(databaseRef(database, 'users/' + user.uid))
                .then((snapshot) => {
                    if (snapshot.exists()) {
                        const userData = snapshot.val();
                        const onlineStatus = userData.onlineStatus;
                        console.log('Online Status:', onlineStatus);

                        var imgElement = document.getElementById("nav-img");

                        // Update the src attribute with the 'url' variable
                        imgElement.src = userData.profile;

                        try {

                            // 1. Create a reference to the user's data in the database

                            // Get completed challenges from /users/{userId}/challenges
                            const challengesRef = userData.challenges;
                            // For each challenge, see if it is completed
                            for (const challengeId in challengesRef) {
                                const isCompleted = challengesRef[challengeId];
                                // If the challenge is completed, add the "completed" class to the corresponding challenge button
                                if (isCompleted) {
                                    const challengeButton = document.querySelector(`#${challengeId}`);
                                    challengeButton.classList.add('completed');
                                }
                            }

                            const username = userData.username;
                            const email = user.email;

                            // 4. Do what you wish with the user details


                            const modal = document.querySelector('.modal');
                            const modalContent = document.querySelector('.data-modal-content'); // Updated modal content selector
                            const flagInput = document.querySelector('.flag-input');
                            const submitButton = document.querySelector('.submit-button');

                            // Assuming you have defined your challenges in questions.js as an array of objects
                            // const challenges = [...] 

                            // Loop through challenge buttons and update their content
                            document.querySelectorAll('.challenge-buttons').forEach((button, index) => {
                                const challengeData = challenges[index]; // Get the corresponding challenge data
                                const challengeText = button.querySelector('.challenge-text');
                                const challengePoints = button.querySelector('.challenge-points');

                                // Update the button content
                                challengeText.textContent = challengeData.title;
                                challengePoints.textContent = challengeData.points + ' pts';
                            });


                            function toggleModal() {
                                modal.classList.toggle("show-modal");
                            }
                            // Event listener for challenge button click
                            document.querySelectorAll('.challenge-buttons').forEach(button => {
                                button.addEventListener('click', function () {
                                    const challengeId = this.dataset.challenge;
                                    const challengeData = challenges.find(challenge => challenge.id === challengeId);
                                    openModal(challengeData);

                                });
                            });

                            // Function to open the modal
                            function openModal(challengeData) {
                                toggleModal(); // Open the modal
                                modalContent.innerHTML = `
                            <span id="close">&times;</span>
                            <h2>${challengeData.title}</h2>
                            <h3>${challengeData.points} pts</h3>
                            <hr style="height:2px;border-width:0;color:gray;background-color:gray">
                            <h4>${challengeData.question}</h4>
                            <input type="text" placeholder="Flag" class="flag-input">
                            <button class="submit-button">Submit</button>
                        `;

                                const submitButton = modalContent.querySelector('.submit-button');
                                submitButton.addEventListener('click', function () {
                                    const inputValue = modalContent.querySelector('.flag-input').value;
                                    const challengeId = challengeData.id;
                                    checkAnswer(challengeData, inputValue, challengeId);
                                });

                                // Add an event listener for the 'keydown' event on the input field
                                const flagInput = modalContent.querySelector('.flag-input');
                                flagInput.addEventListener('keydown', function (event) {
                                    // Check if the key pressed is the Enter key (key code 13)
                                    if (event.keyCode === 13) {
                                        const inputValue = flagInput.value;
                                        const challengeId = challengeData.id;
                                        checkAnswer(challengeData, inputValue, challengeId);
                                    }
                                });

                                function close(challengeData, challengeButtonId) {
                                    console.log('close called');
                                    toggleModal(challengeData);
                                }

                                document.getElementById('close').addEventListener('click', close);

                                // Event listener for clicking outside the modal to close it
                                window.addEventListener('click', function (event) {
                                    if (event.target === modal) {
                                        close();
                                    }
                                });
                            }

                            function checkAnswer(challengeData, inputValue, challengeButtonId) {
                                console.log('checkAnswer called');
                                console.log('Challenge Data:', challengeData);
                                console.log('Input Value:', inputValue);

                                const userAnswer = inputValue.trim().toLowerCase();
                                const correctAnswer = challengeData.answer.trim().toLowerCase();

                                if (userAnswer === correctAnswer) {
                                    console.log('Correct Answer'); // Add this line
                                    const canvas = document.querySelector('#confetti')

                                    const jsConfetti = new JSConfetti({ canvas })
                                    jsConfetti.addConfetti();
                                    toggleModal();
                                    // Add the "completed" class to the challenge button
                                    console.log(userData.score + challengeData.points);
                                    console.log("UserData score" + userData.score);
                                    console.log("ChallengeData points" + challengeData.points);
                                    update(databaseRef(database, 'users/' + user.uid), {
                                        // Increment the user's score by the challenge points
                                        [`score`]: userData.score + challengeData.points,
                                        [`challenges/${challengeData.id}`]: true
                                    })

                                    const challengeButton = document.querySelector(`#${challengeButtonId}`);
                                    challengeButton.classList.add('completed');

                                } else {

                                    console.log('Incorrect Answer'); // Add this line
                                }
                            }

                            document.addEventListener('click', function (event) {
                                if (event.target.classList.contains('submit-button')) {
                                    const inputValue = flagInput.value;
                                    console.log('Input Value:', inputValue);
                                    const challengeId = modalContent.querySelector('h2').textContent.toLowerCase();
                                    const challengeData = challenges.find(challenge => challenge.id === challengeId);
                                    checkAnswer(challengeData, inputValue);
                                }
                            });
                        } catch (error) {
                            console.error("Error fetching user data:", error);
                        }
                    } else {
                        console.log('No such document!');
                    }
                })
                .catch((error) => {
                    console.error('Error getting document:', error);
                });
                
        }

        // Populate Scoreboard
        if (window.location.href.includes("scoreboard")) {
            // Reference to the Firebase database

            // Reference to the leaderboard container
            const leaderboardContainer = document.querySelector('.leaderboard-container');

            // Function to populate the HTML with data from Firebase
            function populateLeaderboard(username, score, profile) {
                // Create a new row for the leaderboard
                const row = document.createElement('tr');

                // Create the place/number column
                const placeColumn = document.createElement('th');
                placeColumn.classList.add('place', 'number');
                row.appendChild(placeColumn);

                // Create the profile picture and name column
                const pfpNameColumn = document.createElement('td');
                pfpNameColumn.classList.add('pfp_name');

                const avatar = document.createElement('img');
                avatar.src = profile; // Profile picture
                avatar.alt = `${username} profile picture`; 
                avatar.classList.add('avatar');
                pfpNameColumn.appendChild(avatar);

                const usernameText = document.createTextNode(username);
                pfpNameColumn.appendChild(usernameText);

                const tauntLink = document.createElement('a');
                tauntLink.href = '#';
                tauntLink.classList.add('tooltip');
                tauntLink.id = 'taunt';

                const ghostIcon = document.createElement('i');
                ghostIcon.classList.add('fa-solid', 'fa-ghost');
                tauntLink.appendChild(ghostIcon);

                const tooltipSpan = document.createElement('span');
                tooltipSpan.classList.add('tooltiptext');
                tooltipSpan.textContent = 'Taunt';
                tauntLink.appendChild(tooltipSpan);

                pfpNameColumn.appendChild(tauntLink);

                row.appendChild(pfpNameColumn);

                // Create the score column
                const scoreColumn = document.createElement('td');
                scoreColumn.classList.add('score');
                scoreColumn.textContent = score;
                row.appendChild(scoreColumn);

                // Append the row to the leaderboard table
                const leaderboardTable = document.getElementById('scores');
                leaderboardTable.appendChild(row);

                // Append the row to the leaderboard container
                leaderboardContainer.appendChild(leaderboardTable);
            }

            // Fetch data from Firebase and populate the leaderboard
            get(databaseRef(database, 'users/' + user.uid))
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    const onlineStatus = userData.onlineStatus;
                    console.log('Online Status:', onlineStatus);

                    var imgElement = document.getElementById("nav-img");

                    // Update the src attribute with the 'url' variable
                    imgElement.src = userData.profile;
                }
            });


            get(databaseRef(database, 'users/'))
                .then((snapshot) => {
                    if (snapshot.exists()) {
                        const userData = snapshot.val();
                        for (const userId in userData) {
                            const username = userData[userId].username;
                            const score = userData[userId].score;
                            const profile = userData[userId].profile;
                            populateLeaderboard(username, score, profile);


                            // Format score tables

                            var placeElements = document.querySelectorAll('.place.number');

                            // Loop through the elements and assign placement numbers
                            for (var i = 0; i < placeElements.length; i++) {
                                placeElements[i].textContent = (i + 1).toString(); // Assign placement number
                            }

                            // Sort the Leaderboard by score

                            const table = document.getElementById("scores"); // get the table element by its ID
                            const rows = table.getElementsByTagName("tr"); // get all the table rows

                            // convert the rows to an array so that we can use the Array.sort() method
                            const rowsArray = Array.from(rows);

                            // sort the rows by the score element in descending order
                            rowsArray.sort((a, b) => {
                                const scoreA = parseInt(a.getElementsByClassName("score")[0].textContent);
                                const scoreB = parseInt(b.getElementsByClassName("score")[0].textContent);
                                return scoreB - scoreA;
                            });

                            // append the sorted rows back to the table
                            for (let i = 0; i < rowsArray.length; i++) {
                                table.appendChild(rowsArray[i]);
                            }
                            // Show the placement number of each team

                            var a = document.getElementsByClassName("number");
                            for (var i = 0; i < a.length; i++) {
                                a[i].innerHTML = (i + 1);
                                // a[i].innerHTML = (i+1)+".";
                            }
                        }



                    }
                })
                .catch((error) => {
                    console.error('Error fetching data: ', error);
                });
        } else if (window.location.href.includes("profile")) {
            get(databaseRef(database, 'users/' + user.uid))
                .then((snapshot) => {
                    if (snapshot.exists()) {
                        const userData = snapshot.val();
                        const onlineStatus = userData.onlineStatus;
                        console.log('Online Status:', onlineStatus);

                        var imgElement = document.getElementById("nav-img");
                        var imgElement2 = document.getElementById("settings-profile");
                        // Update the src attribute with the 'url' variable
                        imgElement.src = userData.profile;
                        imgElement2.src = userData.profile;


                        // Update the profile picture

                    }
                });
        } 






    } else {
        // Handle the case where the user is not authenticated.
    }
});


logout.addEventListener('click', (e) => {
    const auth = getAuth();
    signOut(auth).then(() => {
        // Sign-out successful.
        alert("Logged out.");
        window.location.href = "../login";
    }).catch((error) => {
        const errorMessage = error.message;
        alert(errorMessage);
    });
});



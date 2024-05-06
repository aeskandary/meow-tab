//settings object
let settings = {};

//save settings
function saveSettings(key, val) {
    chrome.storage.sync.set({
        [key]: val
    }, function() {
        //   console.log('Value is set to ' + val);
    });
}

//load settings
function loadSettings() {
    let keys = ["paradigm", "meridiem", "opacity"];
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(keys, function(result) {
            settings = result;
            resolve();
        });
    });
}

function toggleSetting(key, newValue) {
    saveSettings(key, newValue);
    settings[key] = newValue;
}

function initializeSettingsControls() {
    //toggling 12-hour/24-hour time
    var ampm = document.getElementById("am-pm");
    if (ampm) {
        //checking current setting to display initial text
        ampm.textContent = settings.meridiem === "1" ? "12-hour time" : "24-hour time";
        //when the ampm button is clicked, load the current setting, switch it, and save
        ampm.addEventListener("click", function() {
            //if settings.meridiem = 1, set 0, else set 1
            var newVal = settings.meridiem === "1" ? "0" : "1";
            toggleSetting("meridiem", newVal);
            //updating button text
            ampm.textContent = newVal === "1" ? "12-hour time" : "24-hour time";
        });
    }

    //adjusting opacity
    var brightnessButton = document.getElementById("brightness");
    var opacitySlider = document.getElementById("opacity-slider");
    var catImage = document.getElementById("cat-image");

    if (brightnessButton && opacitySlider) {
        //checking settings object to display initial opacity
        var opacityVal = settings.opacity || "0.5"; //default opacity val is 0.5
        catImage.style.opacity = opacityVal;
        opacitySlider.value = opacityVal;
        //toggling opacity slider
        brightnessButton.addEventListener("click", function() {
            if (opacitySlider.style.display === "none" || opacitySlider.style.display === "") {
                opacitySlider.style.display = "block";
            } else {
                opacitySlider.style.display = "none";
            }
        });
        //when the slider is moved, save new value and update the image
        opacitySlider.addEventListener("input", function() {
            var newVal = opacitySlider.value;
            if (newVal >= 0 && newVal <= 1) {
                toggleSetting("opacity", newVal);
                catImage.style.opacity = newVal;
                opacityVal = newVal;
            } else {
                alert("Invalid opacity value. Please enter a number between 0 and 1.");
            }
        });
    }

    //toggling between cat and dog mode
    var paradigm = document.getElementById("paradigmShift");
    if (paradigm) {
        //checking current setting to display initial text
        paradigm.textContent = settings.paradigm === "1" ? "Cat Mode" : "Dog Mode";
        //when the mode button is clicked, load the current setting, switch it, and save
        paradigm.addEventListener("click", function() {
            //toggling value
            var newVal = settings.paradigm === "1" ? "0" : "1";
            toggleSetting("paradigm", newVal);
            //updating button text
            paradigm.textContent = newVal === "1" ? "Cat Mode" : "Dog Mode";
            //refresh the image/fact/title
            displayCat();
            displayFact();
            checkTitle();
        });
    }
}

//adding the zero in front of a minute (e.g. 3:7  --> 3:07)
function addZero(n) {
    if (n < 10) {
        return (n = "0" + n);
    }
    return n;
}

//getting the suffix of a date
function getSuffix(date) {
    //11th, 12th, 13th
    if (date >= 11 && date <= 13) {
        return "th";
    }
    //we can find out everything else by looking at its last digit
    switch (date % 10) {
        case 1:
            return "st";
        case 2:
            return "nd";
        case 3:
            return "rd";
        default:
            return "th";
    }
}

function displayDate() {
    //converting numeric date values into words
    const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ];
    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];
    //geting numeric values for the date
    let today = new Date();
    let year = today.getFullYear();
    let month = months[today.getMonth()];
    let date = today.getDate();
    let day = days[today.getDay()];
    let hour = today.getHours();
    let minute = addZero(today.getMinutes());
    let second = addZero(today.getSeconds());
    let ampm;
    //getting the suffix for the date
    let suffix = getSuffix(date);
    //Example: Saturday, December 18th, 2021
    document.getElementById("date").innerHTML =
        "<strong>" +
        day +
        "</strong>" +
        ", " +
        month +
        " " +
        date +
        suffix +
        ", " +
        year;
    //getting the correct date format according to user settings
    //(12 hr time) Example: 5:13:06 PM
    //default value is 0, 12 hour format
    if (settings.meridiem === "0") {
        //set am/pm depending on the hour
        ampm = hour >= 12 ? "PM" : "AM";
        hour = hour % 12;
        //hour 0 = 12
        hour = hour ? hour : 12;
    }
    //(24 hr time) Example: 17:13:06
    else {
        hour = addZero(hour);
    }
    document.getElementById("time").innerHTML =
        hour + ":" + minute + ":" + second + (ampm ? " " + ampm : "");
}

function displayCat() {
    //appends a random number to the end of the url each refresh to ensure the image doesn't get cached
    let random = Math.floor(Math.random() * (9999999999 - 0) + 0);
    let catImage = document.getElementById("cat-image");
    //use settings object to determine what mode the user is in
    if (settings.paradigm == "0") {
        //if the user is in cat mode, display a cat image
        catImage.src = "https://cataas.com/cat?t=" + random;
    } else {
        //otherwise, dog image
        fetch('https://dog.ceo/api/breeds/image/random')
            .then(response => response.json())
            .then(data => catImage.src = data.message)
            .catch(error => console.error('Error:', error));
    }
}

async function displayFact() {
    //if the user is in cat mode, fetch cat fact
    if (settings.paradigm == "0") {
        let response = await fetch("https://catfact.ninja/fact");
        let data = await response.json();
        document.getElementById("cat-fact").innerHTML = data.fact;
    } else {
        //otherwise, dog fact
        let response = await fetch("https://dogapi.dog/api/v2/facts");
        let data = await response.json();
        let fact = data.data[0].attributes.body;
        document.getElementById("cat-fact").innerHTML = fact;
    }
}

//check the settings and update the title/search bar placeholder text depending on mode
function checkTitle() {
    var searchButton = document.getElementById("search-button");
    if (settings.paradigm == "1") {
        document.title = "Woof Tab";
        searchButton.innerText = "Fetch Results";
    } else {
        document.title = "Meow Tab";
        searchButton.innerText = "Search Meow";
    }
}

//loading user settings upon page load
document.addEventListener("DOMContentLoaded", function() {
    loadSettings().then(function() {
        checkTitle();
        displayDate();
        displayCat();
        displayFact();
        initializeSettingsControls();
    });

    //displaying settings when the settings gear is clicked
    var settingsGear = document.getElementById("settings");
    var settingsArea = document.getElementById("settings-area");
    if (settingsGear) {
        settingsGear.addEventListener("click", function() {
            settingsGear.classList.add("spin");
            setTimeout(function() {
                settingsGear.classList.remove("spin");
            }, 500);
            if (settingsArea.style.display === "none") {
                settingsArea.style.display = "block";
                settingsArea.classList.add("fade-in");
                setTimeout(function() {
                    settingsArea.classList.remove("fade-in");
                }, 500);
            } else {
                settingsArea.classList.add("fade-out");
                setTimeout(function() {
                    settingsArea.style.display = "none";
                    settingsArea.classList.remove("fade-out");
                }, 500);
            }
        });
    }

    //update time every 100ms
    window.setInterval(displayDate, 100);

});
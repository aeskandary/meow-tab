//save settings
function saveSettings(key, val) {
    chrome.storage.sync.set({ [key]: val }, function () {
        //   console.log('Value is set to ' + val);
    });
}

//load settings
function loadSettings(key, callback) {
    chrome.storage.sync.get([key], function (result) {
        //   console.log('Value currently is ' + result[key]);
        callback(result[key]);
    });
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
    loadSettings("meridiem", function (val) {
        //(12 hr time) Example: 5:13:06 PM
        //default value is 0, 12 hour format
        if (val === "0") {
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
    });
}

function displayCat() {
    //appends a random number to the end of the url each refresh to ensure the image doesn't get cached
    let random = Math.floor(Math.random() * (9999999999 - 0) + 0);
    let catImage = document.getElementById("cat-image");
    catImage.src = "https://cataas.com/cat?t=" + random;
}

async function displayFact() {
    let response = await fetch("https://catfact.ninja/fact");
    let data = await response.json();
    document.getElementById("cat-fact").innerHTML = data.fact;
}

//when the page loads, load the user settings
document.addEventListener("DOMContentLoaded", function () {
    //toggling am/pm
    var button = document.getElementById("am-pm");
    if (button) {
        //when the button is clicked, load the current setting, switch it, and save
        button.addEventListener("click", function () {
            loadSettings("meridiem", function (val) {
                //if val = 1, set 0, else set 1
                var newVal = val === "1" ? "0" : "1";
                saveSettings("meridiem", newVal);
            });
        });
    }
    // loadSettings('myKey', function(val) {
    //   console.log('Loaded val: ' + val);
    // });
});

//update time every 100ms
window.setInterval(displayDate, 100);
//now... show them what they came for
displayCat();
displayFact();  
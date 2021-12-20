//for adding the zero in front of a minute (e.g. 3:7  --> 3:07)
function addZero(n){
    if(n < 10){
        return n = "0" + n;
    }
    return n;
}

function displayDate(){
    //for converting numeric date values into words
    const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    //geting numeric values for the date
    let today =  new Date();
    let year = today.getFullYear();
    let month = months[today.getMonth()];
    let date = today.getDate();
    let day = days[today.getDay()];
    let hour = today.getHours();
    let minute = addZero(today.getMinutes());
    let second = addZero(today.getSeconds());
    //Example: Saturday, December 18th, 2021
    document.getElementById("date").innerHTML = "<strong>" + day + "</strong>" + ", " + month + " " + date + "th, " + year;
    //(24 hr time) Example: 7:13:06
    document.getElementById("time").innerHTML = hour + ":" + minute + ":" + second;
}

function displayCat(){
    //appends a random number to the end of the url each refresh to ensure the image doesn't get cached
    let random = Math.floor(Math.random() * (9999999999 - 0) + 0)
    let catImage = document.getElementById("catImage");
    catImage.src = "https://cataas.com/cat?t=" + random;
}

async function displayFact(){
    let response = await fetch('https://cat-fact.herokuapp.com/facts/random?animal_type=cat&amount=1');
    let fact  = await response.text();
    document.getElementById("catFact").innerHTML = JSON.parse(fact).text;
}

//update time every 100ms
window.setInterval(displayDate, 100);
//now... show them what they came for
displayCat();
displayFact();

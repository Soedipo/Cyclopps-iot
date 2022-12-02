//THIS IS WHERE YOU PASTE THE CODE TO CONNECT TO YOUR OWN DATABASE
//Copy and paste the CDN bit of code from your app that you created on Firebase.
//The script tag above is already there, so careful not to have duplicate script tags.
//After you've copied and pasted, just delete the unnecessary script tags.
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-app.js";
// (the one where you imported "initializeApp" from),
//but change "firebase-app" to "firebase-database"
import {
  getDatabase,
  ref,
  update,
  remove,
  onValue,
  push,
} from "https://www.gstatic.com/firebasejs/9.14.0/firebase-database.js"; //Copy and Paste the URL from near the top of the CDN you pasted in from firebase
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA_2kq4DiwnodMRIzicpIpSUwo45-GP1GA",
  authDomain: "iot-tubes-cyclometer-27152.firebaseapp.com",
  databaseURL: "https://iot-tubes-cyclometer-27152-default-rtdb.firebaseio.com",
  projectId: "iot-tubes-cyclometer-27152",
  storageBucket: "iot-tubes-cyclometer-27152.appspot.com",
  messagingSenderId: "483704036640",
  appId: "1:483704036640:web:a7d84ee5338455c0958b45",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase();
// History variable
var distanceLog = 0;
var maxSpeedLog = 0;
var averageSpeedLog = 0;
var startTimeLog = "";
var timeCountLog = "";
var dateLog = "";

let saveButton = document.getElementById("button-save");

// Stopwatch content
const historyList = document.getElementById("history-list");
let startBtn = document.getElementById("button-start");
let stopBtn = document.getElementById("button-stop");
let resetBtn = document.getElementById("button-reset");
let historyResetBtn = document.getElementById("button-history-reset");
let setDiameterBtn = document.getElementById("button-set-diameter");

let startStatus = false;
let currentDate = "";
let hour = 0;
let minute = 0;
let second = 0;
let count = 0;
let timer = false;
let secondCounting = 0;

let hour_string = "";
let minute_string = "";
let second_string = "";
let count_string = "";

let timeCount = "";

let child_data = [];
let child_key = [];

realtimeData();

function saveData() {
  if (startStatus) {
    startStatus = true;
    // child_data = [];
    push(ref(db, "cyclingLog/"), {
      date: dateLog,
      startTime: startTimeLog,
      elapsedTime: timeCountLog,
      distance: distanceLog,
      maxSpeed: maxSpeedLog,
      averageSpeed: averageSpeedLog,
    })
      .then(() => {
        alert("Data added successfully");
      })
      .catch((error) => {
        alert(error);
      });
  } else if (!startStatus) {
    alert("You haven't start yet ^_^");
  }
}

function realtimeData() {
  const dbref = ref(db);
  onValue(ref(db, "realtimeData/"), (snapshot) => {
    document.getElementById("speedData").innerHTML =
      snapshot.val().speed.toFixed(2) + " km/h";
    document.getElementById("avgSpeedData").innerHTML =
      snapshot.val().averageSpeed.toFixed(2) + " km/h";
    document.getElementById("maxSpeedData").innerHTML =
      snapshot.val().maxSpeed.toFixed(2) + " km/h";
    document.getElementById("distanceData").innerHTML =
      snapshot.val().distance.toFixed(2) + " km";

    distanceLog = snapshot.val().distance;
    maxSpeedLog = snapshot.val().maxSpeed;
    averageSpeedLog = snapshot.val().averageSpeed;
  });
}

function resetHistory() {
  for (let uid of child_key) {
    remove(ref(db, "cyclingLog/" + uid));
  }
  child_key = [];
  child_data = [];
  historyList.innerHTML = ``;
}

function convertObjectsToArrayOfObjects(logList) {
  const filteredData = [];
  for (let person in logList) {
    filteredData.push(logList[person]);
  }
  return filteredData;
}

function elList() {
  historyList.innerHTML = `
      ${child_data.map((cyclingData) => {
        return `
            <div>
              ${cyclingData.date} ${cyclingData.startTime}
              <div>Distance: ${cyclingData.distance}</div>
              <div>Max Speed: ${cyclingData.maxSpeed}</div>
              <div>Average Speed: ${cyclingData.averageSpeed}</div>
              <div>Elapsed Time: ${cyclingData.elapsedTime}</div>
            </div>
          `;
      })}
  `;
}

function getListData() {
  onValue(ref(db, "cyclingLog/"), (snapshot) => {
    snapshot.forEach((childSnapshot) => {
      const childKey = childSnapshot.key;
      const childData = childSnapshot.val();
      child_data.push(childData);
      child_key.push(childKey);
      elList();
    });
    child_data = [];
  });
}

getListData();

saveButton.addEventListener("click", saveData);
setDiameterBtn.addEventListener("click", function () {
  update(ref(db, "realtimeData/"), {
    diameter: parseFloat(document.getElementById('inputDiameter').value),
  }).catch((error) => {
    alert(error);
  });
});

/* get current clock time */
function clock() {
  const today = new Date();
  let h = today.getHours();
  let m = today.getMinutes();
  let s = today.getSeconds();
  m = checkTime(m);
  s = checkTime(s);
  timeCount = h + ":" + m + ":" + s;
  document.getElementById("clock").innerHTML = timeCount;
  setTimeout(clock, 1000);
}

function checkTime(i) {
  if (i < 10) {
    i = "0" + i;
  } // add zero in front of numbers < 10
  return i;
}

/* get current date */
function padTo2Digits(num) {
  return num.toString().padStart(2, "0");
}

function formatDate(date) {
  return [
    padTo2Digits(date.getDate()),
    padTo2Digits(date.getMonth() + 1),
    date.getFullYear(),
  ].join("/");
}

currentDate = formatDate(new Date());
document.getElementById("date").innerHTML = currentDate;

/* Timer Content */
startBtn.addEventListener("click", function () {
  startStatus = true;
  timer = true;
  startTimeLog = timeCount;
  dateLog = currentDate;
  stopWatch();
});

stopBtn.addEventListener("click", function () {
  timer = false;
});

historyResetBtn.addEventListener("click", function () {
  resetHistory();
});

resetBtn.addEventListener("click", function () {
  startStatus = false;
  timer = false;
  hour = 0;
  minute = 0;
  second = 0;
  count = 0;
  secondCounting = 0;
  startTimeLog = "";
  dateLog = "";
  document.getElementById("timeData").innerHTML = "00 : 00 : 00 : 00";

  update(ref(db, "realtimeData/"), {
    averageSpeed: 0,
    distance: 0,
    maxSpeed: 0,
    elapsedTime: 0, // in milisecond
  }).catch((error) => {
    alert(error);
  });
});

function secondCounter() {
  update(ref(db, "realtimeData/"), {
    elapsedTime: secondCounting, // in milisecond
  }).catch((error) => {
    alert(error);
  });
}

function stopWatch() {
  if (timer) {
    count++;

    if (count == 100) {
      second++;
      secondCounting++;
      count = 0;
    }

    if (second == 60) {
      minute++;
      secondCounting++;
      second = 0;
    }

    if (minute == 60) {
      hour++;
      secondCounting++;
      minute = 0;
      second = 0;
    }

    let hrString = hour;
    let minString = minute;
    let secString = second;
    let countString = count;

    if (hour < 10) {
      hrString = "0" + hrString;
    }

    if (minute < 10) {
      minString = "0" + minString;
    }

    if (second < 10) {
      secString = "0" + secString;
    }

    if (count < 10) {
      countString = "0" + countString;
    }

    hour_string = hrString;
    minute_string = minString;
    second_string = minString;
    count_string = countString;

    document.getElementById("timeData").innerHTML =
      hrString + " : " + minString + " : " + secString + " : " + countString;
    timeCountLog =
      hrString + " : " + minString + " : " + secString + " : " + countString;

    secondCounter();
    setTimeout(stopWatch, 10);
  }
}

window.onload = clock();

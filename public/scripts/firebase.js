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
  get,
  set,
  child,
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
let startBtn = document.getElementById("button-start");
let stopBtn = document.getElementById("button-stop");
let resetBtn = document.getElementById("button-reset");
let historyResetBtn = document.getElementById("button-history-reset");

let startStatus = false;
let currentDate = "";
let hour = 0;
let minute = 0;
let second = 0;
let count = 0;
let timer = false;

let hour_string = "";
let minute_string = "";
let second_string = "";
let count_string = "";

let timeCount = "";

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
      snapshot.val().speed + " km/H";
    document.getElementById("avgSpeedData").innerHTML =
      snapshot.val().averageSpeed + " km/H";
    document.getElementById("maxSpeedData").innerHTML =
      snapshot.val().maxSpeed + " km/H";
    document.getElementById("distanceData").innerHTML =
      snapshot.val().distance + " m";

    distanceLog = snapshot.val().distance;
    maxSpeedLog = snapshot.val().maxSpeed;
    averageSpeedLog = snapshot.val().averageSpeed;
  });
}

function resetHistory() {
  for(let uid of child_key){
    remove(ref(db, "cyclingLog/" + uid));
  }
  child_key = [];
  child_data = [];
  historyList.innerHTML = ``;
}

const historyList = document.getElementById("history-list");

function convertObjectsToArrayOfObjects(logList) {
  const filteredData = [];
  for (let person in logList) {
    filteredData.push(logList[person]);
  }
  return filteredData;
}

// function elList(logList) {
//   const familyData = convertObjectsToArrayOfObjects(logList);
//   historyList.innerHTML = `
//       ${familyData.map((person) => {
//         return `
//             <h1>name: ${person.elapsedTime}</h1>
//             <h2>age: ${person.startTime}</h2>
//           `;
//       })}
//   `;
// }
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

let child_data = [];
let child_key = [];

function getListData() {
  onValue(ref(db, "cyclingLog/"), (snapshot) => {
    snapshot.forEach((childSnapshot) => {
      const childKey = childSnapshot.key;
      const childData = childSnapshot.val();
      child_data.push(childData);
      child_key.push(childKey);
      elList();
      console.log(childData);
      console.log(childKey);
      console.log(child_data);
      console.log(child_key);
      console.log(convertObjectsToArrayOfObjects(childData));
    });
    child_data = [];
  });
}

getListData();

saveButton.addEventListener("click", saveData);

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
  console.log(child_key);
});

resetBtn.addEventListener("click", function () {
  startStatus = false;
  timer = false;
  hour = 0;
  minute = 0;
  second = 0;
  count = 0;
  startTimeLog = "";
  dateLog = "";
  document.getElementById("timeData").innerHTML = "00 : 00 : 00 : 00";

  update(ref(db, "realtimeData/"), {
    averageSpeed: 0,
    distance: 0,
    maxSpeed: 0,
  }).catch((error) => {
    alert(error);
  });
});

function stopWatch() {
  if (timer) {
    count++;

    if (count == 100) {
      second++;
      count = 0;
    }

    if (second == 60) {
      minute++;
      second = 0;
    }

    if (minute == 60) {
      hour++;
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
    setTimeout(stopWatch, 10);
  }
}

window.onload = clock();

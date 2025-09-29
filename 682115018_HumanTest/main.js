/*
  953104 – Assignment: Human Test – Select All That Match
  Starter code with guidance comments
*/

const TOPICS = [
  {
    label: "cars",
    images: [
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=800",
      "https://images.unsplash.com/photo-1483721310020-03333e577078?q=80&w=800",
      "https://images.unsplash.com/photo-1658030017202-7cb98f1c8bae?q=80&w=800",
      "https://images.unsplash.com/photo-1758323782884-80eb0dfc839e?q=80&w=800",
      "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?q=80&w=800",
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=800",
      "https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?q=80&w=800",
      "https://images.unsplash.com/photo-1757583010761-ffc255a8868c?q=80&w=800",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800",
   
    ],
    correct: new Set([0, 2, 8]) // indexes of correct images
  },
  {
    label: "cats",
    images: [
      "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?q=80&w=800",
      "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?q=80&w=800",
      "https://images.unsplash.com/photo-1508672019048-805c876b67e2?q=80&w=800",
      "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?q=80&w=800",
      "https://images.unsplash.com/photo-1758438919146-f3f59a6d2544?q=80&w=800",
      "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?q=80&w=800",
      "https://images.unsplash.com/photo-1494256997604-768d1f608cac?q=80&w=800",
      "https://images.unsplash.com/photo-1510337550647-e84f83e341ca?q=80&w=800",
      "https://images.unsplash.com/photo-1526296609207-80e77afde33d?q=80&w=800"
    ],
    correct: new Set([0, 1, 6]) // indexes of correct images
  }
];

// DOM references
const grid = document.querySelector(".grid");
const promptEl = document.getElementById("prompt");
const submitBtn = document.getElementById("submitBtn");
const newRoundBtn = document.getElementById("newRoundBtn");
const resultEl = document.getElementById("result");

let topic = null;          // current topic (cars/cats)
let selected = new Set();  // track user-selected indexes
let locked = false;        // prevent changes after submit

let started = null;       // track if game has started
let ms = 0;                // track time in milliseconds
let bestTime = 0;   // track best time

// Pick random topic
function pickTopic() {
    return TOPICS[Math.floor(Math.random() * TOPICS.length)];
}

// Render the grid for current topic
function render() {
    // 1. Update the prompt text with the label of the current topic (e.g. cars/cats)
    promptEl.textContent = `Select all images with ${topic.label}.`;

    // 2. Clear previous grid
    grid.innerHTML = "";
    selected.clear();
    locked = false;
    submitBtn.disabled = true;
    document.getElementById("time").textContent = ""
    resultEl.textContent = ""
    // TODO:
    // Loop over topic.images and for each:
    // - Create a <button class="tile"> element
    // - Set aria-pressed="false" initially
    // - Add an <img> inside with src and alt
    // - Add click and keydown event listeners to call toggle(i, btn)
    // - Append to the grid
    topic.images.forEach((element, i) => {
      const tile = document.createElement('button');
      tile.classList.add('tile');
      tile.setAttribute('aria-pressed', 'false');
      const img = document.createElement('img');
      img.src = element;
      img.alt = topic.label;
      tile.appendChild(img);
      tile.addEventListener('click', () => toggle(i, tile));
      // You don't need the keydown event listener for Enter and Space key. (Tested on Chrome, Edge, and Brave)
      // tile.addEventListener('keydown', (e) => {
      //    if(e.key === 'Enter' || e.key === ' '){ 
      //        toggle(i, tile)
      //    }
      // });
      grid.appendChild(tile);
    });
    
}

function timer(params) {
  setInterval(setTime, 1000);

  function setTime() {
    ++totalSeconds;
    secondsLabel.innerHTML = pad(totalSeconds % 60);
    minutesLabel.innerHTML = pad(parseInt(totalSeconds / 60));
  }
}

function getTimerFormat(mstime) {
    let minute = Math.floor(mstime / 60000)
    let second = Math.floor((mstime % 60000) / 1000)
    let millisecond = mstime % 1000
    return `${minute < 10 ? '0' + minute : minute}:${second < 10 ? '0' + second : second}.${millisecond < 10 ? '00' + millisecond : millisecond < 100 ? '0' + millisecond : millisecond}`
}

// Toggle tile selection
function toggle(i, el) {
    if (locked) return;
    if (!started){
      started = setInterval(() => {
        ms+=4
        
        document.getElementById("time").textContent = getTimerFormat(ms)
      }, 4)
    }

    if (selected.has(i)) {
      selected.delete(i);
      el.setAttribute('aria-pressed', 'false');
    } else {
      selected.add(i);
      el.setAttribute('aria-pressed', 'true');
    }
    // TODO:
    // - If index i is already in selected → remove it, set aria-pressed="false"
    // - Otherwise add it to selected, set aria-pressed="true"
    // - In CSS, style .tile[aria-pressed="true"] to indicate selection (e.g. border, background, box-shadow, transform, transition)
    // - Enable submitBtn if at least one tile is selected
    if(selected.size > 0){
      submitBtn.disabled = false
    }else{
      submitBtn.disabled = true
    }
}

// Validate and mark tiles
function check() {
    if (locked) return;
    locked = true;

    clearInterval(started);
    started = null;
    if(bestTime == 0){
      bestTime = ms
    } else if (ms < bestTime){
      bestTime = ms
    }

    let correctCount = 0;
    let wrongCount = 0;

    const tiles = document.querySelectorAll(".tile");
    tiles.forEach((tile, i) => {
      if (topic.correct.has(i) && tile.getAttribute('aria-pressed') === 'true') {
        tile.classList.remove("wrong", "correct", "missed");
        tile.classList.add("correct")
        tile.dataset.state = "✓";
        correctCount++;
      } else if (!topic.correct.has(i) && tile.getAttribute('aria-pressed') === 'true'){
        tile.classList.remove("wrong", "correct", "missed");
        tile.classList.add("wrong")
        tile.dataset.state = "✗";
        wrongCount++;
      } else if (topic.correct.has(i) && tile.getAttribute('aria-pressed') === 'false'){
        tile.classList.remove("wrong", "correct", "missed");
        tile.classList.add("missed")
        tile.dataset.state = "missed";
      }
    })

    document.getElementById("time").textContent = `The time taken for this round is ${getTimerFormat(ms)}, Your best time is ${getTimerFormat(bestTime)}`
    resultEl.textContent = `You found ${correctCount}/${topic.correct.size}. Wrong selections: ${wrongCount}`
    ms = 0
    // TODO:
    // Loop through all .tile elements
    // - If selected AND correct → add class "correct", show ✓
    // - If selected AND NOT correct → add class "wrong", show ✗
    // Then check missed correct answers (tiles not selected but should be)
    // - Add class "missed", show label
    // (Use data-state attribute to show ✓/✗/missed via CSS ::after)
    //
    // Finally, update resultEl with message:
    // "You found X/Y. Wrong selections: Z"
    
}

// Start new round
function newRound() {
    topic = pickTopic(); // returns random topic object
    render();
}

// Event listeners
submitBtn.addEventListener("click", check);
newRoundBtn.addEventListener("click", newRound);

// Init
newRound();
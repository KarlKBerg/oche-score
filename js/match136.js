const players = [];
/* ==== GLOBAL VARS ==== */
let playerCount = 2;
let selectedScore = 501;
let doubleOut = true;
let legsToWin = 1;
let pendingCheckout = false;
let pendingCheckoutScore = null;
let legStarterIndex = 0;

let score = "";

/* ==== SETTINGS ==== */
// Handle number of players button clicks
document.querySelectorAll(".nr-of-players button").forEach((btn) => {
  btn.addEventListener("click", () => {
    // Remove active class from all buttons
    document.querySelectorAll(".nr-of-players button").forEach((b) => {
      b.classList.remove("active");
    });
    // Add active class to clicked button
    btn.classList.add("active");
    // Set playerCount based on button clicked
    playerCount = parseInt(btn.dataset.players);

    // Create input fields for player names based on playerCount
    const playerNamesContainer = document.getElementById(
      "player-names-container",
    );
    for (let i = 0; i < playerCount; i++) {
      if (!document.getElementById(`player-name-${i}`)) {
        const div = document.createElement("div");
        div.classList.add("player-name-input");

        const label = document.createElement("label");
        label.textContent = `Player ${i + 1}: `;

        const input = document.createElement("input");
        input.type = "text";
        input.id = `player-name-${i}`;
        input.name = `player-name-${i}`;
        input.placeholder = `Player ${i + 1}`;
        playerNamesContainer.appendChild(div);
        div.appendChild(label);
        div.appendChild(input);
      }
    }
    // Remove extra input fields if playerCount is decreased
    const existingInputs =
      playerNamesContainer.querySelectorAll(".player-name-input");
    existingInputs.forEach((inputDiv, index) => {
      if (index >= playerCount) {
        playerNamesContainer.removeChild(inputDiv);
      }
    });
    // reset player array
    players.length = 0;
  });
});

// Random start order
document
  .getElementById("randomize-players")
  .addEventListener("click", chooseRandomStarter);

function chooseRandomStarter() {
  if (players.length === 0) {
    // before game start → use playerCount
    legStarterIndex = Math.floor(Math.random() * playerCount);
  } else {
    // after game start (optional support)
    legStarterIndex = Math.floor(Math.random() * players.length);
  }

  // reset turns
  players.forEach((player) => (player.isMyTurn = false));

  // set random starter
  if (players[legStarterIndex]) {
    players[legStarterIndex].isMyTurn = true;
  }

  displayPlayers();
  displayCurrentPlayerStats();
}
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Handle select starting score
document.querySelectorAll(".starting-score button").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".starting-score button").forEach((b) => {
      b.classList.remove("active");
    });
    btn.classList.add("active");
    selectedScore = parseInt(btn.dataset.score);
  });
});

// Handle double out or single out selection
document.querySelectorAll(".out-option button").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".out-option button").forEach((b) => {
      b.classList.remove("active");
    });
    btn.classList.add("active");
    doubleOut = btn.dataset.double === "true";
  });
});

// Handle legs to win section
document.querySelectorAll(".legs button").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".legs button").forEach((b) => {
      b.classList.remove("active");
    });
    btn.classList.add("active");
    legsToWin = parseInt(btn.dataset.legs);
  });
});

/* ==== RESETS ==== */
document
  .getElementById("play-again")
  .addEventListener("click", resetToSettings);

document
  .getElementById("new-game-btn")
  .addEventListener("click", resetToSettings);

function resetToSettings() {
  // Reset player stats but KEEP players & names
  players.forEach((player) => {
    player.currentScore = selectedScore;
    player.startingScore = selectedScore;
    player.lastScore = [];
    player.avg = 0;
    player.throws = 0;
    player.lastDartDouble = false;
    player.isMyTurn = false;
  });
  legStarterIndex = 0;

  players.forEach((p) => (p.isMyTurn = false));
  players[legStarterIndex].isMyTurn = true;

  // First player starts next game
  if (players.length > 0) {
    players[0].isMyTurn = true;
  }

  // Reset game flags
  pendingCheckout = false;
  pendingCheckoutScore = null;
  score = "";

  // Clear messages & input
  document.getElementById("display-message").innerHTML = "";
  document.getElementById("score-input").value = "";

  // Restore UI
  document.getElementById("winning-stats").classList.add("hidden");
  document.getElementById("game").classList.add("hidden");
  document.getElementById("keypad").classList.remove("hidden");
  document.getElementById("new-game-prompt").classList.add("hidden");

  // Show settings again
  document.getElementById("settings").classList.remove("hidden");

  // Reset button styles
  document.getElementById("new-game-btn").style.backgroundColor = "";
}
/* ==== PLAYERS ==== */
// Create users based on playerCount
const createPlayer = (playerNumber, name, startingScore, doubleOut) => {
  const defaultPlayer = {
    name: name || `Player ${playerNumber + 1}`,
    startingScore: startingScore,
    currentScore: startingScore,
    throws: 0,
    avg: 0,
    lastScore: [],
    handicap: false,
    doubleOut: doubleOut,
    legsWon: 0,
    isMyTurn: playerNumber === 0 ? true : false,
    lastDartDouble: false,
  };
  players.push(defaultPlayer);
};
// Display players
function displayPlayers() {
  const playersContainer = document.getElementById("players-container");
  playersContainer.innerHTML = "";
  players.forEach((player, index) => {
    const playerDiv = document.createElement("div");

    playerDiv.classList.add("player-card");
    playerDiv.id = `player-${index}`;
    if (player.isMyTurn) {
      playerDiv.classList.add("player-turn");
    }

    const scoreLegsDiv = document.createElement("div");
    scoreLegsDiv.classList.add("score-legs");

    const nameHeading = document.createElement("h3");
    nameHeading.textContent = player.name;

    const scoreHeading = document.createElement("h3");
    scoreHeading.id = `player-score-${index}`;
    scoreHeading.textContent = `${player.currentScore}`;

    const legsPara = document.createElement("p");
    legsPara.id = `player-legs-${index}`;
    legsPara.textContent = `${player.legsWon}`;

    playersContainer.appendChild(playerDiv);
    playerDiv.appendChild(nameHeading);
    playerDiv.appendChild(scoreLegsDiv);
    scoreLegsDiv.appendChild(scoreHeading);
    scoreLegsDiv.appendChild(legsPara);
  });
}

// Display current player stats
function displayCurrentPlayerStats() {
  const currentPlayerDiv = document.getElementById("current-player");
  currentPlayerDiv.innerHTML = "";
  const playerIsMyTurn = players.find((player) => player.isMyTurn === true);

  if (playerIsMyTurn) {
    const nameHeading = document.createElement("h3");
    nameHeading.textContent = playerIsMyTurn.name;

    const infoDiv = document.createElement("div");
    infoDiv.classList.add("info");

    const statsDiv = document.createElement("div");
    statsDiv.classList.add("stats");

    const avgDiv = document.createElement("div");
    avgDiv.classList.add("avg");

    const lastScoreDiv = document.createElement("div");
    lastScoreDiv.classList.add("last-score");

    const dartsThrownDiv = document.createElement("div");
    dartsThrownDiv.classList.add("darts-thrown");

    const scoreDisplay = document.createElement("h3");
    scoreDisplay.classList.add("score");
    scoreDisplay.textContent = playerIsMyTurn.currentScore;

    const avgTitle = document.createElement("h4");
    avgTitle.classList.add("title");
    avgTitle.textContent = "3-dart average:";

    const avgValue = document.createElement("h4");
    avgValue.classList.add("value");
    avgValue.textContent = Math.round(playerIsMyTurn.avg);

    const lastScoreTitle = document.createElement("h4");
    lastScoreTitle.classList.add("title");
    lastScoreTitle.textContent = "Last score:";

    const lastScoreValue = document.createElement("h4");
    lastScoreValue.classList.add("value");
    lastScoreValue.textContent = playerIsMyTurn.lastScore.length
      ? playerIsMyTurn.lastScore[playerIsMyTurn.lastScore.length - 1]
      : "-";

    const dartsThrownTitle = document.createElement("h4");
    dartsThrownTitle.classList.add("title");
    dartsThrownTitle.textContent = "Darts thrown:";

    const dartsThrownValue = document.createElement("h4");
    dartsThrownValue.classList.add("value");
    dartsThrownValue.textContent = playerIsMyTurn.throws;

    currentPlayerDiv.appendChild(infoDiv);
    infoDiv.appendChild(nameHeading);
    infoDiv.appendChild(scoreDisplay);
    currentPlayerDiv.appendChild(statsDiv);
    statsDiv.appendChild(avgDiv);
    avgDiv.appendChild(avgTitle);
    avgDiv.appendChild(avgValue);

    statsDiv.appendChild(lastScoreDiv);
    lastScoreDiv.appendChild(lastScoreTitle);
    lastScoreDiv.appendChild(lastScoreValue);

    statsDiv.appendChild(dartsThrownDiv);
    dartsThrownDiv.appendChild(dartsThrownTitle);
    dartsThrownDiv.appendChild(dartsThrownValue);
  }
}

/* ==== START GAME ==== */
// Confirm settings and start game
const startGameBtn = document.getElementById("start-game-btn");
startGameBtn.addEventListener("click", startGame);
function startGame() {
  players.length = 0; // Clear previous players
  for (let i = 0; i < playerCount; i++) {
    let userName = document.getElementById(`player-name-${i}`).value.trim();
    createPlayer(i, userName, selectedScore, doubleOut);
  }
  const randomize = document.getElementById("randomize-players").checked;
  if (randomize) {
    shuffleArray(players);
  }

  players.forEach((player) => (player.isMyTurn = false));

  legStarterIndex = 0;
  players[legStarterIndex].isMyTurn = true;
  displayPlayers();
  displayCurrentPlayerStats();

  // Hide settings and show game interface
  document.getElementById("settings").classList.add("hidden");

  document.getElementById("game").classList.remove("hidden");
  displayRules();
}

/* ==== ERROR AND SUCCESS MESSAGES ==== */
// Display error and success message
function showErrorMessage(message) {
  const messageContainer = document.getElementById("display-message");
  messageContainer.innerHTML = "";

  const errorHeading = document.createElement("h2");
  errorHeading.classList.add("error");
  errorHeading.textContent = message;

  messageContainer.appendChild(errorHeading);

  setTimeout(function () {
    messageContainer.innerHTML = "";
  }, 3000);
}

function showSuccessMessage(message) {
  const messageContainer = document.getElementById("display-message");
  messageContainer.innerHTML = "";

  const successHeading = document.createElement("h2");
  successHeading.classList.add("success");
  successHeading.textContent = message;
  messageContainer.appendChild(successHeading);
}

/* ==== KEYPAD ==== */
// Get input from keypad
document.querySelectorAll(".keypad-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    let clickedDigits = btn.innerHTML;
    score = score + clickedDigits;
    document.getElementById("score-input").value = score;
  });
});
document.getElementById("clear-btn").addEventListener("click", () => {
  score = "";
  document.getElementById("score-input").value = score;
});

// Store score for later use
document.getElementById("submit-score").addEventListener("click", () => {
  if (score === "") {
    showErrorMessage("Can't submit empty score, enter 0");
    return;
  }
  let currentScore = parseInt(score);
  if (currentScore > 180) {
    showErrorMessage("Score can't be more than 180");
    score = "";
    document.getElementById("score-input").value = score;
    return;
  } else {
    submitTurn();
    score = "";
    document.getElementById("score-input").value = score;
  }
});

/* ==== GAME FUNCTIONS ==== */
// Display rules
function displayRules() {
  let rulesContainer = document.querySelector("#game .rules-container");
  rulesContainer.innerHTML = "";
  let legRule = document.createElement("h2");
  legRule.textContent = `Best of: ${legsToWin}`;
  rulesContainer.appendChild(legRule);
}

// Player bust
function playerBust() {
  const playerIsMyTurn = players.find((player) => player.isMyTurn === true);

  // Push last score to scores array
  playerIsMyTurn.lastScore.push(0);

  // Calculate average
  let average = playerIsMyTurn.lastScore;
  let sum = 0;
  sum = 0;
  for (let i = 0; i < average.length; i++) {
    sum += average[i];
  }
  playerIsMyTurn.avg = (sum / average.length) * 3;

  // Calculate throws
  playerIsMyTurn.throws = average.length * 3;
  nextPlayerTurn();
  displayPlayers();
  displayCurrentPlayerStats();
}

// Accepted score
function playerScored() {
  updatePlayer();
  nextPlayerTurn();
  displayPlayers();
  displayCurrentPlayerStats();
}

// Leg win
function legWon() {
  // 🔄 rotate leg starter
  legStarterIndex = (legStarterIndex + 1) % players.length;

  // reset player stats
  players.forEach((player, index) => {
    player.currentScore = selectedScore;
    player.startingScore = selectedScore;
    player.lastScore = [];
    player.avg = 0;
    player.throws = 0;
    player.lastDartDouble = false;
    player.isMyTurn = index === legStarterIndex; // ✅ ONLY starter gets turn
  });

  // reset flags
  pendingCheckout = false;
  pendingCheckoutScore = null;
  score = "";

  // clear UI
  document.getElementById("display-message").innerHTML = "";
  document.getElementById("score-input").value = "";

  document.getElementById("winning-stats").classList.add("hidden");
  document.getElementById("game").classList.remove("hidden");
  document.getElementById("keypad").classList.remove("hidden");
  document.getElementById("new-game-prompt").classList.add("hidden");

  document.getElementById("new-game-btn").style.backgroundColor = "";

  displayPlayers();
  displayCurrentPlayerStats();
}

// Match over (player won)
function matchOver() {
  displayPlayers();
  displayCurrentPlayerStats();
  displayWinningPage();
  document.getElementById("keypad").classList.add("hidden");
  document.getElementById("new-game-btn").style.backgroundColor = "#d4af37";
}

document.querySelectorAll(".buttons button").forEach((btn) => {
  btn.addEventListener("click", () => {
    const player = players.find((p) => p.isMyTurn);

    document.getElementById("double-prompt").classList.add("hidden");
    document.getElementById("game").classList.remove("hidden");

    if (btn.dataset.last === "true") {
      player.lastDartDouble = true;

      resolveCheckout();

      player.legsWon += 1;

      if (player.legsWon === legsToWin) {
        matchOver();
      } else {
        legWon();
      }
    } else {
      playerBust();
      displayPlayers();
      displayCurrentPlayerStats();
    }
  });
});

// Resolve checkout
function resolveCheckout() {
  if (!pendingCheckout || pendingCheckoutScore === null) return;

  const player = players.find((p) => p.isMyTurn);

  // Use the STORED checkout score
  const scoreToApply = pendingCheckoutScore;

  // Apply score
  player.currentScore -= scoreToApply;
  player.lastScore.push(scoreToApply);

  // Update stats
  const sum = player.lastScore.reduce((a, b) => a + b, 0);
  player.avg = sum / player.lastScore.length;
  player.throws = player.lastScore.length * 3;

  // Cleanup
  pendingCheckout = false;
  pendingCheckoutScore = null;
  player.lastDartDouble = false;
}

// Game won
function gameWon() {
  const player = players.find((p) => p.isMyTurn);
  player.legsWon += 1;
}

// Display winning page
function displayWinningPage() {
  const playerIsMyTurn = players.find((player) => player.isMyTurn === true);
  showSuccessMessage(`Congratulations! ${playerIsMyTurn.name}, You won!`);
  const winningStats = document.getElementById("all-player-stats");
  winningStats.innerHTML = "";
  players.forEach((player, index) => {
    const nameHeading = document.createElement("h3");
    nameHeading.textContent = player.name;

    const playerDiv = document.createElement("div");
    playerDiv.classList.add("player-div");
    playerDiv.id = `winner-${index}`;
    const avg = document.createElement("h4");
    avg.classList.add("value");
    avg.textContent = `Total average: ${Math.round(player.avg)}`;

    const dartsThrown = document.createElement("h4");
    dartsThrown.textContent = `Total Throws: ${player.throws}`;

    const highestScore = document.createElement("h4");
    highestScore.textContent = `Highest score: ${Math.max(
      ...player.lastScore,
    )}`;

    winningStats.appendChild(playerDiv);
    playerDiv.appendChild(nameHeading);
    playerDiv.appendChild(avg);
    playerDiv.appendChild(dartsThrown);
    playerDiv.appendChild(highestScore);
  });
  document.getElementById("winner-0").style.backgroundColor = "#d4af37";
  document.getElementById("game").classList.add("hidden");
  document.getElementById("winning-stats").classList.remove("hidden");
}

// Move turn to next player
function nextPlayerTurn() {
  const index = players.findIndex((player) => player.isMyTurn === true);
  let lastPLayer = players.length - 1;

  if (index !== lastPLayer) {
    // Next player
    players[index].isMyTurn = false;
    players[index + 1].isMyTurn = true;
  } else {
    // First player's turn
    players[lastPLayer].isMyTurn = false;
    players[0].isMyTurn = true;
  }
}

// Update player
function updatePlayer() {
  const playerIsMyTurn = players.find((player) => player.isMyTurn === true);
  let tempScore = parseInt(score);
  // Update score
  playerIsMyTurn.currentScore = playerIsMyTurn.currentScore - tempScore;

  // Push last score to scores array
  playerIsMyTurn.lastScore.push(tempScore);

  // Calculate average
  let average = playerIsMyTurn.lastScore;
  let sum = 0;
  sum = 0;
  for (let i = 0; i < average.length; i++) {
    sum += average[i];
  }
  playerIsMyTurn.avg = sum / average.length;

  // Calculate throws
  playerIsMyTurn.throws = average.length * 3;
}

// Quit game (back to settings)
/* ==== GAME LOGIC ==== */
function submitTurn() {
  const playerIsMyTurn = players.find((player) => player.isMyTurn === true);
  let tempScore = parseInt(score);
  if (!playerIsMyTurn) {
    showErrorMessage("Error, please restart the game!");
    return;
  }
  // Double or single checkout
  if (playerIsMyTurn.doubleOut) {
    if (
      playerIsMyTurn.currentScore === tempScore &&
      playerIsMyTurn.lastDartDouble !== true
    ) {
      pendingCheckout = true;
      pendingCheckoutScore = tempScore;
      document.getElementById("game").classList.add("hidden");
      document.getElementById("double-prompt").classList.remove("hidden");
      return;
    } else if (
      tempScore === playerIsMyTurn.currentScore &&
      playerIsMyTurn.lastDartDouble === true
    ) {
      playerIsMyTurn.legsWon += 1;
      if (playerIsMyTurn.legsWon === legsToWin) {
        matchOver();
      } else {
        legWon();
      }
    } else if (tempScore > playerIsMyTurn.currentScore) {
      showErrorMessage("No score");
      playerBust();
    } else {
      if (playerIsMyTurn.currentScore - tempScore === 1) {
        showErrorMessage("No score, Can't checkout 1");
        playerBust();
      } else {
        playerScored();
      }
    }
  } else {
    if (tempScore === playerIsMyTurn.currentScore) {
      updatePlayer();
      gameWon();
      if (playerIsMyTurn.legsWon === legsToWin) {
        matchOver();
      } else {
        legWon();
      }
    } else if (tempScore > playerIsMyTurn.currentScore) {
      showErrorMessage("No score");
      playerBust();
    } else {
      playerScored();
    }
  }
}

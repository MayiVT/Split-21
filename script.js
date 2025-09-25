const suits = ['♠', '♥', '♦', '♣'];
const ranks = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
const DECKS = 1; 
const SHUFFLE_POINT = 0.25; 

let deck, playerHand, dealerHand, bankroll = 100, bet = 10;
let gameOver = false;

function createDeck() {
  const d = [];
  for (let s of suits) {
    for (let r of ranks) {
      d.push({rank:r, suit:s});
    }
  }
  return d;
}

function shuffle(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i+1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function cardValue(card) {
  if (['J','Q','K'].includes(card.rank)) return 10;
  if (card.rank === 'A') return 11;
  return parseInt(card.rank);
}

function handValue(hand) {
  let total = 0, aces = 0;
  for (let c of hand) {
    total += cardValue(c);
    if (c.rank === 'A') aces++;
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

function handToHTML(hand) {
  return hand.map(c => {
    const redSuits = ['♥','♦'];
    const classes = redSuits.includes(c.suit) ? "card red" : "card";
    return `<div class="${classes}">${c.rank}${c.suit}</div>`;
  }).join('');
}

function startRound() {
  // If deck doesn't exist yet or it's below the shuffle threshold → reshuffle
  if (!deck || deck.length < (DECKS * 52 * SHUFFLE_POINT)) {
    // Disable controls during shuffle
    disableControls(true);
    document.getElementById('message').textContent = "🔄 Shuffling new shoe...";

    setTimeout(() => {
      deck = shuffle(createDeck(DECKS));
      console.log("🔄 Shuffling new shoe...");
      disableControls(false);
      dealHands();
    }, 3000 + Math.random() * 2000); // 3–5 seconds delay

  } else {
    dealHands();
  }
}

function dealHands() {
  playerHand = [deck.pop(), deck.pop()];
  dealerHand = [deck.pop(), deck.pop()];
  gameOver = false;
  render();
  document.getElementById('message').textContent = "Your move...";
}

function disableControls(state) {
  document.getElementById('hit').disabled = state;
  document.getElementById('stand').disabled = state;
  document.getElementById('new-round').disabled = state;
}

function render() {
  document.getElementById('player-hand').innerHTML =
    handToHTML(playerHand) + `<br>( ${handValue(playerHand)} )`;

  if (gameOver) {
    document.getElementById('dealer-hand').innerHTML =
      handToHTML(dealerHand) + `<br>( ${handValue(dealerHand)} )`;
  } else {
    document.getElementById('dealer-hand').innerHTML =
      handToHTML([dealerHand[0]]) + `<div class="card back">?</div>`;
  }

  document.getElementById('bankroll').textContent = `Bankroll: $${bankroll}`;
  document.getElementById('bet').textContent = `Bet: $${bet}`;
  document.getElementById('deck-count').textContent =
  `Cards left: ${deck.length}`;
}


function endRound() {
  gameOver = true;

  while (handValue(dealerHand) < 17) {
    dealerHand.push(deck.pop());
  }

  const playerVal = handValue(playerHand);
  const dealerVal = handValue(dealerHand);
  let msg;

  if (playerVal > 21) {
    bankroll -= bet;
    msg = "You bust! Dealer wins.";
  } else if (dealerVal > 21 || playerVal > dealerVal) {
    bankroll += bet;
    msg = "You win!";
  } else if (playerVal === dealerVal) {
    msg = "Push (tie).";
  } else {
    bankroll -= bet;
    msg = "Dealer wins.";
  }

  document.getElementById('message').textContent = msg;
  render();
}

document.getElementById('hit').onclick = () => {
  if (gameOver) return;
  playerHand.push(deck.pop());
  if (handValue(playerHand) > 21) {
    endRound();
  } else {
    render();
  }
};

document.getElementById('stand').onclick = () => {
  if (gameOver) return;
  endRound();
};

document.getElementById('new-round').onclick = () => {
  startRound();
};

startRound();

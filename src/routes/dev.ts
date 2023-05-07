import { Router } from 'express';
import { MatchMakingQueue, MatchMakingQueueItem } from '../match/queue';
import debounce from 'lodash.debounce';
let isMatching = false;
const router = Router();

setInterval(() => {
  if (!isMatching && rankedQueue.get().length > 6) {
    debouncedMatch();
  }
}, 000);

const unrankedQueue = new MatchMakingQueue();
const rankedQueue = new MatchMakingQueue();

const usernames = [
  'test1',
  'test2',
  'test3',
  'test4',
  'test5',
  'test6',
  'test7',
  'test8',
  'test9',
  'test10',
  'test11',
  'test12',
  'test13',
];

const avg = (values: number[]) => {
  return values.reduce((sum, current) => sum + current, 0) / values.length;
};

const variance = (values: number[], waitingTime: number[]) => {
  const waitingPeriod = 60000; // 60 seconds for now, can change latter ( wait up to 1 mins)
  const average = avg(values);
  const squareDiffs = values.map((value, index) => {
    let diff = value - average;
    const timeDiff = waitingTime[index];

    // decrease the variance
    if (timeDiff > waitingPeriod) {
      diff = Math.abs(diff) * (waitingPeriod / timeDiff);
    }
    return diff * diff;
  });
  const variance = avg(squareDiffs);
  return variance;
};

function match() {
  isMatching = true;
  console.log('start matching...');

  const queue = rankedQueue.get();
  if (queue.length < 6) {
    isMatching = false;
    return;
  }
  // sort the player rating in ASC order
  const sorted = queue.sort((a, b) =>
    a.playerRating > b.playerRating ? 1 : -1,
  );

  const sortedRating = sorted.map(({ playerRating }) => playerRating);
  const waitingTime = sorted.map(({ joinAt }) => Date.now() - joinAt);
  const window = 6; // 6 players for now

  let validVariance = 1000; // players rating points variance

  let min = +Infinity;
  let playerIndex = -1;

  for (let index = 0; index < sortedRating.length - window + 1; index++) {
    const v = variance(
      sortedRating.slice(index, index + window),
      waitingTime.slice(index, index + window),
    );
    if (v < min) {
      min = v;
      playerIndex = index;
    }
  }

  if (min < validVariance) {
    const matched = sorted.slice(playerIndex, playerIndex + window);
    console.table(matched);
    matched.forEach((player) => {
      rankedQueue.leave(player.id);
    });
    printQueue(rankedQueue.get());
    isMatching = false;
    return matched;
  }
  console.log({min})
  isMatching = false;
}

const debouncedMatch = debounce(match, 3000);

function printQueue(queue: MatchMakingQueueItem[]) {
  console.log(queue.map(({ id, playerRating }) => ({ id, playerRating })));
}
// when someone join the queue
rankedQueue.subscribe({
  onJoin: (playerId) => {
    console.log(`${playerId} joined`);
    printQueue(rankedQueue.get());
    debouncedMatch();
  },
  onLeave: (playerId) => {
    console.log(playerId + ' left');
    debouncedMatch();
  },
  subscriberId: 'match_making',
});

// join queue with random delay from 0s - 30s
router.post('/join', async (req, res) => {
  await Promise.all(
    usernames.map(
      (username) =>
        new Promise((resolve) => {
          const wait = Math.random() * 30 * 1000;
          const inTheQueue = rankedQueue
            .get()
            .find((item) => item.id === username);
          if (inTheQueue) {
            return resolve(false);
          }
          setTimeout(() => {
            rankedQueue.join(username);
            resolve(true);
          }, wait);
        }),
    ),
  );
  return res.status(200).send({ result: 'joined' });
});

// leave ranked queue API
router.post('/leave', async (req, res) => {
  usernames.forEach((username) => {
    rankedQueue.leave(username);
  });
  return res.status(200).send({ message: 'leave the queue successfully' });
});

// get queue or get first n's players
router.get('/queue', (req, res) => {
  const { quantity, rank = false } = req.body;
  if (rank) {
    const result = isNaN(quantity)
      ? rankedQueue.get()
      : rankedQueue.getFirstNItems(quantity);
    return res.status(200).send({ result });
  } else {
    const result = isNaN(quantity)
      ? unrankedQueue.get()
      : unrankedQueue.getFirstNItems(quantity);
    return res.status(200).send({ result });
  }
});

export default router;

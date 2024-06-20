import { MatchMakingQueueItem } from './MatchMakingQueueItem';

const WINDOW_SIZE = 6; // 6 players for now
const WAITING_PERIOD = 60000; // 60 seconds for now, can change latter ( wait up to 1 mins)
let ALLOWABLE_RATING_VARIANCE = 10000; // players rating points variance

export const avg = (values: number[]) => {
  return values.reduce((sum, current) => sum + current, 0) / values.length;
};

/**
 * This function will calculate the variance of 6 (window size) players variance
 * @param rating players' rating array
 * @param waitingTime players' waiting time
 * @returns 
 */
export const matchQuality = (rating: number[], waitingTime: number[]) => {
  const average = avg(rating);
  const squareDiffs = rating.map((value, index) => {
    let diff = value - average;
    const timeDiff = waitingTime[index];
    // decrease the variance by waiting time
    if (timeDiff > WAITING_PERIOD) {
      diff = Math.abs(diff) * (WAITING_PERIOD / timeDiff);
    }
    return diff * diff;
  });
  const variance = avg(squareDiffs);
  return variance;
};

export function matchMakePlayers(playersInQueue: MatchMakingQueueItem[]) {
  if (playersInQueue.length < 6) {
    return [];
  }

  const sortedRating = playersInQueue.map(({ playerRating }) => playerRating);
  const waitingTime = playersInQueue.map(
    ({ timeJoinedAt }) => Date.now() - timeJoinedAt,
  );

  let min = +Infinity;
  let playerIndex = -1;

  for (let index = 0; index < sortedRating.length - WINDOW_SIZE + 1; index++) {
    const matchQualityValue = matchQuality(
      sortedRating.slice(index, index + WINDOW_SIZE),
      waitingTime.slice(index, index + WINDOW_SIZE),
    );
    if (matchQualityValue < min) {
      min = matchQualityValue;
      playerIndex = index;
    }
  }


  if (min < ALLOWABLE_RATING_VARIANCE) {
    // match found
    const matched = playersInQueue.slice(playerIndex, playerIndex + WINDOW_SIZE);
    // output the matched queue
    // Socket API will handle those player leave queue
    printQueue(matched);
    return matched;
  }
}

function printQueue(playersInQueue: MatchMakingQueueItem[]) {
  console.log(
    playersInQueue.map(({ username, playerRating }) => ({ username, playerRating })),
  );
}

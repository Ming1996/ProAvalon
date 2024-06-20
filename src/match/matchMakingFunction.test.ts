import { MatchMakingQueueItem } from './MatchMakingQueueItem';
import { matchMakePlayers } from './matchMakingFunction';

describe('Match Making Queue Result', () => {
  it('should expect the result from the algorithm will be the same.', async () => {
    // Setup
    const testRankedQueue: MatchMakingQueueItem[] = [
      {
        username: 'test12',
        playerRating: 1095,
        timeJoinedAt: 1686405743677,
      },
      {
        username: 'test2',
        playerRating: 1385,
        timeJoinedAt: 1686405743679,
      },
      {
        username: 'test6',
        playerRating: 1353,
        timeJoinedAt: 1686405743680,
      },
      {
        username: 'test11',
        playerRating: 1465,
        timeJoinedAt: 1686405743682,
      },
      {
        username: 'test3',
        playerRating: 1400,
        timeJoinedAt: 1686405743683,
      },
      {
        username: 'test7',
        playerRating: 1252,
        timeJoinedAt: 1686405743689,
      },
      {
        username: 'test13',
        playerRating: 1414,
        timeJoinedAt: 1686405743689,
      },
      {
        username: 'test4',
        playerRating: 1193,
        timeJoinedAt: 1686405743691,
      },
      {
        username: 'test8',
        playerRating: 1270,
        timeJoinedAt: 1686405743694,
      },
      {
        username: 'test9',
        playerRating: 1194,
        timeJoinedAt: 1686405743694,
      },
      {
        username: 'test1',
        playerRating: 1378,
        timeJoinedAt: 1686405743695,
      },
      {
        username: 'test5',
        playerRating: 1476,
        timeJoinedAt: 1686405743696,
      },
      {
        username: 'test10',
        playerRating: 1470,
        timeJoinedAt: 1686405743696,
      },
    ];

    const matchedPlayersGroup1 = matchMakePlayers(testRankedQueue);
    const players = testRankedQueue.filter(
      (player) =>
        !matchedPlayersGroup1.map((p) => p.username).includes(player.username),
    );
    const matchedPlayersGroup2 = matchMakePlayers(players);
    const playerLeft = players.filter(
      (player) =>
        !matchedPlayersGroup2.map((p) => p.username).includes(player.username),
    );

    // Assert
    expect(playerLeft).toEqual([
      {
        username: 'test12',
        playerRating: 1095,
        timeJoinedAt: 1686405743677,
      },
    ]);
    expect(matchedPlayersGroup1).toEqual([
      {
        username: 'test2',
        playerRating: 1385,
        timeJoinedAt: 1686405743679,
      },
      {
        username: 'test6',
        playerRating: 1353,
        timeJoinedAt: 1686405743680,
      },
      {
        username: 'test11',
        playerRating: 1465,
        timeJoinedAt: 1686405743682,
      },
      {
        username: 'test3',
        playerRating: 1400,
        timeJoinedAt: 1686405743683,
      },
      {
        username: 'test7',
        playerRating: 1252,
        timeJoinedAt: 1686405743689,
      },
      {
        username: 'test13',
        playerRating: 1414,
        timeJoinedAt: 1686405743689,
      },
    ]);

    expect(matchedPlayersGroup2).toEqual([
      {
        username: 'test4',
        playerRating: 1193,
        timeJoinedAt: 1686405743691,
      },
      {
        username: 'test8',
        playerRating: 1270,
        timeJoinedAt: 1686405743694,
      },
      {
        username: 'test9',
        playerRating: 1194,
        timeJoinedAt: 1686405743694,
      },
      {
        username: 'test1',
        playerRating: 1378,
        timeJoinedAt: 1686405743695,
      },
      {
        username: 'test5',
        playerRating: 1476,
        timeJoinedAt: 1686405743696,
      },
      {
        username: 'test10',
        playerRating: 1470,
        timeJoinedAt: 1686405743696,
      },
    ]);
  });
});

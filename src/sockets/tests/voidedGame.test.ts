import { Types } from 'mongoose';
import Mongo from '../../db/mongo';
import Game from '../../gameplay/game';
import ScoreRedistributor from '../../gameplay/scoreRedistributor';

jest.mock('../../models/user');
jest.mock('../../models/rank');

describe('voidedGame', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls voidGame', async () => {
    const userIds = [
      new Types.ObjectId(),
      new Types.ObjectId(),
      new Types.ObjectId(),
      new Types.ObjectId(),
      new Types.ObjectId(),
      new Types.ObjectId(),
    ];

    const rankIds = [
      new Types.ObjectId(),
      new Types.ObjectId(),
      new Types.ObjectId(),
      new Types.ObjectId(),
      new Types.ObjectId(),
      new Types.ObjectId(),
    ];
    const usernames: string[] = ['user1', 'user2', 'user3', 'user4', 'user5'];
    //assign first 3 users in users to the leavers array, and the rest to the nonleavers array

    jest
      .spyOn(Mongo, 'getUserRankByUsername')
      .mockImplementation((username) => {
        switch (username) {
          case 'user1':
            return Promise.resolve({
              _id: rankIds[0],
              userId: userIds[0],
              username: 'user1',
              seasonNumber: 1,
              playerRating: 1500,
              rd: 200,
              volatility: 0.06,
              leavePenalty: 0,
            });
          case 'user2':
            return Promise.resolve({
              _id: rankIds[1],
              userId: userIds[1],
              username: 'user2',
              seasonNumber: 1,
              playerRating: 1700,
              rd: 170,
              volatility: 0.06,
              leavePenalty: 0,
            });
          case 'user3':
            return Promise.resolve({
              _id: rankIds[2],
              userId: userIds[2],
              username: 'user3',
              seasonNumber: 1,
              playerRating: 1400,
              rd: 30,
              volatility: 0.06,
              leavePenalty: 0,
            });
          case 'user4':
            return Promise.resolve({
              _id: rankIds[3],
              userId: userIds[3],
              username: 'user4',
              seasonNumber: 1,
              playerRating: 1400,
              rd: 30,
              volatility: 0.06,
              leavePenalty: 0,
            });
          case 'user5':
            return Promise.resolve({
              _id: rankIds[4],
              userId: userIds[4],
              username: 'user5',
              seasonNumber: 1,
              playerRating: 1400,
              rd: 30,
              volatility: 0.06,
              leavePenalty: 0,
            });
          case 'mockUser':
            return Promise.resolve({
              _id: rankIds[5],
              userId: userIds[5],
              username: 'user5',
              seasonNumber: 1,
              playerRating: 1400,
              rd: 30,
              volatility: 0.06,
              leavePenalty: 100,
            });
        }
      });
    jest.spyOn(Mongo, 'getUserByUsername').mockImplementation((username) => {
      switch (username) {
        case 'user1':
          return Promise.resolve({
            _id: userIds[0],
            username: 'user1',
            usernameLower: 'user1',
            currentRanking: rankIds[0],
          });
        case 'user2':
          return Promise.resolve({
            _id: userIds[1],
            username: 'user2',
            usernameLower: 'user2',
            currentRanking: rankIds[1],
          });
        case 'user3':
          return Promise.resolve({
            _id: userIds[2],
            username: 'user3',
            usernameLower: 'user3',
            currentRanking: rankIds[2],
          });
        case 'user4':
          return Promise.resolve({
            _id: userIds[3],
            username: 'user4',
            usernameLower: 'user4',
            currentRanking: rankIds[3],
          });
        case 'user5':
          return Promise.resolve({
            _id: userIds[4],
            username: 'user5',
            usernameLower: 'user5',
            currentRanking: rankIds[4],
          });
          case 'mockUser':
          return Promise.resolve({
            _id: userIds[5],
            username: 'user5',
            usernameLower: 'user5',
            currentRanking: rankIds[5],
          });
      }
    });
    const leavers: string[] = usernames.slice(0, 3);
    const nonLeavers = usernames.slice(3);

    const mockGame = new Game(
      1,
      1,
      1,
      10,
      1212,
      'Avalon',
      true,
      true,
      false,
      'CUSTOM_ROOM', // to track ranked vs unranked vs custom game
      jest.fn(),
    );

    await mockGame.voidedGame(leavers, nonLeavers);

    expect(mockGame.phase).toBe('voided');
    
    const updateRank = await ScoreRedistributor.updateRankData('user1',100);
    console.log(updateRank);
  });
});

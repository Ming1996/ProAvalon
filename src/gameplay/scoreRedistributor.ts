import Mongo from '../db/mongo';
import { eloConstants } from '../elo/constants/eloConstants';

class ScoreRedistributor {
  static async punishPlayers(
    leavePlayers: string[],
    nonLeavePlayers: string[],
  ): Promise<void> {
    // Get all the players
    const leavePlayerPromises = leavePlayers.map((leavePlayer) =>
      Mongo.getUserByUsername(leavePlayer),
    );
    const nonLeavePlayerPromises = nonLeavePlayers.map((otherPlayer) =>
      Mongo.getUserByUsername(otherPlayer),
    );

    const [leaves, nonleaves] = await Promise.all([
      Promise.all(leavePlayerPromises),
      Promise.all(nonLeavePlayerPromises),
    ]);

    // Scores wait to distribute
    let score = 0;

    // Punish the leavers
    const punishLeaversPromises = leaves.map(async (leavePlayer) => {
      await this.updateRankData(
        leavePlayer.usernameLower,
        -eloConstants.LEAVE_PENALTY,
      );
      score += eloConstants.LEAVE_PENALTY;
    });

    await Promise.all(punishLeaversPromises);

    // Distribute the score to the nonleaves
    const compensation = score / nonleaves.length;

    // Compensate the nonleaves
    const compensateNonLeaversPromises = nonleaves.map(
      async (nonleavePlayer) => {
        await this.updateRankData(nonleavePlayer.usernameLower, compensation);
      },
    );

    await Promise.all(compensateNonLeaversPromises);
  }

  static async updateRankData(
    usernameLower: string,
    leavePenaltyChange: number,
  ): Promise<void> {
    const rankData = await Mongo.getUserRankByUsername(usernameLower);
    rankData.leavePenalty += leavePenaltyChange;
    await Mongo.updateRankRatings(usernameLower, rankData);
  }
}

export default ScoreRedistributor;

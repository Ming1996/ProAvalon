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
    for (const leavePlayer of leaves) {
      const rankData = await Mongo.getUserRankByUserId(
        leavePlayer.usernameLower,
      );
      rankData.leavePenalty -= eloConstants.LEAVE_PENALTY;
      await Mongo.updateRankRatings(leavePlayer.usernameLower, rankData);
      score += eloConstants.LEAVE_PENALTY;
    }

    // Distribute the score to the nonleaves
    const compensation = score / nonleaves.length;

    // Compensate the nonleaves
    for (const nonleavePlayer of nonleaves) {
      const rankData = await Mongo.getUserRankByUsername(
        nonleavePlayer.usernameLower,
      );
      rankData.leavePenalty += compensation;
      await Mongo.updateRankRatings(nonleavePlayer.usernameLower, rankData);
    }
  }
}

export default ScoreRedistributor;

import Mongo from '../db/mongo';
import { eloConstants } from '../elo/constants/eloConstants';
import { IUser } from '../models/types';

class LeaveGameDetection {
  static async punishingPlayers(
    leavePlayers: string[],
    nonLeavePlayers: string[],
  ): Promise<void> {
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

    const redistributeScore = await this.leavePenalty(leaves);
    console.log(`Redistribute score: ${redistributeScore}`);

    await this.redistributeScores(redistributeScore, nonleaves);
  }

  private static async redistributeScores(
    score: number,
    nonleavePlayers: IUser[],
  ): Promise<void> {
    const compensation = score / nonleavePlayers.length;
    for (const nonleavePlayer of nonleavePlayers) {
      const rankData = await Mongo.getUserRankByUsername(
        nonleavePlayer.usernameLower,
      );
      rankData.leavePenalty += compensation;
      await Mongo.updateRankRatings(nonleavePlayer.usernameLower, rankData);
    }
  }

  private static async leavePenalty(leavePlayers: IUser[]): Promise<number> {
    for (const leavePlayer of leavePlayers) {
      const rankData = await Mongo.getUserRankByUserId(
        leavePlayer.usernameLower,
      );
      rankData.leavePenalty += eloConstants.LEAVE_PENALTY;
      await Mongo.updateRankRatings(leavePlayer.usernameLower, rankData);
    }
    return eloConstants.LEAVE_PENALTY * leavePlayers.length;
  }
}

export default LeaveGameDetection;

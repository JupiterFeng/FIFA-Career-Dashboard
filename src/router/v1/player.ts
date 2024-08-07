import express from 'express';
import { Logger } from '../../lib/logger';
import { bulkUpdatePlayer } from '../../general/player/bulk-update-player';
import { doRawInsert, doRawQuery } from '../../models';
import { getAllPlayers } from '../../general/player/get-all-players';

const router = express.Router();

const logger = new Logger(__filename);

/**
 * Get all players
 */
router.get('', async (req: any, res) => {
    try {
        const result = await getAllPlayers();
        res.send(result);
    } catch (e) {
        logger.error(`[API_LOGS][/player] ${e}`);
        res.status(500).send('Internal Server Error');
    }
});

/**
 * Get player count
 */
router.get('/count', async (req: any, res) => {
    try {
        const sqlRes: any[] = await doRawQuery(`SELECT COUNT(*) as c FROM player where is_archived = 0`);
        const count = sqlRes[0].c;
        logger.info(`[API_LOGS][/player/count] ${count} unarchived players found`);
        res.send(count);
    } catch (e) {
        logger.error(`[API_LOGS][/player/count] ${e}`);
        res.status(500).send('Internal Server Error');
    }
});

/**
 * Create or update player
 */
router.post('/single/:playerID', async (req: any, res) => {
    try {
        const playerID = req.params.playerID;
        logger.info(`[API_LOGS][/player] req.body=${JSON.stringify(req.body)}`);
        const { saveUID, currentDate, overallrating, potential } = req.body;

        logger.info(
            `[API_LOGS][/player] playerID=${playerID}, saveUID=${saveUID}, currentDate=${currentDate}, overallrating=${overallrating}, potential=${potential}`,
        );

        if (!playerID || !overallrating || !potential) {
            res.status(400).send('Bad Request');
            return;
        }

        // query first
        const queryRes: any[] = await doRawQuery(`SELECT * FROM player WHERE player_id = ${playerID} limit 1`);
        if (queryRes.length === 0) {
            // insert
            const result = await doRawInsert(
                `INSERT INTO player (player_id, overallrating, potential)
                 VALUES (${playerID}, ${overallrating}, ${potential})`,
            );
            logger.info(
                `[API_LOGS][/player] Created new player: playerID=${playerID}, overallrating=${overallrating}, potential=${potential}`,
            );
            return res.send({
                playerID: playerID,
                message: 'Created successfully',
            });
        } else {
            // update
            const result = await doRawQuery(
                `UPDATE player
                 SET overallrating=${overallrating},
                     potential=${potential}
                 WHERE player_id = ${playerID}`,
            );
            if (
                parseInt(queryRes[0].overallrating) !== parseInt(overallrating) ||
                parseInt(queryRes[0].potential) !== parseInt(potential)
            ) {
                logger.info(
                    `[API_LOGS][/player] Updated player: playerID=${playerID}, overallrating=${queryRes[0].overallrating}->${overallrating}, potential=${queryRes[0].potential}->${potential}`,
                );
            }
            return res.send({
                playerID: playerID,
                message: 'Updated successfully',
            });
        }
    } catch (e) {
        logger.error(`[API_LOGS][/player] ${e}`);
        res.status(500).send('Internal Server Error');
    }
});

/**
 * Create or update players in bulk
 */
router.post('/bulk', async (req: any, res) => {
    try {
        res.send({
            message: 'Got the message',
        });
        const players = req.body;
        logger.info(`[API_LOGS][/player/bulk] players.length=${players.length}`);
        if (!players || players.length === 0) {
            return;
        }
        await bulkUpdatePlayer(players);
        logger.info(`[API_LOGS][/player/bulk] Done`);
    } catch (e) {
        logger.error(`[API_LOGS][/player/bulk] ${e}`);
        res.status(500).send('Internal Server Error');
    }
});

export default router;

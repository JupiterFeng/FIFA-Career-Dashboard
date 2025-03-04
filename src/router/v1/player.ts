import express from 'express';
import { Logger } from '../../lib/logger';
import { bulkUpdatePlayer } from '../../general/player/bulk-update-player';
import { getAllPlayers } from '../../general/player/get-all-players';
import { getPlayerCount } from '../../general/player/get-player-count';
import { getAllPlayerTrends } from '../../general/player/get-all-player-trends';

const router = express.Router();

const logger = new Logger(__filename);

/**
 * Get all players
 */
router.get('', async (req: any, res) => {
    const result = await getAllPlayers();
    res.send(result);
});

/**
 * Get player count
 */
router.get('/count', async (req: any, res) => {
    const count = await getPlayerCount();
    res.send(count);
});

/**
 * Get player trends
 */
router.get('/trends', async (req: any, res) => {
    const result = await getAllPlayerTrends();
    res.send(result);
});

/**
 * Create or update players in bulk
 */
router.post('/bulk', async (req: any, res) => {
    res.send({
        message: 'Got the message',
    });
    await bulkUpdatePlayer(req.body);
});

export default router;

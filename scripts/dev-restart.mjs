// Sanctioned dev-server restart for Cursor agents, Codex, and Ryo.
// Frees ports 3000/3001, syncs deps if needed, then starts next dev once.

import { restartDevServer } from './dev-launcher.mjs';

await restartDevServer();

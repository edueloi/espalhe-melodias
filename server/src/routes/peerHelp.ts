import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import * as ctrl from '../controllers/peerHelpController';

const router = Router();

router.get('/',              authenticate, asyncHandler(ctrl.listPeerHelpRequests));
router.post('/',             authenticate, asyncHandler(ctrl.createPeerHelpRequest));
router.post('/:id/replies',  authenticate, asyncHandler(ctrl.replyToPeerHelpRequest));
router.patch('/:id/resolve', authenticate, asyncHandler(ctrl.resolvePeerHelpRequest));

export default router;

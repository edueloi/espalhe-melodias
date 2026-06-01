import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { upload, uploadAvatar, deleteAvatar } from '../controllers/uploadController';

const router = Router();

router.post('/avatar',  authenticate, upload.single('avatar'), asyncHandler(uploadAvatar));
router.delete('/avatar', authenticate, asyncHandler(deleteAvatar));

export default router;

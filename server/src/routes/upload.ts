import { Router } from 'express';
import { authenticate, professionalOrAdmin } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import {
  upload, uploadAvatar, deleteAvatar,
  uploadGallery, uploadGalleryPhoto,
  uploadMaterial, uploadMaterialFile,
  uploadBlogCover, uploadBlogCoverImage,
} from '../controllers/uploadController';

const router = Router();

router.post('/avatar',  authenticate, upload.single('avatar'), asyncHandler(uploadAvatar));
router.delete('/avatar', authenticate, asyncHandler(deleteAvatar));

router.post('/gallery-photo', authenticate, professionalOrAdmin, uploadGallery.single('photo'), asyncHandler(uploadGalleryPhoto));

router.post('/material', authenticate, professionalOrAdmin, uploadMaterial.single('file'), asyncHandler(uploadMaterialFile));

router.post('/blog-cover', authenticate, professionalOrAdmin, uploadBlogCover.single('cover'), asyncHandler(uploadBlogCoverImage));

export default router;

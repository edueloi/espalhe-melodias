import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import * as ctrl from '../controllers/professionalsController';

const router = Router();

router.get('/slug-check', authenticate, asyncHandler(ctrl.checkSlug));
router.get('/',           authenticate, asyncHandler(ctrl.listProfessionals));
router.get('/:id',        authenticate, asyncHandler(ctrl.getProfessional));
// Todo usuário da plataforma é, na prática, um profissional de saúde mental —
// "member" é apenas o nível de acesso administrativo padrão, não uma distinção
// de tipo de usuário. Por isso qualquer autenticado pode editar seu próprio perfil.
router.put('/me',         authenticate, asyncHandler(ctrl.upsertProfessional));

export default router;

import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { SessionController } from '../controllers/session.controller';
import { TeacherController } from '../controllers/teacher.controller';
import { UserController } from '../controllers/user.controller';

import { RegisterSchema, LoginSchema } from '../dto/auth.dto';
import { CreateSessionSchema, UpdateSessionSchema } from '../dto/session.dto';

import { validate } from '../middleware/validate.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

// Controllers
const authController = new AuthController();
const sessionController = new SessionController();
const teacherController = new TeacherController();
const userController = new UserController();

// Auth routes (public)
router.post('/api/auth/login', validate(LoginSchema), asyncHandler((req, res) => authController.login(req, res)));
router.post('/api/auth/register', validate(RegisterSchema), asyncHandler((req, res) => authController.register(req, res)));

// Session routes (protected)
router.get('/api/session', authMiddleware, (req, res) => sessionController.getAll(req, res));
router.get('/api/session/:id', authMiddleware, (req, res) => sessionController.getById(req, res));
router.post('/api/session', authMiddleware, validate(CreateSessionSchema), (req, res) => sessionController.create(req, res));
router.put('/api/session/:id', authMiddleware, validate(UpdateSessionSchema), (req, res) => sessionController.update(req, res));
router.delete('/api/session/:id', authMiddleware, (req, res) => sessionController.delete(req, res));
router.post('/api/session/:id/participate/:userId', authMiddleware, (req, res) => sessionController.participate(req, res));
router.delete('/api/session/:id/participate/:userId', authMiddleware, (req, res) => sessionController.unparticipate(req, res));

// Teacher routes (protected)
router.get('/api/teacher', authMiddleware, (req, res) => teacherController.getAll(req, res));
router.get('/api/teacher/:id', authMiddleware, (req, res) => teacherController.getById(req, res));

// User routes (protected)
router.get('/api/user/:id', authMiddleware, (req, res) => userController.getById(req, res));
router.post('/api/user/promote-admin', authMiddleware, (req, res) =>
  userController.promoteSelfToAdmin(req, res),
);
router.delete('/api/user/:id', authMiddleware, (req, res) => userController.delete(req, res));

export default router;

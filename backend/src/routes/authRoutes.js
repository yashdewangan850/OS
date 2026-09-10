import { Router } from 'express';
export default function authRoutes(controller, auth) {
  const router = Router();
  router.post('/register', controller.register);
  router.post('/login', controller.login);
  router.get('/me', auth, controller.me);
  return router;
}

import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth.js';
import { aiChatRateLimiter, flashcardRateLimiter } from '../middleware/rateLimiter.js';
import {
  chatWithCampAi,
  generateFlashcards,
  getDecks,
  deleteDeck
} from '../controllers/aiController.js';

const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(pdf)$/)) {
      return cb(new Error('Only PDF files are supported.'));
    }
    cb(undefined, true);
  }
});

const router = Router();

// authenticate runs first so rateLimiter can key by req.user._id
router.post('/chat', authenticate, aiChatRateLimiter, chatWithCampAi);
router.post('/flashcards/generate', authenticate, flashcardRateLimiter, upload.single('pdf'), generateFlashcards);
router.get('/flashcards', authenticate, getDecks);
router.delete('/flashcards/:id', authenticate, deleteDeck);

export default router;

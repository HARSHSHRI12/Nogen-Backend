const express = require('express');
const router = express.Router();
const connectionController = require('../controllers/connectionController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/request', connectionController.sendRequest);
router.put('/accept/:requestId', connectionController.acceptRequest);
router.delete('/reject/:requestId', connectionController.rejectRequest);
router.get('/all', connectionController.getConnections);
router.get('/pending', connectionController.getPendingRequests);
router.get('/suggestions', connectionController.getSuggestions);

module.exports = router;

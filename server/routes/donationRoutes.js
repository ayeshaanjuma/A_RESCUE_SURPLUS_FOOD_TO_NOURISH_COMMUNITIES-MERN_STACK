const express = require('express');
const router = express.Router();
const {
    createDonation,
    getNearbyDonations,
    getAllDonations,
    claimDonation,
    updateDonationStatus,
    getDonationStats,
    getDashboardGlobalStats
} = require('../controllers/donationController');
const { protect, optionalProtect, donorOnly, ngoOnly } = require('../middleware/auth');

router.post('/create', protect, donorOnly, createDonation);
router.get('/nearby', optionalProtect, getNearbyDonations);
router.get('/all', protect, getAllDonations);
router.put('/claim/:id', protect, ngoOnly, claimDonation);
router.put('/status/:id', protect, updateDonationStatus);
router.get('/stats', getDonationStats);
router.get('/dashboard-stats', protect, getDashboardGlobalStats);

module.exports = router;

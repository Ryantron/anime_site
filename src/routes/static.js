import express from 'express';

const router = express.Router();

router.route('/').get(async (req, res) => {
  return res.render('landing', {
    title: 'Landing',
  });
});

router.route('/landing').get(async (req, res) => {
  return res.render('landing', {
    title: 'Landing',
  });
});

export default router;

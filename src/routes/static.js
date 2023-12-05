import express from 'express';

const router = express.Router();

router.route('/').get(async (req, res) => {
  return res.render('aboutus', {
    title: 'About Us',
  });
});

router.route('/aboutus').get(async (req, res) => {
  return res.render('aboutus', {
    title: 'About Us',
  });
});

export default router;

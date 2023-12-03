import staticRouter from './static.js';

export default function createRoutes(app) {
  app.use('/', staticRouter);

  app.use('*', (_, res) => {
    res.render('errors', {
      errorStatus: 404,
      title: 'Error',
      errorMessage: 'Page not found',
    });
  });
}

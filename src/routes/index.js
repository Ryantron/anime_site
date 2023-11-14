export default function createRoutes(app) {
  app.use('*', (_, res) => {
    res.render('error', {
      errorStatus: 404,
      title: 'Error',
      errorMessage: 'Page not found',
    });
  });
}

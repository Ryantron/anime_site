import staticRouter from "./static.js";

export default function createRoutes(app) {
  app.use("/", staticRouter);

  app.use("*", (_, res) => {
    res.redirect(`/errors?errorStatus=${404}&message=${"Page not found"}`);
  });
}

import staticRouter from "./static.js";
import mainRouter from "./main.js";
import recRouter from "./recommendations.js";
import accRouter from "./accounts.js";

export default function createRoutes(app) {
  app.use("/", staticRouter);
  app.use("/main", mainRouter);
  app.use("/recommendations", recRouter);
  app.use("/accounts", accRouter);

  app.use("*", (_, res) => {
    res.redirect(`/errors?errorStatus=${404}&message=${"Page not found"}`);
  });
}

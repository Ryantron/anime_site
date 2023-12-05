import staticRouter from "./static.js";

export default function createRoutes(app) {
  app.use("/", staticRouter);

  app.use("*", (_, res) => {
    res.status(404).render("errors", {
      errorStatus: 404,
      title: "Error",
      errorMessage: "Page not found",
    });
  });
}

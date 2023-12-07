// This file should set up the express server as shown in the lecture code

import express from "express";
import routes from "./routes/index.js";
import { fileURLToPath } from "url";
import path from "path";
import exphbs from "express-handlebars";
import session from "express-session";

const __filename = fileURLToPath(import.meta.url);
const __rootDirectory = path.dirname(path.dirname(__filename));
const __publicPath = path.join(__rootDirectory, "/public");
const __viewPath = path.join(__rootDirectory, "/views");
const expressPublicPath = express.static(__publicPath);

const handlebarsInstance = exphbs.create({
  defaultLayout: "main",
  helpers: {
    asJSON: (obj, spacing) => {
      if (typeof spacing === "number")
        return new Handlebars.SafeString(JSON.stringify(obj, null, spacing));
    },
  },
});

const app = express();
app.use("/public", expressPublicPath);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middlewares
app.use(
  session({
    name: "AuthState",
    secret: "some secret string!",
    resave: false,
    saveUninitialized: false,
  }),
);

app.use("/accounts", (req, res, next) => {
  if (req.session.user) return next();
  res.redirect("/login");
});

app.engine("handlebars", handlebarsInstance.engine);
app.set("view engine", "handlebars");
app.set("views", __viewPath);

routes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log("Your routes will be running on http://localhost:3000");
});

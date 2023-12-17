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
    increment: (value) => value + 1,
    eq: (a, b) => a === b,
  },
});

export const app = express();

const rewriteUnsupportedBrowserMethods = (req, res, next) => {
  // If the user posts to the server with a property called _method, rewrite the request's method
  // To be that method; so if they post _method=PUT you can now allow browsers to POST to a route that gets
  // rewritten in this middleware to a PUT route
  // Ex: <input type="hidden" name='_method' value="PUT" /> in the form
  if (req.body && req.body._method) {
    req.method = req.body._method;
    delete req.body._method;
  }

  // let the next middleware run:
  next();
};

// Middlewares START

app.use("/public", expressPublicPath);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rewriteUnsupportedBrowserMethods);

app.use(
  session({
    name: "AuthState",
    secret: "some secret string!",
    resave: false,
    saveUninitialized: false,
  })
);

app.use((req, res, next) => {
  const user = req.session.user ? req.session.user : null;
  // Make the user data available to all routes
  res.locals.navbar = { user };
  next();
});

app.engine("handlebars", handlebarsInstance.engine);
app.set("view engine", "handlebars");
app.set("views", __viewPath);

app.get("/", (req, res, next) => {
  const defaultSrc =
    "default-src 'self' https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js https://kit.fontawesome.com https://ka-f.fontawesome.com https://rawgit.com/leizongmin/js-xss/master/dist/xss.js;";
  const styleSrc =
    "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css;";
  const fontSrc =
    "font-src 'self' https://kit.fontawesome.com/643c2e6cd9.js https://ka-f.fontawesome.com;";
  res.set("Content-Security-Policy", `${defaultSrc}${styleSrc}${fontSrc}`);
  next();
});

app.use("/accounts", (req, res, next) => {
  if (req.session.user) return next();
  res.redirect("/login");
});

app.use("/login", (req, res, next) => {
  if (!req.session.user) return next();
  res.redirect("/main");
});

app.use("/signup", (req, res, next) => {
  if (!req.session.user) return next();
  res.redirect("/main");
});

// Middlewares END

routes(app);

export const server = app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log("Your routes will be running on http://localhost:3000");
});

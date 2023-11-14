// This file should set up the express server as shown in the lecture code

import express from 'express';
import routes from './routes/index.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import exphbs from 'express-handlebars';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pubPath = express.static(join(__dirname, '/public'));

const handlebarsInstance = exphbs.create({
  defaultLayout: 'main',
  helpers: {
    asJSON: (obj, spacing) => {
      if (typeof spacing === 'number')
        return new Handlebars.SafeString(JSON.stringify(obj, null, spacing));
    },
  },
});

const app = express();
app.use('/public', pubPath);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine('handlebars', handlebarsInstance.engine);
app.set('view engine', 'handlebars');
app.set('views', './views');

routes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});

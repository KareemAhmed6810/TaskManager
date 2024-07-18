const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { AppError } = require('./utlis/appError');
dotenv.config({ path: './config.env' });
const { app } = require('./app');
const port = process.env.PORT || 3000;
(async function DBconnection() {
  await mongoose.connect(process.env.DATABASE_LOCAL);
  console.log('DB CONNECTION DONE');
})();
app.use('*', () => {
  next(new AppError(`the following ${req.url} is not found`, 400));
});

app.listen(port, () => {
  console.log('app is running on ', port);
});

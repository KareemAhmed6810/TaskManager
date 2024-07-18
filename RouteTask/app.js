const express = require('express');
const userRouter = require('./routes/userRoutes');
const categoryRouter = require('./routes/categoryRoutes');
const taskRouter = require('./routes/taskRoutes');

const morgan = require('morgan');
const { globalErrorHandling } = require('./controller/errorController');
const app = express();
app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use('/users', userRouter);
app.use('/categories', categoryRouter);
app.use('/tasks', taskRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`can not find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandling);
module.exports = { app };

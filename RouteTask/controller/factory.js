const { AppError } = require('../utlis/appError');
const catchAsync = require('../utlis/catchAsync');


exports.getOne = function(Model, population) {
  return catchAsync(async function(req, res, next) {
    let doc = await Model.findById(req.params.id).populate(population);
    if (!doc) return next(new AppError('NOT FOUND', 404));
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        doc
      }
    });
  });
};


  
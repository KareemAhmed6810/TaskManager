const { AppError } = require('./appError');

class AppFeatures {
  //(task.find, req.query)
  constructor(query, queryStr, numOfDocs) {
    this.query = query;
    this.queryStr = queryStr;
    this.numOfDocs = numOfDocs;
  }

  filter() {
    let str = { ...this.queryStr };
    // console.log(str);

    let excludedFields = ['fields', 'limit', 'sort', 'page'];
    excludedFields.forEach(el => delete str[el]);
    str = JSON.stringify(str);
    str = str.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    str = JSON.parse(str);


      // this.query = this.query.populate({
      //   path: 'category',
      //   match: { name: categoryName }
      // });
    
    this.query = this.query.find(str);
    return this;
  }
  sort() {
    if (this.queryStr.sort) {
      let str = this.queryStr.sort.split(',').join(' ');
      this.query = this.query.sort(str);
    } else {
      this.query = this.query.sort('createdAt');
    }
    return this;
  }

  selectFields() {
    if (this.queryStr.fields) {
      let str2 = this.queryStr.fields.split(',').join(' ');
      this.query = this.query.select(str2);
    }
    return this;
  }

  paginate() {
    const page = this.queryStr.page * 1 || 1;
    const limit = Number(this.queryStr.limit) || 10;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    if (this.queryStr.page) {
      if (skip >= this.numOfDocs) {
        throw new AppError('This page does not exist', 400);
      }
    }
    return this;
  }
}

module.exports = { AppFeatures };

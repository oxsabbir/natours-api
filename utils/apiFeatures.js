class APIFeature {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const quryObject = { ...this.queryString };
    const excludedItem = ['limit', 'page', 'sort', 'fields'];
    excludedItem.forEach((el) => delete quryObject[el]);

    // Filtering in advance for less then greater then
    let queryStr = JSON.stringify(quryObject);
    queryStr = queryStr.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (matchValue) => `$${matchValue}`,
    );

    // BUILDING QUERY
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    // SORTING METHOD
    if (this.queryString.sort) {
      const dataOfSort = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(dataOfSort);
    }
    return this;
  }

  limitFields() {
    // With some of the field
    if (this.queryString.fields) {
      const dataOfField = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(dataOfField);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skipper = (page - 1) * limit;

    if (this.queryString.page) {
      this.query = this.query.skip(skipper).limit(limit);
    }
    return this;
  }
}

module.exports = APIFeature;

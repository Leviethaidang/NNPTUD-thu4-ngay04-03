var express = require('express');
var router = express.Router();
let { dataCategories, dataProducts } = require('../utils/data');
const slugify = require('slugify');
let { genID, getItemById } = require('../utils/idHandler')


router.get('/', function (req, res, next) {
  let result = dataProducts.filter(
    function (e) {
      return !e.isDeleted
    }
  )
  res.send(result);
});
///api/v1/products/id
router.get('/:id', function (req, res, next) {
  let id = req.params.id;
  let result = dataProducts.filter(
    function (e) {
      return e.id == id && !e.isDeleted
    }
  )
  if (result.length) {
    res.send(result[0]);
  } else {
    res.status(404).send({
      message: "ID NOT FOUND"
    });
  }
});
router.post('/', function (req, res, next) {
  let getCate = getItemById(req.body.category, dataCategories);
  if (!getCate) {
    res.send("ID CATE NOT FOUND");
    return;
  }
  let newProduct = {
    id: genID(dataProducts),
    title: req.body.title,
    slug: slugify(req.body.title, {
      replacement: '-',
      remove: undefined,
      lower: true
    }),
    images: req.body.images,
    creationAt: new Date(Date.now()),
    updatedAt: new Date(Date.now()),
    price: req.body.price,
    description: req.body.description,
    category: getCate
  }
  dataProducts.push(newProduct),
    res.send(newProduct)
})
router.put('/:id', function (req, res, next) {
  let id = req.params.id;
  let result = dataProducts.filter(
    function (e) {
      return e.id == id && !e.isDeleted
    }
  )
  if (result.length) {
    result = result[0];
    let keys = Object.keys(req.body);
    for (const key of keys) {
      if (key == 'category') {
        let getCate = getItemById(req.body.category, dataCategories);
        if (!getCate) {
          res.send("ID CATE NOT FOUND");
          return;
        }
        result.category = getCate;
        continue;
      }
      if (result[key]) {
        result[key] = req.body[key];
        result.updatedAt = new Date(Date.now())
      }
    }
    res.send(result)
  } else {
    res.status(404).send({
      message: "ID NOT FOUND"
    });
  }
})
router.delete('/:id', function (req, res, next) {
  let id = req.params.id;
  let result = dataProducts.filter(
    function (e) {
      return e.id == id && !e.isDeleted
    }
  )
  if (result.length) {
    result = result[0];
    result.isDeleted = true;
    result.updatedAt = new Date(Date.now())
    res.send(result)
  } else {
    res.status(404).send({
      message: "ID NOT FOUND"
    });
  }
})
module.exports = router;


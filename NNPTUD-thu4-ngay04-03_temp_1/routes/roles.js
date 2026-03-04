var express = require('express');
var router = express.Router();
let { dataRole, dataUser } = require('../utils/data');

function getRoleById(id) {
  return dataRole.find(function (role) {
    return role.id == id && !role.isDeleted;
  });
}

function getNextRoleId() {
  let maxId = dataRole.reduce(function (max, role) {
    let numericId = Number.parseInt(String(role.id).replace(/^r/i, ''));
    if (Number.isNaN(numericId)) {
      return max;
    }
    return Math.max(max, numericId);
  }, 0);

  return 'r' + (maxId + 1);
}

router.get('/', function (req, res, next) {
  let result = dataRole.filter(function (role) {
    return !role.isDeleted;
  });

  res.send(result);
});

router.get('/:id', function (req, res, next) {
  let role = getRoleById(req.params.id);

  if (!role) {
    res.status(404).send({
      message: 'ID ROLE NOT FOUND'
    });
    return;
  }

  res.send(role);
});

router.get('/:id/users', function (req, res, next) {
  let role = getRoleById(req.params.id);
  if (!role) {
    res.status(404).send({
      message: 'ID ROLE NOT FOUND'
    });
    return;
  }

  let users = dataUser.filter(function (user) {
    return !user.isDeleted && user.role && user.role.id == req.params.id;
  });

  res.send(users);
});

router.post('/', function (req, res, next) {
  if (!req.body.name || !req.body.description) {
    res.status(400).send({
      message: 'name and description are required'
    });
    return;
  }

  let now = new Date(Date.now());
  let newRole = {
    id: getNextRoleId(),
    name: req.body.name,
    description: req.body.description,
    creationAt: now,
    updatedAt: now
  };

  dataRole.push(newRole);
  res.status(201).send(newRole);
});

router.put('/:id', function (req, res, next) {
  let role = getRoleById(req.params.id);

  if (!role) {
    res.status(404).send({
      message: 'ID ROLE NOT FOUND'
    });
    return;
  }

  let hasChange = false;
  if (req.body.name !== undefined) {
    role.name = req.body.name;
    hasChange = true;
  }
  if (req.body.description !== undefined) {
    role.description = req.body.description;
    hasChange = true;
  }

  if (hasChange) {
    role.updatedAt = new Date(Date.now());

    dataUser.forEach(function (user) {
      if (user.isDeleted || !user.role || user.role.id != role.id) {
        return;
      }
      user.role = {
        id: role.id,
        name: role.name,
        description: role.description
      };
      user.updatedAt = new Date(Date.now());
    });
  }

  res.send(role);
});

router.delete('/:id', function (req, res, next) {
  let role = getRoleById(req.params.id);

  if (!role) {
    res.status(404).send({
      message: 'ID ROLE NOT FOUND'
    });
    return;
  }

  role.isDeleted = true;
  role.updatedAt = new Date(Date.now());

  res.send(role);
});

module.exports = router;

var express = require('express');
var router = express.Router();
let { dataUser, dataRole } = require('../utils/data');

function getRoleById(id) {
  return dataRole.find(function (role) {
    return role.id == id && !role.isDeleted;
  });
}

function getUserByUsername(username) {
  return dataUser.find(function (user) {
    return user.username == username && !user.isDeleted;
  });
}

function getRoleIdFromBody(body) {
  if (!body) {
    return undefined;
  }
  if (body.roleId !== undefined) {
    return body.roleId;
  }
  if (body.role && body.role.id !== undefined) {
    return body.role.id;
  }
  if (body.role !== undefined && typeof body.role !== 'object') {
    return body.role;
  }
  return undefined;
}

router.get('/', function (req, res, next) {
  let result = dataUser.filter(function (user) {
    return !user.isDeleted;
  });

  res.send(result);
});

router.get('/:username', function (req, res, next) {
  let user = getUserByUsername(req.params.username);

  if (!user) {
    res.status(404).send({
      message: 'USERNAME NOT FOUND'
    });
    return;
  }

  res.send(user);
});

router.post('/', function (req, res, next) {
  if (!req.body.username || !req.body.password || !req.body.email || !req.body.fullName) {
    res.status(400).send({
      message: 'username, password, email, fullName are required'
    });
    return;
  }

  let existedUser = dataUser.find(function (user) {
    return user.username == req.body.username;
  });
  if (existedUser) {
    res.status(409).send({
      message: 'USERNAME ALREADY EXISTS'
    });
    return;
  }

  let roleId = getRoleIdFromBody(req.body);
  let role = getRoleById(roleId);
  if (!role) {
    res.status(400).send({
      message: 'ID ROLE NOT FOUND'
    });
    return;
  }

  let now = new Date(Date.now());
  let newUser = {
    username: req.body.username,
    password: req.body.password,
    email: req.body.email,
    fullName: req.body.fullName,
    avatarUrl: req.body.avatarUrl || '',
    status: req.body.status !== undefined ? Boolean(req.body.status) : true,
    loginCount: req.body.loginCount !== undefined ? Number(req.body.loginCount) : 0,
    role: {
      id: role.id,
      name: role.name,
      description: role.description
    },
    creationAt: now,
    updatedAt: now
  };

  dataUser.push(newUser);
  res.status(201).send(newUser);
});

router.put('/:username', function (req, res, next) {
  let user = getUserByUsername(req.params.username);
  if (!user) {
    res.status(404).send({
      message: 'USERNAME NOT FOUND'
    });
    return;
  }

  let hasChange = false;

  if (req.body.username !== undefined && req.body.username !== user.username) {
    let duplicated = dataUser.find(function (item) {
      return item.username == req.body.username && !item.isDeleted;
    });
    if (duplicated) {
      res.status(409).send({
        message: 'USERNAME ALREADY EXISTS'
      });
      return;
    }
    user.username = req.body.username;
    hasChange = true;
  }

  if (req.body.password !== undefined) {
    user.password = req.body.password;
    hasChange = true;
  }
  if (req.body.email !== undefined) {
    user.email = req.body.email;
    hasChange = true;
  }
  if (req.body.fullName !== undefined) {
    user.fullName = req.body.fullName;
    hasChange = true;
  }
  if (req.body.avatarUrl !== undefined) {
    user.avatarUrl = req.body.avatarUrl;
    hasChange = true;
  }
  if (req.body.status !== undefined) {
    user.status = Boolean(req.body.status);
    hasChange = true;
  }
  if (req.body.loginCount !== undefined) {
    user.loginCount = Number(req.body.loginCount);
    hasChange = true;
  }

  let roleId = getRoleIdFromBody(req.body);
  if (roleId !== undefined) {
    let role = getRoleById(roleId);
    if (!role) {
      res.status(400).send({
        message: 'ID ROLE NOT FOUND'
      });
      return;
    }
    user.role = {
      id: role.id,
      name: role.name,
      description: role.description
    };
    hasChange = true;
  }

  if (hasChange) {
    user.updatedAt = new Date(Date.now());
  }

  res.send(user);
});

router.delete('/:username', function (req, res, next) {
  let user = getUserByUsername(req.params.username);
  if (!user) {
    res.status(404).send({
      message: 'USERNAME NOT FOUND'
    });
    return;
  }

  user.isDeleted = true;
  user.updatedAt = new Date(Date.now());

  res.send(user);
});

module.exports = router;

const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

// get config vars
dotenv.config();

module.exports = function (app) {
  const generateAccessToken = (username) => {
    return jwt.sign(username, process.env.TOKEN_SECRET, {
      expiresIn: "1800s",
    });
  };

  const authenticateToken = (req, res, next) => {
    const token = req.headers["authorization"];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  let users = [
    {
      id: 1,
      firstName: "Alberto",
      lastName: "Silva",
      email: "abc@def.com",
      password: "12345",
    },
    {
      id: 2,
      firstName: "João",
      lastName: "Castro",
      email: "def@ghi.com",
      password: "23456",
    },
    {
      id: 3,
      firstName: "Maria",
      lastName: "Sousa",
      email: "ghi@jkl.com",
      password: "34567",
    },
  ];
  let id = 3;

  const findUserByEmail = (email) => {
    return users.find((user) => user.email === email);
  };
  const sortUsers = (user1, user2) => {
    if (user1.id < user2.id) {
      return -1;
    }
    if (user1.id > user2.id) {
      return 1;
    }
    return 0;
  };

  app.get("/hello", (req, res) => {
    // #swagger.tags = ['Hello']
    res.send({
      msg: "Hello World!",
    });
  });

  app.get("/users", (req, res) => {
    // #swagger.tags = ['Users']
    res.send(users);
  });

  app.get("/users/:email", (req, res) => {
    // #swagger.tags = ['Users']
    res.send(users.filter((element) => element.email === req.params.email));
  });

  app.post("/users", (req, res) => {
    // #swagger.tags = ['Users']
    const { firstName, lastName, email, password } = req.body;

    if (firstName && lastName && email && password) {
      if (!findUserByEmail(email)) {
        id++;
        req.body.id = id;
        users.push(req.body);
        res.send(req.body);
        return;
      }
      res.status(400).send("Email already exists");
      return;
    }
    res.status(400).send("All fields must be filled");
  });

  app.delete("/users/:email", (req, res) => {
    // #swagger.tags = ['Users']
    const { email } = req.params;
    if (email) {
      const user = findUserByEmail(email);
      if (user) {
        users = users.filter((user) => user.email !== email);
        res.status(200).send(user);
        return;
      }
      res.status(404).send("User does not exist");
      return;
    }
    res.status(400).send("Must provide an email");
  });

  app.put("/users", (req, res) => {
    // #swagger.tags = ['Users']
    const { firstName, lastName, email, password } = req.body;
    if (email) {
      const existingUser = findUserByEmail(email);
      if (existingUser) {
        const updatedUser = {
          id: existingUser.id,
          email: email,
          firstName: firstName,
          lastName: lastName,
          password: password,
        };
        users = [...users.filter((user) => user.email !== email), updatedUser];
        users.sort(sortUsers);
        res.status(200).send(updatedUser);
        return;
      }
      res.status(404).send("User does not exist");
      return;
    }
    res.status(400).send("Must provide an email");
  });

  app.post("/auth/login", (req, res) => {
    /*
    #swagger.tags = ['Auth']
    #swagger.parameters['obj'] = {
      in: 'body',
      description: 'User data.',
      required: true,
      schema: {
          email: "abc@def.com",
          password: "12345"
      }
    }
    */
    const { email, password } = req.body;
    if (
      users.some((user) => user.email == email && user.password == password)
    ) {
      const token = generateAccessToken({
        username: req.body.email,
      });
      res.json({
        email: email,
        token: token,
      });
      return;
    }
    res.status(400).send("Email and password do not match");
  });

  app.get("/protected", authenticateToken, (req, res) => {
    /* 
    #swagger.tags = ['Auth']
    #swagger.security = [{"bearerAuth": []}] 
    */
    res.send({
      msg: "Hello " + req.user.username,
    });
  });
};

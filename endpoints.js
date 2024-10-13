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
      sex: "male",
      isAdult: "yes",
    },
    {
      id: 2,
      firstName: "João",
      lastName: "Castro",
      email: "def@ghi.com",
      password: "23456",
      sex: "male",
      isAdult: "yes",
    },
    {
      id: 3,
      firstName: "Maria",
      lastName: "Sousa",
      email: "ghi@jkl.com",
      password: "34567",
      sex: "female",
      isAdult: "yes",
    },
  ];
  let id = 3;

  const findUserById = (id) => {
    return users.find((user) => user.id === parseInt(id));
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

  app.get("/users/:id", (req, res) => {
    // #swagger.tags = ['Users']
    const user = findUserById(req.params.id);

    if (user) {
      res.send(user);
    } else {
      res.status(404).send("User not found");
    }
  });

  app.post("/users", (req, res) => {
    // #swagger.tags = ['Users']
    const { firstName, lastName, email, password, sex, isAdult } = req.body;

    if (
      firstName &&
      lastName &&
      email &&
      password &&
      (sex === "male" || sex === "female") &&
      (isAdult === "yes" || isAdult === "no")
    ) {
      if (!users.find((user) => user.email === email)) {
        id++;
        req.body.id = id;
        users.push(req.body);
        res.send(req.body);
        return;
      }
      res.status(400).send("Email already exists");
      return;
    }
    res.status(400).send("All fields must be filled and valid");
  });

  app.delete("/users/:id", (req, res) => {
    // #swagger.tags = ['Users']
    const { id } = req.params;
    if (id) {
      const user = findUserById(id);
      if (user) {
        users = users.filter((user) => user.id !== parseInt(id));
        res.status(200).send(user);
        return;
      }
      res.status(404).send("User does not exist");
      return;
    }
    res.status(400).send("Must provide an id");
  });

  app.put("/users", (req, res) => {
    // #swagger.tags = ['Users']
    const { id, firstName, lastName, email, password, sex, isAdult } = req.body;
    if (
      id &&
      (sex === "male" || sex === "female") &&
      (isAdult === "yes" || isAdult === "no")
    ) {
      const existingUser = findUserById(id);
      if (existingUser) {
        const updatedUser = {
          id: existingUser.id,
          email: email || existingUser.email,
          firstName: firstName || existingUser.firstName,
          lastName: lastName || existingUser.lastName,
          password: password || existingUser.password,
          sex: sex || existingUser.sex,
          isAdult: isAdult || existingUser.isAdult,
        };
        users = [
          ...users.filter((user) => user.id !== parseInt(id)),
          updatedUser,
        ];
        users.sort(sortUsers);
        res.status(200).send(updatedUser);
        return;
      }
      res.status(404).send("User does not exist");
      return;
    }
    res.status(400).send("Must provide valid data");
  });

  app.patch("/users/:id", (req, res) => {
    // #swagger.tags = ['Users']
    const { id } = req.params;
    const { firstName, lastName, email, password, sex, isAdult } = req.body;

    if (id) {
      const existingUser = findUserById(id);
      if (existingUser) {
        // Update only fields provided in the request
        const updatedUser = {
          ...existingUser, // keep existing fields
          firstName: firstName || existingUser.firstName, // update if provided
          lastName: lastName || existingUser.lastName, // update if provided
          email: email || existingUser.email, // update if provided
          password: password || existingUser.password, // update if provided
          sex: sex === "male" || sex === "female" ? sex : existingUser.sex,
          isAdult:
            isAdult === "yes" || isAdult === "no"
              ? isAdult
              : existingUser.isAdult,
        };

        users = [
          ...users.filter((user) => user.id !== parseInt(id)),
          updatedUser,
        ];
        users.sort(sortUsers);
        res.status(200).send(updatedUser);
        return;
      }
      res.status(404).send("User does not exist");
      return;
    }
    res.status(400).send("Must provide valid data");
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

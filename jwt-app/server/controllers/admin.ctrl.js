const { AdminModel } = require("../models");
const HttpStatus = require("../HttpStatus");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const config = require("../config");

const EXPIRES_IN_MINUTES = "1440m"; // expires in 24 hours

module.exports = {
  insertAdmin: (req, res) => {
    console.log("this is admin controller === > ", req.body);
    const body = req.body;

    if (!body) {
      return res.status(HttpStatus.unauthorized).json({
        success: false,
        error: "You must provide an admin",
      });
    }

    AdminModel.find({ login: body.login }, (err, docs) => {
      if (docs.length) {
        return res
          .status(HttpStatus.badRequest)
          .json({ success: false, error: "Admin Already exist" });
      } else {
        const admin = new AdminModel(body);

        if (!admin) {
          return res
            .status(HttpStatus.badRequest)
            .json({ success: false, error: err });
        }
        console.log("this is admin >> ", admin);
        admin
          .save()
          .then(() => {
            
            res.status(HttpStatus.created).json({
              success: true,
              id: admin._id,
              message: "Admin created!",
            });
          })
          .catch((error) => {
            console.log("this is response", error);
            res.status(HttpStatus.badRequest).json({
              success: false,
              error,
              message: "Admin not created!",
            });
          });
      }
    });
  },
  authenticate: (req, res) => {
    const login = req.body.login;
    const password = req.body.password;

    AdminModel.findOne({ login }).then((admin, err) => {
      if (err) {
        return res
          .status(HttpStatus.badRequest)
          .json({ success: false, error: err });
      }

      if (!admin) {
        return res.status(HttpStatus.notFound).json({
          success: false,
          error: `login not found`,
        });
      }
      console.log("this is password ==> ", password);
      console.log("this is password ==> ", admin.password);
      bcrypt.compare(password, admin.password, function (err, result) {
        console.log("this is password ==> ", admin.password);
        console.log("this is password ==> ", result);
        if (result === true) {
          console.log("this is password ==> ", admin.password);
          const payload = { admin: admin._id };
          const token = jwt.sign(payload, config.JWTSecret, {
            expiresIn: EXPIRES_IN_MINUTES,
          });

          admin.password = undefined;

          return res.status(HttpStatus.OK).json({
            success: true,
            admin,
            token,
            message: "Admin authenticated!",
          });
        } else {
          return res.status(HttpStatus.notAcceptable).json({
            success: false,
            error: `Password doesn't match`,
          });
        }
      });
    });
  },
};

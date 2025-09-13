const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/user.js");

// ====================== SIGNUP ======================
// Signup form
router.get("/signup", userController.renderSignUpForm);

// Signup submit
router.post("/signup", wrapAsync(userController.signUp));

// ====================== LOGIN ======================
router
  .route("/login")
  // login form
  .get(userController.renderLoginForm)
  // login submit (with redirectUrl saving)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    userController.login
  );

// ====================== LOGOUT ======================
router.get("/logout", userController.logOut);

module.exports = router;


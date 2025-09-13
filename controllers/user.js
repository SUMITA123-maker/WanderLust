const User = require("../models/user");

// ====================== SIGNUP ======================

// GET /signup
module.exports.renderSignUpForm = (req, res) => {
  res.render("users/signup.ejs");
};

// POST /signup
module.exports.signUp = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const newUser = new User({ username, email });
    const registeredUser = await User.register(newUser, password);

    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to WanderLust!");

      // restore temp booking if present
      if (req.session.tempBookingData) {
        req.session.bookingData = req.session.tempBookingData;
        delete req.session.tempBookingData;
      }

      const fallback = "/listings";
      let redirectUrl =
        res.locals.redirectUrl || req.session.redirectUrl || fallback;

      // if we have listingId, always go to its cart
      const listingId = req.session.bookingData?.listingId;
      if (listingId) redirectUrl = `/listings/${listingId}/addtocart`;

      delete req.session.redirectUrl;
      return res.redirect(redirectUrl);
    });
  } catch (e) {
    req.flash("error", e.message);
    return res.redirect("/signup");
  }
};

// ====================== LOGIN ======================

// GET /login
module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

// POST /login
module.exports.login = (req, res) => {
  req.flash("success", "Welcome back to WanderLust!");

  // Restore temp booking if present
  if (req.session.tempBookingData) {
    req.session.bookingData = req.session.tempBookingData;
    delete req.session.tempBookingData;
  }

  const fallback = "/listings";
  let redirectUrl =
    res.locals.redirectUrl || req.session.redirectUrl || fallback;

  // If we have booking data, redirect with query params
  const booking = req.session.bookingData;
  const listingId = booking?.listingId;
  if (listingId) {
    const params = new URLSearchParams({
      checkin: booking.checkin || "",
      checkout: booking.checkout || "",
      guests: booking.guests || "",
      nights: booking.nights || "",
      totalPrice: booking.totalPrice || "",
      taxes: booking.taxes || "",
      finalTotal: booking.finalTotal || "",
    }).toString();
    redirectUrl = `/listings/${listingId}/addtocart?${params}`;
  }

  delete req.session.redirectUrl;
  return res.redirect(redirectUrl);
};

// ====================== LOGOUT ======================

// GET /logout
module.exports.logOut = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "You are logged out!");
    res.redirect("/listings");
  });
};


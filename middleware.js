const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError");
const {listingSchema, reviewSchema, reservationSchema} = require("./schema.js");
const multer = require("multer");
const { storage } = require("./cloudConfig");
const upload = multer({ storage });


module.exports.isLoggedIn = (req, res, next) => {
    console.log(req.user);
    if(! req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl ;
    req.flash("error", "You must be logged in first!");
    return res.redirect("/login");
  }
    next();
};

// ✅ Save booking info (checkin, checkout, guests, listingId) into session
module.exports.saveBooking = (req, res, next) => {
  const { checkin, checkout, guests, nights, totalPrice, taxes, finalTotal } = req.body;
  const { id } = req.params;

  req.session.bookingData = {
    checkin,
    checkout,
    guests,
    nights,
    totalPrice,
    taxes,
    finalTotal,
    listingId: id
  };

  next();
};


// ✅ Protect payment route – if not logged in, save booking data before redirect
module.exports.isLoggedInForPayment = (req, res, next) => {
    if (!req.isAuthenticated()) {
        const { checkin, checkout, guests } = req.body;
        const { id } = req.params;

        req.session.bookingData = {
            checkin,
            checkout,
            guests,
            listingId: id
        };

        // After login → redirect back to addtocart page
        req.session.returnTo = `/listings/${id}/addtocart`;
        req.session.redirectUrl = `/listings/${id}/addtocart`;

        
        return res.redirect("/login");
    }
    next();
};

// ✅ Ensure redirectUrl is available to login/signup controllers
module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.returnTo && !req.session.redirectUrl) {
        req.session.redirectUrl = req.session.returnTo;
    }
    res.locals.redirectUrl = req.session.redirectUrl;
    next();
};


module.exports.isOwner = async(req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currUser._id)) {
      req.flash("error", "You are not the owner of this listing");
      return res.redirect(`/listings/${id}`);
    }
    next();
};

module.exports.validateListing = (req, res, next) => {
   let {error} = listingSchema.validate(req.body);
      if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
       throw new ExpressError(400, errMsg);
      } else {
        next();
      }
};

module.exports.validateReview = (req, res, next) => {
   let {error} = reviewSchema.validate(req.body);
      if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
       throw new ExpressError(400, errMsg);
      } else {
        next();
      }
};

module.exports.isReviewAuthor = async(req, res, next) => {
  let { id, reviewId } = req.params;
  let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)) {
      req.flash("error", "You are not the author of this review");
      return res.redirect(`/listings/${id}`);
    }
    next();
};


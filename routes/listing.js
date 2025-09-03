const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing , isLoggedInForPayment, saveBooking} = require("../middleware.js");
const listingController = require("../controllers/listing.js"); 
const multer  = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });

router.route("/")
// Index route
.get( wrapAsync(listingController.index))
// Create route 
.post(isLoggedIn, upload.fields([{ name: "listing[image]", maxCount: 5 }]) , validateListing, wrapAsync(listingController.createListing));


//New route
router.get("/new", isLoggedIn, listingController.renderNewForm);


router.route("/:id")
//show route
.get(wrapAsync(listingController.showListing))
//update route
.put(isLoggedIn, isOwner, upload.fields([{ name: "listing[image]", maxCount: 5 }]), validateListing, wrapAsync(listingController.updateListing))
//Delete route
.delete( isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));


//Edit route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.editListing));


// ✅ Add to cart (GET) → for direct visits / refresh
router.get("/:id/addtocart", wrapAsync(listingController.addToCart));


router.post("/:id/addtocart", saveBooking, (req, res) => {
  const { id } = req.params;
  const booking = req.session.bookingData || {};
  const params = new URLSearchParams({
    checkin: booking.checkin || "",
    checkout: booking.checkout || "",
    guests: booking.guests || "",
    nights: booking.nights || "",
    totalPrice: booking.totalPrice || "",
    taxes: booking.taxes || "",
    finalTotal: booking.finalTotal || ""
  }).toString();
  res.redirect(`/listings/${id}/addtocart?${params}`);
});



// ✅ Payment page (GET)
router.get("/:id/payment", wrapAsync(listingController.paymentPage));

// ✅ Payment page (POST) -- add this!
router.post("/:id/payment", isLoggedInForPayment, wrapAsync(listingController.paymentPage));

//confirmation page
router.post("/:id/confirmation", (req, res) => {
    const { checkin, checkout, guests, total } = req.body;

    // Generate booking ID
    const bookingId = "BK" + Math.floor(100000 + Math.random() * 900000);

    const booking = {
        bookingId,
        checkin,
        checkout,
        guests,
        amount: total
    };

    res.render("listings/confirmation", { booking });

});




module.exports = router;

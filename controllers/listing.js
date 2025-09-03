const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
    const allListings = await Listing.find();
    res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: { path: "author" }
        })
        .populate("owner");

    if (!listing) {
        req.flash("error", "Listing you requested for doesn't exist!");
        return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  try {
    const response = await geocodingClient.forwardGeocode({
      query: req.body.listing.location,
      limit: 1
    }).send();

    const newListing = new Listing({
      ...req.body.listing,
      owner: req.user._id,
      geometry: response.body.features[0].geometry
    });

    // Save multiple images if uploaded
    if (req.files && req.files["listing[image]"]) {
      newListing.image = req.files["listing[image]"].map(f => ({
        url: f.path,
        filename: f.filename
      }));
    }

    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
  } catch (e) {
    next(e);
  }
};

// EDIT Listing form
module.exports.editListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listings");
    }

    // Prepare images for display in edit form
    const images = listing.image && listing.image.length > 0
      ? listing.image.map(img => img.url)
      : ["/images/default.jpg"];

    res.render("listings/edit.ejs", { listing, images });
  } catch (e) {
    next(e);
  }
};

// UPDATE Listing
module.exports.updateListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listings");
    }

    // Update listing fields
    Object.assign(listing, req.body.listing);

    // Append new images if uploaded
    if (req.files && req.files["listing[image]"]) {
      listing.image.push(...req.files["listing[image]"].map(f => ({
        url: f.path,
        filename: f.filename
      })));
    }

    await listing.save();
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
  } catch (e) {
    next(e);
  }
};
module.exports.deleteListing = async (req, res) => {
    const { id } = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};


// controllers/cart.js
module.exports.addToCart = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  // ✅ merge query → bookingData → tempBookingData
  const booking = {
    ...req.session.tempBookingData,
    ...req.session.bookingData,
    ...req.query,
  };

  let checkin = booking.checkin || "";
  let checkout = booking.checkout || "";
  let guests = booking.guests || "";
  let nights = Number(booking.nights) || 0;
  let totalPrice = Number(booking.totalPrice) || 0;
  let taxes = Number(booking.taxes) || 0;
  let finalTotal = Number(booking.finalTotal) || 0;
  const pricePerNight = listing.price;

  // Recalculate if dates exist
  if (checkin && checkout) {
    nights = Math.ceil(
      (new Date(checkout) - new Date(checkin)) / (1000 * 60 * 60 * 24)
    );
    totalPrice = nights * pricePerNight;
    taxes = Math.round(totalPrice * 0.1);
    finalTotal = totalPrice + taxes;
  }

  // ✅ Pass bookingData as one object
  return res.render("listings/addtocart", {
    listing,
    bookingData: {
      checkin,
      checkout,
      guests,
      nights,
      pricePerNight,
      totalPrice,
      taxes,
      finalTotal,
    },
  });
};


// ✅ Payment page (GET after successful login or direct if logged in)
module.exports.paymentPage = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  // ✅ prefer body → bookingData → tempBookingData
  const booking = Object.keys(req.body || {}).length > 0
    ? req.body
    : (req.session.bookingData || req.session.tempBookingData || {});

  let checkin = booking.checkin || "";
  let checkout = booking.checkout || "";
  let guests = booking.guests || "";
  let nights = Number(booking.nights) || 0;
  let totalPrice = Number(booking.totalPrice) || 0;
  let taxes = Number(booking.taxes) || 0;
  let finalTotal = Number(booking.finalTotal) || 0;
  const pricePerNight = listing.price;

  if (checkin && checkout) {
    nights = Math.ceil((new Date(checkout) - new Date(checkin)) / (1000 * 60 * 60 * 24));
    totalPrice = nights * pricePerNight;
    taxes = Math.round(totalPrice * 0.1);
    finalTotal = totalPrice + taxes;
  }

  res.render("listings/payment", {
    listing,
    checkin,
    checkout,
    guests,
    nights,
    pricePerNight,
    totalPrice,
    taxes,
    finalTotal,
  });
};

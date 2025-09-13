if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}

process.setMaxListeners(30);

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const MongoStore = require("connect-mongo")
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");





const listingRouter = require("./routes/listing.js")
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");


// const dbUrl = 'mongodb://127.0.0.1:27017/wanderlust';
const dbUrl = process.env.ATLASDB_URL;


main().then((res) => {
    console.log("connected successfully");
}).catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store =  MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600
});

store.on("error", (err) => {
    console.log("Error in Mongo Session Store", err);
});

const sessionOptions = {
     store,
     secret: process.env.SECRET,
     resave: false,
     saveUninitialized: false,
     cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
     }
};


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});


app.get("/privacy", (req, res) => {
  res.render("pages/PrivacyPage", { title: "Privacy Policy", currUser: req.user });
});

app.get("/terms", (req, res) => {
  res.render("pages/TermsOfServices", { title: "Terms of Service", currUser: req.user });
});


app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);

// Root route → redirect to /listings
app.get("/", (req, res) => {
  res.redirect("/listings");
});

app.use("/", userRouter);


app.use((req, res, next) => {
    next(new ExpressError(404, "Page not found!"));
});

app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }
    let {statusCode=500, message="Something went wrong!"} = err;
    res.status(statusCode).render("error.ejs", {message});
});

app.listen(8080, () => {
    console.log("Server is listening to port 8080");
})
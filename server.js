require('dotenv').config();
const express = require('express');
const app = express();
const connectDB = require('./server/database/connection');
const helmet = require('helmet')
const cors = require('cors')
const morgan = require('morgan')
const session = require("express-session");
const { initialize } = require('./utils/passport');
const passport = require("passport");
const cookieParser = require("cookie-parser");
const MongoStore = require("connect-mongo");
const fileUpload = require("express-fileupload");
const path = require('path')


const port = process.env.PORT || 3000


// Connect Database
connectDB();

initialize(passport);

// Middlewares
app.use(express.json());
app.use(helmet());
app.use(morgan('tiny'))
app.use(cookieParser());



const allowedOrigins = [
    "https://exapsuites.com",
    "https://www.exapsuites.com",
    process.env.FRONTEND_BASE_URL
  ];
  
  app.use(
    cors({
      origin: (origin, callback) => {
        if (allowedOrigins.includes(origin) || !origin) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      methods: ["GET", "PUT", "POST", "PATCH", "DELETE"],
      credentials: true,
    })
  );
  
  
    // Configure Content Security Policy of helmet
    app.use(
      helmet.contentSecurityPolicy({
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "https://res.cloudinary.com"], // Allow images from Cloudinary
        },
      }),
    );
  
    // Load body parser
    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());


      //  file upload Config
      app.use(
        fileUpload({
          useTempFiles: true,
          tempFileDir: path.join(__dirname, "tmp"),
          createParentPath: true,
          limits: {
            fileSize: 6 * 1024 * 1024 * 8, // 6mb max
          },
        }),
      );


    app.use(
        session({
          secret: process.env.SESSION_SECRETE,
          resave: false,
          saveUninitialized: false,
          rolling: true, // Refresh the session expiration on activity
          store: MongoStore.create({
            mongoUrl: process.env.MONGO_URI,
            ttl: 10800,
            autoRemove: 'native',
          }),
          cookie: {
            maxAge: 10800000, // 3 hours
          },
        }),
      );

        
  // Load passport middlewares
  app.use(passport.initialize());
  app.use(passport.session());
  
  if (process.env.NODE_ENV === "development") {
    console.log("App running in development mode");
  } else {
    console.log("App running in production mode!");
  }

app.get('/', (req, res)=>{

    res.send("Welcome to Exapsuites")
})
app.use('/api/secure', require('./server/routes/auth'))
app.use('/api/user', require('./server/routes/user'))
 app.use('/api/apartment', require('./server/routes/apartment'))
 app.use('/api/booking', require('./server/routes/booking'))
app.use('/api/notification', require('./server/routes/notification.routes'))
app.use('/api/contact', require('./server/routes/contact.routes'))
 app.use('/api/stats', require('./server/routes/stats'))
app.use('/api/expense', require('./server/routes/expenses'))
app.use("/api/cron", require("./server/services/BookingExpirator"));

app.use((req, res) => {
  res.send("Page Not Found");
});



app.listen(port, ()=> console.log(`Server running on: http://localhost:${port}`))
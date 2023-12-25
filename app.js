const express = require("express");
const awsParamEnv = require("aws-param-env");
const cors = require("cors");
const compression = require("compression");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const env = require("./env");

awsParamEnv.load(`/course-catalog/${process.env.NODE_ENV}`, {
   credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
   },
   region: "us-east-1",
});

const app = express();
const port = process.env.PORT || 8000;
// environments
// app.use(initEnv);
app.use(helmet());
app.use(compression());
app.disable("x-powered-by");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.raw());
app.use("/public", express.static(__dirname + "/public")); // Public directory

/* Start Logging */
const log_path = env.log_path || path.join(__dirname, "logs");

// if log path not exist, log_path folder will be created
if (!fs.existsSync(log_path)) {
   fs.mkdirSync(log_path, { recursive: true });
}

// Log all error requests status
app.use(
   morgan("combined", {
      skip: (req, res) => {
         return res.statusCode < 400;
      },
      stream: fs.createWriteStream(path.join(log_path, "error.log"), {
         flags: "a",
      }),
   })
);

// Log all success request status
app.use(
   morgan("combined", {
      skip: (req, res) => {
         return res.statusCode > 400;
      },
      stream: fs.createWriteStream(path.join(log_path, "access.log"), {
         flags: "a",
      }),
   })
);
/* End Logging */

/* Dynamic CORS */
app.use(
   cors({
      origin: "*",
   })
);
/* End Dynamic CORS */

/* Start Cookie Settings */
app.use(cookieParser());
/* End Cookie Settings */

/* Start of Routing Modules */
const courseRoute = require("./routes/course_route");

courseRoute(app);
/* End of Routing Modules */

/* Check database connection */

app.listen(port, () => {
   console.log(`Server API listen on port ${port}`);
});

module.exports = app;

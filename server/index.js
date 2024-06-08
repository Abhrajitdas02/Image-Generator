import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import PostRouter from "./routes/Posts.js";
import generateImageRoute from "./routes/GenerateImage.js";
import posts from "./routes/Posts.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true })); 

app.use("/api/generateImage/", generateImageRoute);
app.use("/api/post", PostRouter);

app.use((req, res, next) => {
  const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  console.log(`Incoming request from IP: ${clientIP}`);
  next();
});

// Route to get the Render IP address
app.get("/getRenderIP", async (req, res) => {
  const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  res.status(200).json({
    ipAddress: clientIP,
  });
});

// error handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Something went wrong";
  return res.status(status).json({
    success: false,
    status,
    message,
  });
});

app.get("/", async (req, res) => {
  res.status(200).json({
    message: "Hello developers!! Happy Coding",
  });
});

//function to connect to mongoose

const connectDB = () => {
  mongoose.set("strictQuery", true);
  mongoose
    .connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 60000, // 30 seconds
      socketTimeoutMS: 100000, // 45 seconds
    })
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => {
      console.error("failed to connect with mongo");
      console.error(err);
    });
};

const startServer = async () => {
  try {
    connectDB();
    app.listen(8081, () => console.log("Server started on port 8081"));
  } catch (error) {
    console.log(error);
  }
};

app.get("/exampleRoute", async (req, res, next) => {
  try {
    const posts = await posts.find({}).timeout(30000); // Adjust timeout as needed
    return res.status(200).json({ success: true, data: posts });
  } catch (error) {
    return next(
      createError(
        error.status,
        error?.response?.data?.error.message || "Database operation timed out"
      )
    );
  }
});

startServer();

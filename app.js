import { config } from "dotenv";
import express from "express"
import cors from "cors"
import helmet from "helmet";
import morgan from "morgan"
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser';

// Routers
import courseRouter from "./routers/courseRouter.js"
import userRouter from "./routers/userRouter.js"
import paymentRouter from "./routers/paymentRouter.js"

// Middlerware
import ErrorMiddleware from "./middlewares/ErrorMiddleware.js";

// Config
config({
    path:"./config/config.env"
})

const app = express() 
app.use(express.json())
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('common'))
app.use(helmet())
app.use(helmet.crossOriginResourcePolicy({policy: "cross-origin"}))
app.use(cookieParser())
app.use(cors({
    origin: process.env.FRONT_URL,
    credentials: true,
    methods: ["GET","POST","PUT","DLETE"],
}))

app.use("/app/v1", courseRouter)

app.use("/app/v1", userRouter)

app.use("/app/v1", paymentRouter)

app.get("/", (req,res)=> res.send(`<h1>Server is working, click 
    <a href=${process.env.FRONT_URL}>here</a> to visit frontend</h1>`))

export default app;

app.use(ErrorMiddleware);
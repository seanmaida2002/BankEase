import express from "express";
import configRoutes from "./routes/index.js";
import cors from 'cors';
import dashboardRoutes from './routes/dashboard.js';

const app = express();

app.use(cors({ origin: ['http://localhost:5173'], methods: ['GET', 'POST', 'PUT','PATCH', 'DELETE'] }));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/dashboard', dashboardRoutes);

configRoutes(app);

app.get('/', (req,res)=>{
    res.status(200).send("API running. Send frontend to http://localhost:5173")
});

app.listen(3000, () => {
    console.log("We've got a server!");
    console.log("Your routes will be running on http://localhost:3000");
});

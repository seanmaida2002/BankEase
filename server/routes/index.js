import userRoutes from './users.js';
import authRoutes from './auth_routes.js';
import alertRoutes from './alerts.js';
import expenseRoutes from './expenses.js';
import billRoutes from './bills.js';
import dashboardRoutes from './dashboard.js';
import depositRoutes from './deposits.js';


const constructorMethod = (app) => {
    app.use("/user", userRoutes);
    app.use("/auth", authRoutes);
    app.use("/alerts", alertRoutes);
    app.use("/expenses", expenseRoutes );
    app.use("/bills", billRoutes );
    app.use("/dashboard", dashboardRoutes);
    app.use("/deposits", depositRoutes);
}

export default constructorMethod;
import React from 'react';
import {Navigate, Outlet} from 'react-router-dom';


export const PrivateRoute = () => {
    const isAuthenticated = localStorage.getItem('user') !== null;
    return isAuthenticated ? <Outlet /> : <Navigate to='/' replace />;
}

export default PrivateRoute;
import { Navigate } from "react-router-dom"; // Import the Navigate component from react-router-dom to redirect users
import { jwtDecode } from "jwt-decode"; // Import jwtDecode to decode the JWT token
import api from "../api"; // Import the custom API instance for making HTTP requests
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants"; // Import constants for local storage keys
import { useState, useEffect } from "react"; // Import hooks from React to manage state and side effects


function ProtectedRoute({children}) {
        // State to track whether the user is authorized
    const [isAuthorized, setIsAuthorized] = useState(null);

    useEffect(() => {
        // useEffect hook runs when the component mounts, initiating the authorization check
        auth().catch(() => setIsAuthorized(false)); // Call auth function, set authorization status based on the result
    }, [])

    // Function to refresh the access token using the refresh token
    const refreshToken = async () => {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN);   // Get the refresh token from local storage
        try {
            // Make a POST request to the token refresh endpoint
            const res = await api.post("/api/token/refresh/", {
                refresh: refreshToken,
                });
            if (res.status === 200) {
                 // If the response is successful, update the access token in local storage
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
            } else {
                // If the response is not successful, mark the user as unauthorized
                setIsAuthorized(false);
            }
        } catch (error) {
            console.log(error); // Log any errors to the console
            setIsAuthorized(false); // Set the authorization status to false if an error occurs
        }
    };

    // Function to check if the user is authenticated and their token is valid
    const auth = async () => {
        const token = localStorage.getItem(ACCESS_TOKEN); // Get the access token from local storage
        if (!token) {
            setIsAuthorized(false); // If no token is found, mark the user as unauthorized
            return;
        }
        const decoded = jwtDecode(token);       // Decode the JWT token to get its payload
        const tokenExpiration = decoded.exp;    // Extract the expiration time from the token
        const now = Date.now() / 1000;          // Get the current time in seconds

        if (tokenExpiration < now) {
            // If the token is expired, try to refresh it
            await refreshToken();
        } else {
            // If the token is still valid, mark the user as authorized
            setIsAuthorized(true);
        }
    };

    // While the authorization status is being determined, show a loading message
    if (isAuthorized === null) {
        return <div>Loading....</div>;
    }
    // If authorized, render the children components; otherwise, redirect to the login page
    return isAuthorized ? children : <Navigate to="/login" />;
}
export default ProtectedRoute;

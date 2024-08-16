import { useState } from "react"; // Import useState hook from React for managing local state
import api from "../api"; // Import the custom API instance for making HTTP requests
import { useNavigate } from "react-router-dom"; // Import useNavigate hook for programmatic navigation
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants"; // Import constants for local storage keys
import "../styles/Form.css"; // Import the CSS file for styling the form
import LoadingIndicator from "./LoadingIndicator";

function Form({ route, method }) {
    const [username, setUsername] = useState(""); // State to store the username input
    const [password, setPassword] = useState(""); // State to store the password input
    const [loading, setLoading] = useState(false); // State to track if the form is submitting
    const navigate = useNavigate(); // Hook to navigate programmatically after form submission

    // Determine if the form is for login or registration based on the method prop
    const name = method === "login" ? "Login" : "Register";

    const handleSubmit = async (e) => {
        setLoading(true); // Set loading state to true when the form is being submitted
        e.preventDefault(); // Prevent the default form submission behavior

        try {
            const res = await api.post(route, { username, password });
            // If the method is login, save the access and refresh tokens to local storage
            if (method === "login") {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                navigate("/");
            } else {
                navigate("/login"); // Navigate to the login page after successful registration
            }
        } catch (error) {
            alert(error + `\nWrong Username or password.\nTry again.`); // Display an alert if an error occurs during form submission
        } finally {
            setLoading(false); // Set loading state back to false after submission is complete
        }
    };

    // Render the form with controlled inputs for username and password
    return (
        <form onSubmit={handleSubmit} className="form-container">
            <h1>{name}</h1>
            <input
                className="form-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
            />
            <input
                className="form-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
            />
            {loading && <LoadingIndicator />}
            <button className="form-button" type="submit">
                {name}
            </button>
        </form>
    );
}

export default Form;

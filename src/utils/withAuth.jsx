import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const withAuth = (WrappedComponent) => {
    const AuthComponent = (props) => {
        const navigate = useNavigate();
        const token = localStorage.getItem("token");

        useEffect(() => {
           
            if (!token) {
                navigate("/auth");
            }
        }, [token, navigate]);

       
        if (!token) {
            return null; 
        }

       
        return <WrappedComponent {...props} />;
    };

    return AuthComponent;
};

export default withAuth;
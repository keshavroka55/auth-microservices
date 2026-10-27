import { Link } from "react-router-dom";

const Splash = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900">
                    Welcome
                </h1>

                <p className="mt-3 text-gray-600">
                    Continue with Google Authentication
                </p>

                <Link
                    to="/login"
                    className="inline-block mt-6 px-6 py-3 rounded-lg bg-black text-white hover:bg-gray-800 transition"
                >
                    Login Page
                </Link>
            </div>
        </div>
    );
};

export default Splash;

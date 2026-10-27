import { Link } from "react-router-dom";

const NotFound = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
            <div className="text-center">
                <p className="text-8xl font-bold text-gray-900">
                    404
                </p>

                <h1 className="mt-4 text-3xl font-bold text-gray-900">
                    Page Not Found
                </h1>

                <p className="mt-3 text-gray-600">
                    Sorry, the page you are looking for does not exist.
                </p>

                <Link
                    to="/"
                    className="inline-block mt-6 px-6 py-3 rounded-lg bg-black text-white hover:bg-gray-800 transition"
                >
                    Go Back Home
                </Link>
            </div>
        </div>
    );
};

export default NotFound;

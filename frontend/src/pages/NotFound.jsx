import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#E8E8E8] px-4 text-slate-900">
            <div className="w-full max-w-md rounded-3xl border border-white/70 bg-white/75 p-8 text-center shadow-sm backdrop-blur-xl">
                <p className="text-5xl font-bold tracking-tight">404</p>
                <h1 className="mt-3 text-xl font-semibold">Page not found</h1>
                <p className="mt-2 text-sm text-slate-500">
                    The page you are looking for does not exist or has been moved.
                </p>
                <Link
                    to="/"
                    className="mt-6 inline-block rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
                >
                    Go to Home
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
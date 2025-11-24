import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading) {
            if (user) {
                // User is authenticated, redirect to feed
                navigate('/feed');
            } else {
                // User is not authenticated, redirect to login
                navigate('/login');
            }
        }
    }, [user, loading, navigate]);

    // Show loading state while checking authentication
    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
            <div className="text-center">
                <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]">
                    <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                        Loading...
                    </span>
                </div>
                <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
                    Redirecting...
                </p>
            </div>
        </div>
    );
}


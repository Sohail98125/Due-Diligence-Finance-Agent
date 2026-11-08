import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import BackgroundDecor1 from "../utils/BackgroundDecor1";
import { motion } from "motion/react";

/*
  RESPONSIVE RULE:
  - no prefix -> phone (compact card)
  - sm: (640px+) and lg: -> your original design, unchanged
*/

const Login = () => {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (user) return <Navigate to='/dashboard' replace />
    const GOOGLE_LINK = import.meta.env.VITE_GOOGLE_LINK;

    const loginContainerVariants = {
        hidden: {
            opacity: 0,
            x: 50,
            scale: 0.97
        },
        visible: {
            opacity: 1,
            x: 0,
            scale: 1,
            transition: {
                duration: 0.8,
                ease: "easeOut",
                staggerChildren: 0.18,
                delayChildren: 0.8
            }
        }
    };

    const headerVariants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.12
            }
        }
    };

    const loginItemVariants = {
        hidden: {
            opacity: 0,
            y: 18
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4,
                ease: "easeOut"
            }
        }
    };
    return (
        <div className="relative isolate flex min-h-screen items-center justify-center overflow-x-clip bg-[#E8E8E8] lg:justify-end">
            <BackgroundDecor1 />
            <motion.div
                variants={loginContainerVariants}
                initial="hidden"
                animate="visible"
                className="relative z-10 mx-4 my-8 flex w-full max-w-md flex-col items-center gap-4 rounded-2xl border border-white/50 bg-white/55 p-5 text-center shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl backdrop-saturate-150 sm:mx-6 sm:my-12 sm:gap-6 sm:rounded-3xl sm:p-10 lg:mr-16 xl:mr-28">
                <motion.div variants={headerVariants}>
                    <motion.h2 variants={loginItemVariants} className="text-2xl font-bold tracking-tight font-sans sm:text-3xl">SIGN IN TO CONTINUE</motion.h2>
                    <motion.h4 variants={loginItemVariants} className="mt-1.5 text-sm leading-snug text-gray-600 font-sans sm:mt-2 sm:text-base sm:leading-normal"> Use your Google account to analyze companies and view your report history.</motion.h4>
                </motion.div>
                <motion.a
                    variants={loginItemVariants}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    href={GOOGLE_LINK} className="flex w-full items-center justify-center gap-2 rounded-full bg-black py-2.5 text-sm font-semibold text-white shadow-lg transition hover:translate-colors hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black sm:gap-3 sm:py-3.5 sm:text-base">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white sm:h-8 sm:w-8">
                        <svg viewBox="0 0 48 48" className="h-4 w-4 sm:h-4.5 sm:w-4.5" aria-hidden="true">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                        </svg>
                    </span>
                    LOGIN WITH GOOGLE</motion.a>
                <motion.p variants={loginItemVariants} className="text-[11px] text-gray-500 sm:text-xs"> Reports support financial review and are not investment advice.</motion.p>
                <motion.div variants={loginItemVariants}>
                    <Link to="/" className="text-xs font-semibold text-gray-600 transition hover:text-black sm:text-sm">BACK TO HOME</Link>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Login;
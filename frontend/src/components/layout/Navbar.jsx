
import { useNavigate, Link } from "react-router-dom";
import { motion } from "motion/react";

const Navbar = () => {
    const navigate = useNavigate();

    const handleLogin = () => {
        navigate("/login");
    };

    return (
        <motion.nav
            initial={{
                opacity: 0,
                y: 20
            }}
            animate={{
                opacity: 1,
                y: 0
            }}
            transition={{
                duration: 0.6,
                ease: "easeOut"
            }}
            className="relative z-20 mx-auto mt-3 flex w-[calc(100%-1rem)] max-w-7xl items-center justify-between rounded-full border border-white/20 bg-white/30 px-3 py-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl backdrop-saturate-150 sm:mt-6 sm:px-6 sm:py-2" >
            <Link to="/" className="flex items-center gap-2 sm:gap-3">
                <img src="/logo2.png" alt="DD Finance Agent logo" className="h-9 w-9 rounded-lg object-contain sm:h-12 sm:w-12" />

                <div className="leading-tight">
                    <h3 className="text-sm font-sans font-semibold tracking-tight text-black sm:text-base">
                        Due Diligence
                    </h3>
                    <p className="text-xs font-normal text-gray-800 sm:text-base">
                        Finance Agent
                    </p>
                </div>
            </Link>

            <motion.button
                whileTap={{
                    scale: 0.98
                }}
                transition={{
                    duration: 0.2,
                    ease: "easeOut"
                }}
                className="rounded-full bg-black px-4 py-1.5 text-xs font-medium text-white transition hover:bg-white hover:text-black sm:rounded-4xl sm:px-7 sm:py-2 sm:text-lg" onClick={handleLogin} >
                LOGIN
            </motion.button>
        </motion.nav>
    );
};

export default Navbar;

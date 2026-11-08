const BackgroundDecor1 = () => {
    return (
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">

            {/* Top-left curved lines */}
            <div className="absolute -top-48 -left-40 h-130 w-130 rounded-full border border-gray-400/30" />

            <div className="absolute -top-32 -left-28 h-100 w-100 rounded-full border border-white/80" />

            {/* Bottom-right curved lines */}
            <div className="absolute -bottom-64 -right-40 h-150 w-150 rounded-full border border-gray-400/30" />

            <div className="absolute -bottom-48 -right-28 h-112.5 w-112.5 rounded-full border border-white/80" />

            {/* DD Watermark
                phone / tablet : small logo centered ABOVE the login card (card is centered on screen)
                desktop (lg+)  : original big watermark on the left */}
            <img
                src="/logo2.png"
                alt=""
                className="absolute bottom-[calc(50%+8.5rem)] left-1/2 w-28 -translate-x-1/2 md:bottom-[calc(50%+12rem)] md:w-48 lg:bottom-auto lg:left-[10%] lg:top-[20%] lg:w-105 lg:translate-x-0"
            />

            {/* Top-right dots */}
            <div
                className="absolute right-10 top-10 h-36 w-48 opacity-40"
                style={{
                    backgroundImage: "radial-gradient(#999 1.2px, transparent 1.2px)",
                    backgroundSize: "24px 24px",
                }}
            />

            {/* Bottom-left dots */}
            <div
                className="absolute bottom-10 left-10 h-36 w-48 opacity-40"
                style={{
                    backgroundImage: "radial-gradient(#999 1.2px, transparent 1.2px)",
                    backgroundSize: "24px 24px",
                }}
            />
            <div className="absolute -left-24 top-1/4 h-80 w-80 rounded-full bg-stone-400/30 blur-3xl" />
            <div className="absolute -right-24 top-2/3 h-96 w-96 rounded-full bg-stone-400/30 blur-3xl" />

            <svg className="absolute bottom-0 left-0 w-full opacity-[0.07]" viewBox="0 0 1200 200" fill="none" preserveAspectRatio="none">
                <path d="M0 160 L120 140 L220 150 L340 90 L460 110 L580 60 L700 80 L820 30 L940 50 L1060 20 L1200 40" stroke="black" strokeWidth="3" />
            </svg>

            <div
                className="absolute inset-0"
                style={{
                    backgroundImage:
                        "linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px)",
                    backgroundSize: "56px 56px",
                    maskImage: "radial-gradient(ellipse at 50% 30%, black 20%, transparent 70%)",
                    WebkitMaskImage: "radial-gradient(ellipse at 50% 30%, black 20%, transparent 70%)",
                }}
            />

        </div>
    );
};

export default BackgroundDecor1;
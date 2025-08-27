import calendarLogo from "../images/calendar.png";

export const Navbar = () => {
    return (
        <div className="navbar bg-base-100 shadow-sm fixed top-0 left-0 w-full z-10">
            <div className="flex-1 d-flex flex items-center gap-2 mx-8">
                <img
                    className="h-[25px]"
                    src={calendarLogo}
                    alt="Schedulify Logo"
                />
                <a href="/" className="font-semibold text-xl">
                    Schedulify
                </a>
            </div>
        </div>
    );
};

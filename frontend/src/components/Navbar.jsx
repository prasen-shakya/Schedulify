import calendarLogo from "../images/calendar.png";

export const Navbar = () => {
  return (
    <div className="navbar bg-base-100 sticky top-0 left-0 w-full shadow-sm">
      <div className="d-flex mx-8 flex flex-1 items-center gap-2">
        <img className="h-[25px]" src={calendarLogo} alt="Schedulify Logo" />
        <a href="/" className="text-xl font-semibold">
          Schedulify
        </a>
      </div>
    </div>
  );
};

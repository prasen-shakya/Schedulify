import useAuth from "@/hooks/useAuth";
import calendarLogo from "@/images/calendar.png";

export const Navbar = () => {
  const { isAuthenticated, showAuthenticationModal, signOut } = useAuth();
  return (
    <div className="navbar bg-base-100 sticky top-0 left-0 w-full shadow-sm">
      <div className="mx-8 flex w-full justify-between">
        <div className="flex items-center gap-2">
          <img className="h-[25px]" src={calendarLogo} alt="Schedulify Logo" />
          <a href="/" className="text-xl font-semibold">
            Schedulify
          </a>
        </div>
        <button
          className="btn btn-primary mt-2 h-10"
          onClick={isAuthenticated ? signOut : showAuthenticationModal}
        >
          {isAuthenticated ? "Sign Out" : "Sign In"}
        </button>
      </div>
    </div>
  );
};

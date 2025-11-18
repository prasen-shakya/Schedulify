import EventModal from "@/components/home/EventModal";
import { useAuth } from "@/contexts/AuthContext";
import exampleImg from '../images/example.jpg';
import githubImg from '../images/github.png';
//import calendarLogo from "@/images/calendar.png";

export const Home = () => {
  const { requireAuth } = useAuth();

  const handleScheduleEvent = () => {
    document.getElementById("event-modal").showModal();
  };

  return (
    <>
      <EventModal />
        {/* TITLE + SCHEDULE EVENT SECTION */}
        <div className="relative flex flex-col items-center justify-center flex-1 p-5 min-h-[80vh]">
          {/* CENTER CONTENT */}
          <div className="flex flex-col items-center justify-center gap-2">
            <a href="https://github.com/prasen-shakya/Schedulify" className="cursor-pointer"><span className="badge">Check out our Github 
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-github" viewBox="0 0 16 16">
  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/>
</svg>
            </span></a>
            <h1 className="text-center text-4xl font-bold">
              Schedule Events Without A Hassle.
            </h1>
            <p className="text-secondary text-center">
              Schedule group events with ease without having to worry about
              scheduling conflicts.
            </p>

            <button
              className="btn btn-primary mt-2 h-12"
              onClick={() => requireAuth(handleScheduleEvent)}
            >
              Schedule An Event
            </button>
          </div>
          {/* BOTTOM ARROW */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-6 animate-bounce text-gray-600 cursor-pointer"
              viewBox="0 0 16 16"
              fill="currentColor"
              onClick={() => {
            document.getElementById("how")
            ?.scrollIntoView({ behavior: "smooth" });
          }}
            >
              <path
                fillRule="evenodd"
                d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1"
              />
            </svg>
          </div>
        </div>
        {/* HOW TO USE SECTION */}
        <div className="hero bg-base-200 min-h-screen" id="how">
          <div className="hero-content flex-col lg:flex-row-reverse"> 
            <img
              src={exampleImg}
              className="max-w-[50vw] h-auto"
            />
            <div className="min-w-[25vw]">
              <h1 className="text-5xl font-bold">How it works</h1>
              <p className="py-6">
                <ul className="steps steps-vertical text-xl">
                  <li className="step step-primary">Log in</li> 
                  <li className="step step-primary">Create your event</li> 
                  {/*<li className="step step-primary">Fill out your availability</li> */}
                  <li className="step ">Share with participants</li> 
                  <li className="step ">See what times work best!</li> 
                </ul> 
              </p>
              {/* <button
                  className="btn btn-primary mt-2 h-12"
                  onClick={() => requireAuth(handleScheduleEvent)}
                >
                  Get Started
              </button> */}
            </div>
          </div>
        </div>
        {/* About Section 
        <div className="hero min-h-screen" id="about">
          <div className="hero-content flex-col lg:flex-row">
            <img
              src={githubImg}
              className="max-w-sm rounded-lg shadow-2xl"
            />
            <div className="text-center">
              <h1 className="text-5xl font-bold">About the Project</h1>
                <p className="py-6">
                  Our project is a collaborative effort to design and build a full-stack scheduling application as part of our CS370 Software Design and Development course. The goal of the project is to simulate a real-world software development environment, allowing our team to experience planning, designing, and implementing a complete system from scratch. We worked together to create a tool that helps groups coordinate meeting times by analyzing and comparing user-submitted availability. Throughout the process, we practiced industry-standard development practices such as version control, iterative design, documentation, and collaborative problem-solving. This project reflects both our teamwork and our ability to apply software engineering principles to build a functional, user-focused application.
                </p>
              <a href="https://github.com/prasen-shakya/Schedulify"><button className="btn btn-primary">Check out the Source</button></a>
            </div>
          </div>
        </div>
        {/* Footer 
        <footer className="footer sm:footer-horizontal bg-base-200  p-10">
          <aside>
            <img className="h-[25px]" src={calendarLogo} alt="Schedulify Logo" />
            <p>
              Schedulify
              <br />
              {/* Schedule events without a hassle. 
            </p>
          </aside>
          <nav>
            <h6 className="footer-title">How to use</h6>
            <h6 className="footer-title">About</h6>
          </nav>
        </footer>*/}
    </>
  );
};

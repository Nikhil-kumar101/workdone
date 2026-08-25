import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  let user = null;

  try {
    const storedUser =
      sessionStorage.getItem("user");

    if (storedUser) {
      user = JSON.parse(storedUser);
    }
  } catch (error) {
    console.error(
      "USER DATA ERROR:",
      error
    );
  }

  const name =
    user?.name || "User";

  const email =
    user?.email || "";


  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    navigate("/login", {
      replace: true,
    });
  };


  return (
    <div className="dashboard-page">

      {/* =====================================
          HEADER
      ====================================== */}

      <header className="dashboard-header">

        <div className="dashboard-brand">
          <div className="dashboard-brand-icon">
            🎥
          </div>

          <div>
            <h2>
              Video Meeting Platform
            </h2>

            <span>
              Collaboration workspace
            </span>
          </div>
        </div>


        <div className="dashboard-header-right">

          <div className="dashboard-user">

            <div className="dashboard-avatar">
              {name
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="dashboard-user-details">

              <strong>
                {name}
              </strong>

              {email && (
                <span>
                  {email}
                </span>
              )}

            </div>

          </div>

          <button
            type="button"
            className="dashboard-logout"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </header>


      {/* =====================================
          MAIN
      ====================================== */}

      <main className="dashboard-main">

        <section className="dashboard-welcome">

          <div className="dashboard-eyebrow">
            DASHBOARD
          </div>

          <h1>
            Welcome back, {name} 👋
          </h1>

          <p>
            Create a new meeting or join an
            existing meeting.
          </p>

        </section>


        {/* =================================
            ACTION CARDS
        ================================== */}

        <section className="dashboard-actions">

          <button
            type="button"
            className="dashboard-action-card create"
            onClick={() =>
              navigate(
                "/create-meeting"
              )
            }
          >

            <div className="dashboard-action-icon">
              🎥
            </div>

            <div className="dashboard-action-content">

              <h2>
                Create Meeting
              </h2>

              <p>
                Start a new video meeting
                and invite participants.
              </p>

              <span className="dashboard-action-button purple">
                Create Meeting
              </span>

            </div>

          </button>


          <button
            type="button"
            className="dashboard-action-card join"
            onClick={() =>
              navigate(
                "/join-meeting"
              )
            }
          >

            <div className="dashboard-action-icon">
              🔗
            </div>

            <div className="dashboard-action-content">

              <h2>
                Join Meeting
              </h2>

              <p>
                Enter a meeting ID and join
                an existing meeting.
              </p>

              <span className="dashboard-action-button green">
                Join Meeting
              </span>

            </div>

          </button>

        </section>


        {/* =================================
            QUICK FEATURES
        ================================== */}

        <section className="dashboard-features">

          <div className="dashboard-feature-card">

            <div className="feature-icon">
              🎤
            </div>

            <div>
              <h3>
                Audio & Video
              </h3>

              <p>
                Camera and microphone
                controls inside every meeting.
              </p>
            </div>

          </div>


          <div className="dashboard-feature-card">

            <div className="feature-icon">
              💬
            </div>

            <div>
              <h3>
                Real-time Chat
              </h3>

              <p>
                Chat and share files while
                you meet.
              </p>
            </div>

          </div>


          <div className="dashboard-feature-card">

            <div className="feature-icon">
              👥
            </div>

            <div>
              <h3>
                Participants
              </h3>

              <p>
                View participants and
                meeting activity.
              </p>
            </div>

          </div>

        </section>


        <div className="dashboard-security">
          🔒 Secure authenticated meetings
        </div>

      </main>

    </div>
  );
}

export default Dashboard;
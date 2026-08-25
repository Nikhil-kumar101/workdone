import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";

import "./CreateMeeting.css";

function CreateMeeting() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [maxParticipants, setMaxParticipants] =
    useState(10);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreateMeeting = async (event) => {
    event.preventDefault();

    setError("");

    const cleanTitle = title.trim();
    const participantCount =
      Number(maxParticipants);

    if (!cleanTitle) {
      setError(
        "Please enter a meeting title."
      );
      return;
    }

    if (
      !Number.isInteger(participantCount) ||
      participantCount < 1 ||
      participantCount > 100
    ) {
      setError(
        "Maximum participants must be between 1 and 100."
      );
      return;
    }

    const token =
      sessionStorage.getItem("token");

    if (!token) {
      setError(
        "Authentication required. Please login again."
      );

      navigate("/login", {
        replace: true,
      });

      return;
    }

    try {
      setLoading(true);

      console.log("Creating meeting...");

      const response = await api.post(
        "/meetings",
        {
          title: cleanTitle,
          maxParticipants:
            participantCount,
        }
      );

      console.log(
        "Meeting response:",
        response.data
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Meeting creation failed."
        );
      }

      const meeting =
        response.data?.meeting;

      if (!meeting?.roomId) {
        throw new Error(
          "Meeting was created but roomId was not returned."
        );
      }

      navigate(
        `/meeting/${meeting.roomId}`
      );

    } catch (error) {
      console.error(
        "CREATE MEETING ERROR:",
        error
      );

      if (
        error.response?.status === 401
      ) {
        sessionStorage.clear();

        navigate("/login", {
          replace: true,
        });

        return;
      }

      setError(
        error.response?.data?.message ||
          error.message ||
          "Could not create meeting."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-page">

      <div className="create-card">

        <div className="create-icon">
          🎥
        </div>

        <div className="create-heading">

          <h1>
            Create Meeting
          </h1>

          <p>
            Start a new meeting and invite
            others to join.
          </p>

        </div>


        <form
          className="create-form"
          onSubmit={handleCreateMeeting}
        >

          <div className="form-group">

            <label htmlFor="meeting-title">
              Meeting Title
            </label>

            <input
              id="meeting-title"
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value
                )
              }
              placeholder="Enter meeting title"
              maxLength={100}
              disabled={loading}
              autoFocus
            />

          </div>


          <div className="form-group">

            <label htmlFor="max-participants">
              Maximum Participants
            </label>

            <input
              id="max-participants"
              type="number"
              min="1"
              max="100"
              value={maxParticipants}
              onChange={(event) =>
                setMaxParticipants(
                  event.target.value
                )
              }
              disabled={loading}
            />

            <span className="form-help">
              Maximum number of people
              allowed.
            </span>

          </div>


          {error && (
            <div className="create-error">
              {error}
            </div>
          )}


          <button
            type="submit"
            className="create-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="create-spinner" />
                Creating...
              </>
            ) : (
              "👥 Create Meeting"
            )}
          </button>

        </form>

      </div>

    </div>
  );
}

export default CreateMeeting;
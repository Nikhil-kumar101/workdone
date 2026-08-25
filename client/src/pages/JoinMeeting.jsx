import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";

import "./JoinMeeting.css";

function JoinMeeting() {
  const navigate = useNavigate();

  const [roomId, setRoomId] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  const handleJoinMeeting = async (
    event
  ) => {
    event.preventDefault();

    setError("");

    const cleanRoomId =
      roomId.trim();

    if (!cleanRoomId) {
      setError(
        "Please enter a meeting ID."
      );
      return;
    }

    const token =
      sessionStorage.getItem("token");

    if (!token) {
      setError(
        "Your session has expired. Please sign in again."
      );

      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      // Verify meeting using authenticated API
      await api.get(
        `/meetings/${cleanRoomId}`
      );

      // Meeting exists and user is authenticated
      navigate(
        `/meeting/${cleanRoomId}`
      );

    } catch (error) {
      console.error(
        "JOIN MEETING ERROR:",
        error
      );

      if (
        error.response?.status === 401
      ) {
        sessionStorage.clear();

        navigate("/login");

        return;
      }

      setError(
        error.response?.data?.message ||
          "Could not find this meeting."
      );

    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="join-meeting-page">

      <div className="join-meeting-card">

        <div className="join-meeting-icon">
          🔗
        </div>

        <h1>
          Join Meeting
        </h1>

        <p>
          Enter the meeting ID shared
          with you.
        </p>


        <form
          onSubmit={handleJoinMeeting}
          className="join-meeting-form"
        >

          <div className="join-field">

            <label htmlFor="room-id">
              Meeting ID
            </label>

            <input
              id="room-id"
              type="text"
              value={roomId}
              onChange={(event) =>
                setRoomId(
                  event.target.value
                )
              }
              placeholder="Enter meeting ID"
              disabled={loading}
              autoFocus
            />

          </div>


          {error && (
            <div className="join-error">
              {error}
            </div>
          )}


          <button
            type="submit"
            className="join-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="join-spinner" />
                Checking...
              </>
            ) : (
              "Join Meeting"
            )}
          </button>

        </form>

      </div>

    </div>
  );
}

export default JoinMeeting;
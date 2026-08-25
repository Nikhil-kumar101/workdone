import { useEffect, useState } from "react";
import {
  LiveKitRoom,
  VideoConference,
} from "@livekit/components-react";

import "@livekit/components-styles";

function TestMeeting() {
  const [token, setToken] = useState(null);
  const [serverUrl, setServerUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getMeetingCredentials = async () => {
      try {
        const authToken = sessionStorage.getItem("token");

        if (!authToken) {
          throw new Error("Authentication token not found. Please login first.");
        }

        const response = await fetch(
          "http://localhost:5000/api/livekit/internship-test-room/token",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        const data = await response.json();

        console.log("LiveKit response:", data);

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to get meeting credentials"
          );
        }

        setToken(data.token);
        setServerUrl(data.url);

        sessionStorage.setItem("livekitToken", data.token);
        sessionStorage.setItem("livekitUrl", data.url);
      } catch (err) {
        console.error("LiveKit error:", err);
        setError(err.message);
      }
    };

    getMeetingCredentials();
  }, []);

  if (error) {
    return (
      <div style={{ padding: "30px" }}>
        <h1>Meeting Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!token || !serverUrl) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <h1>Connecting to meeting...</h1>
      </div>
    );
  }

  return (
    <div style={{ height: "100vh" }}>
      <LiveKitRoom
  token={token}
  serverUrl={serverUrl}
  connect={true}
  audio={true}
  video={true}
>
  <ConnectionStatus />

  <div className="livekit-meeting">
  </div>
        <VideoConference />
      </LiveKitRoom>
    </div>
  );
}

export default TestMeeting;
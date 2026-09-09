import {
  useEffect,
  useState,
  useRef,
} from "react";

import {
  useParams,
  useNavigate,
} from "react-router-dom";

import {
  LiveKitRoom,
  useLocalParticipant,
  useTracks,
  useParticipants,
  useRoomContext,
  VideoTrack,
} from "@livekit/components-react";

import {
  Track,
  RoomEvent,
} from "livekit-client";

import "@livekit/components-styles";

import api from "../services/api";
import "./MeetingRoom.css";
const normalizeRoomId = (value) => {
  if (!value) {
    return "";
  }

  const raw = String(value).trim();

  // Full URL:
  // http://localhost:5173/meeting/95e8de488ff1
  try {
    const url = new URL(raw);

    const match =
      url.pathname.match(
        /\/meeting\/([^/?#]+)$/i
      );

    if (match?.[1]) {
      return decodeURIComponent(
        match[1]
      );
    }
  } catch {
    // Not a full URL.
  }

  // /meeting/95e8de488ff1
  const match =
    raw.match(
      /\/meeting\/([^/?#\s]+)/i
    );

  if (match?.[1]) {
    return decodeURIComponent(
      match[1]
    );
  }

  // Normal value:
  // 95e8de488ff1
  return raw
    .replace(/^\/+|\/+$/g, "")
    .split(/[?#/]/)[0];
};


// ==========================================
// CONSTANTS
// ==========================================

const CHAT_MESSAGE_TYPE = "chat-message";
const CHAT_FILE_TYPE = "chat-file";
const HAND_ATTRIBUTE = "handRaised";

const MAX_FILE_SIZE =
  10 * 1024 * 1024;


// ==========================================
// TIMER
// ==========================================

const formatTime = (totalSeconds) => {
  const hours = Math.floor(
    totalSeconds / 3600
  );

  const minutes = Math.floor(
    (totalSeconds % 3600) / 60
  );

  const seconds =
    totalSeconds % 60;

  return [
    hours,
    minutes,
    seconds,
  ]
    .map((value) =>
      String(value).padStart(2, "0")
    )
    .join(":");
};


const getConnectionQuality = (quality) => {
  switch (quality) {
    case 2:
      return {
        icon: "🟢",
        label: "Excellent",
      };

    case 1:
      return {
        icon: "🟡",
        label: "Fair",
      };

    default:
      return {
        icon: "🔴",
        label: "Poor",
      };
  }
};

// ==========================================
// PARTICIPANT VIEW
// ==========================================
function ParticipantView({
  track,
  participant,
}) {
  const [maximized, setMaximized] =
    useState(false);

  const isSpeaking =
    participant.isSpeaking;

  const isMicrophoneEnabled =
    participant.isMicrophoneEnabled;

  return (
    <div
      className={`participant-card ${
        isSpeaking
          ? "participant-speaking"
          : ""
      } ${
        maximized
          ? "participant-card-maximized"
          : ""
      }`}
    >

      <div className="participant-video">

        {track ? (
          <VideoTrack
            trackRef={track}
          />
        ) : (
          <div className="participant-avatar">
            {participant.name
              ?.charAt(0)
              ?.toUpperCase() ||
              participant.identity
                ?.charAt(0)
                ?.toUpperCase() ||
              "?"}
          </div>
        )}

        <div className="participant-overlay">

          <span className="participant-overlay-name">
            {participant.name ||
              participant.identity}
          </span>

          <button
            type="button"
            className="participant-expand-button"
            onClick={() =>
              setMaximized(
                !maximized
              )
            }
            title={
              maximized
                ? "Minimize"
                : "Maximize"
            }
          >
            {maximized
              ? "⤢"
              : "⛶"}
          </button>

        </div>

      </div>

      <div className="participant-info">

        <span>
          {participant.name ||
            participant.identity}
        </span>

        <span>
          {isMicrophoneEnabled
            ? "🎤"
            : "🔇"}
        </span>

      </div>

    </div>
  );
}
// ==========================================
// PARTICIPANT GRID
// ==========================================

function ParticipantGrid() {
  const tracks = useTracks([
    {
      source: Track.Source.Camera,
      withPlaceholder: true,
    },
  ]);

  return (
    <div className="participant-grid">
      {tracks.map((track) => (
        <ParticipantView
          key={
            track.participant.identity
          }
          track={track}
          participant={
            track.participant
          }
        />
      ))}
    </div>
  );
}


// ==========================================
// PARTICIPANT LIST
// ==========================================

function ParticipantList({
  onClose,
}) {
  const participants =
    useParticipants();

  return (
    <aside className="participant-sidebar">
      <div className="participant-sidebar-header">
        <h3>Participants</h3>

        <button
          type="button"
          className="participant-close-button"
          onClick={onClose}
        >
          ✕
        </button>
      </div>

      <div className="participant-count">
        {participants.length}{" "}
        {participants.length === 1
          ? "participant"
          : "participants"}
      </div>

      <div className="participant-list">
        {participants.map(
          (participant) => {
            const microphoneEnabled =
              participant.isMicrophoneEnabled;

            const cameraEnabled =
              participant.isCameraEnabled;

            const speaking =
              participant.isSpeaking;

            const handRaised =
              participant.attributes?.[
                HAND_ATTRIBUTE
              ] === "true";

            const quality =
              getConnectionQuality(
                participant.connectionQuality
              );

            return (
              <div
                key={
                  participant.identity
                }
                className={`participant-list-item ${
                  speaking
                    ? "participant-list-speaking"
                    : ""
                }`}
              >
                <div className="participant-list-avatar">
                  {participant.name
                    ?.charAt(0)
                    ?.toUpperCase() ||
                    participant.identity
                      ?.charAt(0)
                      ?.toUpperCase() ||
                    "?"}
                </div>

                <div className="participant-list-info">
                  <span className="participant-list-name">
                    {participant.name ||
                      participant.identity}

                    {handRaised &&
                      " ✋"}
                  </span>

                  <span className="participant-list-status">
                    {speaking
                      ? "Speaking"
                      : handRaised
                      ? "Hand raised"
                      : "In meeting"}
                  </span>
                </div>

                <div className="participant-list-devices">
                  <span>
                    {microphoneEnabled
                      ? "🎤"
                      : "🔇"}
                  </span>

                  <span>
                    {cameraEnabled
                      ? "📹"
                      : "🚫"}
                  </span>

                  <span
                    title={quality.label}
                  >
                    {quality.icon}
                  </span>
                </div>
              </div>
            );
          }
        )}
      </div>
    </aside>
  );
}


// ==========================================
// CHAT PANEL
// ==========================================

function ChatPanel({
  onClose,
  roomId,
}) {
  const {
    localParticipant,
  } = useLocalParticipant();

  const room =
    useRoomContext();

  const [
    messages,
    setMessages,
  ] = useState([]);

  const [
    messageText,
    setMessageText,
  ] = useState("");

  const [
    showEmojiPicker,
    setShowEmojiPicker,
  ] = useState(false);

  const fileInputRef =
    useRef(null);

  const messagesEndRef =
    useRef(null);

  const emojis = [
    "😀", "😃", "😄", "😁",
    "😂", "🤣", "😊", "😍",
    "🥰", "😎", "🤔", "😮",
    "😢", "😡", "👍", "👎",
    "❤️", "🔥", "🎉", "👏",
    "🙌", "💯", "🚀", "⭐",
  ];

  useEffect(() => {
    if (!room) {
      return;
    }

    const handleDataReceived = (
      payload,
      participant
    ) => {
      try {
        const text =
          new TextDecoder().decode(
            payload
          );

        const data =
          JSON.parse(text);

        if (
          data.type !==
            CHAT_MESSAGE_TYPE &&
          data.type !== CHAT_FILE_TYPE
        ) {
          return;
        }

        setMessages(
          (currentMessages) => [
            ...currentMessages,
            {
              id:
                `${Date.now()}-${Math.random()}`,
              sender:
                participant?.name ||
                participant?.identity ||
                "Participant",
              text:
                data.type ===
                CHAT_MESSAGE_TYPE
                  ? data.message
                  : undefined,
              file:
                data.type ===
                CHAT_FILE_TYPE
                  ? data.file
                  : undefined,
              timestamp:
                new Date(),
              isOwn: false,
            },
          ]
        );
      } catch (error) {
        console.error(
          "CHAT RECEIVE ERROR:",
          error
        );
      }
    };

    room.on(
      RoomEvent.DataReceived,
      handleDataReceived
    );

    return () => {
      room.off(
        RoomEvent.DataReceived,
        handleDataReceived
      );
    };
  }, [room]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const sendMessage = async () => {
    const text = messageText.trim();

    if (!text) {
      return;
    }

    try {
      const message = {
        type: CHAT_MESSAGE_TYPE,
        message: text,
      };

      const encoded = new TextEncoder().encode(
        JSON.stringify(message)
      );

      await localParticipant.publishData(
        encoded,
        {
          reliable: true,
        }
      );

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `${Date.now()}-${Math.random()}`,
          sender:
            localParticipant.name ||
            localParticipant.identity ||
            "You",
          text,
          timestamp: new Date(),
          isOwn: true,
        },
      ]);

      setMessageText("");
      setShowEmojiPicker(false);
    } catch (error) {
      console.error(
        "CHAT SEND ERROR:",
        error
      );
    }
  };


  // ========================================
  // SEND FILE
  // ========================================

  const sendFile = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      alert(
        "File is too large. Maximum size is 10 MB."
      );
      event.target.value = "";
      return;
    }

    try {
      const formData = new FormData();

      formData.append("file", file);
      formData.append("roomId", roomId);

      const response = await api.post(
        "/files/upload",
        formData
      );

      const uploadedFile =
        response.data.file;

      const message = {
        type: CHAT_FILE_TYPE,
        file: {
          id: uploadedFile.id,
          name: uploadedFile.name,
          url: uploadedFile.url,
          type: uploadedFile.type,
          size: uploadedFile.size,
        },
      };

      const encoded = new TextEncoder().encode(
        JSON.stringify(message)
      );

      await localParticipant.publishData(
        encoded,
        {
          reliable: true,
        }
      );

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `${Date.now()}-${Math.random()}`,
          sender:
            localParticipant.name ||
            localParticipant.identity ||
            "You",
          file: message.file,
          timestamp: new Date(),
          isOwn: true,
        },
      ]);
    } catch (error) {
      console.error(
        "FILE UPLOAD ERROR:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Could not upload file"
      );
    } finally {
      event.target.value = "";
    }
  };

  const addEmoji = (
    emoji
  ) => {
    setMessageText(
      (currentText) =>
        currentText + emoji
    );

    setShowEmojiPicker(false);
  };

  const handleKeyDown = (
    event
  ) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <aside className="chat-sidebar">
      <div className="chat-header">
        <h3>Chat</h3>

        <button
          type="button"
          className="chat-close-button"
          onClick={onClose}
        >
          ✕
        </button>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">
            <span>💬</span>
            <p>No messages yet</p>
            <small>
              Send a message to everyone
              in the meeting.
            </small>
          </div>
        )}

        {messages.map(
          (message) => (
            <div
              key={message.id}
              className={`chat-message ${
                message.isOwn
                  ? "chat-message-own"
                  : ""
              }`}
            >
              <div className="chat-message-sender">
                {message.sender}
              </div>

              {message.file ? (
                <a
                  className="chat-file"
                  href={message.file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📎{" "}
                  {message.file.name}
                </a>
              ) : (
                <div className="chat-message-text">
                  {message.text}
                </div>
              )}

              <div className="chat-message-time">
                {message.timestamp.toLocaleTimeString(
                  [],
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}
              </div>
            </div>
          )
        )}

        <div
          ref={messagesEndRef}
        />
      </div>

      <div className="chat-input-area">
        <input
          ref={fileInputRef}
          type="file"
          style={{
            display: "none",
          }}
          onChange={sendFile}
        />

        <button
          type="button"
          className="file-button"
          onClick={() =>
            fileInputRef.current?.click()
          }
          title="Attach file"
        >
          📎
        </button>

        <div className="emoji-container">
          <button
            type="button"
            className="emoji-button"
            onClick={() =>
              setShowEmojiPicker(
                !showEmojiPicker
              )
            }
          >
            😀
          </button>

          {showEmojiPicker && (
            <div className="emoji-picker">
              {emojis.map(
                (emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className="emoji-option"
                    onClick={() =>
                      addEmoji(
                        emoji
                      )
                    }
                  >
                    {emoji}
                  </button>
                )
              )}
            </div>
          )}
        </div>

        <textarea
          value={messageText}
          onChange={(event) =>
            setMessageText(
              event.target.value
            )
          }
          onKeyDown={
            handleKeyDown
          }
          placeholder="Type a message..."
          rows={2}
          maxLength={1000}
        />

        <button
          type="button"
          onClick={
            sendMessage
          }
          disabled={
            !messageText.trim()
          }
        >
          Send
        </button>
      </div>
    </aside>
  );
}


// ==========================================
// MEETING TOOLS PANEL
// ==========================================
function MeetingToolsPanel({
  roomId,
  meetingTitle,
  onParticipants,
  onChat,
}) {
  const participants = useParticipants();
  const [copied, setCopied] = useState(false);

  const copyMeetingLink = async () => {
    const link = `${window.location.origin}/meeting/${roomId}`;

    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      console.error("COPY MEETING LINK ERROR:", error);
    }
  };

  return (
    <aside className="meeting-tools-panel">
      <div className="meeting-tools-header">
        <div>
          <span className="meeting-tools-kicker">MEETING</span>
          <h3>Meeting Tools</h3>
        </div>
        <span className="meeting-tools-live-dot">●</span>
      </div>

      <div className="meeting-tools-list">
        <button type="button" className="meeting-tool-row" onClick={onParticipants}>
          <span className="meeting-tool-icon">👥</span>
          <span className="meeting-tool-text">
            <strong>Participants</strong>
            <small>{participants.length} in meeting</small>
          </span>
          <span className="meeting-tool-arrow">›</span>
        </button>

        <button type="button" className="meeting-tool-row" onClick={onChat}>
          <span className="meeting-tool-icon">💬</span>
          <span className="meeting-tool-text">
            <strong>Chat</strong>
            <small>Message everyone</small>
          </span>
          <span className="meeting-tool-arrow">›</span>
        </button>

        <button type="button" className="meeting-tool-row" onClick={copyMeetingLink}>
          <span className="meeting-tool-icon">🔗</span>
          <span className="meeting-tool-text">
            <strong>{copied ? "Meeting link copied" : "Invite people"}</strong>
            <small>Copy your meeting link</small>
          </span>
          <span className="meeting-tool-arrow">›</span>
        </button>

        <div className="meeting-tool-info-card">
          <span className="meeting-tool-info-icon">ℹ</span>
          <div>
            <strong>{meetingTitle || "Meeting"}</strong>
            <span>Room: {roomId}</span>
          </div>
        </div>
      </div>

      <button type="button" className="meeting-copy-link" onClick={copyMeetingLink}>
        {copied ? "✓ Link copied" : "🔗 Copy meeting link"}
      </button>
    </aside>
  );
}


// ==========================================
// MEETING CONTROLS
// ==========================================
function MeetingControls({
  roomId,
  showParticipants,
  setShowParticipants,
  showChat,
  setShowChat,
}) {
  const {
    localParticipant,
  } = useLocalParticipant();

  const room =
    useRoomContext();

  const navigate =
    useNavigate();

  const [
    micEnabled,
    setMicEnabled,
  ] = useState(
    localParticipant.isMicrophoneEnabled
  );

  const [
    cameraEnabled,
    setCameraEnabled,
  ] = useState(
    localParticipant.isCameraEnabled
  );

  const [
    screenShareEnabled,
    setScreenShareEnabled,
  ] = useState(
    localParticipant.isScreenShareEnabled
  );

  const [
    handRaised,
    setHandRaised,
  ] = useState(
    localParticipant.attributes?.[
      HAND_ATTRIBUTE
    ] === "true"
  );

  const [
    showDevices,
    setShowDevices,
  ] = useState(false);

  const [
    cameraDevices,
    setCameraDevices,
  ] = useState([]);

  const [
    selectedCamera,
    setSelectedCamera,
  ] = useState("");

  const [
    connectionStatus,
    setConnectionStatus,
  ] = useState("Connected");

  const [
    permissionError,
    setPermissionError,
  ] = useState("");

  useEffect(() => {
    if (!room) {
      return;
    }

    const onReconnecting = () =>
      setConnectionStatus(
        "Reconnecting..."
      );

    const onReconnected = () =>
      setConnectionStatus(
        "Connected"
      );

    const onDisconnected = () =>
      setConnectionStatus(
        "Disconnected"
      );

    room.on(
      RoomEvent.Reconnecting,
      onReconnecting
    );

    room.on(
      RoomEvent.Reconnected,
      onReconnected
    );

    room.on(
      RoomEvent.Disconnected,
      onDisconnected
    );

    return () => {
      room.off(
        RoomEvent.Reconnecting,
        onReconnecting
      );

      room.off(
        RoomEvent.Reconnected,
        onReconnected
      );

      room.off(
        RoomEvent.Disconnected,
        onDisconnected
      );
    };
  }, [room]);

  const refreshCameras = async () => {
    try {
      const devices =
        await navigator.mediaDevices.enumerateDevices();

      const cameras =
        devices.filter(
          (device) =>
            device.kind ===
            "videoinput"
        );

      setCameraDevices(
        cameras
      );

      if (
        !selectedCamera &&
        cameras.length > 0
      ) {
        setSelectedCamera(
          cameras[0].deviceId
        );
      }
    } catch (error) {
      console.error(
        "DEVICE LIST ERROR:",
        error
      );
    }
  };

  useEffect(() => {
    refreshCameras();
  }, []);

  const toggleMicrophone =
    async () => {
      try {
        setPermissionError("");

        const enabled =
          !micEnabled;

        await localParticipant.setMicrophoneEnabled(
          enabled,
          enabled
            ? {
                audioCaptureOptions: {
                  echoCancellation:
                    true,
                  noiseSuppression:
                    true,
                  autoGainControl:
                    true,
                },
              }
            : undefined
        );

        setMicEnabled(
          enabled
        );
      } catch (error) {
        console.error(
          "MICROPHONE ERROR:",
          error
        );

        setPermissionError(
          "Microphone permission was denied or the microphone is unavailable."
        );
      }
    };

  const toggleCamera = async () => {
    try {
      setPermissionError("");

      const enabled = !cameraEnabled;

      const cameraOptions =
        enabled && selectedCamera
          ? {
              deviceId: selectedCamera,
            }
          : undefined;

      await localParticipant.setCameraEnabled(
        enabled,
        cameraOptions
      );

      setCameraEnabled(enabled);
    } catch (error) {
      console.error("CAMERA ERROR:", error);

      setPermissionError(
        "Camera permission was denied or the camera is unavailable."
      );
    }
  };

  const switchCamera = async (
  deviceId
) => {
  try {
    setSelectedCamera(
      deviceId
    );

    await localParticipant.setCameraEnabled(
      false
    );

    await localParticipant.setCameraEnabled(
      true,
      {
        deviceId,
      }
    );

    setCameraEnabled(true);

  } catch (error) {
    console.error(
      "CAMERA SWITCH ERROR:",
      error
    );

    setPermissionError(
      "Could not switch camera."
    );
  }
};

  const toggleScreenShare =
    async () => {
      try {
        setPermissionError("");

        const enabled =
          !screenShareEnabled;

        await localParticipant.setScreenShareEnabled(
          enabled
        );

        setScreenShareEnabled(
          enabled
        );
      } catch (error) {
        console.error(
          "SCREEN SHARE ERROR:",
          error
        );

        setScreenShareEnabled(
          false
        );

        setPermissionError(
          "Screen sharing was cancelled or is unavailable."
        );
      }
    };

  const toggleRaiseHand =
    async () => {
      try {
        const next =
          !handRaised;

        await localParticipant.setAttributes(
          {
            [HAND_ATTRIBUTE]:
              String(next),
          }
        );

        setHandRaised(
          next
        );
      } catch (error) {
        console.error(
          "RAISE HAND ERROR:",
          error
        );

        setPermissionError(
          "Could not update your raised-hand status."
        );
      }
    };

  const leaveMeeting =
    () => {
      const confirmed =
        window.confirm(
          "Are you sure you want to leave the meeting?"
        );

      if (!confirmed) {
        return;
      }

      navigate(
        "/dashboard"
      );
    };

  return (
    <>
      {connectionStatus !==
        "Connected" && (
        <div className="meeting-connection-status">
          {connectionStatus ===
          "Reconnecting..."
            ? "🔄 Reconnecting..."
            : "⚠️ Disconnected"}
        </div>
      )}

      {permissionError && (
        <div className="meeting-permission-error">
          {permissionError}
        </div>
      )}

      {showDevices && (
        <div className="device-menu">
          <div className="device-menu-header">
            <strong>
              Camera
            </strong>

            <button
              type="button"
              onClick={() =>
                setShowDevices(
                  false
                )
              }
            >
              ✕
            </button>
          </div>

          {cameraDevices.length ===
          0 ? (
            <p>
              No camera found.
            </p>
          ) : (
            cameraDevices.map(
              (device, index) => (
                <button
                  type="button"
                  key={
                    device.deviceId ||
                    index
                  }
                  className={
                    selectedCamera ===
                    device.deviceId
                      ? "device-option-active"
                      : "device-option"
                  }
                  onClick={() =>
                    switchCamera(
                      device.deviceId
                    )
                  }
                >
                  📹{" "}
                  {device.label ||
                    `Camera ${
                      index + 1
                    }`}
                </button>
              )
            )
          )}
        </div>
      )}

      <div className="meeting-controls">
        <button
          type="button"
          className={`control-button ${
            micEnabled
              ? ""
              : "control-button-off"
          }`}
          onClick={
            toggleMicrophone
          }
        >
          <span className="control-icon">
            {micEnabled
              ? "🎤"
              : "🔇"}
          </span>

          <span className="control-label">
            {micEnabled
              ? "Mute"
              : "Unmute"}
          </span>
        </button>

        <button
          type="button"
          className={`control-button ${
            cameraEnabled
              ? ""
              : "control-button-off"
          }`}
          onClick={
            toggleCamera
          }
        >
          <span className="control-icon">
            {cameraEnabled
              ? "📹"
              : "🚫"}
          </span>

          <span className="control-label">
            {cameraEnabled
              ? "Camera"
              : "Camera Off"}
          </span>
        </button>

        <button
          type="button"
          className={`control-button ${
            screenShareEnabled
              ? "control-button-active"
              : ""
          }`}
          onClick={
            toggleScreenShare
          }
        >
          <span className="control-icon">
            {screenShareEnabled
              ? "🛑"
              : "🖥️"}
          </span>

          <span className="control-label">
            {screenShareEnabled
              ? "Stop Share"
              : "Share Screen"}
          </span>
        </button>

        <button
          type="button"
          className="control-button"
          onClick={() => {
            setShowDevices(
              !showDevices
            );

            setShowChat(false);
            setShowParticipants(
              false
            );

            refreshCameras();
          }}
        >
          <span className="control-icon">
            🔄
          </span>

          <span className="control-label">
            Camera
          </span>
        </button>

        <button
          type="button"
          className={`control-button ${
            showParticipants
              ? "control-button-active"
              : ""
          }`}
          onClick={() => {
            setShowParticipants(
              !showParticipants
            );

            setShowChat(false);
            setShowDevices(false);
          }}
        >
          <span className="control-icon">
            👥
          </span>

          <span className="control-label">
            Participants
          </span>
        </button>

        <button
          type="button"
          className={`control-button ${
            showChat
              ? "control-button-active"
              : ""
          }`}
          onClick={() => {
            setShowChat(
              !showChat
            );

            setShowParticipants(
              false
            );

            setShowDevices(false);
          }}
        >
          <span className="control-icon">
            💬
          </span>

          <span className="control-label">
            Chat
          </span>
        </button>

        <button
          type="button"
          className={`control-button ${
            handRaised
              ? "control-button-active"
              : ""
          }`}
          onClick={
            toggleRaiseHand
          }
        >
          <span className="control-icon">
            {handRaised
              ? "✋"
              : "✋"}
          </span>

          <span className="control-label">
            {handRaised
              ? "Lower Hand"
              : "Raise Hand"}
          </span>
        </button>

        <button
          type="button"
          className="control-button leave-button"
          onClick={
            leaveMeeting
          }
        >
          <span className="control-icon">
            🚪
          </span>

          <span className="control-label">
            Leave
          </span>
        </button>
      </div>
    </>
  );
}


// ==========================================
// MEETING ROOM
// ==========================================

function MeetingRoom() {
  const {
    roomId: routeRoomId,
  } = useParams();

  const roomId =
    normalizeRoomId(routeRoomId);

  console.log(
    "Route room ID:",
    routeRoomId
  );

  console.log(
    "Normalized room ID:",
    roomId
  );

  const [
    elapsedSeconds,
    setElapsedSeconds,
  ] = useState(0);

  const timerRef =
    useRef(null);

  const [
    token,
    setToken,
  ] = useState("");

  const [
    serverUrl,
    setServerUrl,
  ] = useState("");

  const [
    meeting,
    setMeeting,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    showParticipants,
    setShowParticipants,
  ] = useState(false);

  const [
    showChat,
    setShowChat,
  ] = useState(false);

  const [
    copiedMeetingLink,
    setCopiedMeetingLink,
  ] = useState(false);

  const copyMeetingLink = async () => {
    const link = `${window.location.origin}/meeting/${roomId}`;

    try {
      await navigator.clipboard.writeText(link);
      setCopiedMeetingLink(true);
      window.setTimeout(() => setCopiedMeetingLink(false), 1800);
    } catch (copyError) {
      console.error("COPY MEETING LINK ERROR:", copyError);
    }
  };

  useEffect(() => {
    timerRef.current =
      setInterval(() => {
        setElapsedSeconds(
          (seconds) =>
            seconds + 1
        );
      }, 1000);

    return () => {
      clearInterval(
        timerRef.current
      );
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const joinMeeting = async () => {
      try {
        setLoading(true);
        setError("");

        if (!roomId) {
          throw new Error(
            "Meeting room ID is missing."
          );
        }

        console.log(
          "Route room ID:",
          routeRoomId
        );

        console.log(
          "Normalized room ID:",
          roomId
        );

        const encodedRoomId =
          encodeURIComponent(roomId);

        // Get meeting details first.
        // This keeps the error clear if the room does not exist.
        const meetingResponse =
          await api.get(
            `/meetings/${encodedRoomId}`
          );

        if (cancelled) {
          return;
        }

        console.log(
          "Meeting response:",
          meetingResponse.data
        );

        const meetingData =
          meetingResponse.data?.meeting;

        if (!meetingData) {
          throw new Error(
            "Meeting information was not returned by the server."
          );
        }

        setMeeting(meetingData);

        // Get LiveKit credentials after the meeting is verified.
        const tokenResponse =
          await api.post(
            `/livekit/${encodedRoomId}/token`
          );

        if (cancelled) {
          return;
        }

        console.log(
          "LiveKit response:",
          tokenResponse.data
        );

        const liveKitData =
          tokenResponse.data;

        if (
          !liveKitData?.token ||
          !liveKitData?.url
        ) {
          throw new Error(
            "Meeting credentials are incomplete."
          );
        }

        setToken(
          liveKitData.token
        );

        setServerUrl(
          liveKitData.url
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "JOIN MEETING ERROR:",
          error
        );

        setError(
          error.response?.data?.message ||
            error.message ||
            "Could not join meeting"
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    joinMeeting();

    return () => {
      cancelled = true;
    };
  }, [
    roomId,
    routeRoomId,
  ]);

  if (loading) {
    return (
      <div className="meeting-loading">
        <div className="meeting-loading-card">
          <div className="meeting-loading-icon">🎥</div>
          <div className="meeting-loading-spinner" />
          <h2>Joining meeting</h2>
          <p>Preparing your camera, microphone and meeting room...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="meeting-error">
        <h2>
          Unable to join meeting
        </h2>

        <p>{error}</p>
      </div>
    );
  }

  if (
    !token ||
    !serverUrl
  ) {
    return (
      <div className="meeting-error">
        <h2>
          Missing meeting credentials
        </h2>
      </div>
    );
  }

  return (
    <div className="meeting-page">
      <header className="meeting-header">
        <div className="meeting-header-left">
          <div className="meeting-secure-icon">🛡</div>
          <div>
            <div className="meeting-header-meta">
              <span className="meeting-live-pill">● Live</span>
              <span className="meeting-header-separator">|</span>
              <span>{meeting?.title || "Video Meeting"}</span>
            </div>
            <div className="meeting-header-room">Room: {roomId}</div>
          </div>
          <div className="meeting-time-pill">
            ◷ {formatTime(elapsedSeconds)}
          </div>
        </div>

        <div className="meeting-header-actions">
          <button
            type="button"
            className="share-meeting-button"
            onClick={copyMeetingLink}
          >
            🔗 {copiedMeetingLink ? "Copied" : "Share meeting"}
          </button>
          <button type="button" className="meeting-more-button" title="More options">⋮</button>
        </div>
      </header>

      <main className="meeting-video">
        <LiveKitRoom
          token={token}
          serverUrl={serverUrl}
          connect={true}
          audio={true}
          video={true}
        >
          <div className="meeting-workspace">
            <section className="meeting-video-panel">
              <div className="meeting-video-header">
                <div>
                  <span className="meeting-live-dot">●</span>
                  Live meeting
                </div>
                <span className="meeting-connection-badge">● Secure connection</span>
              </div>

              <div className="meeting-video-grid">
                <ParticipantGrid />
              </div>
            </section>

            <MeetingToolsPanel
              roomId={roomId}
              meetingTitle={meeting?.title}
              onParticipants={() => setShowParticipants(true)}
              onChat={() => setShowChat(true)}
            />
          </div>

          {showParticipants && (
            <ParticipantList
              onClose={() => setShowParticipants(false)}
            />
          )}

          {showChat && (
            <ChatPanel
              roomId={roomId}
              onClose={() => setShowChat(false)}
            />
          )}

          <MeetingControls
            roomId={roomId}
            showParticipants={showParticipants}
            setShowParticipants={setShowParticipants}
            showChat={showChat}
            setShowChat={setShowChat}
          />
        </LiveKitRoom>
      </main>
    </div>
  );
}

export default MeetingRoom
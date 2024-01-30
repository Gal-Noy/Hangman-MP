import React, { useState, useEffect } from "react";
import { useWebSocketContext } from "../../WebSocketContext";
import { useSelector } from "react-redux";
import { sortLobbyUsers } from "../../utils/utils";

function LobbyUsersList() {
  const { lastJsonMessage, sendJsonMessage } = useWebSocketContext();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  const UserBox = ({ user, error, setError }) => {
    const isMe = JSON.parse(localStorage.getItem("user"))._id === user._id;
    const { roomData } = useSelector((state) => state.clientState);
    const isAdmin = JSON.parse(localStorage.getItem("user"))._id === roomData?.admin;
    const [isUserInvited, setIsUserInvited] = useState(false);

    const inviteUserToRoom = (invitedUser) => {
      if (roomData.numberOfPlayers === roomData.players.length) {
        setError({ user: invitedUser, message: "Room is full." });
        return;
      }
      sendJsonMessage({
        type: "rooms",
        content: {
          action: "invite",
          data: {
            invitedPlayerId: invitedUser._id,
            password: roomData?.password,
          },
        },
      });
      setIsUserInvited(true);
    };

    return (
      <div></div>
      // <div className="lobby-user-box">
      //   <div className="lobby-user-box-avatar">
          

      // </div>
      // <div>
      //   <div className={"rounded m-1 d-flex align-items-center p-2 " + (!isMe ? "bg-gray-400" : "bg-primary")}>
      //     <div className="ms-2 mb-1 fs-5">{user.name}</div>
      //     {isAdmin && !isUserInvited && (
      //       <div
      //         className="ms-2 mb-1 fs-5 align-self-end"
      //         type="button"
      //         id="invite-user-to-room"
      //         onClick={() => inviteUserToRoom(user)}
      //       >
      //         ➕
      //       </div>
      //     )}
      //     {isAdmin && isUserInvited && <div className="ms-2 mb-1 fs-5 align-self-end">✔️</div>}
      //   </div>
      //   {error && error.user._id === user._id && (
      //     <div className="alert alert-danger m-1" role="alert">
      //       {error.message}
      //     </div>
      //   )}
      // </div>
    );
  };

  useEffect(() => {
    sendJsonMessage({
      type: "users",
      content: {
        action: "list",
        data: {},
      },
    });
  }, []);

  useEffect(() => {
    if (lastJsonMessage) {
      const { type, content } = lastJsonMessage;
      if (type === "updateLobbyUsersList") {
        const { users } = content.data;

        sortLobbyUsers(users);

        setUsers(users);
      }
    }
  }, [lastJsonMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="lobby-users-list-container">
      <div className="lobby-users-list-search-bar">
        <span class="material-symbols-outlined">search</span>
        <input type="text" placeholder="Search" />
      </div>
      <div className="lobby-users-list">
        {users.map((user) => (
          <UserBox key={user._id} user={user} error={error} setError={setError} />
        ))}
      </div>
    </div>
  );
}

export default LobbyUsersList;

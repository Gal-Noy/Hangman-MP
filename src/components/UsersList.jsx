import React, { useState, useEffect } from "react";
import { useWebSocketContext } from "../WebSocketContext";
import { useSelector } from "react-redux";
import { sortUsersList } from "../utils/utils";
import defaultAvatar from "../assets/default-avatar.jpg";
import { b64toBlob } from "../utils/utils";
import "../styles/UsersList.css";

function UsersList() {
  const { lastJsonMessage, sendJsonMessage } = useWebSocketContext();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const { roomData } = useSelector((state) => state.clientState);
  const [searchInput, setSearchInput] = useState("");
  const [searchedUsers, setSearchedUsers] = useState(users);

  const UserBox = ({ user }) => {
    const isAdmin = JSON.parse(localStorage.getItem("user"))._id === roomData?.admin.id;
    const [isUserInvited, setIsUserInvited] = useState(false);
    const userAvatar = !user?.avatar ? null : b64toBlob(user.avatar, "image/");

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
      <div className="user-box-container" key={user._id}>
        <div className="user-box">
          <img
            className="user-box-avatar"
            src={!userAvatar ? defaultAvatar : URL.createObjectURL(userAvatar)}
            alt="user-avatar"
          />
          <div className="user-box-details">
            <div className="user-box-name">{user.name.toUpperCase()}</div>
            <div className="user-box-status">
              {user.inGame && <span className="user-box-ingame-status">IN-GAME</span>}
              {user.inRoom && !user.inGame && <span className="user-box-inroom-status">IN-ROOM</span>}
              {user.isActive && !user.inRoom && !user.inGame && (
                <span className="user-box-isactive-status">ONLINE</span>
              )}
              {!user.isActive && !user.inRoom && !user.inGame && (
                <span className="user-box-isoffline-status">OFFLINE</span>
              )}
            </div>
          </div>

          {isAdmin &&
            !user.inRoom &&
            !user.inGame &&
            user.isActive &&
            (!isUserInvited ? (
              <span
                className="material-symbols-outlined user-box-invite-button"
                type="button"
                onClick={() => inviteUserToRoom(user)}
              >
                person_add
              </span>
            ) : (
              <span className="material-symbols-outlined user-box-invite-button" type="button">
                done
              </span>
            ))}
        </div>
        {error && error.user._id === user._id && <div className="user-box-error-message">{error.message}</div>}
      </div>
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
    setError(null);
  }, []);

  useEffect(() => {
    if (lastJsonMessage) {
      const { type, content } = lastJsonMessage;
      if (type === "updateUsersList") {
        const { users } = content.data;

        sortUsersList(users);

        if (roomData) {
          const filteredUsers = users.filter((user) => !user.inRoom && !user.inGame && user.isActive);
          setUsers(filteredUsers);
        } else {
          setUsers(users);
        }

        setError(null);
      }
    }
  }, [lastJsonMessage]);

  const handleSearchInput = (e) => {
    setSearchInput(e.target.value);
    const filteredUsers = users.filter((user) => user.name.toLowerCase().includes(e.target.value.toLowerCase()));
    setSearchedUsers(filteredUsers);
  };

  return (
    <div className="users-list-container">
      <div className="users-list-search-bar">
        <span className="material-symbols-outlined">search</span>
        <input type="text" placeholder="Search" value={searchInput} onChange={handleSearchInput} />
      </div>
      <div className="users-list">
        {!searchInput && users.map((user) => <UserBox user={user} key={user._id} />)}
        {searchInput && searchedUsers.map((user) => <UserBox user={user} key={user._id} />)}
      </div>
    </div>
  );
}

export default UsersList;

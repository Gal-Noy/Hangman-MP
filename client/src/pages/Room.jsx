import { useState, useEffect } from "react";
import UsersList from "../components/UsersList";
import PlayersList from "../components/Room/PlayersList";
import RoomDetails from "../components/Room/RoomDetails";
import RoomGameRules from "../components/Room/RoomGameRules";
import { useWebSocketContext } from "../WebSocketContext";
import { useDispatch, useSelector } from "react-redux";
import { setRoom, setLobby, setKickedFromRoom } from "../store/clientStateSlice";
import Chat from "../components/Chat/Chat";
import { sortPlayersList } from "../utils/utils";
import "../styles/Room.css";

function Room() {
  const dispatch = useDispatch();
  const { roomData } = useSelector((state) => state.clientState);
  const isRoomAdmin = JSON.parse(localStorage.getItem("user"))._id === roomData.admin.id;
  const { lastJsonMessage, sendJsonMessage } = useWebSocketContext();
  const [players, setPlayers] = useState([]);
  const [modifyRoomData, setModifyRoomData] = useState({
    newGameRules: {
      totalRounds: null,
      timerDuration: null,
      cooldownDuration: null,
    },
    newName: "",
    newNumberOfPlayers: null,
    newPassword: "",
    isPrivate: null,
  });
  const [showChangeName, setShowChangeName] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showPasswordLengthError, setShowPasswordLengthError] = useState(false);

  useEffect(() => {
    if (!players && roomData) {
      const players = [...roomData.players];
      const sortedPlayers = sortPlayersList(players);
      setPlayers(sortedPlayers);
    }
  }, []);

  useEffect(() => {
    if (lastJsonMessage) {
      const { type, content } = lastJsonMessage;
      if (type === "updateRoomInfo" || type === "createRoomResponse") {
        dispatch(setRoom(content.data.room));
        const players = [...content.data.room.players];

        const sortedPlayers = sortPlayersList(players);

        setPlayers(sortedPlayers);
      } else if (type === "kickFromRoom") {
        const { room } = content.data;
        dispatch(setLobby(room));

        dispatch(setKickedFromRoom(room.name));
        setTimeout(() => {
          dispatch(setKickedFromRoom(""));
        }, 10000);
      }
    }
  }, [lastJsonMessage]);

  useEffect(() => {
    if (
      modifyRoomData.newGameRules.totalRounds ||
      modifyRoomData.newGameRules.timerDuration ||
      modifyRoomData.newGameRules.cooldownDuration ||
      modifyRoomData.newNumberOfPlayers
    ) {
      modifyRoom();
    }
  }, [modifyRoomData.newGameRules, modifyRoomData.newNumberOfPlayers]);

  const clearModifyRoomData = () => {
    setModifyRoomData({
      newGameRules: {
        totalRounds: null,
        timerDuration: null,
        cooldownDuration: null,
      },
      newName: "",
      newNumberOfPlayers: null,
      newPassword: "",
      isPrivate: null,
    });
  };

  const modifyRoom = () => {
    if (modifyRoomData.newPassword && modifyRoomData.newPassword.length < 4) {
      setShowPasswordLengthError(true);
      setTimeout(() => {
        setShowPasswordLengthError(false);
      }, 3000);
    } else {
      console.log(modifyRoomData);
      sendJsonMessage({
        type: "rooms",
        content: {
          action: "modify",
          data: modifyRoomData,
        },
      });
    }
    clearModifyRoomData();
  };

  const kickPlayer = (playerId) => {
    sendJsonMessage({
      type: "rooms",
      content: {
        action: "kick",
        data: {
          kickedPlayerId: playerId,
        },
      },
    });
  };

  const roomDetailsProps = {
    roomData,
    isRoomAdmin,
    modifyRoom,
    modifyRoomData,
    setModifyRoomData,
    showChangeName,
    setShowChangeName,
    showChangePassword,
    setShowChangePassword,
    showPasswordLengthError,
    setShowPasswordLengthError,
  };
  const roomGameRulesProps = { roomData, modifyRoomData, setModifyRoomData, isRoomAdmin };
  const playersListProps = { players, isRoomAdmin, kickPlayer, modifyRoomData, setModifyRoomData };

  return (
    <div className="room-container">
      <div className="room-content">
        <div className="room-info">
          <RoomDetails {...roomDetailsProps} />
          <RoomGameRules {...roomGameRulesProps} />
        </div>
        <div className="room-social">
          <PlayersList {...playersListProps} />
          <Chat />
        </div>
      </div>
      <UsersList />
    </div>
  );
}

export default Room;

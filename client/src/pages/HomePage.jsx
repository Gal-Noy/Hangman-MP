import Dashboard from "../components/Dashboard/Dashboard";
import UsersList from "../components/UsersList";
import Chat from "../components/Chat/Chat";

function HomePage({ onLogout }) {
  return (
    <div className="bg-secondary vh-100 d-flex flex-column justify-content-center align-items-center">
      <Dashboard onLogout={onLogout} />
      <div className=" mb-1 w-75 d-flex flex-row">
        <Chat />
        <UsersList />
      </div>
    </div>
  );
}

export default HomePage;

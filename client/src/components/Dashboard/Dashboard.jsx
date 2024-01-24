import Logout from "./Logout";

function Dashboard({ onLogout }) {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="bg-white mb-1 p-3 rounded w-75">
      {user && (
        <div className="text-center">
          Hello <strong>{user.name}</strong>, welcome to chat!
        </div>
      )}
      <Logout onLogout={onLogout} />
    </div>
  );
}

export default Dashboard;

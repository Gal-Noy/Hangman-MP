import "../styles/DropdownMenu.css";

function DropdownMenu(props) {
  const { contentId, values, stateValue, setFunction } = props;

  return (
    <div className="dropdown">
      <button
        className="dropdown-btn"
        onMouseEnter={() => document.getElementById(contentId)?.classList.remove("hide")}
      >
        {stateValue}
      </button>
      <div className="dropdown-content" id={contentId}>
        {values.map((value) => (
          <a
            key={value}
            className="dropdown-item"
            type="button"
            onClick={() => {
              setFunction(value);
              document.getElementById(contentId)?.classList.add("hide");
            }}
          >
            {value}
          </a>
        ))}
      </div>
    </div>
  );
}

export default DropdownMenu;

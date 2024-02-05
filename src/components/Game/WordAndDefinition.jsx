function WordAndDefinition(props) {
  const { definition, hiddenWord } = props;

  return (
    <div className="word-and-definition-container">
      {definition && hiddenWord && (
        <div className="word-and-definition">
          <div className="definition-header">{definition}</div>
          <div className="hidden-word">
            {hiddenWord.split("").map((char, index) => (
              <span key={index} className="hidden-word-char">
                {char === "_" ? " _ " : ` ${char.toUpperCase()} `}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default WordAndDefinition;

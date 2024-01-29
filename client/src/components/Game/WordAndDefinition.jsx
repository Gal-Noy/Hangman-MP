function WordAndDefinition(props) {
  const { definition, hiddenWord } = props;

  return (
    <div className="rounded bg-light m-2 h-50 overflow-auto">
      {definition && hiddenWord && (
        <div className="definition-header rounded bg-light mt-2 mx-2">
          <p className="text-center pt-2 fs-3 fw-bold text-dark">{definition}</p>
          <div className="text-center pt-2 fw-bold text-dark">
            {/* Map each character in the hidden word to a span element */}
            {hiddenWord.split("").map((char, index) => (
              <span key={index} className={char === "_" ? "fs-1" : "fs-3"}>
                {" " + char.toUpperCase() + " "}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default WordAndDefinition;

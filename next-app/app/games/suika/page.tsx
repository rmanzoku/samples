import "./design.css";

export default function SuikaDesignPage() {
  return (
    <div className="suika-page">
      <div className="game-wrapper">
        <div className="scoreboard">
          <div className="bubble bubble--best">2347</div>
          <div className="bubble bubble--score">684</div>
          <div className="bubble bubble--next">
            <span className="icon" />
          </div>
        </div>
        <div className="glass-box">
          <div
            className="fruit fruit--watermelon"
            style={{ left: "50px", top: "220px" }}
          />
          <div
            className="fruit fruit--orange"
            style={{ left: "120px", top: "180px", zIndex: 2 }}
          />
          <div
            className="fruit fruit--grape"
            style={{ left: "180px", top: "240px", zIndex: 3 }}
          />
          <div
            className="fruit fruit--lemon"
            style={{ left: "140px", top: "120px" }}
          />
          <div
            className="fruit fruit--strawberry"
            style={{ left: "90px", top: "80px", zIndex: 4 }}
          />
        </div>
      </div>
    </div>
  );
}

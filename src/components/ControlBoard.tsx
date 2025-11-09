import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import "../styles/ControlBoard.css";

export function ControlBoard() {
  return (
    <div className="control-board-popup">
      <h1 className="control-board-title">Game Controls</h1>
      
      <div className="control-board-content">
        {/* Movement Controls */}
        <div>
          <h2 className="control-section-title">Movement</h2>
          
          <div className="movement-controls">
            {/* WASD Keys */}
            <div className="key-group">
              <div className="key-row">
                <div className="key-button">W</div>
              </div>
              <div className="key-row">
                <div className="key-button">A</div>
                <div className="key-button">S</div>
                <div className="key-button">D</div>
              </div>
              <p className="key-label">WASD</p>
            </div>

            {/* OR Text */}
            <div className="or-divider">or</div>

            {/* Arrow Keys */}
            <div className="key-group">
              <div className="key-row">
                <div className="key-button">
                  <ArrowUp />
                </div>
              </div>
              <div className="key-row">
                <div className="key-button">
                  <ArrowLeft />
                </div>
                <div className="key-button">
                  <ArrowDown />
                </div>
                <div className="key-button">
                  <ArrowRight />
                </div>
              </div>
              <p className="key-label">Arrow Keys</p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="action-controls">
          {/* Pickup/Drop */}
          <div className="action-item">
            <h3 className="action-title">Pickup / Drop</h3>
            <div className="key-button wide">Space</div>
          </div>

          {/* Sail */}
          <div className="action-item">
            <h3 className="action-title">Sail</h3>
            <div>
              <div className="key-button medium">Enter</div>
              <p className="action-note">(when near boat)</p>
            </div>
          </div>

          {/* Restart */}
          <div className="action-item">
            <h3 className="action-title">Restart</h3>
            <div className="key-button">R</div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const SettingsPage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle("bg-dark");
    document.body.classList.toggle("text-light");
  };

  // Toggle notifications
  const toggleNotifications = () => {
    setNotifications(!notifications);
  };

  return (
    <div className={`container mt-5 ${darkMode ? "bg-dark text-light" : ""}`}>
      <h1>Settings</h1>
      <p>Adjust platform settings.</p>

      {/* Dark Mode Toggle */}
      <div className="form-check form-switch">
        <input
          className="form-check-input"
          type="checkbox"
          id="darkModeSwitch"
          checked={darkMode}
          onChange={toggleDarkMode}
        />
        <label className="form-check-label" htmlFor="darkModeSwitch">
          Enable Dark Mode
        </label>
      </div>

      {/* Notifications Toggle */}
      <div className="form-check form-switch mt-3">
        <input
          className="form-check-input"
          type="checkbox"
          id="notificationsSwitch"
          checked={notifications}
          onChange={toggleNotifications}
        />
        <label className="form-check-label" htmlFor="notificationsSwitch">
          Enable Notifications
        </label>
      </div>
    </div>
  );
};

export default SettingsPage;

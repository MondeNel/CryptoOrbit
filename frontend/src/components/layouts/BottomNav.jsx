import React from "react";

/**
 * BottomNav
 * Mobile-style navigation between app sections
 *
 * @param {Object} props
 * @param {string} props.tab
 * @param {Function} props.setTab
 */
const BottomNav = ({ tab, setTab }) => {

  const items = [
    { id: "trade", ico: "◎", l: "Trade" },
    { id: "history", ico: "◷", l: "History" },
    { id: "wallet", ico: "◈", l: "Wallet" },
    { id: "profile", ico: "◉", l: "Profile" },
  ];

  return (
    <div className="bnav">

      {items.map((n) => (
        <div
          key={n.id}
          className={`ni ${
            tab === n.id ? "on" : ""
          }`}
          onClick={() => {
            setTab(n.id);
            Audio.click();
          }}
        >
          <span className="ni-ico">{n.ico}</span>

          <span>{n.l}</span>
        </div>
      ))}

    </div>
  );
};

export default BottomNav;
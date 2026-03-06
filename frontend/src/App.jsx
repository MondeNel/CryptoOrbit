import TradePage from "./pages/TradePage";
import WalletPage from "./pages/WalletPage";
import HistoryPage from "./pages/HistoryPage";
import ProfilePage from "./pages/ProfilePage";
import BottomNav from "./components/layout/BottomNav";

{tab === "trade" && <TradePage />}
{tab === "wallet" && <WalletPage />}
{tab === "history" && (
  <HistoryPage
    user={user}
    hist={hist}
    winRate={winRate}
  />
)}
{tab === "profile" && (
  <ProfilePage
    user={user}
    doLogout={doLogout}
    fmtZAR={fmtZAR}
    winRate={winRate}
    xpPct={xpPct}
    xpInLvl={xpInLvl}
  />
)}

<BottomNav tab={tab} setTab={setTab} />
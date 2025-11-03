import { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { Transactions } from "./components/Transactions";
import { Reports } from "./components/Reports";
import { Settings } from "./components/Settings";
import { AuthScreen } from "./components/AuthScreen";
import { Toaster, toast } from "sonner";
import { ThemeProvider } from "./components/ThemeProvider";
import { getProfile } from "./utils/authService";

type View = "dashboard" | "transactions" | "reports" | "settings";

export default function App() {
 const [currentView, setCurrentView] = useState<View>('dashboard');
const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // 👈 null means "checking"
const [user, setUser] = useState<any>(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ✅ Check token on first load
useEffect(() => {
  const token = localStorage.getItem("token");
  console.log("TOKEN ON LOAD:", token);

  if (!token) {
    setIsAuthenticated(false);
    return;
  }

  getProfile()
    .then((data) => {
      setUser(data);
      setIsAuthenticated(true);
      localStorage.setItem("bizledger_user", JSON.stringify(data));
    })
    .catch(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("bizledger_user");
      setIsAuthenticated(false);
    });
}, []);


  // ✅ Handle login
  const handleLogin = (userData: any) => {
    if (!userData || !userData.token) {
      toast.error("Invalid login attempt");
      return;
    }

    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem("token", userData.token);
    localStorage.setItem("bizledger_user", JSON.stringify(userData));
  };

  // ✅ FIXED: handleLogout now removes token also
 const handleLogout = () => {
  setUser(null);
  setIsAuthenticated(false);

  localStorage.removeItem('bizledger_user');
  localStorage.removeItem('token'); // ✅ IMPORTANT

  setCurrentView('dashboard');
};


  if (isAuthenticated === null) {
  return (
    <ThemeProvider>
      <div className="flex items-center justify-center h-screen text-lg">
        Checking authentication...
      </div>
    </ThemeProvider>
  );
}

  // ✅ Loader screen to avoid flashing
  if (isAuthenticated === null) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  // ✅ If not authenticated → show login/signup page
  if (!isAuthenticated) {
    return (
      <ThemeProvider>
        <AuthScreen onLogin={handleLogin} />
        <Toaster />
      </ThemeProvider>
    );
  }

  // ✅ Authenticated → dashboard UI
  return (
    <ThemeProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <Sidebar
          currentView={currentView}
          onViewChange={setCurrentView}
          onLogout={handleLogout}
          user={user}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="flex-1 overflow-auto">
          {currentView === "dashboard" && <Dashboard user={user} />}
          {currentView === "transactions" && (
            <Transactions user={user} />
          )}
          {currentView === "reports" && <Reports user={user} />}
          {currentView === "settings" && (
            <Settings user={user} onLogout={handleLogout} />
          )}
        </main>
      </div>

      <Toaster />
    </ThemeProvider>
  );
}

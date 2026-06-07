import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";
import ReactionLab from "./pages/ReactionLab";
import CompoundExplorer from "./pages/CompoundExplorer";
import PeriodicTable from "./pages/PeriodicTable";
import StudyZone from "./pages/StudyZone";
import StudyGroups from "./pages/StudyGroups";
import DeviceHistory from "./pages/DeviceHistory";
import Notes from "./pages/Notes";
import Settings from "./pages/Settings";
import About from "./pages/About";
import Quiz from "./pages/Quiz";
import Suggestions from "./pages/Suggestions";
import Announcements from "./pages/Announcements";
import Collaboration from "./pages/Collaboration";
import Chat from "./pages/Chat";
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/reaction-lab" component={ReactionLab} />
      <Route path="/compound-explorer" component={CompoundExplorer} />
      <Route path="/periodic-table" component={PeriodicTable} />
      <Route path="/study-zone" component={StudyZone} />
      <Route path="/study-groups" component={StudyGroups} />
      <Route path="/device-history" component={DeviceHistory} />
      <Route path="/notes" component={Notes} />
      <Route path="/settings" component={Settings} />
      <Route path="/about" component={About} />
      <Route path="/quiz" component={Quiz} />
      <Route path="/suggestions" component={Suggestions} />
      <Route path="/announcements" component={Announcements} />
      <Route path="/collaboration" component={Collaboration} />
      <Route path="/chat" component={Chat} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <TooltipProvider>
          <Toaster />
          <DashboardLayout>
            <Router />
          </DashboardLayout>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

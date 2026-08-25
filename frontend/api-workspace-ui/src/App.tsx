import {
BrowserRouter,
Routes,
Route
}

from "react-router-dom";
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";
import Dashboard from "./pages/Dashboard/Dashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import WorkspacePage from "./pages/Workspace/WorkspacePage";
import { useEffect } from "react";
import { useAuthStore } from "./store/authStore";
import WorkspaceActivityPage from "./pages/Workspace/workspaceActivityPage";

export default function App(){
    const initialize =
    useAuthStore(
        state => state.initialize
    );
    useEffect(() => {
        initialize();
    }, []);
    return(
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={
                        <PublicRoute>
                            <Login/>
                        </PublicRoute>
                    }
                />

                <Route
                    path="/signup"
                    element={
                        <PublicRoute>
                            <Signup/>
                        </PublicRoute>
                    }
                />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/workspaces/:workspaceId"
                    element={
                        <ProtectedRoute>
                            <WorkspacePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/workspaces/:workspaceId/activity"
                    element={<WorkspaceActivityPage />}
                />
            </Routes>
        </BrowserRouter>
    );
}
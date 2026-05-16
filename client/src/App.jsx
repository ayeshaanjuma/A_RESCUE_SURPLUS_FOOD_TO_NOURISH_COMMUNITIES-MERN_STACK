import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
// We will create these pages next
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MapDirectory from './pages/MapDirectory';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen flex flex-col">
                    <Navbar />
                    <main className="flex-grow pt-16">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/dashboard" element={
                                <AuthContext.Consumer>
                                    {({ user, loading }) =>
                                        !loading && (user ? <Dashboard /> : <Navigate to="/login" />)
                                    }
                                </AuthContext.Consumer>
                            } />
                            <Route path="/map" element={<MapDirectory />} />
                        </Routes>
                    </main>
                    <Footer />
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div>
        <h1>Domestic Helper Booking App</h1>

        <Routes>
          <Route path="/" element={<h2>Home Page</h2>} />
          <Route path="/login" element={<h2>Login Page</h2>} />
          <Route path="/register" element={<h2>Register Page</h2>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
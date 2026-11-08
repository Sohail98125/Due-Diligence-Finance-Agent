import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import ProtectedRoute from './components/layout/ProtectedRoute';
import AuthLayout from './components/layout/AuthLayout';


function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route element={<AuthLayout />}>
            <Route path='/login' element={<Login />} />
            <Route path='*' element={<NotFound />} />
            <Route element={<ProtectedRoute />}>
              <Route path='/dashboard' element={<Dashboard />} />
              <Route path='/dashboard/reports/:jobId' element={<Dashboard />} />
            </Route>
          </Route>
          <Route path='*' element={<Navigate to="/" replace />}></Route>
        </Routes>
      </BrowserRouter >
    </>
  )
}

export default App

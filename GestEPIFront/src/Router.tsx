import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import EpiList from './pages/EpiList';
import EpiForm from './pages/EpiForm';
import ControleList from './pages/ControleList';
import ControleForm from './pages/ControleForm';
import Alerts from './pages/Alerts';

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rediriger /login vers la page d'accueil */}
        <Route path="/login" element={<Navigate to="/" replace />} />

        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="epis" element={<EpiList />} />
          <Route path="epis/new" element={<EpiForm />} />
          <Route path="epis/:id" element={<EpiForm />} />
          <Route path="controles" element={<ControleList />} />
          <Route path="controles/new" element={<ControleForm />} />
          <Route path="controles/:id" element={<ControleForm />} />
          <Route path="alerts" element={<Alerts />} />
        </Route>
        
        {/* Rediriger les chemins inconnus vers la page d'accueil */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;

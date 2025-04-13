import React from 'react';
import { Typography, Box, Paper, Button } from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import AssignmentIcon from '@mui/icons-material/Assignment';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Tableau de bord
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Box sx={{ flex: '1 1 300px' }}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              minHeight: 200,
              justifyContent: 'center',
              bgcolor: '#e3f2fd',
            }}
          >
            <InventoryIcon sx={{ fontSize: 60, color: '#1976d2', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Gestion des EPIs
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Ajoutez, consultez et modifiez les équipements de protection individuelle
            </Typography>
            <Button variant="contained" onClick={() => navigate('/epis')}>
              Accéder
            </Button>
          </Paper>
        </Box>

        <Box sx={{ flex: '1 1 300px' }}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              minHeight: 200,
              justifyContent: 'center',
              bgcolor: '#e8f5e9',
            }}
          >
            <AssignmentIcon sx={{ fontSize: 60, color: '#388e3c', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Contrôles
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Effectuez et consultez les contrôles de vos équipements
            </Typography>
            <Button 
              variant="contained" 
              color="success" 
              onClick={() => navigate('/controles')}
            >
              Accéder
            </Button>
          </Paper>
        </Box>

        <Box sx={{ flex: '1 1 300px' }}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              minHeight: 200,
              justifyContent: 'center',
              bgcolor: '#fff8e1',
            }}
          >
            <NotificationsActiveIcon sx={{ fontSize: 60, color: '#f57c00', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Alertes
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Consultez les contrôles à venir et les équipements à surveiller
            </Typography>
            <Button 
              variant="contained" 
              color="warning" 
              onClick={() => navigate('/alerts')}
            >
              Vérifier
            </Button>
          </Paper>
        </Box>
      </Box>

      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom color="primary">
          Bienvenue dans l'application GestEPI
        </Typography>
        <Typography variant="body1" paragraph>
          Cette application vous permet de gérer les Équipements de Protection Individuelle (EPI) utilisés par les cordistes
          dans le cadre de leurs activités. Vous pouvez enregistrer de nouveaux EPI, effectuer des contrôles périodiques,
          et suivre l'historique des vérifications.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Conformément à la réglementation, l'application vous aide à maintenir un suivi rigoureux de vos EPI
          et vous alerte lorsque des contrôles sont nécessaires.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Home;

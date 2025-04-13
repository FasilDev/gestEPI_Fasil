import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WarningIcon from '@mui/icons-material/Warning';
import { EPIDisplay, EPIType } from '../types';
import { epiService } from '../services/api';
import { format, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';

const Alerts = () => {
  const navigate = useNavigate();
  const [epis, setEpis] = useState<EPIDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [daysThreshold, setDaysThreshold] = useState<number>(30);

  useEffect(() => {
    fetchEpisNeedingControl();
  }, [daysThreshold]);

  const fetchEpisNeedingControl = async () => {
    try {
      setLoading(true);
      const response = await epiService.getNeedingControl(daysThreshold);
      
      if (response.data && response.data.success && response.data.data) {
        // Ajouter un log pour voir les données reçues
        console.log('Données brutes reçues de l\'API:', response.data.data);
        
        // Format the data for display
        const formattedData = response.data.data.map((epi: any) => {
          console.log(`Traitement de l'EPI ${epi.id} (${epi.marque} ${epi.modele}):`);
          console.log('- lastControlDate:', epi.lastControlDate);
          console.log('- dateMiseEnService:', epi.dateMiseEnService);
          console.log('- frequenceControle:', epi.frequenceControle);
          
          // Calculer la date du prochain contrôle
          let nextControlDate;
          let daysRemaining = 0;
          
          // Vérifier si la date du dernier contrôle est valide (pas un objet vide)
          const hasValidLastControlDate = epi.lastControlDate && 
            (typeof epi.lastControlDate === 'string' || 
            (typeof epi.lastControlDate === 'object' && Object.keys(epi.lastControlDate).length > 0));
          
          // Vérifier si la date de mise en service est valide
          const hasValidServiceDate = epi.dateMiseEnService && 
            (typeof epi.dateMiseEnService === 'string' || 
            (typeof epi.dateMiseEnService === 'object' && Object.keys(epi.dateMiseEnService).length > 0));
          
          if (hasValidLastControlDate) {
            // Si l'EPI a déjà été contrôlé, calculer la prochaine date de contrôle
            // en ajoutant la fréquence (en mois) à la dernière date de contrôle
            let dateStr = epi.lastControlDate;
            // Assurer le format YYYY-MM-DD pour la création de Date
            if (typeof dateStr === 'string' && !dateStr.includes('T') && dateStr.includes('-')) {
              dateStr = dateStr + 'T12:00:00Z'; // Ajouter le temps pour éviter les problèmes de fuseau horaire
            }
            
            const lastControlDateObj = new Date(dateStr);
            console.log('- Date du dernier contrôle (objet):', lastControlDateObj);
            console.log('- Date valide?', !isNaN(lastControlDateObj.getTime()));
            
            if (!isNaN(lastControlDateObj.getTime())) {
              nextControlDate = new Date(lastControlDateObj);
              nextControlDate.setMonth(nextControlDate.getMonth() + (epi.frequenceControle || 12));
              daysRemaining = differenceInDays(nextControlDate, new Date());
              console.log('- Prochain contrôle calculé:', nextControlDate);
              console.log('- Jours restants:', daysRemaining);
            }
          } else if (hasValidServiceDate) {
            // S'il n'y a pas eu de contrôle mais une date de mise en service
            let dateStr = epi.dateMiseEnService;
            // Assurer le format YYYY-MM-DD pour la création de Date
            if (typeof dateStr === 'string' && !dateStr.includes('T') && dateStr.includes('-')) {
              dateStr = dateStr + 'T12:00:00Z'; // Ajouter le temps pour éviter les problèmes de fuseau horaire
            }
            
            const dateMiseEnServiceObj = new Date(dateStr);
            console.log('- Date de mise en service (objet):', dateMiseEnServiceObj);
            console.log('- Date valide?', !isNaN(dateMiseEnServiceObj.getTime()));
            
            if (!isNaN(dateMiseEnServiceObj.getTime())) {
              nextControlDate = new Date(dateMiseEnServiceObj);
              nextControlDate.setMonth(nextControlDate.getMonth() + (epi.frequenceControle || 12));
              daysRemaining = differenceInDays(nextControlDate, new Date());
              console.log('- Prochain contrôle calculé:', nextControlDate);
              console.log('- Jours restants:', daysRemaining);
            }
          } else {
            // Si aucune date valide n'est trouvée, utiliser la date actuelle comme base
            console.log('- Aucune date valide trouvée, utilisation de la date actuelle');
            nextControlDate = new Date();
            daysRemaining = 0; // Contrôle immédiat requis
          }
          
          // Formater la date de prochain contrôle pour l'affichage
          const prochainControle = nextControlDate && !isNaN(nextControlDate.getTime()) 
            ? nextControlDate.toISOString().split('T')[0]
            : null;
          
          console.log('- Date du prochain contrôle formatée:', prochainControle);
          
          return {
            ...epi,
            prochainControle,
            jourRestants: epi.daysRemaining !== undefined ? epi.daysRemaining : daysRemaining,
            lastControlDate: hasValidLastControlDate ? epi.lastControlDate : null,
            statut: (epi.daysRemaining !== undefined && epi.daysRemaining <= 0) || daysRemaining <= 0 ? 'En retard' : 'À faire bientôt'
          };
        });
        
        console.log('Données formatées pour affichage:', formattedData);
        setEpis(formattedData);
      } else {
        setError('Échec du chargement des données');
      }
    } catch (err) {
      setError('Erreur lors de la récupération des alertes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateControl = (epiId: number | undefined) => {
    if (epiId) {
      navigate(`/controles/new?epiId=${epiId}`);
    }
  };

  const formatDate = (dateString: string | Date | null | undefined) => {
    if (!dateString) return '-';
    
    // Si c'est un objet vide, retourner "-"
    if (typeof dateString === 'object' && Object.keys(dateString).length === 0) {
      return '-';
    }
    
    try {
      // Si la date est au format ISO (YYYY-MM-DD)
      if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
      }
      
      // Sinon essayer de créer un objet Date
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Date invalide';
      }
      return format(date, 'dd/MM/yyyy', { locale: fr });
    } catch (e) {
      console.error('Erreur formatage date:', e);
      return 'Date invalide';
    }
  };

  const getAlertSeverity = (daysRemaining: number) => {
    if (daysRemaining <= 0) return 'error';
    if (daysRemaining <= 7) return 'warning';
    if (daysRemaining <= 15) return 'info';
    return 'success';
  };

  const handleDaysThresholdChange = (event: any) => {
    setDaysThreshold(event.target.value);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/')}
            sx={{ mb: 1 }}
          >
            Retour
          </Button>
          <Typography variant="h4">Alertes de contrôle</Typography>
        </Box>
        
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="threshold-select-label">Période d'alerte</InputLabel>
          <Select
            labelId="threshold-select-label"
            value={daysThreshold}
            label="Période d'alerte"
            onChange={handleDaysThresholdChange}
          >
            <MenuItem value={7}>7 prochains jours</MenuItem>
            <MenuItem value={15}>15 prochains jours</MenuItem>
            <MenuItem value={30}>30 prochains jours</MenuItem>
            <MenuItem value={60}>60 prochains jours</MenuItem>
            <MenuItem value={90}>90 prochains jours</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Paper elevation={3} sx={{ p: 3, mb: 4, bgcolor: '#fff8e1', borderLeft: '4px solid #f57c00' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <WarningIcon color="warning" fontSize="large" />
          <Box>
            <Typography variant="h6" color="warning.dark">
              Équipements nécessitant un contrôle
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cette page affiche les EPI qui nécessitent un contrôle dans les {daysThreshold} prochains jours.
            </Typography>
          </Box>
        </Box>
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : epis.length === 0 ? (
        <Alert severity="info">
          Aucun EPI ne nécessite de contrôle dans les {daysThreshold} prochains jours.
        </Alert>
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Identifiant</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Marque / Modèle</TableCell>
                  <TableCell>Dernier contrôle</TableCell>
                  <TableCell>Prochain contrôle</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {epis.map((epi) => (
                  <TableRow key={epi.id} sx={{ 
                    bgcolor: epi.jourRestants && epi.jourRestants <= 0 ? 'error.lighter' : 
                             epi.jourRestants && epi.jourRestants <= 7 ? 'warning.lighter' : 
                             'inherit' 
                  }}>
                    <TableCell>{epi.identifiant || `EPI-${epi.id}`}</TableCell>
                    <TableCell>
                      <Chip 
                        label={epi.type} 
                        color={
                          epi.type === EPIType.CASQUE ? 'primary' :
                          epi.type === EPIType.CORDE ? 'secondary' :
                          epi.type === EPIType.BAUDRIER ? 'success' :
                          'default'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{`${epi.marque} ${epi.modele}`}</TableCell>
                    <TableCell>{formatDate(epi.lastControlDate) || 'Jamais contrôlé'}</TableCell>
                    <TableCell>{formatDate(epi.prochainControle)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={
                          (epi.jourRestants !== undefined && epi.jourRestants <= 0)
                            ? `Contrôle immédiat` 
                            : `${epi.jourRestants || 0} jours restants`
                        }
                        color={getAlertSeverity(epi.jourRestants || 0)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Créer un contrôle">
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<AssignmentIcon />}
                          onClick={() => handleCreateControl(epi.id)}
                        >
                          Contrôler
                        </Button>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
};

export default Alerts; 
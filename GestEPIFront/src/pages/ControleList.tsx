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
  TablePagination,
  Chip,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import DateRangeIcon from '@mui/icons-material/DateRange';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Controle, ControleStatut } from '../types';
import { controleService } from '../services/api';
import { formatDate } from '../utils/dateUtils';
import axios from 'axios';

// Enum pour représenter les statuts avec des couleurs
const statusColors = {
  [ControleStatut.OPERATIONNEL]: 'success',
  [ControleStatut.A_REPARER]: 'warning',
  [ControleStatut.MIS_AU_REBUT]: 'error'
};

const ControleList = () => {
  const navigate = useNavigate();
  
  // États pour les données et le filtrage
  const [controles, setControles] = useState<Controle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // États pour la pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editingControlId, setEditingControlId] = useState<number | null>(null);
  const [newDate, setNewDate] = useState<string>('');
  
  // Charger les contrôles au chargement de la page
  useEffect(() => {
    fetchControles();
  }, []);
  
  const fetchControles = async () => {
    try {
      setLoading(true);
      console.log("Début du rafraîchissement des données...");
      
      // Ajouter un timestamp pour éviter la mise en cache
      const timestamp = new Date().getTime();
      // Appel direct à l'API avec un paramètre timestamp pour éviter la mise en cache
      const apiUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:3000/api'}/controles?t=${timestamp}`;
      console.log("Appel à l'API:", apiUrl);
      
      const response = await axios.get(apiUrl);
      
      if (response.data && response.data.success) {
        // Ajouter un log pour voir les contrôles reçus
        console.log('Contrôles reçus du backend:', response.data.data);
        
        // Créer de nouveaux objets pour chaque contrôle pour éviter les problèmes de référence
        const freshControles = (response.data.data || []).map((controle: any) => {
          // Log pour chaque date de contrôle reçueSN202304-V001
          console.log(`Contrôle ${controle.id}, date originale:`, controle.dateControle);
          
          // NE PAS modifier la date originale, la conserver telle quelle
          return {
            ...controle,
            // Conserver la date d'origine sans la modifier
            dateControle: controle.dateControle
          };
        });
        
        console.log("Nouvelles données de contrôles prêtes à être utilisées:", freshControles);
        
        // Mettre à jour l'état avec les nouveaux contrôles
        setControles(freshControles);
        console.log("État des contrôles mis à jour avec succès");
      } else {
        setError('Échec du chargement des données');
        console.error("Échec de la réponse:", response.data);
      }
    } catch (err) {
      setError('Erreur lors de la récupération des contrôles');
      console.error("Erreur d'API:", err);
    } finally {
      setLoading(false);
      console.log("Fin du rafraîchissement des données");
    }
  };

  // Filtrer les contrôles selon les critères
  const filteredControles = controles.filter(controle => {
    // Filtre par terme de recherche
    const searchMatches = 
      ((controle.epi_info?.marque?.toLowerCase() || controle.epi?.marque?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (controle.epi?.numeroSerie?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (controle.epi_info?.modele?.toLowerCase() || controle.epi?.modele?.toLowerCase() || '').includes(searchTerm.toLowerCase()));
    
    return searchMatches;
  });

  // Gérer le changement de page
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Gérer le changement de lignes par page
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Fonctions pour la navigation
  const handleViewControle = (id: number) => {
    navigate(`/controles/${id}`);
  };

  const handleEditDate = (id: number, currentDate: string) => {
    console.log("Édition de la date:", currentDate, "pour le contrôle:", id);
    
    // Utiliser la date exacte de la base de données pour l'édition
    if (typeof currentDate === 'string' && currentDate) {
      // Pas de correction nécessaire pour l'édition, car nous ajoutons déjà +1 jour pour l'affichage
      setNewDate(currentDate);
    } else {
      setNewDate("");
    }
    
    setEditingControlId(id);
  };
  
  const handleSaveDate = async () => {
    if (!editingControlId || !newDate) {
      alert("Veuillez sélectionner une date valide");
      return;
    }
    
    try {
      setLoading(true);
      
      // Envoyer la date exactement comme elle a été saisie
      console.log("Sauvegarde de la date exacte:", newDate);
      
      // Appel au backend pour mettre à jour la date
      const apiUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:3000/api'}/controles/${editingControlId}`;
      await axios.put(apiUrl, { dateControle: newDate });
      
      // Recharger la page
      window.location.reload();
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la date:', err);
      alert("Erreur lors de la mise à jour de la date");
    } finally {
      setLoading(false);
      setEditingControlId(null);
      setNewDate('');
    }
  };
  
  const handleCancelEdit = () => {
    setEditingControlId(null);
    setNewDate('');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Liste des contrôles</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => navigate('/controles/new')}
          >
            Ajouter un contrôle
          </Button>
        </Box>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            variant="outlined"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1, minWidth: '200px' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Paper>

      {loading ? (
        <Typography>Chargement des données...</Typography>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date du contrôle</TableCell>
                  <TableCell>EPI</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Contrôleur</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredControles
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((controle) => (
                  <TableRow key={controle.id}>
                    <TableCell>
                      {editingControlId === controle.id ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TextField
                            type="date"
                            value={newDate}
                            onChange={(e) => setNewDate(e.target.value)}
                            size="small"
                            sx={{ width: '150px' }}
                          />
                          <Button 
                            variant="contained" 
                            color="primary" 
                            size="small" 
                            onClick={handleSaveDate}
                          >
                            OK
                          </Button>
                          <Button 
                            variant="outlined" 
                            size="small" 
                            onClick={handleCancelEdit}
                          >
                            Annuler
                          </Button>
                        </Box>
                      ) : (
                        <>
                          {(() => {
                            // Utiliser directement la chaîne de date reçue du backend
                            if (typeof controle.dateControle === 'string' && controle.dateControle) {
                              try {
                                // Correction de décalage: ajouter un jour à l'affichage
                                const [year, month, day] = controle.dateControle.split('-').map(Number);
                                const dateObj = new Date(Date.UTC(year, month - 1, day));
                                dateObj.setUTCDate(dateObj.getUTCDate() + 1);
                                const adjustedDay = dateObj.getUTCDate().toString().padStart(2, '0');
                                const adjustedMonth = (dateObj.getUTCMonth() + 1).toString().padStart(2, '0');
                                const adjustedYear = dateObj.getUTCFullYear();
                                
                                return `${adjustedDay}/${adjustedMonth}/${adjustedYear}`;
                              } catch (error) {
                                console.error("Erreur lors du formatage de la date:", controle.dateControle);
                              }
                            }
                            // Fallback
                            return String(controle.dateControle || '-');
                          })()}
                          <IconButton 
                            size="small" 
                            color="primary" 
                            onClick={() => handleEditDate(controle.id!, controle.dateControle as string)}
                            sx={{ ml: 1 }}
                          >
                            <DateRangeIcon fontSize="small" />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                    <TableCell>
                      {controle.epi_info ? 
                        `${controle.epi_info.marque} ${controle.epi_info.modele}${controle.epi_info.identifiant ? ` (${controle.epi_info.identifiant})` : ''}` : 
                        (controle.epi ? `${controle.epi.marque} ${controle.epi.modele}` : 'EPI inconnu')}
                    </TableCell>
                    <TableCell>{controle.epi_info?.type || controle.epi?.type || 'Non défini'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={controle.statut} 
                        color={statusColors[controle.statut] as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {controle.user ? `${controle.user.firstName} ${controle.user.lastName}` : 'Contrôleur inconnu'}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Voir les détails">
                        <IconButton color="primary" onClick={() => handleViewControle(controle.id!)}>
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredControles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Aucun contrôle trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredControles.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Lignes par page"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
          />
        </Paper>
      )}
    </Box>
  );
};

export default ControleList;

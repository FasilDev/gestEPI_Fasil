import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  TablePagination,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { EPI, EPIType } from '../types';
import { epiService } from '../services/api';
import { formatDate } from '../utils/dateUtils';

const EpiList = () => {
  const navigate = useNavigate();
  const [epis, setEpis] = useState<EPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchEpis();
  }, []);

  const fetchEpis = async () => {
    try {
      setLoading(true);
      const response = await epiService.getAll();
      if (response.data && response.data.success) {
        setEpis(response.data.data || []);
      } else {
        setError('Échec du chargement des données');
      }
    } catch (err) {
      setError('Erreur lors de la récupération des EPI');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEdit = (id: number | undefined) => {
    if (id) {
      navigate(`/epis/${id}`);
    }
  };

  const handleDelete = async (id: number | undefined) => {
    if (!id) return;
    
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet EPI ?')) {
      try {
        const response = await epiService.delete(id);
        if (response.data && response.data.success) {
          // Rafraîchir la liste après suppression
          fetchEpis();
        } else {
          setError('Échec de la suppression');
        }
      } catch (err) {
        setError('Erreur lors de la suppression');
        console.error(err);
      }
    }
  };

  const filteredEpis = epis.filter(epi => 
    epi.identifiant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    epi.marque.toLowerCase().includes(searchTerm.toLowerCase()) ||
    epi.modele.toLowerCase().includes(searchTerm.toLowerCase()) ||
    epi.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Liste des EPI</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => navigate('/epis/new')}
          >
            Ajouter un EPI
          </Button>
        </Box>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Rechercher un EPI..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
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
                  <TableCell>Identifiant</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Marque / Modèle</TableCell>
                  <TableCell>N° de série</TableCell>
                  <TableCell>Mise en service</TableCell>
                  <TableCell>Fréquence contrôle</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEpis
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((epi) => (
                  <TableRow key={epi.id}>
                    <TableCell>{epi.identifiant}</TableCell>
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
                    <TableCell>{epi.numeroSerie}</TableCell>
                    <TableCell>
                      {(() => {
                        console.log('dateMiseEnService raw value:', epi.dateMiseEnService);
                        return formatDate(epi.dateMiseEnService);
                      })()}
                    </TableCell>
                    <TableCell>{`${epi.frequenceControle} mois`}</TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleEdit(epi.id)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(epi.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredEpis.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Aucun EPI trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredEpis.length}
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

export default EpiList;

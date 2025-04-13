import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  FormHelperText,
  Alert,
  Snackbar,
  CircularProgress,
  Autocomplete
} from '@mui/material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Controle, ControleStatut, EPI } from '../types';
import { controleService, epiService } from '../services/api';
import { formatDate } from '../utils/dateUtils';

const ControleForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const preselectedEpiId = queryParams.get('epiId');
  
  const isEditMode = Boolean(id);
  // User fixe pour remplacer l'authentification
  const user = { id: 1, firstName: 'Admin', lastName: 'User' };

  // État du formulaire
  const [controle, setControle] = useState<Controle>({
    epiId: preselectedEpiId ? parseInt(preselectedEpiId) : 0,
    userId: 1, // Utiliser 1 comme ID fixe pour le développement
    dateControle: new Date().toISOString().split('T')[0], // Format YYYY-MM-DD
    statut: ControleStatut.OPERATIONNEL
  });

  // État pour les EPIs disponibles
  const [epis, setEpis] = useState<EPI[]>([]);
  const [selectedEpi, setSelectedEpi] = useState<EPI | null>(null);

  // États pour la gestion des erreurs et du chargement
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  // Charger les EPIs disponibles et les données du contrôle si en mode édition
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        
        // Charger la liste des EPIs
        const episResponse = await epiService.getAll();
        if (episResponse.data && episResponse.data.success && episResponse.data.data) {
          setEpis(episResponse.data.data || []);
          
          // Si un EPI est présélectionné via l'URL
          if (preselectedEpiId && !isEditMode) {
            const epiId = parseInt(preselectedEpiId);
            const preselectedEpi = episResponse.data.data.find(e => e.id === epiId);
            if (preselectedEpi) {
              setSelectedEpi(preselectedEpi);
              setControle(prev => ({ ...prev, epiId }));
            }
          }
          
          // Si en mode édition, charger les données du contrôle
          if (isEditMode && id) {
            const controleResponse = await controleService.getById(id);
            if (controleResponse.data && controleResponse.data.success && controleResponse.data.data) {
              const controleData = controleResponse.data.data;
              // Vérification que controleData n'est pas undefined
              if (controleData) {
                setControle(controleData);
                
                // Trouver l'EPI associé
                if (controleData.epiId && episResponse.data && episResponse.data.data) {
                  const epi = episResponse.data.data.find(e => e.id === controleData.epiId);
                  if (epi) {
                    setSelectedEpi(epi);
                  }
                }
              }
            } else {
              setError('Impossible de charger les données du contrôle');
            }
          }
        }
      } catch (err) {
        setError('Erreur lors du chargement des données');
        console.error(err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [id, isEditMode, preselectedEpiId]);

  // Fonction pour mettre à jour l'état du formulaire
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    
    // Traitement spécial pour les champs de date
    if (name === 'dateControle') {
      // Assurer que la valeur est au format YYYY-MM-DD pour les champs de type date
      let formattedValue = value;
      
      if (value) {
        try {
          // Si la valeur est une date valide, la formater en YYYY-MM-DD
          const dateObj = new Date(value);
          if (!isNaN(dateObj.getTime())) {
            formattedValue = dateObj.toISOString().split('T')[0];
          }
        } catch (error) {
          console.error('Erreur lors du formatage de la date:', error);
        }
      }
      
      setControle(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } else {
      // Traitement normal pour les autres champs
      setControle(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Effacer l'erreur pour ce champ
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Fonction pour gérer la sélection d'un EPI
  const handleEpiChange = (epi: EPI | null) => {
    setSelectedEpi(epi);
    if (epi) {
      setControle(prev => ({ ...prev, epiId: epi.id || 0 }));
      // Effacer l'erreur pour ce champ
      if (formErrors.epiId) {
        setFormErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.epiId;
          return newErrors;
        });
      }
    } else {
      setControle(prev => ({ ...prev, epiId: 0 }));
    }
  };

  // Fonction de validation du formulaire
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Champs obligatoires
    if (!controle.epiId) errors.epiId = 'Veuillez sélectionner un EPI';
    if (!controle.dateControle) errors.dateControle = 'La date de contrôle est obligatoire';
    if (!controle.statut) errors.statut = 'Le statut est obligatoire';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Fonction de soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError(null);
      
      // Préparer les données du formulaire avec le bon format de date et userId fixe
      const formattedControle = { 
        ...controle,
        userId: 1, // S'assurer que l'ID utilisateur est toujours défini à 1
      };
      
      // S'assurer que la date est au bon format (YYYY-MM-DD)
      try {
        // Ne remplacer la date que si elle est vraiment vide ou invalide
        if (!formattedControle.dateControle) {
          // Si la date est vide, utiliser la date actuelle
          formattedControle.dateControle = new Date().toISOString().split('T')[0];
        } else if (typeof formattedControle.dateControle === 'object') {
          // Si la date est un objet Date, la formater
          if (formattedControle.dateControle instanceof Date && !isNaN(formattedControle.dateControle.getTime())) {
            formattedControle.dateControle = formattedControle.dateControle.toISOString().split('T')[0];
          } else {
            // Si c'est un objet vide ou invalide, utiliser la date actuelle
            formattedControle.dateControle = new Date().toISOString().split('T')[0];
          }
        } else if (typeof formattedControle.dateControle === 'string') {
          // Vérifier si la chaîne de date est valide
          const testDate = new Date(formattedControle.dateControle);
          if (isNaN(testDate.getTime())) {
            // Si la date est invalide, utiliser la date actuelle
            formattedControle.dateControle = new Date().toISOString().split('T')[0];
          } else if (!/^\d{4}-\d{2}-\d{2}$/.test(formattedControle.dateControle)) {
            // Assurer le format YYYY-MM-DD si ce n'est pas déjà le cas
            formattedControle.dateControle = testDate.toISOString().split('T')[0];
          }
          // Si la date est déjà au bon format, la garder telle quelle
        }
        
        console.log('Date de contrôle envoyée au serveur:', formattedControle.dateControle);
      } catch (dateError: any) {
        console.error('Erreur lors du formatage de la date:', dateError);
        formattedControle.dateControle = new Date().toISOString().split('T')[0];
      }
      
      // Logs de débogage
      console.log('Données de contrôle à envoyer:', formattedControle);
      
      if (isEditMode && id) {
        const response = await controleService.update(id, formattedControle);
        if (response.data && response.data.success) {
          setSuccess(true);
          setTimeout(() => {
            navigate('/controles');
          }, 1500);
        } else {
          setError(response.data?.error || 'Erreur lors de la modification du contrôle');
        }
      } else {
        try {
          const response = await controleService.create(formattedControle);
          if (response.data && response.data.success) {
            setSuccess(true);
            setTimeout(() => {
              navigate('/controles');
            }, 1500);
          } else {
            setError(response.data?.error || 'Erreur lors de la création du contrôle');
          }
        } catch (apiError: any) {
          console.error('Détails de l\'erreur API:', apiError);
          console.error('Corps de la réponse:', apiError.response?.data);
          setError(apiError.response?.data?.error || 'Erreur lors de la communication avec le serveur');
        }
      }
    } catch (err: any) {
      console.error('Erreur lors de l\'enregistrement du contrôle:', err);
      // Extraire le message d'erreur de la réponse de l'API si disponible
      setError(err.response?.data?.error || 'Erreur lors de l\'enregistrement du contrôle');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/controles');
  };

  if (loadingData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {isEditMode ? 'Modifier un contrôle' : 'Nouveau contrôle d\'EPI'}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            {/* Sélection de l'EPI */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Informations sur l'EPI
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Autocomplete
                options={epis}
                getOptionLabel={(option) => `${option.marque} ${option.modele} (${option.type})`}
                value={selectedEpi}
                onChange={(event, newValue) => handleEpiChange(newValue)}
                isOptionEqualToValue={(option, value) => 
                  option.id === value.id || 
                  (option.marque === value.marque && option.modele === value.modele)
                }
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Sélectionner un EPI" 
                    required
                    error={!!formErrors.epiId}
                    helperText={formErrors.epiId}
                  />
                )}
                disabled={loading || isEditMode}
              />
            </Grid>
            
            {selectedEpi && (
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Détails de l'EPI
                  </Typography>
                  <Typography variant="body2">
                    <strong>Marque:</strong> {selectedEpi.marque}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Modèle:</strong> {selectedEpi.modele}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Type:</strong> {selectedEpi.type}
                  </Typography>
                  {selectedEpi.numeroSerie && (
                    <Typography variant="body2">
                      <strong>N° de série:</strong> {selectedEpi.numeroSerie}
                    </Typography>
                  )}
                  {selectedEpi.dateMiseEnService && (
                    <Typography variant="body2">
                      <strong>Date de mise en service:</strong> {formatDate(selectedEpi.dateMiseEnService)}
                    </Typography>
                  )}
                </Paper>
              </Grid>
            )}
            
            {/* Informations sur le contrôle */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Informations sur le contrôle
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Date de contrôle"
                name="dateControle"
                type="date"
                value={typeof controle.dateControle === 'string' 
                  ? controle.dateControle 
                  : (controle.dateControle instanceof Date && !isNaN(controle.dateControle.getTime()))
                    ? controle.dateControle.toISOString().split('T')[0]
                    : new Date().toISOString().split('T')[0]}
                onChange={handleChange}
                error={!!formErrors.dateControle}
                helperText={formErrors.dateControle}
                InputLabelProps={{ shrink: true }}
                disabled={loading}
                inputProps={{
                  onInvalid: (e) => {
                    console.log("Valeur invalide:", controle.dateControle, "Type:", typeof controle.dateControle);
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl required fullWidth error={!!formErrors.statut}>
                <InputLabel>Statut</InputLabel>
                <Select
                  name="statut"
                  value={controle.statut}
                  onChange={handleChange}
                  label="Statut"
                  disabled={loading}
                >
                  <MenuItem value={ControleStatut.OPERATIONNEL}>Opérationnel</MenuItem>
                  <MenuItem value={ControleStatut.A_REPARER}>À réparer</MenuItem>
                  <MenuItem value={ControleStatut.MIS_AU_REBUT}>Mis au rebut</MenuItem>
                </Select>
                {formErrors.statut && <FormHelperText>{formErrors.statut}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Commentaire"
                name="commentaire"
                value={controle.commentaire || ''}
                onChange={handleChange}
                multiline
                rows={4}
                disabled={loading}
              />
            </Grid>
            
            {/* Boutons */}
            <Grid item xs={12} sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {isEditMode ? 'Enregistrer les modifications' : 'Enregistrer le contrôle'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      
      {/* Notification de succès */}
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess(false)} severity="success">
          {isEditMode 
            ? 'Contrôle modifié avec succès !' 
            : 'Contrôle enregistré avec succès !'}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ControleForm;

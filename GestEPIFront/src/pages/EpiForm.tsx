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
  CircularProgress
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { fr } from 'date-fns/locale';
import { format, parse } from 'date-fns';
import { EPIType, EPI } from '../types';
import { epiService } from '../services/api';

// Liste des types d'EPI pour le menu déroulant
const epiTypes = Object.values(EPIType);

const EpiForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  // État du formulaire
  const [epi, setEpi] = useState<EPI>({
    marque: '',
    modele: '',
    type: EPIType.CORDE,
    dateMiseEnService: new Date().toISOString().split('T')[0],
    frequenceControle: 6
  });

  // États pour la gestion des erreurs et du chargement
  const [loading, setLoading] = useState(false);
  const [loadingEpi, setLoadingEpi] = useState(isEditMode);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  // Charger les données de l'EPI si on est en mode édition
  useEffect(() => {
    const fetchEpi = async () => {
      if (isEditMode && id) {
        try {
          setLoadingEpi(true);
          const response = await epiService.getById(id);
          if (response.data && response.data.success && response.data.data) {
            setEpi(response.data.data as EPI);
          } else {
            setError('Impossible de charger les données de l\'EPI');
          }
        } catch (err) {
          setError('Erreur lors de la récupération de l\'EPI');
          console.error(err);
        } finally {
          setLoadingEpi(false);
        }
      }
    };

    fetchEpi();
  }, [id, isEditMode]);

  // Fonction pour mettre à jour les champs de formulaire
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setEpi(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur pour ce champ
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Fonction pour mettre à jour les dates
  const handleDateChange = (fieldName: string) => (date: Date | null) => {
    if (date) {
      // S'assurer que la date est valide avant de la formatter
      if (!isNaN(date.getTime())) {
        setEpi(prev => ({ 
          ...prev, 
          [fieldName]: format(date, 'yyyy-MM-dd') 
        }));
      } else {
        console.error(`Date invalide pour ${fieldName}:`, date);
        // Utiliser la date actuelle comme fallback
        setEpi(prev => ({ 
          ...prev, 
          [fieldName]: format(new Date(), 'yyyy-MM-dd') 
        }));
      }
      
      // Effacer l'erreur pour ce champ
      if (formErrors[fieldName]) {
        setFormErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
      }
    } else if (fieldName === 'dateMiseEnService') {
      // Si la date de mise en service est vidée, mettre la date du jour
      setEpi(prev => ({ 
        ...prev, 
        [fieldName]: format(new Date(), 'yyyy-MM-dd') 
      }));
    } else {
      // Pour les autres dates, les mettre à null si vides
      setEpi(prev => ({ 
        ...prev, 
        [fieldName]: null
      }));
    }
  };

  // Fonction de validation du formulaire
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Champs obligatoires
    if (!epi.marque) errors.marque = 'La marque est obligatoire';
    if (!epi.modele) errors.modele = 'Le modèle est obligatoire';
    if (!epi.type) errors.type = 'Le type est obligatoire';
    if (!epi.dateMiseEnService) errors.dateMiseEnService = 'La date de mise en service est obligatoire';
    if (!epi.frequenceControle) errors.frequenceControle = 'La fréquence de contrôle est obligatoire';

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

      // Préparation des données avec dates formatées
      const formattedEpi = { ...epi };
      
      // S'assurer que la date de mise en service existe et est valide
      if (!formattedEpi.dateMiseEnService) {
        formattedEpi.dateMiseEnService = format(new Date(), 'yyyy-MM-dd');
      }
      
      // Valider toutes les dates
      try {
        if (formattedEpi.dateAchat) {
          const dateAchat = parse(formattedEpi.dateAchat.toString(), 'yyyy-MM-dd', new Date());
          formattedEpi.dateAchat = format(dateAchat, 'yyyy-MM-dd');
        }
        
        if (formattedEpi.dateFabrication) {
          const dateFabrication = parse(formattedEpi.dateFabrication.toString(), 'yyyy-MM-dd', new Date());
          formattedEpi.dateFabrication = format(dateFabrication, 'yyyy-MM-dd');
        }
        
        const dateMiseEnService = parse(formattedEpi.dateMiseEnService.toString(), 'yyyy-MM-dd', new Date());
        formattedEpi.dateMiseEnService = format(dateMiseEnService, 'yyyy-MM-dd');
      } catch (error) {
        console.error('Erreur lors du formatage des dates:', error);
        setError('Format de date invalide');
        setLoading(false);
        return;
      }
      
      if (isEditMode && id) {
        const response = await epiService.update(id, formattedEpi);
        if (response.data && response.data.success) {
          setSuccess(true);
          setTimeout(() => {
            navigate('/epis');
          }, 1500);
        } else {
          setError(response.data?.error || 'Erreur lors de la modification de l\'EPI');
        }
      } else {
        const response = await epiService.create(formattedEpi);
        if (response.data && response.data.success) {
          setSuccess(true);
          setTimeout(() => {
            navigate('/epis');
          }, 1500);
        } else {
          setError(response.data?.error || 'Erreur lors de la création de l\'EPI');
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Erreur lors de l\'enregistrement de l\'EPI');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/epis');
  };

  if (loadingEpi) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  // Convertir les dates de chaîne ISO à objet Date pour les pickers
  const getDateValue = (dateString: string | Date | undefined) => {
    if (!dateString) return null;
    if (dateString instanceof Date) return dateString;
    try {
      return parse(dateString.toString(), 'yyyy-MM-dd', new Date());
    } catch (e) {
      return null;
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {isEditMode ? 'Modifier un EPI' : 'Ajouter un nouvel EPI'}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            {/* Informations générales */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Informations générales
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Marque"
                name="marque"
                value={epi.marque}
                onChange={handleChange}
                error={!!formErrors.marque}
                helperText={formErrors.marque}
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Modèle"
                name="modele"
                value={epi.modele}
                onChange={handleChange}
                error={!!formErrors.modele}
                helperText={formErrors.modele}
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl required fullWidth error={!!formErrors.type}>
                <InputLabel>Type d'EPI</InputLabel>
                <Select
                  name="type"
                  value={epi.type}
                  onChange={handleChange}
                  label="Type d'EPI"
                  disabled={loading}
                >
                  {epiTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.type && <FormHelperText>{formErrors.type}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Numéro de série"
                name="numeroSerie"
                value={epi.numeroSerie || ''}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Identifiant unique"
                name="identifiant"
                value={epi.identifiant || ''}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Fréquence de contrôle (mois)"
                name="frequenceControle"
                type="number"
                value={epi.frequenceControle}
                onChange={handleChange}
                error={!!formErrors.frequenceControle}
                helperText={formErrors.frequenceControle}
                inputProps={{ min: 1 }}
                disabled={loading}
              />
            </Grid>
            
            {/* Caractéristiques spécifiques */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Caractéristiques spécifiques
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Taille"
                name="taille"
                value={epi.taille || ''}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Couleur"
                name="couleur"
                value={epi.couleur || ''}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            
            {/* Dates */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Dates
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date d'achat"
                  value={getDateValue(epi.dateAchat)}
                  onChange={(date) => {
                    if (date) handleDateChange('dateAchat')(date);
                  }}
                  renderInput={(params) => <TextField {...params} fullWidth disabled={loading} />}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date de fabrication"
                  value={getDateValue(epi.dateFabrication)}
                  onChange={(date) => {
                    if (date) handleDateChange('dateFabrication')(date);
                  }}
                  renderInput={(params) => <TextField {...params} fullWidth disabled={loading} />}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date de mise en service *"
                  value={getDateValue(epi.dateMiseEnService)}
                  onChange={(date) => {
                    if (date) handleDateChange('dateMiseEnService')(date);
                  }}
                  renderInput={(params) => <TextField {...params} fullWidth disabled={loading} />}
                />
              </LocalizationProvider>
              {formErrors.dateMiseEnService && (
                <FormHelperText error>{formErrors.dateMiseEnService}</FormHelperText>
              )}
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
                {isEditMode ? 'Enregistrer les modifications' : 'Ajouter l\'EPI'}
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
            ? 'EPI modifié avec succès !' 
            : 'Nouvel EPI ajouté avec succès !'}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EpiForm;

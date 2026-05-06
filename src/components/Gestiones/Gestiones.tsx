import * as React from 'react';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { Typography } from '@mui/material';
import GenericCard from '../GenericCard/GenericCard';
import { DataService } from '../../services/dataService';
import { useAuth } from '../../context/AuthContext';
import { useDialog } from '../../context/DialogContext';
import { useTranslation } from '../../context/TranslationContext';
import Loading from '../Loading/Loading';
import AddIcon from '@mui/icons-material/Add';
import AddEditDialogContent from '../AddEditDialog/AddEditDialogContent';
import './Gestiones.scss';

export default function Gestiones() {
  const [gestionesData, setGestionesData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { isAuthenticated } = useAuth();
  const { openDialog, closeDialog } = useDialog();
  const { t } = useTranslation();

  React.useEffect(() => {
    async function loadData() {
      try {
        const data = await DataService.getServiceData();
        setGestionesData(data);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error al cargar datos';
        alert(errorMessage);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm('¿Estás seguro de eliminar este elemento?')) return;
    
    try {
      await DataService.deleteCard(id);
      const updatedData = await DataService.getServiceData();
      setGestionesData(updatedData);
    } catch (error) {
      alert('Error al eliminar: ' + (error as Error).message);
    }
  };

  const handleEdit = (item: any) => {
    openDialog({
      title: 'Editar Gestión',
      icon: 'Edit',
      content: (
        <AddEditDialogContent
          onSave={async (data) => {
            try {
              const itemId = item.id;
              await DataService.updateCard(String(itemId), data);
              const updatedData = await DataService.getServiceData();
              setGestionesData(updatedData);
              closeDialog();
            } catch (error) {
              throw error;
            }
          }}
          contentType="service"
          initialData={item}
          mode="edit"
        />
      ),
      maxWidth: 'md',
      fullWidth: true
    });
  };

  const handleAdd = () => {
    openDialog({
      title: 'Agregar Gestión',
      icon: 'Add',
      content: (
        <AddEditDialogContent
          onSave={async (data) => {
            try {
              await DataService.createCard({ ...data, variant: 'service' });
              const updatedData = await DataService.getServiceData();
              setGestionesData(updatedData);
              closeDialog();
            } catch (error) {
              throw error;
            }
          }}
          contentType="service"
          mode="add"
        />
      ),
      maxWidth: 'md',
      fullWidth: true
    });
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <Container
      maxWidth="lg"
      component="main"
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <Grid container spacing={4}>
        {isAuthenticated && (
          <Grid size={{ xs: 12, md: 3 }}>
            <GenericCard
              data={{
                id: 'add',
                title: '',
                variant: 'service',
              }}
              onClick={handleAdd}
              customContent={
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 4,
                  }}
                >
                  <AddIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold' }}>
                    Agregar Gestión
                  </Typography>
                </Box>
              }
            />
          </Grid>
        )}
        {gestionesData.map((gestion: any, index: number) => (
          <Grid key={index} size={{ xs: 12, md: 3 }}>
            <GenericCard
              data={gestion}
              showEditControls={isAuthenticated}
              onEdit={() => handleEdit(gestion)}
              onDelete={() => handleDelete(String(gestion.id))}
            />
          </Grid>
        ))}
        {gestionesData.length === 0 && !isAuthenticated && (
          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                textAlign: 'center',
                py: 8,
              }}
            >
              <Typography variant="h6" color="text.secondary">
                {t.empty.noServices}
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}

import * as React from 'react';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { Typography } from '@mui/material';
import GenericCard from '../GenericCard/GenericCard';
import { DataService } from '../../services/dataService';
import { useAuth } from '../../context/AuthContext';
import AddIcon from '@mui/icons-material/Add';
import './Gobernanza.scss';

export default function Gobernanza() {
  const [gobernanzaData, setGobernanzaData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { isAuthenticated } = useAuth();

  React.useEffect(() => {
    async function loadData() {
      try {
        const data = await DataService.getGovernanceData();
        setGobernanzaData(data);
      } catch (error) {
        console.error('Failed to load gobernanza:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este elemento?')) return;
    
    try {
      await DataService.deleteCard(id);
      const updatedData = await DataService.getGovernanceData();
      setGobernanzaData(updatedData);
    } catch (error) {
      alert('Error al eliminar: ' + (error as Error).message);
    }
  };

  const handleEdit = (item: any) => {
    alert('Función de edición en desarrollo');
  };

  const handleAdd = () => {
    alert('Función de agregar en desarrollo');
  };

  if (loading) {
    return <Box sx={{ textAlign: 'center', py: 8 }}>Loading...</Box>;
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
                variant: 'governance',
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
                    Agregar
                  </Typography>
                </Box>
              }
            />
          </Grid>
        )}
        {gobernanzaData.map((item: any, index: number) => (
          <Grid key={index} size={{ xs: 12, md: 3 }}>
            <GenericCard
              data={item}
              showEditControls={isAuthenticated}
              onEdit={() => handleEdit(item)}
              onDelete={() => handleDelete(String(item.id))}
            />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

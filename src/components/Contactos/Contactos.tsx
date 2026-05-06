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
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import { useCardReordering } from '../../hooks/useCardReordering';
import './Contactos.scss';

export default function Contactos() {
  const [contactosData, setContactosData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const { openDialog, closeDialog } = useDialog();

  React.useEffect(() => {
    async function loadData() {
      try {
        const data = await DataService.getContactData();
        setContactosData(data);
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
    if (!confirm('¿Estás seguro de eliminar este contacto?')) return;
    
    try {
      await DataService.deleteCard(id);
      const updatedData = await DataService.getContactData();
      setContactosData(updatedData);
    } catch (error) {
      alert('Error al eliminar: ' + (error as Error).message);
    }
  };

  const handleEdit = (item: any) => {
    openDialog({
      title: 'Editar Contacto',
      icon: 'Edit',
      content: (
        <AddEditDialogContent
          onSave={async (data) => {
            try {
              const itemId = item.id;
              await DataService.updateCard(String(itemId), data);
              const updatedData = await DataService.getContactData();
              setContactosData(updatedData);
              closeDialog();
            } catch (error) {
              throw error;
            }
          }}
          contentType="contact"
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
      title: 'Agregar Contacto',
      icon: 'Add',
      content: (
        <AddEditDialogContent
          onSave={async (data) => {
            try {
              await DataService.createCard({ ...data, variant: 'contact' });
              const updatedData = await DataService.getContactData();
              setContactosData(updatedData);
              closeDialog();
            } catch (error) {
              throw error;
            }
          }}
          contentType="contact"
          mode="add"
        />
      ),
      maxWidth: 'md',
      fullWidth: true
    });
  };

  const { handleDragEnd } = useCardReordering({
    data: contactosData,
    setData: setContactosData,
    fetchFunction: DataService.getContactData,
    isAuthenticated,
  });

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
      <DragDropContext onDragEnd={handleDragEnd}>
        <Grid container spacing={4}>
          {isAuthenticated && (
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <GenericCard
                data={{
                  id: 'add',
                  title: '',
                  variant: 'contact',
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
                      Agregar Contacto
                    </Typography>
                  </Box>
                }
              />
            </Grid>
          )}
          <Droppable droppableId="contactos">
            {(provided) => (
              <Box {...provided.droppableProps} ref={provided.innerRef} sx={{ display: 'flex', flexWrap: 'wrap', width: '100%' }}>
                {contactosData.map((contact: any, index: number) => (
                  <Draggable key={contact.id} draggableId={String(contact.id)} index={index} isDragDisabled={!isAuthenticated}>
                    {(provided, snapshot) => (
                      <Box
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        sx={{
                          ...provided.draggableProps.style,
                          width: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(33.33% - 16px)' },
                          padding: '8px',
                          opacity: snapshot.isDragging ? 0.8 : 1,
                          boxSizing: 'border-box',
                        }}
                      >
                        <Box sx={{ position: 'relative' }}>
                          {isAuthenticated && (
                            <div
                              {...provided.dragHandleProps}
                              style={{
                                position: 'absolute',
                                top: 8,
                                left: 8,
                                zIndex: 10,
                                cursor: 'grab',
                                background: 'rgba(255, 255, 255, 0.9)',
                                borderRadius: '50%',
                                padding: 4,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                              }}
                            >
                              <DragHandleIcon />
                            </div>
                          )}
                          <GenericCard
                            data={contact}
                            showEditControls={isAuthenticated}
                            onEdit={() => handleEdit(contact)}
                            onDelete={() => handleDelete(String(contact.id))}
                          />
                        </Box>
                      </Box>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </Box>
            )}
          </Droppable>
        </Grid>
      </DragDropContext>
      {contactosData.length === 0 && !isAuthenticated && (
        <Grid size={{ xs: 12 }}>
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
            }}
          >
            <Typography variant="h6" color="text.secondary">
              {t.empty.noContacts}
            </Typography>
          </Box>
        </Grid>
      )}
    </Container>
  );
}

import * as React from 'react';
import Grid from '@mui/material/Grid';
import { Box, Container, Typography } from '@mui/material';
import Chip from '@mui/material/Chip';
import { DataService } from '../../services/dataService';
import GenericCard from '../GenericCard/GenericCard';
import Search from '../Search/Search';
import { useAuth } from '../../context/AuthContext';
import { useDialog } from '../../context/DialogContext';
import { useTranslation } from '../../context/TranslationContext';
import Loading from '../Loading/Loading';
import AddIcon from '@mui/icons-material/Add';
import AddEditDialogContent from '../AddEditDialog/AddEditDialogContent';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import './Noticias.scss';

export default function Noticias() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('Todo');
  const [focusedCardIndex, setFocusedCardIndex] = React.useState<number | null>(null);
  const [cardsData, setCardsData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const { openDialog, closeDialog } = useDialog();

  React.useEffect(() => {
    async function loadData() {
      try {
        const data = await DataService.getCardsData();
        setCardsData(data);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error al cargar datos';
        alert(errorMessage);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const categories = React.useMemo(() => {
    const newsItems = cardsData.filter((item: any) => item.variant === 'news');
    const uniqueTags = Array.from(new Set(newsItems.map((item: any) => item.tag).filter(Boolean)));
    return ['Todo', ...uniqueTags];
  }, [cardsData]);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleFocus = (index: number) => {
    setFocusedCardIndex(index);
  };

  const handleBlur = () => {
    setFocusedCardIndex(null);
  };

  const handleDelete = async (id: string) => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm('¿Estás seguro de eliminar esta noticia?')) return;
    
    try {
      await DataService.deleteCard(id);
      const updatedData = await DataService.getCardsData();
      setCardsData(updatedData);
    } catch (error) {
      alert('Error al eliminar: ' + (error as Error).message);
    }
  };

  const handleEdit = (news: any) => {
    openDialog({
      title: 'Editar Noticia',
      icon: 'Edit',
      content: (
        <AddEditDialogContent
          onSave={async (data) => {
            try {
              const newsId = news.id;
              await DataService.updateCard(String(newsId), data);
              const updatedData = await DataService.getCardsData();
              setCardsData(updatedData);
              closeDialog();
            } catch (error) {
              throw error;
            }
          }}
          contentType="news"
          initialData={news}
          mode="edit"
        />
      ),
      maxWidth: 'md',
      fullWidth: true
    });
  };

  const handleAdd = () => {
    openDialog({
      title: 'Agregar Noticia',
      icon: 'Add',
      content: (
        <AddEditDialogContent
          onSave={async (data) => {
            try {
              await DataService.createCard({ ...data, variant: 'news' });
              const updatedData = await DataService.getCardsData();
              setCardsData(updatedData);
              closeDialog();
            } catch (error) {
              throw error;
            }
          }}
          contentType="news"
          mode="add"
        />
      ),
      maxWidth: 'md',
      fullWidth: true
    });
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || !isAuthenticated) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    const reorderedItems = Array.from(filteredNews);
    const [reorderedItem] = reorderedItems.splice(sourceIndex, 1);
    reorderedItems.splice(destinationIndex, 0, reorderedItem);

    setCardsData((prev: any[]) => {
      const updated = prev.map((card: any) => {
        if (card.variant !== 'news') return card;
        const newIndex = reorderedItems.findIndex((item: any) => item.id === card.id);
        if (newIndex !== -1) {
          return { ...card, sort_order: newIndex };
        }
        return card;
      });
      return updated;
    });

    const sortUpdateItems = reorderedItems.map((item: any, index: number) => ({
      id: Number(item.id),
      sort_order: index
    }));

    try {
      await DataService.reorderCards(sortUpdateItems);
    } catch (error) {
      console.error('Error reordering:', error);
      const revertedData = await DataService.getCardsData();
      setCardsData(revertedData);
    }
  };

  // Filter for news variant and apply category/search filters
  const filteredNews = React.useMemo(() => {
    let filtered = cardsData.filter((item: any) => item.variant === 'news');
    if (selectedCategory !== 'Todo') {
      filtered = filtered.filter((item: any) => item.tag === selectedCategory);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((item: any) => 
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
    }
    return filtered;
  }, [cardsData, selectedCategory, searchQuery]);

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
      <Box
        sx={{
          display: { xs: "flex", sm: "none" },
          flexDirection: "row",
          gap: 1,
          width: { xs: "100%", md: "fit-content" },
          overflow: "auto",
        }}
      >
        <Search value={searchQuery} onChange={handleSearchChange} />
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column-reverse", md: "row" },
          width: "100%",
          justifyContent: "space-between",
          alignItems: { xs: "start", md: "center" },
          gap: 4,
          overflow: "auto",
        }}
      >
        <Box
          sx={{
            display: "inline-flex",
            flexDirection: "row",
            gap: 3,
            overflow: "auto",
          }}
        >
          {categories.map((category) => (
            <Chip
              key={category}
              onClick={() => handleCategoryClick(category)}
              size="medium"
              label={category}
              sx={{
                backgroundColor:
                  selectedCategory === category
                    ? "primary.light"
                    : "transparent",
                color:
                  selectedCategory === category
                    ? "primary.contrastText"
                    : "text.primary",
                border: selectedCategory === category ? "none" : "1px solid",
                borderColor: "divider",
                "&:hover": {
                  backgroundColor:
                    selectedCategory === category
                      ? "primary.light"
                      : "action.hover",
                },
              }}
            />
          ))}
        </Box>
        <Box
          sx={{
            display: { xs: "none", sm: "flex" },
            flexDirection: "row",
            gap: 1,
            width: { xs: "100%", md: "fit-content" },
            overflow: "auto",
          }}
        >
          <Search value={searchQuery} onChange={handleSearchChange} />
        </Box>
      </Box>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Grid container spacing={2} columns={12}>
          {isAuthenticated && (
            <Grid size={{ xs: 12, md: 6 }}>
              <GenericCard
                data={{
                  id: 'add',
                  title: '',
                  variant: 'news',
                }}
                size="large"
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
                    <AddIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold' }}>
                      Agregar Noticia
                    </Typography>
                  </Box>
                }
                hideImage
              />
            </Grid>
          )}
          <Droppable droppableId="news">
            {(provided) => (
              <Box {...provided.droppableProps} ref={provided.innerRef} sx={{ display: 'flex', flexWrap: 'wrap', width: '100%' }}>
                {filteredNews.map((news: any, index: number) => (
                  <Draggable key={news.id} draggableId={String(news.id)} index={index} isDragDisabled={!isAuthenticated}>
                    {(provided, snapshot) => (
                      <Box
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        sx={{
                          ...provided.draggableProps.style,
                          width: { xs: '100%', md: 'calc(50% - 16px)' },
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
                            data={news}
                            focused={focusedCardIndex === index}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            tabIndex={0}
                            size="large"
                            showEditControls={isAuthenticated}
                            onEdit={() => handleEdit(news)}
                            onDelete={() => handleDelete(String(news.id))}
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
          {filteredNews.length === 0 && !isAuthenticated && (
            <Grid size={{ xs: 12 }}>
              <Box
                sx={{
                  textAlign: 'center',
                  py: 8,
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  {t.empty.noNews}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </DragDropContext>
    </Container>
  );
}

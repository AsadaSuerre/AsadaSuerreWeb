import * as React from 'react';
import Grid from '@mui/material/Grid';
import { Box, Container, Button, Typography } from '@mui/material';
import Chip from '@mui/material/Chip';
import { DataService } from '../../services/dataService';
import GenericCard from '../GenericCard/GenericCard';
import { GenericCardData } from '../GenericCard/GenericCard';
import Search from '../Search/Search';
import { useAuth } from '../../context/AuthContext';
import { useDialog } from '../../context/DialogContext';
import Loading from '../Loading/Loading';
import AddIcon from '@mui/icons-material/Add';
import AddEditDialogContent from '../AddEditDialog/AddEditDialogContent';
// Import images directly
import IMG_3657 from '../../assets/news-images/IMG_3657.JPG';
import IMG_3658 from '../../assets/news-images/IMG_3658.JPG';
import IMG_3660 from '../../assets/news-images/IMG_3660.JPG';
import IMG_3661 from '../../assets/news-images/IMG_3661.JPG';
import IMG_3680 from '../../assets/news-images/IMG_3680.JPG';
import IMG_3683 from '../../assets/news-images/IMG_3683.JPG';
import IMG_3685 from '../../assets/news-images/IMG_3685.JPG';
import IMG_3689 from '../../assets/news-images/IMG_3689.JPG';
import IMG_3698 from '../../assets/news-images/IMG_3698.JPG';
import IMG_3723 from '../../assets/news-images/IMG_3723.JPG';
import './Noticias.scss';

export default function Noticias() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('Todo');
  const [focusedCardIndex, setFocusedCardIndex] = React.useState<number | null>(null);
  const [cardsData, setCardsData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { isAuthenticated } = useAuth();
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

  // Image mapping object
  const imageMap: { [key: string]: string } = {
    './news-images/IMG_3657.JPG': IMG_3657,
    './news-images/IMG_3658.JPG': IMG_3658,
    './news-images/IMG_3660.JPG': IMG_3660,
    './news-images/IMG_3661.JPG': IMG_3661,
    './news-images/IMG_3680.JPG': IMG_3680,
    './news-images/IMG_3683.JPG': IMG_3683,
    './news-images/IMG_3685.JPG': IMG_3685,
    './news-images/IMG_3689.JPG': IMG_3689,
    './news-images/IMG_3698.JPG': IMG_3698,
    './news-images/IMG_3723.JPG': IMG_3723,
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

  // Transform news data to GenericCard format
  const transformedNews: GenericCardData[] = filteredNews.map((news: any) => ({
    id: news.id,
    title: news.title,
    description: news.description,
    date: news.date,
    image: imageMap[news.image] || news.image,
    tag: news.tag,
    authors: news.authors,
    variant: news.variant as 'news' | 'default' | 'service' | 'governance' | 'contact'
  }));

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
        {transformedNews.map((news, index) => (
          <Grid key={news.id} size={{ xs: 12, md: 6 }}>
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
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

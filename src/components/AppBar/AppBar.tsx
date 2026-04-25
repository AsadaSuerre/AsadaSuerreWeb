import * as React from 'react';
import { alpha, styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Drawer from '@mui/material/Drawer';
import { ReactComponent as LogoAsada } from '../../assets/asada-suerre-logo.svg';
import { useNavigate, useLocation } from 'react-router-dom';
import ImageCarousel from '../ImageCarousel/ImageCarousel';
import { DataService } from '../../services/dataService';
import { useAuth } from '../../context/AuthContext';
import { useDialog } from '../../context/DialogContext';
import { LoginDialogContent } from '../LoginDialog';
// Import carousel images for mapping
import IMG_3657 from '../../assets/news-images/IMG_3657.JPG';
import IMG_3658 from '../../assets/news-images/IMG_3658.JPG';
import IMG_3660 from '../../assets/news-images/IMG_3660.JPG';
import IMG_3661 from '../../assets/news-images/IMG_3661.JPG';
import IMG_3680 from '../../assets/news-images/IMG_3680.JPG';
import './AppBar.scss';
import { KeyboardArrowUp, Menu, CloseRounded } from '@mui/icons-material';

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexShrink: 0,
  borderRadius: `calc(${theme.shape.borderRadius}px + 8px)`,
  backdropFilter: 'blur(24px)',
  border: '1px solid',
  borderColor: (theme.vars || theme).palette.divider,
  backgroundColor: theme.vars
    ? `rgba(${theme.vars.palette.background.defaultChannel} / 0.4)`
    : alpha(theme.palette.background.default, 0.4),
  boxShadow: (theme.vars || theme).shadows[1],
  padding: '8px 12px',
}));

export default function AppBarComponent() {
  const [open, setOpen] = React.useState(false);
  const { isAuthenticated, user, logout } = useAuth();  const [carouselImages, setCarouselImages] = React.useState<any[]>([]);
  const { openDialog, closeDialog } = useDialog();

  const navigate = useNavigate();
  const location = useLocation();;

  const handleLoginClick = () => {
    openDialog({
      title: 'Portal Administrativo',
      content: <LoginDialogContent onSuccess={closeDialog} />,
      maxWidth: 'sm',
    });
  };

  const handleLogoutClick = () => {
    logout();
  }

  // Determine if carousel should be collapsed (not on base path)
  const isCarouselCollapsed = location.pathname !== '/' && location.pathname !== '';

  // Image mapping object
  const imageMap: { [key: string]: string } = {
    './news-images/IMG_3657.JPG': IMG_3657,
    './news-images/IMG_3658.JPG': IMG_3658,
    './news-images/IMG_3660.JPG': IMG_3660,
    './news-images/IMG_3661.JPG': IMG_3661,
    './news-images/IMG_3680.JPG': IMG_3680,
  };

  React.useEffect(() => {
    async function loadCarouselImages() {
      try {
        const images = await DataService.getCarouselImages();
        const transformed = images.map((item: any) => ({
          id: item.id,
          image: imageMap[item.image] || item.image,
          title: item.title,
          subtitle: item.subtitle,
          description: item.description
        }));
        setCarouselImages(transformed);
      } catch (error) {
        console.error('Failed to load carousel images:', error);
      }
    }
    loadCarouselImages();
  }, []);

  const handleDeleteSlide = async (index: number, slide: any) => {
    if (!confirm('¿Estás seguro de eliminar este slide?')) return;
    
    try {
      await DataService.deleteHomeSlide(String(slide.id));
      const updatedImages = await DataService.getCarouselImages();
      const transformed = updatedImages.map((item: any) => ({
        id: item.id,
        image: imageMap[item.image] || item.image,
        title: item.title,
        subtitle: item.subtitle,
        description: item.description
      }));
      setCarouselImages(transformed);
    } catch (error) {
      alert('Error al eliminar: ' + (error as Error).message);
    }
  };

  const handleEditSlide = (index: number, slide: any) => {
    alert('Función de edición en desarrollo');
  };

  const handleAddSlide = () => {
    alert('Función de agregar slide en desarrollo');
  };

  const toggleDrawer = (newOpen: boolean) => () => {
    if(!isCarouselCollapsed) {
      handleNavigation('/noticias');
      return;
    }
    setOpen(newOpen);
  };

  const handleNavigation = (path: string) => {
    if (path === '/consulta-en-linea') {
      // Open external portal in new tab
      window.open('https://www.cisaweb.com/mclientes/', '_blank', 'noopener,noreferrer');
    } else {
      // Normal navigation for other routes
      navigate(path);
    }
    setOpen(false);
  };

  const isActive = (path: string) => {
    // ConsultaEnLinea opens in new tab, so it's never "active" in the app
    if (path === '/consulta-en-linea') {
      return false;
    }
    return location.pathname === path;
  };

  return (
    <AppBar
      position="fixed"
      enableColorOnDark
      sx={{
        boxShadow: 0,
        bgcolor: "transparent",
        backgroundImage: "none",
        mt: "calc(var(--template-frame-height, 0px))",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      {/* Hero Section with Background Image */}
      <ImageCarousel 
        images={carouselImages} 
        autoPlay={true} 
        interval={4000} 
        collapsed={isCarouselCollapsed}
        showEditControls={isAuthenticated}
        currentPath={location.pathname}
        onEdit={handleEditSlide}
        onDelete={handleDeleteSlide}
        onAdd={handleAddSlide}
        sx={{ 
          position: 'relative',
          zIndex: 0,
        }} 
      />
      <Container maxWidth="lg">
        <StyledToolbar
          variant="dense"
          disableGutters
          sx={{ bgcolor: "#04A6DB", border: "1px solid black", top: "-50px" }}
        >
          <Box
            sx={{ flexGrow: 1, display: "flex", alignItems: "center", px: 0 }}
          >
            <Box sx={{ display: { xs: "none", md: "flex" } }}>
              <Box
                component={LogoAsada}
                sx={{
                  position: "absolute",
                  left: "50%",
                  transform: "translateX(-50%) translateY(-25%)",
                  width: "8%",
                  objectFit: "contain",
                }}
              />
              <Button
                variant="text"
                color="primary"
                size="small"
                onClick={() => handleNavigation("/")}
                sx={{
                  backgroundColor: isActive("/")
                    ? "primary.dark"
                    : "transparent",
                  color: isActive("/")
                    ? "primary.contrastText"
                    : "inherit",
                }}
              >
                Inicio
              </Button>
              <Button
                variant="text"
                color="primary"
                size="small"
                onClick={() => handleNavigation("/noticias")}
                sx={{
                  backgroundColor: isActive("/noticias")
                    ? "primary.dark"
                    : "transparent",
                  color: isActive("/noticias")
                    ? "primary.contrastText"
                    : "inherit",
                }}
              >
                Noticias
              </Button>
              <Button
                variant="text"
                color="primary"
                size="small"
                onClick={() => handleNavigation("/gestiones")}
                sx={{
                  backgroundColor: isActive("/gestiones")
                    ? "primary.dark"
                    : "transparent",
                  color: isActive("/gestiones")
                    ? "primary.contrastText"
                    : "inherit",
                }}
              >
                Gestiones
              </Button>
              <Button
                variant="text"
                color="primary"
                size="small"
                onClick={() => handleNavigation("/gobernanza")}
                sx={{
                  backgroundColor: isActive("/gobernanza")
                    ? "primary.dark"
                    : "transparent",
                  color: isActive("/gobernanza")
                    ? "primary.contrastText"
                    : "inherit",
                }}
              >
                Gobernanza
              </Button>
              <Button
                variant="text"
                color="primary"
                size="small"
                onClick={() => handleNavigation("/nuestra-historia")}
                sx={{
                  backgroundColor: isActive("/nuestra-historia")
                    ? "primary.dark"
                    : "transparent",
                  color: isActive("/nuestra-historia")
                    ? "primary.contrastText"
                    : "inherit",
                }}
              >
                Nuestra historia
              </Button>
            </Box>
          </Box>
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              gap: 1,
              alignItems: "center",
            }}
          >
            <Button
              variant="text"
              color="primary"
              size="small"
              onClick={() => handleNavigation("/contactos")}
              sx={{
                backgroundColor: isActive("/contactos")
                  ? "primary.dark"
                  : "transparent",
                color: isActive("/contactos")
                  ? "primary.contrastText"
                  : "inherit",
              }}
            >
              Contactos
            </Button>
            <Button
              color="primary"
              variant="contained"
              size="small"
              onClick={isAuthenticated ? handleLogoutClick : handleLoginClick}
            >
              {isAuthenticated ? `Cerrar Sesión (${user?.username})` : 'Portal Administrativo'}
            </Button>
          </Box>
          <Box sx={{ display: { xs: "flex", md: "none" }, gap: 1 }}>
            <Box
              component={LogoAsada}
              sx={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%) translateY(-25%)",
                width: "20%",
                objectFit: "contain",
              }}
            />
            <IconButton
              aria-label="Menu button"
              onClick={toggleDrawer(!open)}
              sx={{ border: "1px solid black" }}
            >
              {!isCarouselCollapsed ? <KeyboardArrowUp /> : (open ? <CloseRounded /> : <Menu />)}
            </IconButton>
            <Drawer
              anchor="top"
              open={open}
              onClose={toggleDrawer(false)}
              hideBackdrop={true}
              slotProps={{
                paper: {
                  sx: {
                    top: "var(--template-frame-height, 100px)",
                    marginLeft: "5%",
                    marginRight: "8%",
                    border: "1px solid black",
                    borderRadius: "8px",
                    paddingTop: "20px",
                  },
                },
              }}
            >
              <Box sx={{ p: 2, backgroundColor: "background.default" }}>
                <MenuItem onClick={() => handleNavigation("/")}>
                  Inicio
                </MenuItem>
                <MenuItem onClick={() => handleNavigation("/noticias")}>
                  Noticias
                </MenuItem>
                <MenuItem onClick={() => handleNavigation("/gestiones")}>
                  Gestiones
                </MenuItem>
                <MenuItem onClick={() => handleNavigation("/gobernanza")}>
                  Gobernanza{" "}
                </MenuItem>
                <MenuItem onClick={() => handleNavigation("/nuestra-historia")}>
                  Nuestra historia
                </MenuItem>
                <MenuItem onClick={() => handleNavigation("/contactos")}>
                  Contactos
                </MenuItem>
                <Divider sx={{ my: 3 }} />
                <MenuItem>
                  <Button
                    color="secondary"
                    variant="contained"
                    fullWidth
                    onClick={isAuthenticated ? handleLogoutClick : handleLoginClick}
                  >
                    {isAuthenticated ? `Cerrar Sesión (${user?.username})` : 'Portal Administrativo'}
                  </Button>
                </MenuItem>
              </Box>
            </Drawer>
          </Box>
        </StyledToolbar>
      </Container>
    </AppBar>
  );
}

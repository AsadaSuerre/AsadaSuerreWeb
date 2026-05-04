# Authentication Implementation Examples

This document provides examples of how to use the authentication system in your React components.

## 1. Wrapping Your App with AuthProvider

First, wrap your application with the `AuthProvider` in your main App component:

```tsx
// src/App.tsx
import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import { useDialog } from './context/DialogContext';
import { LoginDialogContent } from './components/LoginDialog';
import GlobalDialog from './components/FullScreenDialog/GlobalDialog';

const AppContent: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { openDialog, closeDialog } = useDialog();

  const handleLoginClick = () => {
    openDialog({
      title: 'Portal Administrativo',
      content: <LoginDialogContent onSuccess={closeDialog} />,
      maxWidth: 'sm',
    });
  };

  const handleLogoutClick = () => {
    logout();
  };

  return (
    <div>
      {/* Admin Portal Button */}
      <button onClick={isAuthenticated ? handleLogoutClick : handleLoginClick}>
        {isAuthenticated ? `Cerrar Sesión (${user?.username})` : 'Portal Administrativo'}
      </button>

      {/* Your existing app content */}
      {/* ... */}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <GlobalDialog>
        <AppContent />
      </GlobalDialog>
    </AuthProvider>
  );
};

export default App;
```

## 2. Conditional Rendering for Edit Mode

Show edit buttons only when authenticated:

```tsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface CardProps {
  id: string;
  title: string;
  description: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const Card: React.FC<CardProps> = ({ id, title, description, onEdit, onDelete }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="card">
      <h3>{title}</h3>
      <p>{description}</p>
      
      {/* Edit buttons only shown when authenticated */}
      {isAuthenticated && (
        <div className="edit-controls">
          <Button
            startIcon={<EditIcon />}
            onClick={() => onEdit?.(id)}
            variant="outlined"
            size="small"
          >
            Editar
          </Button>
          <Button
            startIcon={<DeleteIcon />}
            onClick={() => onDelete?.(id)}
            variant="outlined"
            size="small"
            color="error"
          >
            Eliminar
          </Button>
        </div>
      )}
    </div>
  );
};

export default Card;
```

## 3. Using Protected API Calls

Use the protected methods from DataService for write operations:

```tsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { DataService } from '../services/dataService';
import { TextField, Button } from '@mui/material';

const CreateCardForm: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para crear contenido');
      return;
    }

    try {
      await DataService.createCard({
        title,
        description,
        variant: 'news',
      });
      
      setTitle('');
      setDescription('');
      alert('Tarjeta creada exitosamente');
    } catch (error) {
      alert('Error al crear tarjeta: ' + (error as Error).message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        label="Título"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Descripción"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        fullWidth
        multiline
        rows={4}
        margin="normal"
      />
      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={!isAuthenticated}
      >
        {isAuthenticated ? 'Crear Tarjeta' : 'Inicia sesión para crear'}
      </Button>
    </form>
  );
};

export default CreateCardForm;
```

## 4. Timeline Component with Edit Mode

```tsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { DataService } from '../services/dataService';
import { Button, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const Timeline: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este elemento?')) return;
    
    try {
      await DataService.deleteTimelineItem(id);
      // Refresh timeline
      const updatedItems = await DataService.getTimeItemsData();
      setItems(updatedItems);
    } catch (error) {
      alert('Error al eliminar: ' + (error as Error).message);
    }
  };

  return (
    <div className="timeline">
      {items.map((item: any) => (
        <div key={item.id} className="timeline-item">
          <div className="timeline-content">
            <span className="year">{item.year}</span>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            
            {isAuthenticated && (
              <div className="timeline-actions">
                <IconButton onClick={() => {/* handle edit */}}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDelete(item.id)} color="error">
                  <DeleteIcon />
                </IconButton>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Timeline;
```

## 5. Home Slides with Edit Mode

```tsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { DataService } from '../services/dataService';
import { Button } from '@mui/material';

const HomeSlides: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [slides, setSlides] = useState([]);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este slide?')) return;
    
    try {
      await DataService.deleteHomeSlide(id);
      const updatedSlides = await DataService.getHomeData();
      setSlides(updatedSlides);
    } catch (error) {
      alert('Error: ' + (error as Error).message);
    }
  };

  return (
    <div className="home-slides">
      {slides.map((slide: any) => (
        <div key={slide.id} className="slide">
          <img src={slide.image} alt={slide.title} />
          <div className="slide-content">
            <h2>{slide.title}</h2>
            <p>{slide.description}</p>
            
            {isAuthenticated && (
              <Button
                variant="contained"
                color="error"
                onClick={() => handleDelete(slide.id)}
              >
                Eliminar Slide
              </Button>
            )}
          </div>
        </div>
      ))}
      
      {isAuthenticated && (
        <Button variant="contained" onClick={() => {/* handle add */}}>
          Agregar Slide
        </Button>
      )}
    </div>
  );
};

export default HomeSlides;
```

## 6. Stats Section with Edit Mode

```tsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { DataService } from '../services/dataService';
import { Button } from '@mui/material';

const StatsSection: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState([]);

  const handleUpdateStats = async () => {
    if (!isAuthenticated) return;
    
    try {
      await DataService.updateStats(stats);
      alert('Estadísticas actualizadas');
    } catch (error) {
      alert('Error: ' + (error as Error).message);
    }
  };

  return (
    <div className="stats-section">
      <div className="stats-grid">
        {stats.map((stat: any) => (
          <div key={stat.id} className="stat-item">
            <div className="stat-number">{stat.number}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>
      
      {isAuthenticated && (
        <Button
          variant="contained"
          onClick={handleUpdateStats}
          sx={{ mt: 2 }}
        >
          Editar Estadísticas
        </Button>
      )}
    </div>
  );
};

export default StatsSection;
```

## 7. Complete Example: Noticias Component with Full Edit Mode

```tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDialog } from '../context/DialogContext';
import { LoginDialogContent } from '../components/LoginDialog';
import { DataService } from '../services/dataService';
import { Button, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const Noticias: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { openDialog, closeDialog } = useDialog();
  const [news, setNews] = useState([]);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      const data = await DataService.getNewsData();
      setNews(data);
    } catch (error) {
      console.error('Error loading news:', error);
    }
  };

  const handleLoginClick = () => {
    openDialog({
      title: 'Portal Administrativo',
      content: <LoginDialogContent onSuccess={closeDialog} />,
      maxWidth: 'sm',
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta noticia?')) return;
    
    try {
      await DataService.deleteCard(String(id));
      await loadNews();
    } catch (error) {
      alert('Error al eliminar: ' + (error as Error).message);
    }
  };

  const handleEdit = (id: number) => {
    // Open edit dialog with card data
    // Implement edit form
  };

  const handleAdd = () => {
    // Open add dialog
    // Implement add form
  };

  return (
    <div className="noticias-container">
      <div className="noticias-header">
        <h2>Noticias</h2>
        
        {/* Admin Portal Button */}
        {!isAuthenticated && (
          <Button variant="outlined" onClick={handleLoginClick}>
            Portal Administrativo
          </Button>
        )}
        
        {/* Add button - only when authenticated */}
        {isAuthenticated && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
          >
            Agregar Noticia
          </Button>
        )}
      </div>

      <div className="noticias-grid">
        {news.map((item: any) => (
          <div key={item.id} className="news-card">
            {item.image && <img src={item.image} alt={item.title} />}
            <div className="news-content">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              {item.date && <span className="date">{item.date}</span>}
              
              {/* Edit controls - only when authenticated */}
              {isAuthenticated && (
                <div className="edit-controls">
                  <IconButton onClick={() => handleEdit(item.id)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(item.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Noticias;
```

## Key Points

1. **Always check `isAuthenticated`** before showing edit controls
2. **Use `DataService` protected methods** for write operations (create, update, delete)
3. **Wrap your app with `AuthProvider`** at the root level
4. **Use the `useAuth` hook** to access authentication state
5. **Handle errors gracefully** when API calls fail
6. **Refresh data after mutations** to keep UI in sync
7. **Use the existing Dialog system** for login and edit forms

## Security Notes

- All write operations are protected on the backend
- Tokens are stored in localStorage and sent with Authorization header
- Tokens expire after 24 hours
- Always verify authentication on the client side for UX, but trust the backend for security

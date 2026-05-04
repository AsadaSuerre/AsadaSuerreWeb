import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  IconButton,
  alpha
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../../context/AuthContext';

interface ImageUploadProps {
  value?: string;
  onChange: (key: string | undefined) => void;
  label?: string;
  error?: string;
  onFileChange?: (file: File | null, oldKey: string | undefined) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  label = 'Image',
  error,
  onFileChange
}) => {
  const { isAuthenticated } = useAuth();
  const [preview, setPreview] = useState<string | null>(null);
  const [localFile, setLocalFile] = useState<File | null>(null);
  const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL || 'http://localhost:8787/images';

  React.useEffect(() => {
    if (value && !localFile) {
      setPreview(`${IMAGE_BASE_URL}/${value}`);
    } else if (localFile) {
      setPreview(URL.createObjectURL(localFile));
    } else {
      setPreview(null);
    }
  }, [value, localFile, IMAGE_BASE_URL]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File too large. Maximum size is 10MB.');
      return;
    }

    setLocalFile(file);
    onChange(undefined); // Clear the old key since we have a new file
    onFileChange?.(file, value); // Notify parent of the file change

    // Reset input
    event.target.value = '';
  };

  const handleDelete = () => {
    if (!value && !localFile) return;

    setLocalFile(null);
    setPreview(null);
    onChange(undefined);
    onFileChange?.(null, value); // Notify parent of deletion
  };

  if (!isAuthenticated) {
    return (
      <Box>
        <Typography variant="body2" color="text.secondary">
          {label}: Se requiere autenticación para subir imágenes
        </Typography>
        {preview && (
          <Box
            component="img"
            src={preview}
            alt={label}
            sx={{
              width: '100%',
              maxWidth: 400,
              height: 200,
              objectFit: 'cover',
              borderRadius: 1,
              mt: 1
            }}
          />
        )}
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="body2" gutterBottom sx={{ fontWeight: 500 }}>
        {label}
      </Typography>
      
      {preview ? (
        <Paper
          sx={{
            position: 'relative',
            display: 'inline-block',
            width: '100%',
            maxWidth: 400,
          }}
        >
          <Box
            component="img"
            src={preview}
            alt={label}
            sx={{
              width: '100%',
              height: 200,
              objectFit: 'cover',
              borderRadius: 1,
              display: 'block',
            }}
          />
          <IconButton
            onClick={handleDelete}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 1)',
              },
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Paper>
      ) : (
        <Paper
          sx={{
            width: '100%',
            maxWidth: 400,
            height: 200,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px dashed',
            borderColor: error ? 'error.main' : 'divider',
            borderRadius: 1,
            bgcolor: error ? alpha('#f44336', 0.05) : 'grey.50',
            cursor: 'pointer',
            '&:hover': {
              bgcolor: error ? alpha('#f44336', 0.1) : 'grey.100',
            },
          }}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Hacer clic para subir imagen
          </Typography>
          <Typography variant="caption" color="text.secondary">
            JPEG, PNG, WebP (máx 10MB)
          </Typography>
        </Paper>
      )}

      <input
        id="file-input"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default ImageUpload;

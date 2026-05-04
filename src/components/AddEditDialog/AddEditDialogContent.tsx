import React, { useState, useEffect } from 'react';
import {
  DialogContent,
  DialogActions,
  Box,
  TextField,
  Button,
  MenuItem,
  Stack,
  Chip,
  Typography,
} from '@mui/material';
import { useDialog } from '../../context/DialogContext';
import { iconMap } from '../GenericCard/GenericCard';
import ImageUpload from '../ImageUpload/ImageUpload';
import DynamicItemsInput from '../DynamicItemsInput/DynamicItemsInput';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

export type ContentType = 'news' | 'service' | 'governance' | 'contact' | 'carousel' | 'timeline' | 'mission' | 'vision' | 'stats' | 'contactFloat';

export interface AddEditDialogContentProps {
  onSave: (data: any) => Promise<void>;
  contentType: ContentType;
  initialData?: any;
  mode?: 'add' | 'edit';
}

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'image' | 'date' | 'items';
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  options?: { value: string; label: string }[];
}

const getFormFields = (contentType: ContentType): FormField[] => {
  switch (contentType) {
    case 'news':
      return [
        { name: 'title', label: 'Título', type: 'text', required: true },
        { name: 'subtitle', label: 'Subtítulo', type: 'text' },
        { name: 'description', label: 'Descripción', type: 'textarea', multiline: true, rows: 4 },
        { name: 'image', label: 'URL de Imagen', type: 'image' },
        { name: 'tag', label: 'Etiqueta', type: 'text' },
        { name: 'date', label: 'Fecha', type: 'date' },
      ];
    case 'service':
    case 'governance':
      return [
        { name: 'title', label: 'Título', type: 'text', required: true },
        { name: 'subtitle', label: 'Subtítulo', type: 'text' },
        { name: 'description', label: 'Descripción', type: 'textarea', multiline: true, rows: 4 },
        { name: 'image', label: 'URL de Imagen', type: 'image' },
        { name: 'icon', label: 'Icono', type: 'select', required: true, options: [
          { value: 'Groups', label: 'Grupos' },
          { value: 'Gavel', label: 'Martillo' },
          { value: 'AccountBalance', label: 'Balance' },
          { value: 'Description', label: 'Descripción' },
          { value: 'Assignment', label: 'Asignación' },
          { value: 'Payment', label: 'Pago' },
          { value: 'Receipt', label: 'Recibo' },
          { value: 'WaterDrop', label: 'Gota de agua' },
        ]},
        { name: 'items', label: 'Requisitos (separados por coma)', type: 'items' },
        { name: 'url', label: 'URL', type: 'text' },
      ];
    case 'contact':
      return [
        { name: 'title', label: 'Título', type: 'text', required: true },
        { name: 'subtitle', label: 'Subtítulo', type: 'text' },
        { name: 'description', label: 'Descripción', type: 'textarea', multiline: true, rows: 4 },
        { name: 'icon', label: 'Icono', type: 'select', required: true, options: [
          { value: 'Phone', label: 'Teléfono' },
          { value: 'Email', label: 'Correo' },
          { value: 'LocationOn', label: 'Ubicación' },
        ]},
        { name: 'googleMapsUrl', label: 'URL de Google Maps', type: 'text' },
      ];
    case 'carousel':
      return [
        { name: 'title', label: 'Título', type: 'text', required: true },
        { name: 'subtitle', label: 'Subtítulo', type: 'text' },
        { name: 'description', label: 'Descripción', type: 'textarea', multiline: true, rows: 3 },
        { name: 'image', label: 'URL de Imagen', type: 'image', required: true },
      ];
    case 'timeline':
      return [
        { name: 'title', label: 'Título', type: 'text', required: true },
        { name: 'year', label: 'Año', type: 'text', required: true },
        { name: 'description', label: 'Descripción', type: 'textarea', multiline: true, rows: 4 },
        { name: 'image', label: 'URL de Imagen', type: 'image' },
      ];
    case 'mission':
    case 'vision':
      return [
        { name: 'title', label: 'Título', type: 'text', required: true },
        { name: 'content', label: 'Contenido', type: 'textarea', multiline: true, rows: 6, required: true },
      ];
    case 'stats':
      return [
        { name: 'number', label: 'Número', type: 'text', required: true },
        { name: 'label', label: 'Etiqueta', type: 'text', required: true },
      ];
    case 'contactFloat':
      return [
        { name: 'value', label: 'Valor', type: 'text', required: true },
      ];
    default:
      return [];
  }
};

const AddEditDialogContent: React.FC<AddEditDialogContentProps> = ({
  onSave,
  contentType,
  initialData,
  mode = 'add'
}) => {
  const { closeDialog } = useDialog();
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [filesToDelete, setFilesToDelete] = useState<string[]>([]);
  const [filesToUpload, setFilesToUpload] = useState<Record<string, File>>({});

  const formFields = getFormFields(contentType);

  useEffect(() => {
    setFormData(initialData || {});
    setErrors({});
    setFilesToDelete([]);
    setFilesToUpload({});
  }, [initialData]);

  const handleChange = (name: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (field: string, file: File | null, oldKey: string | undefined) => {
    if (file) {
      // Track new file for upload
      setFilesToUpload(prev => ({ ...prev, [field]: file }));
      // Track old key for deletion
      if (oldKey) {
        setFilesToDelete(prev => [...prev, oldKey]);
      }
    } else {
      // File was deleted, track old key for deletion
      if (oldKey) {
        setFilesToDelete(prev => [...prev, oldKey]);
      }
      setFilesToUpload(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handleItemFileChange = (index: number, file: File | null, oldKey: string | undefined) => {
    if (file) {
      // Track item file for upload with a unique key
      const field = `item_${index}`;
      setFilesToUpload(prev => ({ ...prev, [field]: file }));
      // Track old key for deletion
      if (oldKey) {
        setFilesToDelete(prev => [...prev, oldKey]);
      }
    } else {
      // File was deleted, track old key for deletion
      if (oldKey) {
        setFilesToDelete(prev => [...prev, oldKey]);
      }
      const field = `item_${index}`;
      setFilesToUpload(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handleItemFilesToDelete = (fileUrls: string[]) => {
    setFilesToDelete(prev => [...prev, ...fileUrls]);
  };

  const deleteFilesFromR2 = async (fileUrls: string[]): Promise<void> => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    const deletePromises = fileUrls.map(async (fileUrl) => {
      try {
        await fetch(`${API_URL}/files/${fileUrl}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error('Error al eliminar archivo:', fileUrl, error);
      }
    });

    await Promise.all(deletePromises);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    formFields.forEach(field => {
      const hasPendingUpload = filesToUpload[field.name] !== undefined;
      const hasValue = formData[field.name] !== undefined && formData[field.name] !== '';
      if (field.required && !hasValue && !hasPendingUpload) {
        newErrors[field.name] = `${field.label} es requerido`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      // Upload new files first
      const uploadPromises = Object.entries(filesToUpload).map(async ([field, file]) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_URL}/upload`, {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Error al subir');
        }

        const data = await response.json();
        return { field, key: data.key };
      });

      const uploadedFiles = await Promise.all(uploadPromises);

      // Update formData with uploaded file keys
      const updatedFormData = { ...formData };
      uploadedFiles.forEach(({ field, key }) => {
        if (field.startsWith('item_')) {
          // This is an item file, update the items array
          const index = parseInt(field.replace('item_', ''));
          if (updatedFormData.items && updatedFormData.items[index] !== undefined) {
            const parts = updatedFormData.items[index].split('|');
            parts[1] = key; // Replace the file key
            updatedFormData.items[index] = parts.join('|');
          }
        } else {
          // This is a regular field
          updatedFormData[field] = key;
        }
      });

      // Delete old files marked for deletion
      if (filesToDelete.length > 0) {
        await deleteFilesFromR2(filesToDelete);
      }

      // Save the card data with updated file keys
      await onSave(updatedFormData);
      closeDialog();
    } catch (error) {
      console.error('Error al guardar:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box>
      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          {formFields.map((field) => (
            <Box key={field.name}>
              {field.type === 'textarea' ? (
                <TextField
                  fullWidth
                  label={field.label}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  required={field.required}
                  error={!!errors[field.name]}
                  helperText={errors[field.name]}
                  multiline
                  rows={field.rows || 4}
                />
              ) : field.type === 'select' ? (
                <TextField
                  fullWidth
                  select
                  label={field.label}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  required={field.required}
                  error={!!errors[field.name]}
                  helperText={errors[field.name]}
                >
                  {field.options?.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              ) : field.type === 'items' ? (
                <DynamicItemsInput
                  label={field.label}
                  value={formData.items || []}
                  onChange={(items) => setFormData((prev: any) => ({ ...prev, items }))}
                  placeholder="Ingresa un valor"
                  onFilesToDelete={handleItemFilesToDelete}
                  onItemFileChange={handleItemFileChange}
                />
              ) : field.type === 'date' ? (
                <TextField
                  fullWidth
                  type="date"
                  label={field.label}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  required={field.required}
                  error={!!errors[field.name]}
                  helperText={errors[field.name]}
                  InputLabelProps={{ shrink: true }}
                />
              ) : field.type === 'image' ? (
                <ImageUpload
                  value={formData[field.name]}
                  onChange={(key: string | undefined) => handleChange(field.name, key || '')}
                  label={field.label}
                  error={errors[field.name]}
                  onFileChange={(file, oldKey) => handleFileChange(field.name, file, oldKey)}
                />
              ) : (
                <TextField
                  fullWidth
                  label={field.label}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  required={field.required}
                  error={!!errors[field.name]}
                  helperText={errors[field.name]}
                />
              )}
            </Box>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button disabled={isSaving} onClick={closeDialog}>
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={isSaving}
          sx={{ backgroundColor: '#04A6DB', '&:hover': { backgroundColor: '#0385b0' } }}
        >
          {isSaving ? 'Guardando...' : mode === 'add' ? 'Agregar' : 'Guardar'}
        </Button>
      </DialogActions>
    </Box>
  );
};

export default AddEditDialogContent;

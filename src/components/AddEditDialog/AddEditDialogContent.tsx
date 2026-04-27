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

export type ContentType = 'news' | 'service' | 'governance' | 'contact' | 'carousel' | 'timeline' | 'mission' | 'vision' | 'stats';

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

  const formFields = getFormFields(contentType);

  useEffect(() => {
    setFormData(initialData || {});
    setErrors({});
  }, [initialData]);

  const handleChange = (name: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }));
    }
  };

  const handleItemsChange = (value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData((prev: any) => ({ ...prev, items }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    formFields.forEach(field => {
      if (field.required && !formData[field.name]) {
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
      await onSave(formData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al guardar';
      alert(errorMessage);
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
                <Box>
                  <TextField
                    fullWidth
                    label={field.label}
                    value={formData.items?.join(', ') || ''}
                    onChange={(e) => handleItemsChange(e.target.value)}
                    helperText="Separa los requisitos con comas"
                    multiline
                    rows={2}
                  />
                  {formData.items && formData.items.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Requisitos:
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
                        {formData.items.map((item: string, idx: number) => (
                          <Chip key={idx} label={item} size="small" />
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Box>
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
                <Box>
                  <TextField
                    fullWidth
                    label={field.label}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    required={field.required}
                    error={!!errors[field.name]}
                    helperText={errors[field.name]}
                  />
                  {formData[field.name] && (
                    <Box sx={{ mt: 1 }}>
                      <img
                        src={formData[field.name]}
                        alt="Preview"
                        style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'cover' }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </Box>
                  )}
                </Box>
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

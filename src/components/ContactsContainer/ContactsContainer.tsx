import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import FacebookIcon from '@mui/icons-material/Facebook';
import BuildIcon from '@mui/icons-material/BuildCircle';
import ContactFloat from '../ContactFloat/ContactFloat';
import './ContactsContainer.scss';
import { useLocation } from 'react-router-dom';
import { DataService } from '../../services/dataService';

const ContactsContainer: React.FC = () => {
  const [whatsappPhoneInfo, setWhatsappPhoneInfo] = useState<string>('');
  const [whatsappPhoneSupport, setWhatsappPhoneSupport] = useState<string>('');
  const [facebookUrl, setFacebookUrl] = useState<string>('');
  const location = useLocation();

  useEffect(() => {
    async function loadContacts() {
      try {
        const [info, support, fb] = await Promise.all([
          DataService.getWhatsAppPhoneInfo(),
          DataService.getWhatsAppPhoneSupport(),
          DataService.getFacebookUrl()
        ]);
        setWhatsappPhoneInfo(info || '');
        setWhatsappPhoneSupport(support || '');
        setFacebookUrl(fb || '');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error al cargar datos';
        alert(errorMessage);
      }
    }
    loadContacts();
  }, []);

  return (
    <Box
      sx={{
        display: {
          xs: "block",
          md: location.pathname === "/" ? "none" : "block",
        },
      }}
      className="contacts-container"
    >
      <Box className="contacts-wrapper">
        {whatsappPhoneInfo && (
          <ContactFloat
            icon={<WhatsAppIcon />}
            link={`https://wa.me/${whatsappPhoneInfo.replace(/[^\d]/g, "")}`}
            tooltipTitle="WhatsApp Gestiones"
            ariaLabel="WhatsApp Gestiones"
          />
        )}
        {whatsappPhoneSupport && (
          <ContactFloat
            icon={<BuildIcon />}
            link={`https://wa.me/${whatsappPhoneSupport.replace(/[^\d]/g, "")}`}
            tooltipTitle="WhatsApp Averias"
            ariaLabel="WhatsApp Averias"
          />
        )}
        {facebookUrl && (
          <ContactFloat
            icon={<FacebookIcon />}
            link={facebookUrl}
            tooltipTitle="Visitar Facebook"
            ariaLabel="Visitar Facebook"
          />
        )}
      </Box>
    </Box>
  );
};

export default ContactsContainer;

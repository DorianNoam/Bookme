import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components';
import * as React from 'react';

interface BookingConfirmationProps {
  clientName: string;
  salonName: string;
  serviceName: string;
  date: string;
  time: string;
  price: number;
}

export const BookingConfirmation = ({
  clientName = 'Client',
  salonName = 'Salon',
  serviceName = 'Prestation',
  date = 'Date',
  time = 'Heure',
  price = 0,
}: BookingConfirmationProps) => {
  return (
    <Html>
      <Head />
      <Preview>Votre rendez-vous au {salonName} est confirmé</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>
              Bookme<span style={logoAccent}>.dz</span>
            </Text>
          </Section>
          
          <Section style={content}>
            <Heading style={heading}>Rendez-vous confirmé ! ✨</Heading>
            <Text style={text}>Bonjour {clientName},</Text>
            <Text style={text}>
              Votre réservation au salon <strong>{salonName}</strong> a bien été enregistrée. Voici le récapitulatif de votre rendez-vous :
            </Text>

            <Section style={recapBox}>
              <Text style={recapText}><strong>Prestation :</strong> {serviceName}</Text>
              <Text style={recapText}><strong>Date :</strong> {date}</Text>
              <Text style={recapText}><strong>Heure :</strong> {time}</Text>
              <Text style={recapText}><strong>Prix à régler sur place :</strong> <span style={priceAccent}>{price} DA</span></Text>
            </Section>

            <Text style={text}>
              Merci de vous présenter 5 minutes avant l'heure prévue. En cas d'empêchement, vous pouvez annuler votre rendez-vous directement depuis votre espace client.
            </Text>
            
            <Hr style={hr} />
            <Text style={footer}>
              L'équipe Bookme.dz<br />
              La plateforme premium de beauté et bien-être en Algérie.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default BookingConfirmation;

// --- Styles en ligne ---
const main = {
  backgroundColor: '#F8F5F0',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '40px auto',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  border: '1px solid #E0D8CE',
  overflow: 'hidden',
  maxWidth: '600px',
};

const header = {
  backgroundColor: '#0A0A0A',
  padding: '20px',
  textAlign: 'center' as const,
};

const logo = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0',
};

const logoAccent = {
  color: '#B8922A',
};

const content = {
  padding: '40px',
};

const heading = {
  color: '#0A0A0A',
  fontSize: '24px',
  fontWeight: 'bold',
  marginBottom: '20px',
};

const text = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '24px',
  marginBottom: '16px',
};

const recapBox = {
  backgroundColor: '#FAFAFA',
  border: '1px solid #E0D8CE',
  borderRadius: '6px',
  padding: '20px',
  marginBottom: '24px',
  marginTop: '24px',
};

const recapText = {
  color: '#0A0A0A',
  fontSize: '15px',
  lineHeight: '28px',
  margin: '0',
};

const priceAccent = {
  color: '#B8922A',
  fontWeight: 'bold',
};

const hr = {
  borderColor: '#E0D8CE',
  margin: '30px 0',
};

const footer = {
  color: '#888888',
  fontSize: '14px',
  lineHeight: '20px',
  textAlign: 'center' as const,
};

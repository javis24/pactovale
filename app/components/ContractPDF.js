import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Registramos una fuente estándar para un look más formal (opcional)
Font.register({
  family: 'Roboto',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf',
});

// Estilos similares a CSS pero para PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Roboto',
    fontSize: 11,
    lineHeight: 1.5,
    color: '#333',
  },
  header: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    borderBottom: '2px solid #333',
    paddingBottom: 10,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
    marginTop: 12,
    textTransform: 'uppercase',
    color: '#000',
  },
  paragraph: {
    marginBottom: 10,
    textAlign: 'justify',
  },
  bold: {
    fontWeight: 'bold',
    color: '#000',
  },
  signatureSection: {
    marginTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBlock: {
    width: '45%',
    alignItems: 'center',
  },
  signatureImage: {
    width: 150,
    height: 60,
    marginBottom: 5,
    borderBottom: '1px solid #000',
  },
  signatureLine: {
    borderTop: '1px solid #000',
    width: '80%',
    marginTop: 50,
    marginBottom: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 9,
    textAlign: 'center',
    color: 'grey',
    borderTop: '1px solid #eee',
    paddingTop: 10,
  },
});

// Este componente recibe los datos del cliente y del préstamo para llenar los huecos
const ContractDocument = ({ client, loan }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '__________';
    return new Date(dateString).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const loanAmount = loan?.amount ? loan.amount.toFixed(2) : "0.00";
  const totalPayments = loan?.totalPayments || 0;
  const startDate = loan?.startDate || new Date();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text>CONTRATO DE PRÉSTAMO MERCANTIL CON GARANTÍA PIGNORATICIA</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.paragraph}>
            En la ciudad de Gómez Palacio, Durango, a <Text style={styles.bold}>{formatDate(startDate)}</Text>.
          </Text>

          <Text style={styles.title}>I. DECLARACIONES Y PARTES</Text>
          <Text style={styles.paragraph}>
            Comparecen a la celebración del presente contrato:
            {"\n\n"}
            Por una parte, <Text style={styles.bold}>PACTOVALE S.A. DE C.V.</Text> (en lo sucesivo "EL PRESTAMISTA"), sociedad mercantil legalmente constituida conforme a las leyes mexicanas.
            {"\n\n"}
            Y por la otra parte, el C. <Text style={styles.bold}>{client?.name.toUpperCase()}</Text> (en lo sucesivo "EL PRESTATARIO"), persona física, mayor de edad, con domicilio declarado en {client?.address}, quien se identifica con los datos proporcionados en su expediente digital.
            {"\n\n"}
            Ambas partes se reconocen mutuamente la capacidad legal necesaria para obligarse y convienen en celebrar el presente Contrato al tenor de las siguientes:
          </Text>

          <Text style={styles.title}>II. CLÁUSULAS</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>PRIMERA. OBJETO DEL PRÉSTAMO.</Text> EL PRESTAMISTA otorga en este acto a EL PRESTATARIO la cantidad de <Text style={styles.bold}>${loanAmount} (PESOS 00/100 M.N.)</Text>, cantidad que EL PRESTATARIO reconoce haber recibido a su entera satisfacción mediante transferencia a la cuenta bancaria número {client?.accountNumber || '__________'} del banco {client?.bankName || '__________'}.
          </Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>SEGUNDA. PLAZO Y FORMA DE PAGO.</Text> EL PRESTATARIO se obliga a restituir la cantidad recibida más los intereses ordinarios pactados, mediante <Text style={styles.bold}>{totalPayments} pagos quincenales</Text> consecutivos y de igual monto, de acuerdo con el calendario de pagos establecido en la plataforma digital de EL PRESTAMISTA.
          </Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>TERCERA. INTERESES MORATORIOS.</Text> En caso de que EL PRESTATARIO no realice alguno de los pagos en la fecha establecida, se generará automáticamente un interés moratorio a razón del <Text style={styles.bold}>10% (diez por ciento) mensual</Text> sobre el saldo insoluto vencido, calculado desde el día siguiente al del vencimiento hasta el día de su pago total.
          </Text>
          
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>CUARTA. PAGARÉ.</Text> Como garantía del cumplimiento de las obligaciones de pago derivadas de este contrato, EL PRESTATARIO suscribe en este acto un PAGARÉ a la vista a favor de EL PRESTAMISTA por el monto total del adeudo. La firma digital estampada por EL PRESTATARIO al final de este instrumento y en el proceso de solicitud digital tiene plena validez legal y efectos vinculantes conforme al Código de Comercio y la legislación aplicable.
          </Text>
          
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>QUINTA. JURISDICCIÓN.</Text> Para la interpretación y cumplimiento del presente contrato, las partes se someten expresamente a las leyes y tribunales competentes de la ciudad de Gómez Palacio, Durango, renunciando a cualquier otro fuero que por razón de sus domicilios presentes o futuros pudiera corresponderles.
          </Text>
        </View>

        <Text style={styles.paragraph}>
          Leído que fue el presente contrato por las partes y enteradas de su contenido y alcance legal, lo firman digitalmente en señal de conformidad.
        </Text>

        <View style={styles.signatureSection}>
          <View style={styles.signatureBlock}>
            <Text style={styles.paragraph}>EL PRESTAMISTA</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.bold}>PACTOVALE S.A. DE C.V.</Text>
            <Text style={{fontSize: 9}}>Representante Legal</Text>
          </View>

          <View style={styles.signatureBlock}>
            <Text style={styles.paragraph}>EL PRESTATARIO</Text>
            {client?.signature ? (
              // Aquí incrustamos la firma digital que guardamos en la BD
              <Image style={styles.signatureImage} src={client.signature} />
            ) : (
              <View style={styles.signatureLine} />
            )}
            <Text style={styles.bold}>{client?.name.toUpperCase()}</Text>
            <Text style={{fontSize: 9}}>Firma Digital Recabada</Text>
          </View>
        </View>
        
        <Text style={styles.footer}>
          Este contrato fue generado electrónicamente a través de la plataforma de Pactovale y cuenta con la firma digital del solicitante. Página 1 de 1.
        </Text>
      </Page>
    </Document>
  );
};

export default ContractDocument;
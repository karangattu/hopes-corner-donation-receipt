import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image as PDFImage } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#112233',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    color: '#112233',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    color: '#555555',
    marginTop: 5,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  text: {
    fontSize: 12,
    marginBottom: 10,
    lineHeight: 1.5,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 12,
    marginTop: 10,
  },
  value: {
    fontSize: 14,
    marginBottom: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 10,
    color: '#888888',
    borderTopWidth: 1,
    borderTopColor: '#CCCCCC',
    paddingTop: 10,
  },
  ein: {
    position: 'absolute',
    right: 40,
    bottom: 18,
    fontSize: 10,
    color: '#444444',
  },
  signatureSection: {
    marginTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: '#000000',
    width: 200,
    marginTop: 40,
    textAlign: 'center',
    paddingTop: 5,
    fontSize: 10,
  },
});

interface DonationReceiptProps {
  name: string;
  date: string;
  amount?: string;
  description?: string;
  email?: string;
  donationType?: 'Cash' | 'Merchandise' | 'Service' | string;
}

const DonationReceipt: React.FC<DonationReceiptProps> = ({ name, date, amount, description, email, donationType }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <PDFImage
            src="https://images.squarespace-cdn.com/content/v1/5622cd82e4b0501d40689558/cdab4aef-0027-40b7-9737-e2f893586a6a/Hopes_Corner_Logo_Green.png"
            style={{ width: 90, height: 40 }}
          />
          <View>
            <Text style={styles.title}>Hope&apos;s Corner Inc.</Text>
            <Text style={styles.subtitle}>Donation Receipt</Text>
            <Text style={styles.subtitle}>EIN: 47-3754161</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.text}>
          Thank you for your generous support of Hope&apos;s Corner. Your contribution helps us continue our mission.
        </Text>

        <Text style={styles.label}>Donor Name:</Text>
        <Text style={styles.value}>{name}</Text>
        {email && (
          <>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{email}</Text>
          </>
        )}

        <Text style={styles.label}>Date of Donation:</Text>
        <Text style={styles.value}>{date}</Text>

        {donationType && (
          <>
            <Text style={styles.label}>Donation Type:</Text>
            <Text style={styles.value}>{donationType}</Text>
          </>
        )}

        {amount && (
          <>
            <Text style={styles.label}>Donation Amount:</Text>
            <Text style={styles.value}>${amount}</Text>
          </>
        )}

        {description && (
          <>
            <Text style={styles.label}>Description:</Text>
            <Text style={styles.value}>{description}</Text>
          </>
        )}

        <Text style={styles.text}>
          Hope&apos;s Corner Inc. is a 501(c)(3) non-profit organization. Federal Tax Identification Number EIN 47-3754161. No goods or services were provided in exchange for this contribution.
        </Text>
      </View>

      <View style={styles.footer}>
        <Text>Hope&apos;s Corner Inc. | 748 Mercy Street | Mountain View, CA 94043 | (123) 456-7890 | https://www.hopes-corner.org/</Text>
        <Text>Thank you for making a difference!</Text>
      </View>
      <Text style={styles.ein}>EIN: 47-3754161</Text>
    </Page>
  </Document>
);

export default DonationReceipt;

'use client';

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
  signatureBlock: {
    marginTop: 40,
    alignItems: 'center',
  },
  signature: {
    width: 200,
    height: 40,
    marginBottom: 8,
  },
  signatureTitle: {
    fontSize: 10,
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#000000',
    paddingTop: 5,
    width: 200,
  },
});

interface DonationReceiptProps {
  name: string;
  date: string;
  estimatedValue?: string;
  itemDescription?: string;
  email?: string;
  organization?: string;
  address?: string;
  phone?: string;
  logoUrl: string;
}

const DonationReceipt: React.FC<DonationReceiptProps> = ({
  name,
  date,
  estimatedValue,
  itemDescription,
  email,
  organization,
  address,
  phone,
  logoUrl,
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <PDFImage
            src={logoUrl}
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

        {organization && (
          <>
            <Text style={styles.label}>Organization:</Text>
            <Text style={styles.value}>{organization}</Text>
          </>
        )}

        {address && (
          <>
            <Text style={styles.label}>Address:</Text>
            <Text style={styles.value}>{address}</Text>
          </>
        )}

        {email && (
          <>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{email}</Text>
          </>
        )}

        {phone && (
          <>
            <Text style={styles.label}>Phone:</Text>
            <Text style={styles.value}>{phone}</Text>
          </>
        )}

        <Text style={styles.label}>Date of Donation:</Text>
        <Text style={styles.value}>{date}</Text>

        {estimatedValue && (
          <>
            <Text style={styles.label}>Estimated Value:</Text>
            <Text style={styles.value}>${estimatedValue}</Text>
          </>
        )}

        {itemDescription && (
          <>
            <Text style={styles.label}>Item Description:</Text>
            <Text style={styles.value}>{itemDescription}</Text>
          </>
        )}

        <Text style={styles.text}>
          Hope&apos;s Corner Inc. is a 501(c)(3) non-profit organization. Federal Tax Identification Number EIN 47-3754161. No goods or services were provided in exchange for this contribution.
        </Text>

        <View style={styles.signatureBlock}>
          <PDFImage src="/priscilla_signature.png" style={styles.signature} />
          <Text style={styles.signatureTitle}>Hope&apos;s Corner Representative</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text>Hope&apos;s Corner Inc. | 748 Mercy Street | Mountain View, CA 94043 | (650) 254-1450 | hopes-corner.org</Text>
        <Text>Thank you for making a difference!</Text>
      </View>
      <Text style={styles.ein}>EIN: 47-3754161</Text>
    </Page>
  </Document>
);

export default DonationReceipt;

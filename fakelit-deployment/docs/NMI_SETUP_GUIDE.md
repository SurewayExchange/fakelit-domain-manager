# 💳 NMI Payment Gateway Setup Guide

## Overview
Network Merchants Inc. (NMI) is the payment gateway used by Fakelit.com for secure payment processing.

## Setup Steps

### 1. NMI Account Setup
1. **Sign up** for an NMI merchant account at https://www.nmi.com/
2. **Complete** merchant application and verification process
3. **Receive** your gateway credentials

### 2. Gateway Configuration
Update your .env file with NMI credentials:

```env
NMI_GATEWAY_ID=your_gateway_id
NMI_USERNAME=your_username
NMI_PASSWORD=your_password
NMI_ENDPOINT=https://secure.networkmerchants.com/api/transact.php
```

### 3. Test Mode vs Production
- **Test Mode**: Use sandbox credentials for development
- **Production Mode**: Use live credentials for real transactions

### 4. API Integration
The Fakelit.com system automatically integrates with NMI using:
- **Transaction Type**: Sale
- **Payment Method**: Credit Card
- **Currency**: USD
- **Response Format**: Key-value pairs

### 5. Security Requirements
- **PCI Compliance**: Ensure your application meets PCI DSS requirements
- **SSL/TLS**: All transactions must use HTTPS
- **Tokenization**: Consider using NMI's tokenization for enhanced security

## Testing

### Test Card Numbers
- **Visa**: 4111111111111111
- **Mastercard**: 5555555555554444
- **American Express**: 378282246310005
- **Discover**: 6011111111111117

### Test CVV
- Use any 3-digit number (e.g., 123)

### Test Expiry
- Use any future date (e.g., 12/25)

## Error Handling
Common NMI response codes:
- **1**: Transaction approved
- **2**: Transaction declined
- **3**: Error in transaction data
- **4**: Insufficient funds

## Support
- **NMI Support**: https://www.nmi.com/support/
- **Fakelit.com Support**: support@fakelit.com

🌐 Powered by: Fakelit.com

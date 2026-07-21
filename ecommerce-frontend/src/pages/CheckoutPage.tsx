import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Paper,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  Skeleton,
  Snackbar,
  Card,
  CardContent,
  Stack,
  CircularProgress,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { useAuth } from '../context/AuthContext';
import { getCart, clearCart, type Cart } from '../services/cartService';
import { realCheckout } from '../services/orderService';

interface ShippingDetails {
  fullName: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Stepper state
  const [activeStep, setActiveStep] = useState<number>(0);
  const steps = ['Shipping Details', 'Payment Method', 'Review Order'];

  // Form states
  const [shipping, setShipping] = useState<ShippingDetails>({
    fullName: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<string>('COD');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '' });
  const [upiId, setUpiId] = useState<string>('');

  // Validation errors
  const [formErrors, setFormErrors] = useState<Partial<ShippingDetails>>({});
  const [paymentErrors, setPaymentErrors] = useState<{ card?: string; upi?: string }>({});

  // Submitting order state
  const [submittingOrder, setSubmittingOrder] = useState<boolean>(false);

  // Snackbar feedback state
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const fetchCartData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCart();
      if (data.items.length === 0) {
        setError('Your cart is empty. Please add items to your cart before checking out.');
      } else {
        setCart(data);
      }
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Authentication required. Please sign in to checkout.');
      } else {
        setError('Failed to retrieve cart details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        setError('Authentication required. Please sign in to checkout.');
        setLoading(false);
      } else {
        fetchCartData();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  // Shipping Form Validation
  const validateShippingForm = (): boolean => {
    const errors: Partial<ShippingDetails> = {};
    if (!shipping.fullName.trim()) errors.fullName = 'Full Name is required';
    
    // Phone validation
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!shipping.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone Number is required';
    } else if (!phoneRegex.test(shipping.phoneNumber)) {
      errors.phoneNumber = 'Enter a valid phone number (at least 10 digits)';
    }

    if (!shipping.address.trim()) errors.address = 'Address is required';
    if (!shipping.city.trim()) errors.city = 'City is required';
    if (!shipping.state.trim()) errors.state = 'State is required';

    // Zip validation
    const zipRegex = /^\d{5,6}$/;
    if (!shipping.zipCode.trim()) {
      errors.zipCode = 'ZIP Code is required';
    } else if (!zipRegex.test(shipping.zipCode)) {
      errors.zipCode = 'Enter a valid 5 or 6 digit numeric ZIP Code';
    }

    if (!shipping.country.trim()) errors.country = 'Country is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Payment Form Validation
  const validatePaymentForm = (): boolean => {
    const errors: { card?: string; upi?: string } = {};
    if (paymentMethod === 'CARD') {
      if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv) {
        errors.card = 'Please fill out all credit card fields';
      } else if (cardDetails.number.replace(/\s/g, '').length < 16) {
        errors.card = 'Enter a valid 16-digit card number';
      }
    } else if (paymentMethod === 'UPI') {
      if (!upiId.trim() || !upiId.includes('@')) {
        errors.upi = 'Enter a valid UPI ID (e.g. user@bank)';
      }
    }
    setPaymentErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (validateShippingForm()) {
        setActiveStep((prev) => prev + 1);
      }
    } else if (activeStep === 1) {
      if (validatePaymentForm()) {
        setActiveStep((prev) => prev + 1);
      }
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handlePlaceOrder = async () => {
    if (!cart) return;
    setSubmittingOrder(true);
    try {
      // Post structured order details to the new real checkout endpoint
      const placedOrder = await realCheckout({
        shippingAddress: shipping.address,
        city: shipping.city,
        state: shipping.state,
        zip: shipping.zipCode,
        country: shipping.country,
        phone: shipping.phoneNumber,
        paymentMethod: paymentMethod,
      });

      // Clear the local cart
      await clearCart();

      setSnackbarMessage('Order placed successfully!');
      setSnackbarSeverity('success');

      // Navigate to order success screen
      setTimeout(() => {
        navigate(`/order-success/${placedOrder.orderId}`);
      }, 1000);
    } catch (err: any) {
      setSnackbarMessage(err.response?.data?.message || 'Failed to place order. Please try again.');
      setSnackbarSeverity('error');
    } finally {
      setSubmittingOrder(false);
    }
  };

  const handleInputChange = (field: keyof ShippingDetails, value: string) => {
    setShipping((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (authLoading || loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 4 }}>
          Checkout
        </Typography>
        <Skeleton variant="rectangular" height={80} sx={{ mb: 4, borderRadius: 2 }} />
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Skeleton variant="rectangular" height={350} sx={{ borderRadius: 2 }} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 2 }} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error || !cart) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, mb: 8, textAlign: 'center' }}>
        <Alert severity="warning" sx={{ mb: 3, display: 'inline-flex', alignItems: 'center' }}>
          {error}
        </Alert>
        <Box sx={{ mt: 2 }}>
          {!user ? (
            <Button variant="contained" color="primary" onClick={() => navigate('/login')}>
              Sign In
            </Button>
          ) : (
            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/cart')}>
              Back to Cart
            </Button>
          )}
        </Box>
      </Container>
    );
  }

  // Mathematics summary
  const subtotal = cart.totalPrice;
  const shippingCost = subtotal >= 50 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const grandTotal = subtotal + shippingCost + tax;
  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 4 }}>
        Checkout
      </Typography>

      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 5 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Grid container spacing={4}>
        {/* Step Inputs Panel */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            {activeStep === 0 && (
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                  Shipping Address
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Full Name"
                      fullWidth
                      value={shipping.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      error={!!formErrors.fullName}
                      helperText={formErrors.fullName}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Phone Number"
                      fullWidth
                      value={shipping.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      error={!!formErrors.phoneNumber}
                      helperText={formErrors.phoneNumber}
                      required
                    />
                  </Grid>
                  <Grid size={12}>
                    <TextField
                      label="Street Address"
                      fullWidth
                      value={shipping.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      error={!!formErrors.address}
                      helperText={formErrors.address}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="City"
                      fullWidth
                      value={shipping.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      error={!!formErrors.city}
                      helperText={formErrors.city}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="State / Province"
                      fullWidth
                      value={shipping.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      error={!!formErrors.state}
                      helperText={formErrors.state}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="ZIP / Postal Code"
                      fullWidth
                      value={shipping.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      error={!!formErrors.zipCode}
                      helperText={formErrors.zipCode}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Country"
                      fullWidth
                      value={shipping.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      error={!!formErrors.country}
                      helperText={formErrors.country}
                      required
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {activeStep === 1 && (
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                  Payment Method
                </Typography>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Select Payment Option</FormLabel>
                  <RadioGroup
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    sx={{ my: 2 }}
                  >
                    <FormControlLabel
                      value="COD"
                      control={<Radio />}
                      label="Cash on Delivery (COD)"
                    />
                    <FormControlLabel
                      value="CARD"
                      control={<Radio />}
                      label="Credit / Debit Card"
                    />
                    <FormControlLabel
                      value="UPI"
                      control={<Radio />}
                      label="UPI Transfer"
                    />
                  </RadioGroup>
                </FormControl>

                {/* Conditional Fields */}
                {paymentMethod === 'CARD' && (
                  <Card variant="outlined" sx={{ p: 3, mt: 2, borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                      Card Details
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid size={12}>
                        <TextField
                          label="Card Number"
                          fullWidth
                          placeholder="XXXX XXXX XXXX XXXX"
                          value={cardDetails.number}
                          onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                        />
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <TextField
                          label="Expiry Date"
                          placeholder="MM/YY"
                          fullWidth
                          value={cardDetails.expiry}
                          onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                        />
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <TextField
                          label="CVV"
                          placeholder="123"
                          fullWidth
                          value={cardDetails.cvv}
                          onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                        />
                      </Grid>
                    </Grid>
                    {paymentErrors.card && (
                      <Alert severity="error" sx={{ mt: 2 }}>
                        {paymentErrors.card}
                      </Alert>
                    )}
                  </Card>
                )}

                {paymentMethod === 'UPI' && (
                  <Card variant="outlined" sx={{ p: 3, mt: 2, borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                      UPI Address
                    </Typography>
                    <TextField
                      label="UPI ID"
                      fullWidth
                      placeholder="username@bank"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      error={!!paymentErrors.upi}
                      helperText={paymentErrors.upi}
                    />
                  </Card>
                )}
              </Box>
            )}

            {activeStep === 2 && (
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Order Review
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={4}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      Shipping Address:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {shipping.fullName}<br />
                      {shipping.address}<br />
                      {shipping.city}, {shipping.state} - {shipping.zipCode}<br />
                      {shipping.country}<br />
                      Phone: {shipping.phoneNumber}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      Payment Method:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {paymentMethod === 'COD' && 'Cash on Delivery'}
                      {paymentMethod === 'CARD' && 'Credit / Debit Card'}
                      {paymentMethod === 'UPI' && `UPI ID: ${upiId}`}
                    </Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Items Preview:
                </Typography>

                <List disablePadding>
                  {cart.items.map((item) => (
                    <ListItem key={item.id} sx={{ py: 1.5, px: 0 }}>
                      <ListItemText
                        primary={item.productName}
                        secondary={`Quantity: ${item.quantity} x $${item.productPrice.toFixed(2)}`}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        ${item.subTotal.toFixed(2)}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* Stepper Navigation Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              {activeStep === 0 ? (
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate('/cart')}
                >
                  Back to Cart
                </Button>
              ) : (
                <Button variant="outlined" onClick={handleBack} disabled={submittingOrder}>
                  Back
                </Button>
              )}

              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handlePlaceOrder}
                  disabled={submittingOrder}
                  startIcon={submittingOrder ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
                  sx={{ px: 4, py: 1 }}
                >
                  {submittingOrder ? 'Placing Order...' : 'Place Order'}
                </Button>
              ) : (
                <Button variant="contained" onClick={handleNext}>
                  Next
                </Button>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Cost Summary Box (Fixed to Right Column) */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Summary
            </Typography>
            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Total Items</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{totalItems}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>${subtotal.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Shipping Cost</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Estimated Tax</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>${tax.toFixed(2)}</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Grand Total</Typography>
                <Typography variant="h5" color="primary" sx={{ fontWeight: 850 }}>
                  ${grandTotal.toFixed(2)}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Snackbar feedback notifications */}
      <Snackbar
        open={snackbarMessage !== null}
        autoHideDuration={5000}
        onClose={() => setSnackbarMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarMessage(null)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CheckoutPage;

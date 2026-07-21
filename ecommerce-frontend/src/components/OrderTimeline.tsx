import React from 'react';
import { Stepper, Step, StepLabel, Box, Typography, Alert } from '@mui/material';
import PendingIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import HomeIcon from '@mui/icons-material/Home';
import CancelIcon from '@mui/icons-material/Cancel';

interface OrderTimelineProps {
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
}

const OrderTimeline: React.FC<OrderTimelineProps> = ({ status }) => {
  const steps = [
    { label: 'Order Placed', icon: <PendingIcon /> },
    { label: 'Processing', icon: <CheckCircleIcon /> },
    { label: 'Shipped', icon: <LocalShippingIcon /> },
    { label: 'Delivered', icon: <HomeIcon /> }
  ];

  const getActiveStep = () => {
    switch (status) {
      case 'PENDING':
        return 0;
      case 'CONFIRMED':
        return 1;
      case 'SHIPPED':
        return 2;
      case 'DELIVERED':
        return 4; // All completed
      case 'CANCELLED':
        return -1;
      default:
        return 0;
    }
  };

  const activeStep = getActiveStep();

  return (
    <Box sx={{ width: '100%', py: 2 }}>
      {status === 'CANCELLED' ? (
        <Alert severity="error" icon={<CancelIcon />} sx={{ mb: 2, borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Order Cancelled
          </Typography>
          This order was cancelled and is no longer being processed.
        </Alert>
      ) : null}

      <Stepper
        activeStep={activeStep}
        alternativeLabel
        sx={{
          '& .MuiStepIcon-root.Mui-active': { color: 'primary.main' },
          '& .MuiStepIcon-root.Mui-completed': { color: 'success.main' }
        }}
      >
        {steps.map((step, index) => (
          <Step key={step.label} completed={activeStep > index}>
            <StepLabel
              icon={
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: activeStep > index ? 'success.main' : activeStep === index ? 'primary.main' : 'text.disabled'
                  }}
                >
                  {step.icon}
                </Box>
              }
            >
              <Typography variant="body2" sx={{ fontWeight: activeStep === index ? 600 : 400 }}>
                {step.label}
              </Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default OrderTimeline;

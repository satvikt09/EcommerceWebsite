import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 6,
        textAlign: 'center',
        borderRadius: 3,
        bgcolor: 'action.hover',
        border: '1px dashed',
        borderColor: 'divider',
        my: 3,
      }}
    >
      <Box sx={{ color: 'text.secondary', fontSize: 64, mb: 2, display: 'flex', justifyContent: 'center' }}>
        {icon || <InboxIcon sx={{ fontSize: 64, opacity: 0.6 }} />}
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 450, mx: 'auto', mb: 3 }}>
          {description}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button variant="contained" color="primary" onClick={onAction} sx={{ px: 3, py: 1 }}>
          {actionLabel}
        </Button>
      )}
    </Paper>
  );
};

export default EmptyState;

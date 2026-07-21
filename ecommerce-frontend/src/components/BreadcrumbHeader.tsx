import React from 'react';
import { Breadcrumbs, Link as MuiLink, Typography, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbHeaderProps {
  items: BreadcrumbItem[];
}

const BreadcrumbHeader: React.FC<BreadcrumbHeaderProps> = ({ items }) => {
  return (
    <Box sx={{ py: 1.5, mb: 2 }}>
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb navigation"
      >
        <MuiLink
          component={RouterLink}
          to="/"
          color="inherit"
          sx={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', fontWeight: 500 }}
        >
          <HomeIcon sx={{ mr: 0.5, fontSize: '1.1rem' }} />
          Home
        </MuiLink>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return isLast || !item.path ? (
            <Typography
              key={index}
              color="text.primary"
              sx={{ fontSize: '0.875rem', fontWeight: 600 }}
            >
              {item.label}
            </Typography>
          ) : (
            <MuiLink
              key={index}
              component={RouterLink}
              to={item.path}
              color="inherit"
              underline="hover"
              sx={{ fontSize: '0.875rem', fontWeight: 500 }}
            >
              {item.label}
            </MuiLink>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
};

export default BreadcrumbHeader;

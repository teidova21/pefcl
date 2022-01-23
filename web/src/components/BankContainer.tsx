import { Box } from '@mui/material';
import { styled } from '@mui/system';

export const BankWrapper = styled(Box)({
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

export const BankContainer = styled(Box)(({ theme }) => ({
  width: '1400px',
  height: '800px',
  borderRadius: 7,
  backgroundColor: theme.palette.background.default,
}));

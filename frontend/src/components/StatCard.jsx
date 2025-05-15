import { Card, CardContent, Typography, CircularProgress, Box } from '@mui/material';

const StatCard = ({ title, value }) => (
  <Card
    sx={{
      width: '220px',
      height: '160px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 4,
      boxShadow: 3,
      transition: '0.3s',
      '&:hover': { boxShadow: 6 }
    }}
  >
    <CardContent sx={{ textAlign: 'center' }}>
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        {title}
      </Typography>
      {value === null ? (
        <CircularProgress size={24} />
      ) : typeof value === 'string' || typeof value === 'number' ? (
        <Typography variant="h5" fontWeight="600">{value}</Typography>
      ) : (
        <Box sx={{textAlign: 'left', maxHeight: 80, overFlowY: 'auto'}}>
          {value}
        </Box>
      )}
    </CardContent>
  </Card>
);

export default StatCard;

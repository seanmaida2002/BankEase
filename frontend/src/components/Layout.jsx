import { Box, Drawer, List, ListItem, ListItemButton, ListItemText, Typography, Toolbar } from '@mui/material';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

const drawerWidth = 200;

// Navigation items with dashboard at the top
const navItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Alerts', path: '/alerts' },
  { label: 'Expenses', path: '/expenses' },
  { label: 'Bills', path: '/bills' },
  { label: 'Deposits', path: '/deposits' },
  { label: 'Profile', path: '/profile' },
  { label: 'Log Out'},
];

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Sidebar / Drawer */}
      <Drawer
        variant="permanent"
        anchor="left"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: '#1A3B5D',
            color: 'white',
            paddingTop: 2,
          },
        }}
      >
        {/* Logo acting as Dashboard link */}
        <Toolbar sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <NavLink to="/dashboard" style={{ textDecoration: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AccountBalanceIcon fontSize="small" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              BankEase
            </Typography>
          </NavLink>
        </Toolbar>

        {/* Navigation Items */}
        <List>
          {navItems.map((item, index) => (
            <ListItem key={item.path || index} disablePadding>
              {item.label === 'Log Out' ? (
                <ListItemButton
                  onClick={handleLogout}
                  sx={{
                    px: 3,
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  <ListItemText primary={item.label} />
                </ListItemButton>
              ) : <ListItemButton
                component={NavLink}
                to={item.path}
                selected={location.pathname === item.path}
                sx={{
                  px: 3,
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    fontWeight: 'bold',
                  },
                }}
              >
                <ListItemText primary={item.label} />
              </ListItemButton>}
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: '#FAF3E0',
          minHeight: '100vh',
          p: 3,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

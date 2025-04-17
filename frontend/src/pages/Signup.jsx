import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  FormControlLabel,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  Chip
} from '@mui/material';
import axios from 'axios';
import logo from '../styles/eeris-center-icon.svg';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSupervisor, setIsSupervisor] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch all users when component mounts
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/get_users');
        setAvailableUsers(response.data.users);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  const handleAdminChange = (e) => {
    if (e.target.checked) {
      setIsAdmin(true);
      setIsSupervisor(false);
      setSelectedTeam([]);
    } else {
      setIsAdmin(false);
    }
  };

  const handleSupervisorChange = (e) => {
    if (e.target.checked) {
      setIsSupervisor(true);
      setIsAdmin(false);
    } else {
      setIsSupervisor(false);
      setSelectedTeam([]);
    }
  };

  const handleAddTeamMember = (username) => {
    if (!selectedTeam.includes(username)) {
      setSelectedTeam([...selectedTeam, username]);
    }
  };

  const handleRemoveTeamMember = (username) => {
    setSelectedTeam(selectedTeam.filter(member => member !== username));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/signup', {
        username,
        password,
        role: isAdmin ? 'admin' : (isSupervisor ? 'supervisor' : 'user'),
        team: selectedTeam
      });
      
      if (response.data.message === 'Signup successful') {
        navigate('/login');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#f0f8f0',
      m: 0,
      p: 0,
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    }}>
      <Container maxWidth="sm" sx={{ pt: 8 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box component="img" src={logo} alt="EERIS Logo" sx={{ width: 150, height: 150, mb: 2 }} />
          <Typography component="h1" variant="h4" sx={{ mb: 4, textAlign: 'center' }}>
            Welcome to the Employee Expense Reporting Information System!
          </Typography>
          <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
            <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
              Sign Up
            </Typography>
            
            <form onSubmit={handleSubmit}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              
              <FormGroup sx={{ mt: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isAdmin}
                      onChange={handleAdminChange}
                      name="isAdmin"
                      color="primary"
                    />
                  }
                  label="Admin account"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isSupervisor}
                      onChange={handleSupervisorChange}
                      name="isSupervisor"
                      color="primary"
                    />
                  }
                  label="Supervisor account"
                />
              </FormGroup>

              {isSupervisor && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Team Members
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {selectedTeam.map((member) => (
                      <Chip
                        key={member}
                        label={member}
                        onDelete={() => handleRemoveTeamMember(member)}
                        color="primary"
                      />
                    ))}
                  </Box>
                  <FormControl fullWidth>
                    <InputLabel id="team-select-label">Add Team Member</InputLabel>
                    <Select
                      labelId="team-select-label"
                      id="team-select"
                      value=""
                      label="Add Team Member"
                      onChange={(e) => handleAddTeamMember(e.target.value)}
                    >
                      {availableUsers
                        .filter(user => !selectedTeam.includes(user.username))
                        .map((user) => (
                          <MenuItem key={user.username} value={user.username}>
                            {user.username}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Box>
              )}
              
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Create Account
              </Button>
              
              <Box sx={{ textAlign: 'center' }}>
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  <Typography color="primary">
                    Already have an account? Login
                  </Typography>
                </Link>
              </Box>
            </form>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default Signup; 
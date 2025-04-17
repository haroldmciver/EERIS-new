import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  Typography
} from '@mui/material';
import axios from 'axios';

const RoleChangeModal = ({ open, onClose, username, currentRole }) => {
  const [role, setRole] = useState('user');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch the user's current role and team
        const userResponse = await axios.get(`/get_user/${username}`);
        const { role: userRole, team: userTeam } = userResponse.data;
        setRole(userRole);
        // If the user is a supervisor, include them in their own team
        if (userRole === 'supervisor') {
          setSelectedTeam([...new Set([username, ...(userTeam || [])])]);
        } else {
          setSelectedTeam(userTeam || []);
        }

        // Fetch available users for team selection
        const usersResponse = await axios.get('/get_users');
        const regularUsers = usersResponse.data.users.filter(
          user => user.role === 'user' && user.username !== username
        );
        setAvailableUsers(regularUsers);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setErrorMessage('Failed to fetch user data');
      }
    };

    if (open) {
      fetchUserData();
    }
  }, [open, username]);

  const handleAddTeamMember = (username) => {
    if (!selectedTeam.includes(username)) {
      setSelectedTeam([...selectedTeam, username]);
    }
  };

  const handleRemoveTeamMember = (username) => {
    setSelectedTeam(selectedTeam.filter(member => member !== username));
  };

  const handleSubmit = async () => {
    try {
      // If role is supervisor, use the selected team without adding the supervisor
      const finalTeam = role === 'supervisor' ? selectedTeam : [];

      await axios.post('/update_user_role', {
        username,
        role,
        team: finalTeam
      });
      onClose(true); // Pass true to indicate successful update
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Failed to update role');
    }
  };

  return (
    <Dialog open={open} onClose={() => onClose(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Change User Role</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            User: {username}
          </Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="role-select-label">Role</InputLabel>
            <Select
              labelId="role-select-label"
              id="role-select"
              value={role}
              label="Role"
              onChange={(e) => setRole(e.target.value)}
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="supervisor">Supervisor</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>

          {role === 'supervisor' && (
            <Box>
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
          {errorMessage && (
            <Typography color="error" sx={{ mt: 2 }}>
              {errorMessage}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Update Role
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoleChangeModal; 
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  AppBar,
  Toolbar
} from '@mui/material';
import axios from 'axios';
import UploadModal from '../components/UploadModal';
import ReceiptsTable from '../components/ReceiptsTable';
import ViewReceiptModal from '../components/ViewReceiptModal';
import EditReceiptModal from '../components/EditReceiptModal';
import ChatComponent from '../components/ChatComponent';

const Dashboard = () => {
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [receipts, setReceipts] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSupervisor, setIsSupervisor] = useState(false);
  const navigate = useNavigate();
  const username = sessionStorage.getItem('username');

  useEffect(() => {
    checkRole();
    loadReceipts();
  }, []);

  const checkRole = async () => {
    try {
      const response = await axios.get('/check_role');
      const role = response.data.role;
      setIsAdmin(role === 'admin');
      setIsSupervisor(role === 'supervisor');
    } catch (error) {
      console.error('Error checking role:', error);
    }
  };

  const loadReceipts = async () => {
    try {
      const response = await axios.get('/my_receipts');
      setReceipts(response.data);
    } catch (error) {
      console.error('Error loading receipts:', error);
    }
  };

  const handleLogout = () => {
    // Clear the chat history from sessionStorage
    sessionStorage.removeItem('chatHistory');
    sessionStorage.removeItem('username');
    navigate('/login');
  };

  const handleViewReceipt = (receipt) => {
    setSelectedReceipt(receipt);
    setViewModalOpen(true);
  };

  const handleEditReceipt = (receipt) => {
    setSelectedReceipt(receipt);
    setEditModalOpen(true);
  };

  const handleUpdateStatus = async (username, processedAt, newStatus) => {
    try {
      await axios.post('/update_receipt_status', {
        username,
        processed_at: processedAt,
        status: newStatus
      });
      loadReceipts();
      setViewModalOpen(false);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleGenerateReport = async () => {
    try {
      const response = await axios.get('/generate_team_report', {
        responseType: 'blob'
      });
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Create a link element and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `team_report_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      bgcolor: '#f5f5f5'
    }}>
      <AppBar position="static">
        <Toolbar>
          <Typography 
            variant="h6" 
            sx={{ 
              flexGrow: 0,
              marginRight: 'auto'
            }}
          >
            Employee Expense Reporting Information System
          </Typography>
          <Button
            variant="contained"
            onClick={() => setUploadModalOpen(true)}
            sx={{ 
              mr: 2,
              bgcolor: 'white',
              color: '#1976d2',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.9)',
              }
            }}
          >
            Upload Receipt
          </Button>
          <Typography sx={{ mr: 1 }}>User: {username}</Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              mr: 2,
              bgcolor: isAdmin ? '#f50057' : (isSupervisor ? '#1976d2' : '#2e7d32'),
              color: 'white',
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              fontWeight: 'medium'
            }}
          >
            Role: {isAdmin ? 'Admin' : (isSupervisor ? 'Supervisor' : 'User')}
          </Typography>
          <Button color="inherit" onClick={handleLogout}>Logout</Button>
        </Toolbar>
      </AppBar>

      <Container 
        maxWidth={false} 
        sx={{ 
          flexGrow: 1, 
          py: 4,
          px: { xs: 2, sm: 4, md: 6 },
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 4
        }}>
          <Typography variant="h5">
            Receipts Dashboard
          </Typography>
          {isSupervisor && (
            <Button
              variant="contained"
              onClick={handleGenerateReport}
              sx={{
                bgcolor: '#64b5f6',
                '&:hover': {
                  bgcolor: '#42a5f5',
                }
              }}
            >
              Generate Team Report
            </Button>
          )}
        </Box>

        <Box sx={{ 
          display: 'flex', 
          gap: 4,
          flexGrow: 1,
          width: '100%',
          height: 'calc(100vh - 200px)'
        }}>
          {/* Left container - Receipts Table (66%) */}
          <Box sx={{ 
            width: '66%',
            backgroundColor: 'white',
            borderRadius: 1,
            boxShadow: 1,
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto'
          }}>
            <ReceiptsTable
              receipts={receipts}
              isAdmin={isAdmin}
              isSupervisor={isSupervisor}
              onViewReceipt={handleViewReceipt}
              onEditReceipt={handleEditReceipt}
              onUpdateStatus={handleUpdateStatus}
            />
          </Box>

          {/* Right container (33%) */}
          <Box sx={{ 
            width: '33%',
            backgroundColor: 'white',
            borderRadius: 1,
            boxShadow: 1,
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'  // Prevent scrollbars on the container itself
          }}>
            <ChatComponent />
          </Box>
        </Box>

        <UploadModal
          open={isUploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          onReceiptSaved={loadReceipts}
        />

        <ViewReceiptModal
          open={isViewModalOpen}
          onClose={() => setViewModalOpen(false)}
          receipt={selectedReceipt}
          onEdit={() => {
            setViewModalOpen(false);
            setEditModalOpen(true);
          }}
          userRole={isAdmin ? 'admin' : 'employee'}
          onStatusChange={handleUpdateStatus}
        />

        <EditReceiptModal
          open={isEditModalOpen}
          onClose={() => setEditModalOpen(false)}
          receipt={selectedReceipt}
          onReceiptUpdated={loadReceipts}
        />
      </Container>
    </Box>
  );
};

export default Dashboard; 
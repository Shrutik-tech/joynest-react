import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import InvitationModal from '../components/InvitationModal';
import ViewInvitationModal from '../components/ViewInvitationModal';
import VendorCard from '../components/VendorCard';
import { eventApi } from '../services/eventApi';
import './UserDashboard.css';

const UserDashboard = ({ setCurrentPage, user }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('ai');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      type: 'ai',
      content: t('ai_assistant_desc') || "Hello! I'm your event planning assistant. Describe your event and I'll help you plan it step by step, including vendor recommendations."
    }
  ]);

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // States for events, vendors, invitations, notes
  const [userEvents, setUserEvents] = useState([]);
  const [userInvitations, setUserInvitations] = useState([]);
  const [userNotes, setUserNotes] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [vendorFilter, setVendorFilter] = useState('');
  const [vendorLoading, setVendorLoading] = useState(false);
  
  // Modal states
  const [showInvitationModal, setShowInvitationModal] = useState(false);
  const [viewingInvitation, setViewingInvitation] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  
  // Form state for create event
  const [eventForm, setEventForm] = useState({
    name: '',
    type: '',
    date: '',
    time: '',
    timeAmPm: 'AM',
    location: '',
    guests: '',
    budget: '',
    description: ''
  });

  // Notes and checklist state
  const [checklistItems, setChecklistItems] = useState([]);
  const [checklistInput, setChecklistInput] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  
  // Edit mode state
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Helper function to format time with AM/PM for display
  const formatDisplayTime = (time, ampm) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    let displayHours = parseInt(hours);
    let displayAmPm = ampm || (displayHours >= 12 ? 'PM' : 'AM');
    
    if (displayHours > 12) {
      displayHours = displayHours - 12;
    } else if (displayHours === 0) {
      displayHours = 12;
    }
    
    return `${displayHours}:${minutes} ${displayAmPm}`;
  };

  // Helper function to format time from 24h to 12h for display in events
  const formatEventTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // ============================================
  // Get user ID with proper number conversion
  // ============================================
  const getUserId = useCallback(() => {
    if (user?.id) {
      return parseInt(user.id);
    }
    
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        return parsedUser.id ? parseInt(parsedUser.id) : null;
      } catch (e) {
        console.error('Error parsing stored user:', e);
      }
    }
    return null;
  }, [user]);

  // ============================================
  // USER FUNCTIONS
  // ============================================
  const getUserName = () => {
    if (user?.fullName) return user.fullName;
    if (user?.username) return user.username;
    if (user?.email) return user.email;
    return t('event_planner') || 'User';
  };

  // ============================================
  // EVENT FUNCTIONS
  // ============================================
  const loadEvents = useCallback(async () => {
    const userId = getUserId();
    if (!userId) {
      const savedEvents = localStorage.getItem('joynest_events');
      if (savedEvents) {
        try {
          const allEvents = JSON.parse(savedEvents);
          setUserEvents(allEvents);
        } catch (err) {
          console.error('Error parsing events:', err);
        }
      }
      return;
    }

    try {
      const events = await eventApi.getUserEvents(userId);
      setUserEvents(events);
    } catch (error) {
      console.error('Error loading events from backend:', error);
      const savedEvents = localStorage.getItem('joynest_events');
      if (savedEvents) {
        try {
          const allEvents = JSON.parse(savedEvents);
          const userEvents = allEvents.filter(event => event.user_id === userId);
          setUserEvents(userEvents);
        } catch (err) {
          console.error('Error parsing events:', err);
        }
      }
    }
  }, [getUserId]);

  const handleEventFormChange = (e) => {
    const { id, value } = e.target;
    setEventForm(prev => ({ ...prev, [id]: value }));
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    const { name, type, date, location, time, timeAmPm } = eventForm;

    if (!name || !type || !date || !location) {
      alert(t('fill_required_fields') || 'Please fill all required fields');
      return;
    }

    const userId = getUserId();
    if (!userId) {
      alert('User not logged in. Please login again.');
      return;
    }

    let formattedTime = time || '';
    if (time && timeAmPm) {
      const [hours, minutes] = time.split(':');
      let hour24 = parseInt(hours);
      
      if (timeAmPm === 'PM' && hour24 < 12) {
        hour24 = hour24 + 12;
      } else if (timeAmPm === 'AM' && hour24 === 12) {
        hour24 = 0;
      }
      
      formattedTime = `${hour24.toString().padStart(2, '0')}:${minutes}`;
    }

    const eventData = {
      title: name,
      event_type: type,
      date: date,
      time: formattedTime,
      location: location,
      guests: eventForm.guests ? parseInt(eventForm.guests) : 0,
      budget: eventForm.budget ? parseFloat(eventForm.budget) : 0,
      description: eventForm.description || '',
      user_id: userId
    };

    try {
      const result = await eventApi.createEvent(eventData);
      
      if (result.success) {
        await loadEvents();
        alert(t('event_created_success') || 'Event created successfully!');
        
        setEventForm({
          name: '', type: '', date: '', time: '', timeAmPm: 'AM', location: '', 
          guests: '', budget: '', description: ''
        });
        
        setActiveTab('events');
      } else {
        alert('Error creating event: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event. Please try again.');
      
      const eventData = {
        id: 'event_' + Date.now(),
        user_id: userId,
        title: name,
        event_type: type,
        date: date,
        time: formattedTime,
        location: location,
        guests: eventForm.guests,
        budget: eventForm.budget,
        description: eventForm.description
      };

      const savedEvents = localStorage.getItem('joynest_events');
      let allEvents = [];
      if (savedEvents) {
        try {
          allEvents = JSON.parse(savedEvents);
        } catch (err) {
          console.error('Error parsing events:', err);
        }
      }
      
      allEvents.push(eventData);
      localStorage.setItem('joynest_events', JSON.stringify(allEvents));
      
      const userEvents = allEvents.filter(event => event.user_id === userId);
      setUserEvents(userEvents);
      
      setEventForm({
        name: '', type: '', date: '', time: '', timeAmPm: 'AM', location: '', 
        guests: '', budget: '', description: ''
      });
      setActiveTab('events');
    }
  };

  const deleteEvent = async (eventId) => {
    if (!window.confirm(t('confirm_delete_event') || 'Are you sure you want to delete this event?')) return;
    
    const userId = getUserId();
    
    try {
      if (userId) {
        const result = await eventApi.deleteEvent(eventId);
        if (result.success) {
          await loadEvents();
          alert(t('event_deleted_success') || 'Event deleted successfully');
        } else {
          alert('Error deleting event: ' + (result.error || 'Unknown error'));
        }
      } else {
        const savedEvents = localStorage.getItem('joynest_events');
        if (savedEvents) {
          try {
            const allEvents = JSON.parse(savedEvents);
            const updatedEvents = allEvents.filter(event => event.id !== eventId);
            localStorage.setItem('joynest_events', JSON.stringify(updatedEvents));
            
            const userEvents = updatedEvents.filter(event => event.user_id === userId);
            setUserEvents(userEvents);
            
            alert(t('event_deleted_success') || 'Event deleted successfully');
          } catch (err) {
            console.error('Error deleting event:', err);
          }
        }
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event. Please try again.');
    }
  };

  // ============================================
  // VENDOR FUNCTIONS
  // ============================================
  const loadVendors = useCallback((serviceType = '') => {
    setVendorLoading(true);
    setVendorFilter(serviceType);
    
    let url = 'http://localhost:5000/api/all-vendors';
    if (serviceType) {
      url += `?service_type=${serviceType}`;
    }
    
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log("✅ Vendors loaded:", data);
        if (serviceType && Array.isArray(data)) {
          setVendors(data.filter(v => v.service_type === serviceType));
        } else {
          setVendors(data);
        }
        setVendorLoading(false);
      })
      .catch(error => {
        console.error('Error loading vendors from backend:', error);
        setVendorLoading(false);
        setVendors([]);
      });
  }, []);

  // ============================================
  // INVITATION FUNCTIONS
  // ============================================
  const loadInvitations = useCallback(() => {
    const userId = getUserId();
    if (!userId) return;

    const savedInvitations = localStorage.getItem('joynest_invitations');
    if (savedInvitations) {
      try {
        const allInvitations = JSON.parse(savedInvitations);
        const userInvitations = allInvitations.filter(inv => inv.userId === userId);
        setUserInvitations(userInvitations);
      } catch (err) {
        console.error('Error parsing invitations:', err);
      }
    }

    fetch(`http://localhost:5000/api/invitations/user/${userId}`)
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data)) {
          const formattedInvitations = data.map(inv => ({
            id: inv.id,
            userId: inv.user_id,
            template: inv.template_id,
            fontFamily: inv.font_family,
            fontColor: inv.font_color,
            accentColor: inv.accent_color,
            photoUrl: inv.photo_url,
            created_at: inv.created_at
          }));
          setUserInvitations(formattedInvitations);
        }
      })
      .catch(error => console.error('Error loading invitations from backend:', error));
  }, [getUserId]);

  const handleSaveInvitation = async (invitationData) => {
    try {
      const userId = getUserId();
      if (!userId) {
        alert('User not logged in. Please login again.');
        return;
      }

      const invitationWithUser = {
        ...invitationData,
        userId: userId
      };

      const requestData = {
        user_id: userId,
        template_id: invitationWithUser.template || 1,
        font_family: invitationWithUser.fontFamily || invitationWithUser.fontStyle || '',
        font_color: invitationWithUser.fontColor || '',
        accent_color: invitationWithUser.accentColor || '',
        photo_url: invitationWithUser.photoUrl || invitationWithUser.photo || '',
      };
      
      console.log("📤 Sending invitation to backend:", requestData);
      
      const response = await fetch('http://localhost:5000/api/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });
      
      const result = await response.json();
      console.log("📥 Invitation save response:", result);
      
      if (result.success || result.message === 'Invitation saved successfully') {
        const savedInvitations = localStorage.getItem('joynest_invitations');
        let allInvitations = [];
        if (savedInvitations) {
          try {
            allInvitations = JSON.parse(savedInvitations);
          } catch (err) {
            console.error('Error parsing invitations:', err);
          }
        }
        
        const newInvitation = {
          ...invitationWithUser,
          id: result.invitation_id || 'inv_' + Date.now()
        };
        
        allInvitations.push(newInvitation);
        localStorage.setItem('joynest_invitations', JSON.stringify(allInvitations));
        
        const userInvitations = allInvitations.filter(inv => inv.userId === userId);
        setUserInvitations(userInvitations);
        
        alert(t('invitation_saved_success') || 'Invitation saved successfully!');
        setShowInvitationModal(false);
      } else {
        alert('Error saving invitation: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving invitation:', error);
      
      const userId = getUserId();
      const savedInvitations = localStorage.getItem('joynest_invitations');
      let allInvitations = [];
      if (savedInvitations) {
        try {
          allInvitations = JSON.parse(savedInvitations);
        } catch (err) {
          console.error('Error parsing invitations:', err);
        }
      }
      
      const newInvitation = {
        ...invitationData,
        userId: userId,
        id: 'inv_' + Date.now()
      };
      
      allInvitations.push(newInvitation);
      localStorage.setItem('joynest_invitations', JSON.stringify(allInvitations));
      
      const userInvitations = allInvitations.filter(inv => inv.userId === userId);
      setUserInvitations(userInvitations);
      
      alert(t('invitation_saved_success') || 'Invitation saved successfully!');
      setShowInvitationModal(false);
    }
  };

  const handleViewInvitation = (invitation) => {
    console.log("Viewing invitation:", invitation);
    setViewingInvitation(invitation);
    setShowViewModal(true);
  };

  const deleteInvitation = (invitationId) => {
    if (!window.confirm(t('confirm_delete_invitation') || 'Are you sure you want to delete this invitation?')) return;
    
    const userId = getUserId();
    const savedInvitations = localStorage.getItem('joynest_invitations');
    
    if (savedInvitations) {
      try {
        const allInvitations = JSON.parse(savedInvitations);
        const updatedAllInvitations = allInvitations.filter(inv => inv.id !== invitationId);
        localStorage.setItem('joynest_invitations', JSON.stringify(updatedAllInvitations));
        
        const userInvitations = updatedAllInvitations.filter(inv => inv.userId === userId);
        setUserInvitations(userInvitations);
        
        alert(t('invitation_deleted_success') || 'Invitation deleted successfully');
      } catch (err) {
        console.error('Error deleting invitation:', err);
      }
    }

    fetch(`http://localhost:5000/api/invitations/${invitationId}`, {
      method: 'DELETE',
    }).catch(error => console.error('Error deleting invitation from backend:', error));
  };

  // ============================================
  // NOTES & CHECKLIST FUNCTIONS
  // ============================================
  const loadNotes = useCallback(async () => {
    const userId = getUserId();
    if (!userId) {
      const savedNotes = localStorage.getItem('joynest_notes');
      if (savedNotes) {
        try {
          const allNotes = JSON.parse(savedNotes);
          setUserNotes(allNotes);
        } catch (err) {
          console.error('Error parsing notes:', err);
        }
      }
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/notes/user/${userId}`);
      const notes = await response.json();
      setUserNotes(notes);
    } catch (error) {
      console.error('Error loading notes from backend:', error);
      const savedNotes = localStorage.getItem('joynest_notes');
      if (savedNotes) {
        try {
          const allNotes = JSON.parse(savedNotes);
          const userNotes = allNotes.filter(note => note.user_id === userId);
          setUserNotes(userNotes);
        } catch (err) {
          console.error('Error parsing notes:', err);
        }
      }
    }
  }, [getUserId]);

  const handleAddChecklistItem = () => {
    if (checklistInput.trim()) {
      setChecklistItems([...checklistItems, { text: checklistInput, completed: false }]);
      setChecklistInput('');
    }
  };

  const handleRemoveChecklistItem = (index) => {
    const updated = [...checklistItems];
    updated.splice(index, 1);
    setChecklistItems(updated);
  };

  const handleEditNote = (note) => {
    console.log("📝 Editing note:", note);
    setEditingNoteId(note.id);
    setIsEditMode(true);
    setNoteTitle(note.title);
    setNoteContent(note.content || '');
    setChecklistItems(note.checklist_items || []);
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setIsEditMode(false);
    setNoteTitle('');
    setNoteContent('');
    setChecklistItems([]);
  };

  const handleSaveNote = async () => {
    if (!noteTitle.trim()) {
      alert(t('enter_note_title') || 'Please enter a note title');
      return;
    }

    const userId = getUserId();
    if (!userId) {
      alert('User not logged in. Please login again.');
      return;
    }

    const noteData = {
      title: noteTitle,
      content: noteContent,
      checklist_items: checklistItems,
      user_id: userId
    };

    try {
      let response;
      let result;
      
      if (isEditMode && editingNoteId) {
        response = await fetch(`http://localhost:5000/api/notes/${editingNoteId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(noteData)
        });
      } else {
        response = await fetch('http://localhost:5000/api/notes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(noteData)
        });
      }
      
      result = await response.json();
      
      if (result.success) {
        await loadNotes();
        handleCancelEdit();
        alert(isEditMode ? 'Note updated successfully!' : 'Note saved successfully!');
      } else {
        alert('Error saving note: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving note:', error);
      
      const savedNotes = localStorage.getItem('joynest_notes');
      let allNotes = [];
      if (savedNotes) {
        try {
          allNotes = JSON.parse(savedNotes);
        } catch (err) {
          console.error('Error parsing notes:', err);
        }
      }
      
      let updatedNotes;
      if (isEditMode && editingNoteId) {
        updatedNotes = allNotes.map(note => 
          note.id === editingNoteId 
            ? { ...note, title: noteTitle, content: noteContent, checklist_items: checklistItems, user_id: userId }
            : note
        );
      } else {
        const newNote = {
          id: 'note_' + Date.now(),
          user_id: userId,
          title: noteTitle,
          content: noteContent,
          checklist_items: checklistItems,
          created_at: new Date().toISOString()
        };
        updatedNotes = [newNote, ...allNotes];
      }
      
      localStorage.setItem('joynest_notes', JSON.stringify(updatedNotes));
      
      const userNotes = updatedNotes.filter(note => note.user_id === userId);
      setUserNotes(userNotes);
      
      handleCancelEdit();
      alert(isEditMode ? 'Note updated successfully! (offline mode)' : 'Note saved successfully! (offline mode)');
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    
    const userId = getUserId();
    
    try {
      if (userId) {
        const response = await fetch(`http://localhost:5000/api/notes/${noteId}`, {
          method: 'DELETE',
        });
        
        const result = await response.json();
        
        if (result.success) {
          await loadNotes();
          alert('Note deleted successfully!');
        } else {
          alert('Error deleting note: ' + (result.error || 'Unknown error'));
        }
      } else {
        const savedNotes = localStorage.getItem('joynest_notes');
        if (savedNotes) {
          const allNotes = JSON.parse(savedNotes);
          const updatedNotes = allNotes.filter(note => note.id !== noteId);
          localStorage.setItem('joynest_notes', JSON.stringify(updatedNotes));
          
          const userNotes = updatedNotes.filter(note => note.user_id === userId);
          setUserNotes(userNotes);
          
          alert('Note deleted successfully! (offline mode)');
        }
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Error deleting note. Please try again.');
    }
  };

  const handleClearNote = () => {
    handleCancelEdit();
  };

  // ============================================
  // UPDATED AI ASSISTANT FUNCTIONS with improved budget extraction
  // ============================================
  const handleSendMessage = async () => {
    if (!aiPrompt.trim()) return;
    
    const userMessage = { type: 'user', content: aiPrompt };
    setChatMessages(prev => [...prev, userMessage]);
    
    const currentPrompt = aiPrompt;
    setAiPrompt('');
    setAiLoading(true);
    
    try {
      let eventType = 'general';
      if (currentPrompt.toLowerCase().includes('wedding')) eventType = 'wedding';
      else if (currentPrompt.toLowerCase().includes('birthday')) eventType = 'birthday';
      else if (currentPrompt.toLowerCase().includes('corporate') || currentPrompt.toLowerCase().includes('business')) eventType = 'corporate';
      else if (currentPrompt.toLowerCase().includes('anniversary')) eventType = 'anniversary';
      else if (currentPrompt.toLowerCase().includes('baby')) eventType = 'baby';
      else if (currentPrompt.toLowerCase().includes('graduation')) eventType = 'graduation';
      
      const response = await fetch('http://localhost:5000/api/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentPrompt,
          eventType: eventType
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setChatMessages(prev => [...prev, {
          type: 'ai',
          content: data.response
        }]);
      } else {
        setTimeout(() => {
          setChatMessages(prev => [...prev, {
            type: 'ai',
            content: getSimulatedResponse(currentPrompt)
          }]);
        }, 1500);
      }
    } catch (error) {
      console.error('Error calling AI assistant:', error);
      setTimeout(() => {
        setChatMessages(prev => [...prev, {
          type: 'ai',
          content: getSimulatedResponse(currentPrompt)
        }]);
      }, 1500);
    } finally {
      setAiLoading(false);
    }
  };

  // FIXED: Removed unused lowerPrompt variable
  const getSimulatedResponse = (prompt) => {
    let budget = 500000;
    let guests = 100;
    
    const budgetPatterns = [
      { pattern: /(\d+(?:\.\d+)?)\s*(lakh|lac)\b/i, multiplier: 100000 },
      { pattern: /(\d+(?:\.\d+)?)\s*(crore|crores|cr)\b/i, multiplier: 10000000 },
      { pattern: /(\d+(?:\.\d+)?)\s*(k|thousand)\b/i, multiplier: 1000 },
      { pattern: /(?:rs|inr|₹)\s*(\d+(?:,\d+)*)/i, multiplier: 1 },
      { pattern: /\b(\d+(?:,\d+)*)\b(?=\s*(?:budget|for|with|of|rs|₹))/i, multiplier: 1 }
    ];

    for (const { pattern, multiplier } of budgetPatterns) {
      const match = prompt.match(pattern);
      if (match) {
        let amount = parseFloat(match[1].replace(/,/g, ''));
        budget = amount * multiplier;
        break;
      }
    }

    const guestPatterns = [
      /(\d+)\s*(?:guests?|people|persons?|attendees?)/i,
      /for\s*(\d+)\s*(?:guests?|people)/i,
      /(\d+)\s*(?:pax)/i,
      /(\d+)(?=\s*(?:person|people|guest))/i
    ];

    for (const pattern of guestPatterns) {
      const match = prompt.match(pattern);
      if (match) {
        guests = parseInt(match[1]);
        break;
      }
    }

    const formatCurrency = (num) => {
      return '₹' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    const venue = Math.round(budget * 0.30);
    const catering = Math.round(budget * 0.25);
    const decor = Math.round(budget * 0.15);
    const entertainment = Math.round(budget * 0.10);
    const marketing = Math.round(budget * 0.10);
    const contingency = Math.round(budget * 0.10);
    
    return `# EVENT MANAGEMENT

## Your Event Budget of ${formatCurrency(budget)} for ${guests} guests

- **Venue (30%)**  
  ${formatCurrency(venue)}  

- **Catering (25%)**  
  ${formatCurrency(catering)}  

- **Decorations (15%)**  
  ${formatCurrency(decor)}  

- **Entertainment (10%)**  
  ${formatCurrency(entertainment)}  

- **Marketing (10%)**  
  ${formatCurrency(marketing)}  

- **Contingency (10%)**  
  ${formatCurrency(contingency)}  

---

Keep 10% aside for unexpected costs!

---

Based on your request, I've created this budget breakdown. Would you like more specific vendor recommendations?`;
  };

  // Load data on component mount
  useEffect(() => {
    loadEvents();
    loadInvitations();
    loadNotes();
    loadVendors();
  }, [loadEvents, loadInvitations, loadNotes, loadVendors]);

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================
  const getTemplateBackground = (templateId) => {
    switch(templateId) {
      case 1: return 'linear-gradient(135deg, #2b1545 0%, #1a0d2e 50%, #2b1545 100%)';
      case 2: return 'linear-gradient(135deg, #0a1931 0%, #0c2340 50%, #0a1931 100%)';
      case 3: return 'linear-gradient(135deg, #064e3b 0%, #0a5f4e 50%, #064e3b 100%)';
      case 4: return 'linear-gradient(135deg, #5c1a33 0%, #7e1946 50%, #5c1a33 100%)';
      case 5: return 'linear-gradient(135deg, #d4708c 0%, #b8546e 50%, #d4708c 100%)';
      case 6: return 'linear-gradient(135deg, #001529 0%, #002a52 50%, #001529 100%)';
      case 7: return 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 50%, #1b4332 100%)';
      case 8: return 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 50%, #ff6b6b 100%)';
      case 9: return 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1e3a8a 100%)';
      case 10: return 'linear-gradient(135deg, #8b7355 0%, #a0826d 50%, #8b7355 100%)';
      case 11: return 'linear-gradient(135deg, #0f766e 0%, #14b8a6 50%, #0f766e 100%)';
      case 12: return 'linear-gradient(135deg, #1f2937 0%, #374151 50%, #1f2937 100%)';
      case 13: return 'linear-gradient(135deg, #fecdd3 0%, #fda4af 50%, #fecdd3 100%)';
      case 14: return 'linear-gradient(135deg, #4c1d95 0%, #5b21b6 50%, #4c1d95 100%)';
      case 15: return 'linear-gradient(135deg, #000000 0%, #1f2937 50%, #000000 100%)';
      default: return '#2b1545';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setCurrentPage('landing-page');
  };

  // Mobile Navigation Component
  const MobileNavBar = () => {
    const navItems = [
      { id: 'ai', icon: 'fas fa-robot', label: 'AI' },
      { id: 'events', icon: 'fas fa-calendar-alt', label: 'Events' },
      { id: 'invitations', icon: 'fas fa-envelope', label: 'Invites' },
      { id: 'notes', icon: 'fas fa-sticky-note', label: 'Notes' },
      { id: 'vendors', icon: 'fas fa-store', label: 'Vendors' },
      { id: 'create', icon: 'fas fa-plus-circle', label: 'Create' }
    ];

    return (
      <div style={{
        display: 'flex',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'white',
        borderTop: '1px solid rgba(178, 102, 255, 0.2)',
        padding: '8px',
        justifyContent: 'space-around',
        zIndex: 1000,
        boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
      }}>
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '8px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              flex: 1,
              color: activeTab === item.id ? '#b266ff' : '#999',
              fontSize: '11px',
              minHeight: '60px'
            }}
          >
            <i className={item.icon} style={{ fontSize: '22px', marginBottom: '4px' }}></i>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    );
  };

  // ============================================
  // RENDER WITH DEEPSEEK-STYLE LAYOUT & MOBILE SUPPORT
  // ============================================
  return (
    <div style={{
      minHeight: '100vh',
      display: isMobile ? 'block' : 'flex',
      background: 'linear-gradient(135deg, #ffe6f0, #f3e6ff, #f0e6ff)',
      paddingBottom: isMobile ? '70px' : '0'
    }}>
      {/* LEFT SIDEBAR - Only show on desktop */}
      {!isMobile && (
        <div style={{
          width: '280px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(178, 102, 255, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'sticky',
          top: 0,
          overflow: 'hidden'
        }}>
          {/* App Title */}
          <div style={{
            padding: '24px 20px 16px 20px',
            borderBottom: '1px solid rgba(178, 102, 255, 0.1)'
          }}>
            <h2 style={{
              fontSize: '1.4rem',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #ff69b4, #b266ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0
            }}>
              JoyNest
            </h2>
          </div>

          {/* Navigation Tabs */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 12px'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {/* AI Assistant Tab */}
              <button
                onClick={() => setActiveTab('ai')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  background: activeTab === 'ai' ? 'rgba(178, 102, 255, 0.1)' : 'transparent',
                  border: activeTab === 'ai' ? '1px solid rgba(178, 102, 255, 0.3)' : '1px solid transparent',
                  borderRadius: '12px',
                  color: activeTab === 'ai' ? '#b266ff' : '#4a4a4a',
                  fontWeight: activeTab === 'ai' ? '600' : '500',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  width: '100%'
                }}
              >
                <i className="fas fa-robot" style={{ fontSize: '1.1rem', width: '20px' }}></i>
                <span>AI Assistant</span>
              </button>

              {/* My Events Tab */}
              <button
                onClick={() => setActiveTab('events')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  background: activeTab === 'events' ? 'rgba(178, 102, 255, 0.1)' : 'transparent',
                  border: activeTab === 'events' ? '1px solid rgba(178, 102, 255, 0.3)' : '1px solid transparent',
                  borderRadius: '12px',
                  color: activeTab === 'events' ? '#b266ff' : '#4a4a4a',
                  fontWeight: activeTab === 'events' ? '600' : '500',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  width: '100%'
                }}
              >
                <i className="fas fa-calendar-alt" style={{ fontSize: '1.1rem', width: '20px' }}></i>
                <span>My Events</span>
                {userEvents.length > 0 && (
                  <span style={{
                    marginLeft: 'auto',
                    background: 'rgba(178, 102, 255, 0.2)',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    color: '#b266ff'
                  }}>
                    {userEvents.length}
                  </span>
                )}
              </button>

              {/* Invitations Tab */}
              <button
                onClick={() => setActiveTab('invitations')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  background: activeTab === 'invitations' ? 'rgba(178, 102, 255, 0.1)' : 'transparent',
                  border: activeTab === 'invitations' ? '1px solid rgba(178, 102, 255, 0.3)' : '1px solid transparent',
                  borderRadius: '12px',
                  color: activeTab === 'invitations' ? '#b266ff' : '#4a4a4a',
                  fontWeight: activeTab === 'invitations' ? '600' : '500',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  width: '100%'
                }}
              >
                <i className="fas fa-envelope" style={{ fontSize: '1.1rem', width: '20px' }}></i>
                <span>Invitations</span>
                {userInvitations.length > 0 && (
                  <span style={{
                    marginLeft: 'auto',
                    background: 'rgba(178, 102, 255, 0.2)',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    color: '#b266ff'
                  }}>
                    {userInvitations.length}
                  </span>
                )}
              </button>

              {/* Notes Tab */}
              <button
                onClick={() => setActiveTab('notes')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  background: activeTab === 'notes' ? 'rgba(178, 102, 255, 0.1)' : 'transparent',
                  border: activeTab === 'notes' ? '1px solid rgba(178, 102, 255, 0.3)' : '1px solid transparent',
                  borderRadius: '12px',
                  color: activeTab === 'notes' ? '#b266ff' : '#4a4a4a',
                  fontWeight: activeTab === 'notes' ? '600' : '500',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  width: '100%'
                }}
              >
                <i className="fas fa-sticky-note" style={{ fontSize: '1.1rem', width: '20px' }}></i>
                <span>Notes</span>
                {userNotes.length > 0 && (
                  <span style={{
                    marginLeft: 'auto',
                    background: 'rgba(178, 102, 255, 0.2)',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    color: '#b266ff'
                  }}>
                    {userNotes.length}
                  </span>
                )}
              </button>

              {/* Create Event Tab */}
              <button
                onClick={() => setActiveTab('create')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  background: activeTab === 'create' ? 'rgba(178, 102, 255, 0.1)' : 'transparent',
                  border: activeTab === 'create' ? '1px solid rgba(178, 102, 255, 0.3)' : '1px solid transparent',
                  borderRadius: '12px',
                  color: activeTab === 'create' ? '#b266ff' : '#4a4a4a',
                  fontWeight: activeTab === 'create' ? '600' : '500',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  width: '100%',
                  marginTop: '8px'
                }}
              >
                <i className="fas fa-calendar-plus" style={{ fontSize: '1.1rem', width: '20px' }}></i>
                <span>Create Event</span>
              </button>

              {/* Find Vendors Tab */}
              <button
                onClick={() => setActiveTab('vendors')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  background: activeTab === 'vendors' ? 'rgba(178, 102, 255, 0.1)' : 'transparent',
                  border: activeTab === 'vendors' ? '1px solid rgba(178, 102, 255, 0.3)' : '1px solid transparent',
                  borderRadius: '12px',
                  color: activeTab === 'vendors' ? '#b266ff' : '#4a4a4a',
                  fontWeight: activeTab === 'vendors' ? '600' : '500',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  width: '100%'
                }}
              >
                <i className="fas fa-store" style={{ fontSize: '1.1rem', width: '20px' }}></i>
                <span>Find Vendors</span>
                {vendors.length > 0 && (
                  <span style={{
                    marginLeft: 'auto',
                    background: 'rgba(178, 102, 255, 0.2)',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    color: '#b266ff'
                  }}>
                    {vendors.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* User Profile at Bottom */}
          <div style={{
            padding: '20px 16px',
            borderTop: '1px solid rgba(178, 102, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ff69b4, #b266ff)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: '600',
              fontSize: '1rem'
            }}>
              {getUserName().charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#2d2d2d' }}>
                {getUserName()}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#999' }}>
                {user?.email || 'user@example.com'}
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                background: 'none',
                border: 'none',
                color: '#b266ff',
                cursor: 'pointer',
                fontSize: '1.2rem',
                padding: '8px'
              }}
            >
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      )}

      {/* RIGHT MAIN CONTENT */}
      <div style={{
        flex: 1,
        padding: isMobile ? '16px' : '30px',
        overflowY: 'auto',
        height: isMobile ? 'auto' : '100vh'
      }}>
        {/* Header with Welcome and Stats */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
          background: 'white',
          padding: isMobile ? '16px' : '20px 30px',
          borderRadius: '20px',
          boxShadow: '0 5px 20px rgba(178, 102, 255, 0.1)',
          border: '1px solid rgba(178, 102, 255, 0.2)',
          flexWrap: isMobile ? 'wrap' : 'nowrap',
          gap: isMobile ? '15px' : '0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setCurrentPage('landing-page')}
              style={{
                padding: '8px 16px',
                background: 'none',
                border: '2px solid #b266ff',
                borderRadius: '30px',
                color: '#b266ff',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease'
              }}
            >
              <i className="fas fa-arrow-left"></i>
              {t('back_to_home')}
            </button>
            <h2 style={{ fontSize: isMobile ? '1.2rem' : '1.5rem', fontWeight: '700', color: '#2d2d2d', margin: 0 }}>
              Welcome back, {getUserName().split(' ')[0]}! 🎉
            </h2>
          </div>

          {/* Stats Row */}
          <div style={{
            display: 'flex',
            gap: '15px',
            width: isMobile ? '100%' : 'auto',
            justifyContent: isMobile ? 'space-around' : 'flex-start'
          }}>
            <div style={{
              background: 'rgba(178, 102, 255, 0.1)',
              padding: '8px 16px',
              borderRadius: '30px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i className="fas fa-calendar-check" style={{ color: '#b266ff' }}></i>
              <span style={{ fontWeight: '600', color: '#2d2d2d' }}>{userEvents.length}</span>
              <span style={{ color: '#666' }}>Events</span>
            </div>
            <div style={{
              background: 'rgba(178, 102, 255, 0.1)',
              padding: '8px 16px',
              borderRadius: '30px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i className="fas fa-envelope" style={{ color: '#b266ff' }}></i>
              <span style={{ fontWeight: '600', color: '#2d2d2d' }}>{userInvitations.length}</span>
              <span style={{ color: '#666' }}>Invites</span>
            </div>
            <div style={{
              background: 'rgba(178, 102, 255, 0.1)',
              padding: '8px 16px',
              borderRadius: '30px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i className="fas fa-sticky-note" style={{ color: '#b266ff' }}></i>
              <span style={{ fontWeight: '600', color: '#2d2d2d' }}>{userNotes.length}</span>
              <span style={{ color: '#666' }}>Notes</span>
            </div>
          </div>
        </div>

        {/* AI Assistant Tab */}
        {activeTab === 'ai' && (
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            padding: isMobile ? '20px' : '40px',
            borderRadius: '30px',
            boxShadow: '0 20px 40px rgba(178, 102, 255, 0.1)',
            border: '1px solid rgba(178, 102, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            minHeight: '500px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              marginBottom: '25px',
              flexDirection: isMobile ? 'column' : 'row',
              textAlign: isMobile ? 'center' : 'left'
            }}>
              <div style={{
                width: isMobile ? '50px' : '60px',
                height: isMobile ? '50px' : '60px',
                background: 'linear-gradient(135deg, #ff69b4, #b266ff)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 20px rgba(178, 102, 255, 0.3)'
              }}>
                <i className="fas fa-robot" style={{ fontSize: isMobile ? '1.5rem' : '1.8rem', color: 'white' }}></i>
              </div>
              <h3 style={{
                fontSize: isMobile ? '1.5rem' : '1.8rem',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #ff69b4, #b266ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {t('ai_assistant_tab')}
              </h3>
            </div>
            
            <p style={{
              marginBottom: '30px',
              color: '#4a4a4a',
              lineHeight: '1.8',
              fontSize: isMobile ? '0.95rem' : '1.1rem',
              padding: '0 10px',
              textAlign: isMobile ? 'center' : 'left'
            }}>
              {t('describe_event')}
            </p>

            {/* Quick Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '10px',
              marginBottom: '25px',
              flexWrap: 'wrap',
              justifyContent: isMobile ? 'center' : 'flex-start'
            }}>
              <button
                onClick={() => setAiPrompt("Help me plan a wedding for 200 guests with a budget of ₹5 lakhs")}
                style={{
                  padding: isMobile ? '8px 16px' : '10px 20px',
                  background: 'rgba(178, 102, 255, 0.1)',
                  border: '1px solid rgba(178, 102, 255, 0.3)',
                  borderRadius: '30px',
                  color: '#b266ff',
                  fontSize: isMobile ? '0.8rem' : '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                <i className="fas fa-ring" style={{ marginRight: '8px' }}></i>
                Wedding
              </button>
              <button
                onClick={() => setAiPrompt("Plan a birthday party for 50 people with a budget of ₹1 lakh")}
                style={{
                  padding: isMobile ? '8px 16px' : '10px 20px',
                  background: 'rgba(178, 102, 255, 0.1)',
                  border: '1px solid rgba(178, 102, 255, 0.3)',
                  borderRadius: '30px',
                  color: '#b266ff',
                  fontSize: isMobile ? '0.8rem' : '0.9rem',
                  cursor: 'pointer'
                }}
              >
                <i className="fas fa-birthday-cake" style={{ marginRight: '8px' }}></i>
                Birthday
              </button>
              <button
                onClick={() => setAiPrompt("Help with corporate event planning for 100 attendees")}
                style={{
                  padding: isMobile ? '8px 16px' : '10px 20px',
                  background: 'rgba(178, 102, 255, 0.1)',
                  border: '1px solid rgba(178, 102, 255, 0.3)',
                  borderRadius: '30px',
                  color: '#b266ff',
                  fontSize: isMobile ? '0.8rem' : '0.9rem',
                  cursor: 'pointer'
                }}
              >
                <i className="fas fa-briefcase" style={{ marginRight: '8px' }}></i>
                Corporate
              </button>
              <button
                onClick={() => setAiPrompt("What vendors do I need for my event?")}
                style={{
                  padding: isMobile ? '8px 16px' : '10px 20px',
                  background: 'rgba(178, 102, 255, 0.1)',
                  border: '1px solid rgba(178, 102, 255, 0.3)',
                  borderRadius: '30px',
                  color: '#b266ff',
                  fontSize: isMobile ? '0.8rem' : '0.9rem',
                  cursor: 'pointer'
                }}
              >
                <i className="fas fa-store" style={{ marginRight: '8px' }}></i>
                Vendors
              </button>
              <button
                onClick={() => setAiPrompt("Give me a wedding planning checklist")}
                style={{
                  padding: isMobile ? '8px 16px' : '10px 20px',
                  background: 'rgba(178, 102, 255, 0.1)',
                  border: '1px solid rgba(178, 102, 255, 0.3)',
                  borderRadius: '30px',
                  color: '#b266ff',
                  fontSize: isMobile ? '0.8rem' : '0.9rem',
                  cursor: 'pointer'
                }}
              >
                <i className="fas fa-check-circle" style={{ marginRight: '8px' }}></i>
                Checklist
              </button>
            </div>

            {/* Chat Container */}
            <div style={{
              height: isMobile ? '50vh' : '400px',
              overflowY: 'auto',
              padding: isMobile ? '15px' : '25px',
              background: 'rgba(255,240,245,0.5)',
              borderRadius: '24px',
              border: '2px solid rgba(178, 102, 255, 0.2)',
              marginBottom: '25px',
              display: 'flex',
              flexDirection: 'column',
              gap: '15px'
            }}>
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  style={{
                    padding: msg.type === 'ai' ? (isMobile ? '15px' : '25px') : (isMobile ? '12px 18px' : '18px 25px'),
                    borderRadius: msg.type === 'ai' ? '20px 20px 20px 5px' : '20px 20px 5px 20px',
                    maxWidth: msg.type === 'ai' ? (isMobile ? '95%' : '90%') : (isMobile ? '85%' : '80%'),
                    alignSelf: msg.type === 'ai' ? 'flex-start' : 'flex-end',
                    background: msg.type === 'ai' 
                      ? 'white'
                      : 'linear-gradient(135deg, #ff69b4, #b266ff)',
                    color: msg.type === 'ai' ? '#2d2d2d' : 'white',
                    border: msg.type === 'ai' ? '2px solid rgba(178, 102, 255, 0.2)' : 'none',
                    boxShadow: msg.type === 'ai' 
                      ? '0 5px 15px rgba(0,0,0,0.05)'
                      : '0 10px 20px rgba(178, 102, 255, 0.3)',
                    whiteSpace: 'pre-line',
                    lineHeight: '1.6',
                    fontSize: isMobile ? '0.85rem' : '0.95rem'
                  }}
                >
                  {msg.type === 'ai' && (
                    <strong style={{ color: '#b266ff', display: 'block', marginBottom: '15px', fontSize: isMobile ? '0.95rem' : '1.1rem' }}>
                      <i className="fas fa-robot" style={{ marginRight: '8px' }}></i>
                      JoyNest AI Assistant
                    </strong>
                  )}
                  <div style={{ 
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}>
                    {msg.type === 'ai' ? (
                      msg.content.split('\n').map((line, i) => {
                        if (line.startsWith('# ')) {
                          return <h2 key={i} style={{ fontSize: isMobile ? '1.2rem' : '1.5rem', fontWeight: '700', margin: '15px 0 10px 0', color: '#b266ff' }}>{line.substring(2)}</h2>;
                        }
                        if (line.startsWith('## ')) {
                          return <h3 key={i} style={{ fontSize: isMobile ? '1.1rem' : '1.3rem', fontWeight: '600', margin: '12px 0 8px 0', color: '#4a4a4a' }}>{line.substring(3)}</h3>;
                        }
                        if (line.startsWith('- **')) {
                          const parts = line.split('**');
                          return (
                            <div key={i} style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center',
                              padding: '8px 0',
                              borderBottom: '1px dashed #e0e0e0',
                              flexDirection: isMobile ? 'column' : 'row',
                              gap: isMobile ? '5px' : '0'
                            }}>
                              <span style={{ fontWeight: '600', color: '#b266ff' }}>{parts[1]}</span>
                              <span style={{ fontWeight: '600', color: '#2d2d2d' }}>{parts[2]?.replace('  ', '')}</span>
                            </div>
                          );
                        }
                        if (line.startsWith('• ')) {
                          return <li key={i} style={{ marginLeft: '20px', color: '#4a4a4a' }}>{line.substring(2)}</li>;
                        }
                        if (line.trim() === '---') {
                          return <hr key={i} style={{ margin: '15px 0', border: 'none', borderTop: '2px dashed #b266ff40' }} />;
                        }
                        if (line.trim() === '') {
                          return <div key={i} style={{ height: '10px' }} />;
                        }
                        return <p key={i} style={{ margin: '5px 0', color: '#4a4a4a', fontSize: isMobile ? '0.85rem' : '0.95rem' }}>{line}</p>;
                      })
                    ) : (
                      <span>{msg.content}</span>
                    )}
                  </div>
                </div>
              ))}
              {chatMessages.length === 1 && (
                <div style={{
                  textAlign: 'center',
                  color: '#999',
                  padding: isMobile ? '20px' : '40px 20px'
                }}>
                  <i className="fas fa-comment-dots" style={{ fontSize: isMobile ? '2rem' : '3rem', marginBottom: '15px', opacity: 0.5 }}></i>
                  <p>Ask me anything about event planning!</p>
                  <p style={{ fontSize: '0.9rem' }}>Try: "Plan a wedding for 200 guests with budget ₹5 lakhs"</p>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div style={{
              display: 'flex',
              gap: '15px',
              flexDirection: isMobile ? 'column' : 'row'
            }}>
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !aiLoading && handleSendMessage()}
                placeholder="Describe your event (e.g., Wedding for 200 people, budget ₹5L)"
                style={{
                  flex: 1,
                  padding: isMobile ? '12px 16px' : '16px 24px',
                  border: '2px solid rgba(178, 102, 255, 0.2)',
                  borderRadius: '50px',
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  background: 'white'
                }}
                disabled={aiLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={aiLoading || !aiPrompt.trim()}
                style={{
                  padding: isMobile ? '12px 20px' : '16px 35px',
                  background: (aiLoading || !aiPrompt.trim()) ? '#ccc' : 'linear-gradient(135deg, #ff69b4, #b266ff)',
                  border: 'none',
                  borderRadius: '50px',
                  color: 'white',
                  fontWeight: '700',
                  cursor: (aiLoading || !aiPrompt.trim()) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  width: isMobile ? '100%' : 'auto'
                }}
              >
                {aiLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Thinking...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i>
                    {t('send')}
                  </>
                )}
              </button>
            </div>
            
            <p style={{
              textAlign: 'center',
              marginTop: '15px',
              fontSize: '0.75rem',
              color: '#999'
            }}>
              AI Assistant provides suggestions based on common practices. Always verify with vendors.
            </p>
          </div>
        )}

        {/* Create Event Tab */}
        {activeTab === 'create' && (
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            padding: isMobile ? '20px' : '40px',
            borderRadius: '30px',
            boxShadow: '0 20px 40px rgba(178, 102, 255, 0.1)',
            border: '1px solid rgba(178, 102, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            minHeight: '500px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              marginBottom: '25px',
              flexDirection: isMobile ? 'column' : 'row',
              textAlign: isMobile ? 'center' : 'left'
            }}>
              <div style={{
                width: isMobile ? '50px' : '60px',
                height: isMobile ? '50px' : '60px',
                background: 'linear-gradient(135deg, #ff69b4, #b266ff)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 20px rgba(178, 102, 255, 0.3)'
              }}>
                <i className="fas fa-calendar-plus" style={{ fontSize: isMobile ? '1.5rem' : '1.8rem', color: 'white' }}></i>
              </div>
              <h3 style={{
                fontSize: isMobile ? '1.5rem' : '1.8rem',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #ff69b4, #b266ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {t('create_new_event')}
              </h3>
            </div>
            
            <form onSubmit={handleCreateEvent}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: '20px',
                marginBottom: '20px'
              }}>
                <div>
                  <label style={{ 
                    display: 'flex',
                    marginBottom: '8px', 
                    fontWeight: '600', 
                    color: '#2d2d2d',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <i className="fas fa-tag" style={{ color: '#b266ff' }}></i>
                    Event Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={eventForm.name}
                    onChange={handleEventFormChange}
                    placeholder="e.g., Wedding Anniversary"
                    required
                    style={{
                      width: '100%',
                      padding: isMobile ? '12px' : '12px 16px',
                      border: '2px solid rgba(178, 102, 255, 0.2)',
                      borderRadius: '16px',
                      fontSize: isMobile ? '0.9rem' : '1rem',
                      outline: 'none',
                      transition: 'all 0.3s ease'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ 
                    display: 'flex',
                    marginBottom: '8px', 
                    fontWeight: '600', 
                    color: '#2d2d2d',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <i className="fas fa-calendar" style={{ color: '#b266ff' }}></i>
                    Event Type *
                  </label>
                  <select
                    id="type"
                    value={eventForm.type}
                    onChange={handleEventFormChange}
                    required
                    style={{
                      width: '100%',
                      padding: isMobile ? '12px' : '12px 16px',
                      border: '2px solid rgba(178, 102, 255, 0.2)',
                      borderRadius: '16px',
                      fontSize: isMobile ? '0.9rem' : '1rem',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="">Select event type</option>
                    <option value="birthday">Birthday</option>
                    <option value="wedding">Wedding</option>
                    <option value="corporate">Corporate</option>
                    <option value="conference">Conference</option>
                    <option value="social">Social Gathering</option>
                  </select>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: '20px',
                marginBottom: '20px'
              }}>
                <div>
                  <label style={{ 
                    display: 'flex',
                    marginBottom: '8px', 
                    fontWeight: '600', 
                    color: '#2d2d2d',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <i className="fas fa-calendar-day" style={{ color: '#b266ff' }}></i>
                    Date *
                  </label>
                  <input
                    id="date"
                    type="date"
                    value={eventForm.date}
                    onChange={handleEventFormChange}
                    required
                    style={{
                      width: '100%',
                      padding: isMobile ? '12px' : '12px 16px',
                      border: '2px solid rgba(178, 102, 255, 0.2)',
                      borderRadius: '16px',
                      fontSize: isMobile ? '0.9rem' : '1rem',
                      outline: 'none'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ 
                    display: 'flex',
                    marginBottom: '8px', 
                    fontWeight: '600', 
                    color: '#2d2d2d',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <i className="fas fa-clock" style={{ color: '#b266ff' }}></i>
                    Time
                  </label>
                  <div style={{ display: 'flex', gap: '10px', flexDirection: isMobile ? 'column' : 'row' }}>
                    <input
                      id="time"
                      type="time"
                      value={eventForm.time}
                      onChange={handleEventFormChange}
                      style={{
                        flex: 1,
                        padding: isMobile ? '12px' : '12px 16px',
                        border: '2px solid rgba(178, 102, 255, 0.2)',
                        borderRadius: '16px',
                        fontSize: isMobile ? '0.9rem' : '1rem',
                        outline: 'none'
                      }}
                    />
                    <select
                      id="timeAmPm"
                      value={eventForm.timeAmPm || 'AM'}
                      onChange={(e) => {
                        const ampm = e.target.value;
                        setEventForm(prev => ({ ...prev, timeAmPm: ampm }));
                      }}
                      style={{
                        width: isMobile ? '100%' : '90px',
                        padding: isMobile ? '12px' : '12px 10px',
                        border: '2px solid rgba(178, 102, 255, 0.2)',
                        borderRadius: '16px',
                        fontSize: isMobile ? '0.9rem' : '1rem',
                        outline: 'none',
                        backgroundColor: 'white'
                      }}
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                  {eventForm.time && (
                    <div style={{
                      marginTop: '5px',
                      fontSize: '0.75rem',
                      color: '#666',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}>
                      <i className="fas fa-info-circle" style={{ color: '#b266ff' }}></i>
                      Selected time: {formatDisplayTime(eventForm.time, eventForm.timeAmPm)}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'flex',
                  marginBottom: '8px', 
                  fontWeight: '600', 
                  color: '#2d2d2d',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <i className="fas fa-map-marker-alt" style={{ color: '#b266ff' }}></i>
                  Location *
                </label>
                <input
                  id="location"
                  type="text"
                  value={eventForm.location}
                  onChange={handleEventFormChange}
                  placeholder="Venue address"
                  required
                  style={{
                    width: '100%',
                    padding: isMobile ? '12px' : '12px 16px',
                    border: '2px solid rgba(178, 102, 255, 0.2)',
                    borderRadius: '16px',
                    fontSize: isMobile ? '0.9rem' : '1rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: '20px',
                marginBottom: '20px'
              }}>
                <div>
                  <label style={{ 
                    display: 'flex',
                    marginBottom: '8px', 
                    fontWeight: '600', 
                    color: '#2d2d2d',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <i className="fas fa-users" style={{ color: '#b266ff' }}></i>
                    Number of Guests
                  </label>
                  <input
                    id="guests"
                    type="number"
                    value={eventForm.guests}
                    onChange={handleEventFormChange}
                    placeholder="Approximate guests"
                    min="1"
                    style={{
                      width: '100%',
                      padding: isMobile ? '12px' : '12px 16px',
                      border: '2px solid rgba(178, 102, 255, 0.2)',
                      borderRadius: '16px',
                      fontSize: isMobile ? '0.9rem' : '1rem',
                      outline: 'none'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ 
                    display: 'flex',
                    marginBottom: '8px', 
                    fontWeight: '600', 
                    color: '#2d2d2d',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <i className="fas fa-rupee-sign" style={{ color: '#b266ff' }}></i>
                    Budget (₹)
                  </label>
                  <input
                    id="budget"
                    type="number"
                    value={eventForm.budget}
                    onChange={handleEventFormChange}
                    placeholder="Total budget"
                    min="0"
                    style={{
                      width: '100%',
                      padding: isMobile ? '12px' : '12px 16px',
                      border: '2px solid rgba(178, 102, 255, 0.2)',
                      borderRadius: '16px',
                      fontSize: isMobile ? '0.9rem' : '1rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '25px' }}>
                <label style={{ 
                  display: 'flex',
                  marginBottom: '8px', 
                  fontWeight: '600', 
                  color: '#2d2d2d',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <i className="fas fa-align-left" style={{ color: '#b266ff' }}></i>
                  Description
                </label>
                <textarea
                  id="description"
                  value={eventForm.description}
                  onChange={handleEventFormChange}
                  placeholder="Event details..."
                  rows="4"
                  style={{
                    width: '100%',
                    padding: isMobile ? '12px' : '12px 16px',
                    border: '2px solid rgba(178, 102, 255, 0.2)',
                    borderRadius: '16px',
                    fontSize: isMobile ? '0.9rem' : '1rem',
                    outline: 'none',
                    resize: 'vertical',
                    minHeight: isMobile ? '100px' : '120px'
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: isMobile ? '14px' : '16px',
                  background: 'linear-gradient(135deg, #ff69b4, #b266ff)',
                  border: 'none',
                  borderRadius: '50px',
                  fontSize: isMobile ? '1rem' : '1.2rem',
                  fontWeight: '700',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: '0 10px 25px rgba(178, 102, 255, 0.4)',
                  transition: 'all 0.3s ease',
                  marginTop: '20px'
                }}
              >
                <i className="fas fa-calendar-check"></i>
                Create Event
              </button>
            </form>
          </div>
        )}

        {/* Find Vendors Tab */}
        {activeTab === 'vendors' && (
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            padding: isMobile ? '20px' : '40px',
            borderRadius: '30px',
            boxShadow: '0 20px 40px rgba(178, 102, 255, 0.1)',
            border: '1px solid rgba(178, 102, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            minHeight: '500px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              marginBottom: '25px',
              flexDirection: isMobile ? 'column' : 'row',
              textAlign: isMobile ? 'center' : 'left'
            }}>
              <div style={{
                width: isMobile ? '50px' : '60px',
                height: isMobile ? '50px' : '60px',
                background: 'linear-gradient(135deg, #b266ff, #9d4edd)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 20px rgba(178, 102, 255, 0.3)'
              }}>
                <i className="fas fa-store" style={{ fontSize: isMobile ? '1.5rem' : '1.8rem', color: 'white' }}></i>
              </div>
              <h3 style={{
                fontSize: isMobile ? '1.5rem' : '1.8rem',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #b266ff, #9d4edd)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {t('find_vendors_tab')}
              </h3>
            </div>
            
            <p style={{
              marginBottom: '30px',
              color: '#4a4a4a',
              lineHeight: '1.8',
              fontSize: isMobile ? '0.9rem' : '1.1rem',
              padding: '0 10px',
              textAlign: isMobile ? 'center' : 'left'
            }}>
              {t('browse_vendors')}
            </p>

            {/* Filters */}
            <div style={{
              display: 'flex',
              gap: '15px',
              marginBottom: '30px',
              flexWrap: 'wrap',
              flexDirection: isMobile ? 'column' : 'row'
            }}>
              <select
                value={vendorFilter}
                onChange={(e) => loadVendors(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: isMobile ? '100%' : '250px',
                  padding: isMobile ? '12px 20px' : '14px 20px',
                  border: '2px solid rgba(178, 102, 255, 0.2)',
                  borderRadius: '50px',
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  backgroundColor: 'white'
                }}
              >
                <option value="">All Services</option>
                <option value="catering">Catering</option>
                <option value="photography">Photography</option>
                <option value="venue">Venue</option>
                <option value="decoration">Decoration</option>
                <option value="entertainment">Entertainment</option>
                <option value="audio_visual">Audio Visual</option>
                <option value="designer">Designer</option>
              </select>
              
              <button
                onClick={() => loadVendors(vendorFilter)}
                style={{
                  padding: isMobile ? '12px 20px' : '14px 30px',
                  background: 'white',
                  border: '2px solid #b266ff',
                  borderRadius: '50px',
                  color: '#b266ff',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  width: isMobile ? '100%' : 'auto'
                }}
              >
                <i className="fas fa-sync-alt"></i>
                Refresh
              </button>
            </div>

            {/* Vendors Grid */}
            {vendorLoading ? (
              <div style={{ textAlign: 'center', padding: isMobile ? '40px' : '60px' }}>
                <div style={{
                  display: 'inline-block',
                  width: isMobile ? '40px' : '50px',
                  height: isMobile ? '40px' : '50px',
                  border: '4px solid rgba(178, 102, 255, 0.2)',
                  borderTopColor: '#b266ff',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginBottom: '20px'
                }}></div>
                <p style={{ color: '#666' }}>Loading vendors...</p>
              </div>
            ) : vendors.length === 0 ? (
              <div style={{ textAlign: 'center', padding: isMobile ? '40px' : '60px' }}>
                <i className="fas fa-store" style={{
                  fontSize: isMobile ? '3rem' : '4rem',
                  color: '#b266ff',
                  marginBottom: '20px',
                  opacity: '0.5'
                }}></i>
                <h4 style={{ fontSize: isMobile ? '1.2rem' : '1.5rem', marginBottom: '10px', color: '#2d2d2d' }}>No vendors found</h4>
                <p style={{ color: '#666' }}>Try a different filter.</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '20px'
              }}>
                {vendors.map(vendor => (
                  <VendorCard key={vendor.id} vendor={vendor} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Events Tab */}
        {activeTab === 'events' && (
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            padding: isMobile ? '20px' : '40px',
            borderRadius: '30px',
            boxShadow: '0 20px 40px rgba(178, 102, 255, 0.1)',
            border: '1px solid rgba(178, 102, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            minHeight: '500px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              marginBottom: '25px',
              flexDirection: isMobile ? 'column' : 'row',
              textAlign: isMobile ? 'center' : 'left'
            }}>
              <div style={{
                width: isMobile ? '50px' : '60px',
                height: isMobile ? '50px' : '60px',
                background: 'linear-gradient(135deg, #9d4edd, #b266ff)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 20px rgba(178, 102, 255, 0.3)'
              }}>
                <i className="fas fa-calendar-alt" style={{ fontSize: isMobile ? '1.5rem' : '1.8rem', color: 'white' }}></i>
              </div>
              <h3 style={{
                fontSize: isMobile ? '1.5rem' : '1.8rem',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #9d4edd, #b266ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                My Events
              </h3>
            </div>
            
            <p style={{
              marginBottom: '30px',
              color: '#4a4a4a',
              lineHeight: '1.8',
              fontSize: isMobile ? '0.9rem' : '1.1rem',
              padding: '0 10px',
              textAlign: isMobile ? 'center' : 'left'
            }}>
              View and manage all your upcoming and past events
            </p>

            {userEvents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: isMobile ? '40px' : '60px' }}>
                <i className="fas fa-calendar-plus" style={{
                  fontSize: isMobile ? '3rem' : '4rem',
                  color: '#b266ff',
                  marginBottom: '20px',
                  opacity: '0.5'
                }}></i>
                <h4 style={{ fontSize: isMobile ? '1.2rem' : '1.5rem', marginBottom: '10px', color: '#2d2d2d' }}>No events created yet</h4>
                <p style={{ color: '#666', marginBottom: '30px' }}>Create your first event!</p>
                <button
                  onClick={() => setActiveTab('create')}
                  style={{
                    padding: isMobile ? '12px 25px' : '14px 35px',
                    background: 'linear-gradient(135deg, #ff69b4, #b266ff)',
                    border: 'none',
                    borderRadius: '50px',
                    color: 'white',
                    fontWeight: '700',
                    fontSize: isMobile ? '0.9rem' : '1.1rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <i className="fas fa-plus-circle"></i>
                  Create Your First Event
                </button>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '20px'
              }}>
                {userEvents.map(event => (
                  <div key={event.id} style={{
                    background: 'white',
                    borderRadius: '24px',
                    padding: isMobile ? '16px' : '25px',
                    boxShadow: '0 10px 25px rgba(178, 102, 255, 0.1)',
                    border: '1px solid rgba(178, 102, 255, 0.2)',
                    transition: 'all 0.3s ease',
                    position: 'relative'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '15px',
                      flexWrap: 'wrap',
                      gap: '10px'
                    }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        background: 'rgba(178, 102, 255, 0.1)',
                        borderRadius: '30px',
                        color: '#b266ff',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        textTransform: 'capitalize'
                      }}>
                        {event.event_type || 'Event'}
                      </span>
                      <span style={{
                        color: new Date(event.date) >= new Date() ? '#4CAF50' : '#999',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        {new Date(event.date) >= new Date() ? 'Upcoming' : 'Past'}
                      </span>
                    </div>
                    
                    <h4 style={{
                      fontSize: isMobile ? '1.1rem' : '1.3rem',
                      fontWeight: '700',
                      marginBottom: '15px',
                      color: '#2d2d2d'
                    }}>
                      {event.title}
                    </h4>
                    
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      marginBottom: '20px',
                      paddingBottom: '20px',
                      borderBottom: '1px solid rgba(178, 102, 255, 0.1)'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        color: '#666',
                        fontSize: isMobile ? '0.8rem' : '0.85rem'
                      }}>
                        <i className="fas fa-calendar-day" style={{ color: '#b266ff', width: '20px' }}></i>
                        <span>{event.date} {event.time ? `at ${formatEventTime(event.time)}` : ''}</span>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        color: '#666',
                        fontSize: isMobile ? '0.8rem' : '0.85rem'
                      }}>
                        <i className="fas fa-map-marker-alt" style={{ color: '#b266ff', width: '20px' }}></i>
                        <span>{event.location}</span>
                      </div>
                      {event.guests && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          color: '#666',
                          fontSize: isMobile ? '0.8rem' : '0.85rem'
                        }}>
                          <i className="fas fa-users" style={{ color: '#b266ff', width: '20px' }}></i>
                          <span>{event.guests} guests</span>
                        </div>
                      )}
                      {event.budget && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          color: '#666',
                          fontSize: isMobile ? '0.8rem' : '0.85rem'
                        }}>
                          <i className="fas fa-rupee-sign" style={{ color: '#b266ff', width: '20px' }}></i>
                          <span>₹{Number(event.budget).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                    
                    {event.description && (
                      <p style={{
                        color: '#4a4a4a',
                        lineHeight: '1.6',
                        marginBottom: '20px',
                        fontSize: isMobile ? '0.85rem' : '0.95rem',
                        padding: '10px',
                        background: 'rgba(178, 102, 255, 0.02)',
                        borderRadius: '12px'
                      }}>
                        {event.description}
                      </p>
                    )}
                    
                    <div style={{
                      display: 'flex',
                      gap: '10px',
                      marginTop: '10px',
                      flexDirection: isMobile ? 'column' : 'row'
                    }}>
                      <button
                        onClick={() => {
                          setEventForm({
                            ...eventForm,
                            name: event.title,
                            type: event.event_type,
                            date: event.date,
                            time: event.time,
                            location: event.location
                          });
                          setShowInvitationModal(true);
                        }}
                        style={{
                          flex: 1,
                          padding: isMobile ? '10px' : '12px',
                          background: 'linear-gradient(135deg, #ff69b4, #b266ff)',
                          border: 'none',
                          borderRadius: '50px',
                          color: 'white',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          fontSize: isMobile ? '0.85rem' : '0.9rem'
                        }}
                      >
                        <i className="fas fa-envelope"></i>
                        Invitations
                      </button>
                      <button
                        onClick={() => deleteEvent(event.id)}
                        style={{
                          padding: isMobile ? '10px' : '12px 20px',
                          background: 'white',
                          border: '2px solid #b266ff',
                          borderRadius: '50px',
                          color: '#b266ff',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          fontSize: isMobile ? '0.85rem' : '0.9rem'
                        }}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Invitations Tab */}
        {activeTab === 'invitations' && (
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            padding: isMobile ? '20px' : '40px',
            borderRadius: '30px',
            boxShadow: '0 20px 40px rgba(178, 102, 255, 0.1)',
            border: '1px solid rgba(178, 102, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            minHeight: '500px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              marginBottom: '25px',
              flexDirection: isMobile ? 'column' : 'row',
              textAlign: isMobile ? 'center' : 'left'
            }}>
              <div style={{
                width: isMobile ? '50px' : '60px',
                height: isMobile ? '50px' : '60px',
                background: 'linear-gradient(135deg, #ff69b4, #b266ff)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 20px rgba(178, 102, 255, 0.3)'
              }}>
                <i className="fas fa-envelope" style={{ fontSize: isMobile ? '1.5rem' : '1.8rem', color: 'white' }}></i>
              </div>
              <h3 style={{
                fontSize: isMobile ? '1.5rem' : '1.8rem',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #ff69b4, #b266ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Invitations
              </h3>
            </div>
            
            <p style={{
              marginBottom: '30px',
              color: '#4a4a4a',
              lineHeight: '1.8',
              fontSize: isMobile ? '0.9rem' : '1.1rem',
              padding: '0 10px',
              textAlign: isMobile ? 'center' : 'left'
            }}>
              Create stunning digital invitations for your events
            </p>

            {/* Premium Invitation Designer Card */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(255, 105, 180, 0.05), rgba(178, 102, 255, 0.05))',
              padding: isMobile ? '20px' : '30px',
              borderRadius: '24px',
              marginBottom: '30px',
              textAlign: 'center',
              border: '2px dashed rgba(178, 102, 255, 0.3)'
            }}>
              <i className="fas fa-magic" style={{
                fontSize: isMobile ? '2rem' : '3rem',
                color: '#b266ff',
                marginBottom: '15px'
              }}></i>
              <h4 style={{
                fontSize: isMobile ? '1.2rem' : '1.4rem',
                fontWeight: '700',
                marginBottom: '10px',
                color: '#2d2d2d'
              }}>
                Premium Invitation Designer
              </h4>
              <p style={{
                color: '#666',
                marginBottom: '25px',
                fontSize: isMobile ? '0.85rem' : '0.9rem'
              }}>
                Create stunning, personalized invitations with our easy-to-use designer
              </p>
              <button
                onClick={() => setShowInvitationModal(true)}
                style={{
                  padding: isMobile ? '10px 25px' : '14px 35px',
                  background: 'linear-gradient(135deg, #ff69b4, #b266ff)',
                  border: 'none',
                  borderRadius: '50px',
                  color: 'white',
                  fontWeight: '700',
                  fontSize: isMobile ? '0.9rem' : '1.1rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <i className="fas fa-pen-fancy"></i>
                Create New Invitation
              </button>
            </div>

            {/* Invitations Grid */}
            {userInvitations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: isMobile ? '30px' : '40px' }}>
                <i className="fas fa-envelope-open-text" style={{
                  fontSize: isMobile ? '3rem' : '4rem',
                  color: '#b266ff',
                  marginBottom: '20px',
                  opacity: '0.5'
                }}></i>
                <h4 style={{ fontSize: isMobile ? '1.1rem' : '1.3rem', marginBottom: '10px', color: '#2d2d2d' }}>No invitations yet</h4>
                <p style={{ color: '#666' }}>Create your first invitation card!</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '20px'
              }}>
                {userInvitations.map(invitation => (
                  <div key={invitation.id} style={{
                    background: 'white',
                    borderRadius: '24px',
                    padding: isMobile ? '16px' : '25px',
                    boxShadow: '0 10px 25px rgba(178, 102, 255, 0.1)',
                    border: '1px solid rgba(178, 102, 255, 0.2)',
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      background: 'rgba(178, 102, 255, 0.1)',
                      borderRadius: '30px',
                      color: '#b266ff',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      marginBottom: '15px'
                    }}>
                      {invitation.templateName || invitation.template || 'Invitation'}
                    </div>
                    
                    <h4 style={{
                      fontSize: isMobile ? '1rem' : '1.2rem',
                      fontWeight: '700',
                      marginBottom: '15px',
                      color: '#2d2d2d'
                    }}>
                      {invitation.eventName}
                    </h4>
                    
                    <div style={{
                      height: isMobile ? '100px' : '120px',
                      background: getTemplateBackground(invitation.template || 1),
                      borderRadius: '12px',
                      marginBottom: '15px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: invitation.fontColor || '#d4af37',
                      fontFamily: invitation.fontFamily || "'Great Vibes', cursive",
                      fontSize: isMobile ? '1rem' : '1.2rem',
                      textAlign: 'center',
                      padding: '15px',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        right: '10px',
                        bottom: '10px',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderRadius: '8px',
                        pointerEvents: 'none'
                      }}></div>
                      <span>{invitation.eventName?.split(' ')[0] || 'Invitation'}</span>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '20px',
                      color: '#666',
                      fontSize: isMobile ? '0.8rem' : '0.9rem'
                    }}>
                      <span>
                        <i className="far fa-calendar" style={{ color: '#b266ff', marginRight: '5px' }}></i>
                        {invitation.date}
                      </span>
                      <span>
                        <i className="far fa-clock" style={{ color: '#b266ff', marginRight: '5px' }}></i>
                        {invitation.time}
                      </span>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      gap: '10px',
                      flexDirection: isMobile ? 'column' : 'row'
                    }}>
                      <button
                        onClick={() => handleViewInvitation(invitation)}
                        style={{
                          flex: 1,
                          padding: isMobile ? '8px' : '10px',
                          background: 'linear-gradient(135deg, #ff69b4, #b266ff)',
                          border: 'none',
                          borderRadius: '50px',
                          color: 'white',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          fontSize: isMobile ? '0.85rem' : '0.9rem'
                        }}
                      >
                        <i className="fas fa-eye"></i>
                        View
                      </button>
                      <button
                        onClick={() => deleteInvitation(invitation.id)}
                        style={{
                          padding: isMobile ? '8px' : '10px 20px',
                          background: 'white',
                          border: '2px solid #b266ff',
                          borderRadius: '50px',
                          color: '#b266ff',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          fontSize: isMobile ? '0.85rem' : '0.9rem'
                        }}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            padding: isMobile ? '20px' : '40px',
            borderRadius: '30px',
            boxShadow: '0 20px 40px rgba(178, 102, 255, 0.1)',
            border: '1px solid rgba(178, 102, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            minHeight: '500px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              marginBottom: '25px',
              flexDirection: isMobile ? 'column' : 'row',
              textAlign: isMobile ? 'center' : 'left'
            }}>
              <div style={{
                width: isMobile ? '50px' : '60px',
                height: isMobile ? '50px' : '60px',
                background: 'linear-gradient(135deg, #ff69b4, #b266ff)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 20px rgba(178, 102, 255, 0.3)'
              }}>
                <i className="fas fa-sticky-note" style={{ fontSize: isMobile ? '1.5rem' : '1.8rem', color: 'white' }}></i>
              </div>
              <h3 style={{
                fontSize: isMobile ? '1.5rem' : '1.8rem',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #ff69b4, #b266ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Notes & Checklists
              </h3>
              {isEditMode && (
                <span style={{
                  background: '#ff69b4',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  marginLeft: isMobile ? '0' : '15px'
                }}>
                  Editing Mode
                </span>
              )}
            </div>

            {/* Notes Form */}
            <div style={{
              background: 'rgba(178, 102, 255, 0.05)',
              padding: isMobile ? '15px' : '25px',
              borderRadius: '20px',
              marginBottom: '25px',
              border: isEditMode ? '3px solid #ff69b4' : '2px solid rgba(178, 102, 255, 0.2)'
            }}>
              <h4 style={{
                marginBottom: '15px',
                color: '#b266ff',
                fontSize: isMobile ? '1.1rem' : '1.3rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <i className="fas fa-sticky-note"></i>
                {isEditMode ? 'Edit Note' : 'Create New Note'}
              </h4>
              
              {/* Note Form */}
              <div style={{
                background: 'white',
                padding: isMobile ? '15px' : '20px',
                borderRadius: '16px',
                marginBottom: '20px',
                border: '2px solid rgba(178, 102, 255, 0.2)'
              }}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ 
                    display: 'flex',
                    marginBottom: '8px', 
                    fontWeight: '600', 
                    color: '#2d2d2d',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: isMobile ? '0.85rem' : '0.9rem'
                  }}>
                    <i className="fas fa-sticky-note" style={{ color: '#b266ff' }}></i>
                    Note Title *
                  </label>
                  <input
                    type="text"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder="e.g., Things to buy"
                    style={{
                      width: '100%',
                      padding: isMobile ? '10px 12px' : '12px 16px',
                      border: '2px solid rgba(178, 102, 255, 0.2)',
                      borderRadius: '16px',
                      fontSize: isMobile ? '0.85rem' : '1rem',
                      outline: 'none'
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ 
                    display: 'flex',
                    marginBottom: '8px', 
                    fontWeight: '600', 
                    color: '#2d2d2d',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: isMobile ? '0.85rem' : '0.9rem'
                  }}>
                    <i className="fas fa-align-left" style={{ color: '#b266ff' }}></i>
                    Note Content
                  </label>
                  <textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Details about this note..."
                    rows="3"
                    style={{
                      width: '100%',
                      padding: isMobile ? '10px 12px' : '12px 16px',
                      border: '2px solid rgba(178, 102, 255, 0.2)',
                      borderRadius: '16px',
                      fontSize: isMobile ? '0.85rem' : '1rem',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                  />
                </div>
                
                {/* Checklist Items */}
                <div>
                  <label style={{ 
                    display: 'flex',
                    marginBottom: '8px', 
                    fontWeight: '600', 
                    color: '#2d2d2d',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: isMobile ? '0.85rem' : '0.9rem'
                  }}>
                    <i className="fas fa-check-circle" style={{ color: '#b266ff' }}></i>
                    Checklist Items
                  </label>
                  <div style={{
                    display: 'flex',
                    gap: '10px',
                    marginBottom: '15px',
                    flexDirection: isMobile ? 'column' : 'row'
                  }}>
                    <input
                      type="text"
                      value={checklistInput}
                      onChange={(e) => setChecklistInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddChecklistItem()}
                      placeholder="Add a checklist item"
                      style={{
                        flex: 1,
                        padding: isMobile ? '10px 12px' : '12px 16px',
                        border: '2px solid rgba(178, 102, 255, 0.2)',
                        borderRadius: '16px',
                        fontSize: isMobile ? '0.85rem' : '1rem',
                        outline: 'none'
                      }}
                    />
                    <button
                      onClick={handleAddChecklistItem}
                      style={{
                        padding: isMobile ? '10px 20px' : '12px 24px',
                        background: 'linear-gradient(135deg, #ff69b4, #b266ff)',
                        border: 'none',
                        borderRadius: '16px',
                        color: 'white',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        width: isMobile ? '100%' : 'auto'
                      }}
                    >
                      <i className="fas fa-plus"></i>
                      Add
                    </button>
                  </div>
                  
                  <div>
                    {checklistItems.length === 0 ? (
                      <p style={{ color: '#666', fontStyle: 'italic', fontSize: isMobile ? '0.8rem' : '0.85rem' }}>No checklist items added yet.</p>
                    ) : (
                      checklistItems.map((item, index) => (
                        <div key={index} style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: isMobile ? '8px 12px' : '10px 15px',
                          background: 'rgba(178, 102, 255, 0.05)',
                          borderRadius: '12px',
                          marginBottom: '8px',
                          border: '1px solid rgba(178, 102, 255, 0.2)'
                        }}>
                          <span style={{ fontSize: isMobile ? '0.85rem' : '0.9rem' }}>{item.text}</span>
                          <button
                            onClick={() => handleRemoveChecklistItem(index)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#b266ff',
                              cursor: 'pointer',
                              fontSize: '1rem',
                              padding: '5px'
                            }}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  gap: '15px',
                  marginTop: '20px',
                  flexDirection: isMobile ? 'column' : 'row'
                }}>
                  <button
                    onClick={handleSaveNote}
                    style={{
                      padding: isMobile ? '10px 20px' : '12px 24px',
                      background: 'linear-gradient(135deg, #ff69b4, #b266ff)',
                      border: 'none',
                      borderRadius: '40px',
                      color: 'white',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      width: isMobile ? '100%' : 'auto'
                    }}
                  >
                    <i className="fas fa-save"></i>
                    {isEditMode ? 'Update Note' : 'Save Note'}
                  </button>
                  <button
                    onClick={handleClearNote}
                    style={{
                      padding: isMobile ? '10px 20px' : '12px 24px',
                      background: 'white',
                      border: '2px solid #b266ff',
                      borderRadius: '40px',
                      color: '#b266ff',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      width: isMobile ? '100%' : 'auto'
                    }}
                  >
                    <i className="fas fa-times"></i>
                    {isEditMode ? 'Cancel' : 'Clear'}
                  </button>
                </div>
              </div>

              {/* Saved Notes List */}
              <h4 style={{
                marginTop: '30px',
                marginBottom: '15px',
                color: '#b266ff',
                fontSize: isMobile ? '1rem' : '1.2rem',
                fontWeight: '600'
              }}>
                <i className="fas fa-history" style={{ marginRight: '10px' }}></i>
                Saved Notes ({userNotes.length})
              </h4>
              
              {userNotes.length === 0 ? (
                <p style={{ color: '#666', fontStyle: 'italic', textAlign: 'center', padding: '20px', fontSize: isMobile ? '0.85rem' : '0.9rem' }}>
                  No notes saved yet. Create your first note above!
                </p>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '20px'
                }}>
                  {userNotes.map(note => (
                    <div key={note.id} style={{
                      background: 'white',
                      padding: isMobile ? '15px' : '20px',
                      borderRadius: '16px',
                      border: editingNoteId === note.id ? '3px solid #ff69b4' : '1px solid rgba(178, 102, 255, 0.2)',
                      boxShadow: editingNoteId === note.id ? '0 10px 20px rgba(255, 105, 180, 0.2)' : '0 5px 15px rgba(0,0,0,0.05)',
                      position: 'relative'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '10px'
                      }}>
                        <h5 style={{ fontSize: isMobile ? '0.95rem' : '1.1rem', fontWeight: '600', color: '#2d2d2d', margin: 0 }}>
                          {note.title}
                        </h5>
                        <div>
                          <button
                            onClick={() => handleEditNote(note)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#b266ff',
                              cursor: 'pointer',
                              fontSize: isMobile ? '0.85rem' : '1rem',
                              marginRight: '10px'
                            }}
                            title="Edit note"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#ff4444',
                              cursor: 'pointer',
                              fontSize: isMobile ? '0.85rem' : '1rem'
                            }}
                            title="Delete note"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                      <p style={{ color: '#666', fontSize: isMobile ? '0.85rem' : '0.95rem', marginBottom: '15px' }}>
                        {note.content}
                      </p>
                      {note.checklist_items && note.checklist_items.length > 0 && (
                        <div>
                          <small style={{ color: '#b266ff', fontWeight: '600', fontSize: isMobile ? '0.7rem' : '0.75rem' }}>Checklist:</small>
                          <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
                            {note.checklist_items.map((item, idx) => (
                              <li key={idx} style={{ color: '#666', fontSize: isMobile ? '0.8rem' : '0.9rem' }}>{item.text || item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div style={{ marginTop: '15px', fontSize: isMobile ? '0.7rem' : '0.8rem', color: '#999' }}>
                        {new Date(note.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && <MobileNavBar />}

      {/* Modals */}
      {showInvitationModal && (
        <InvitationModal 
          onClose={() => setShowInvitationModal(false)}
          onSave={handleSaveInvitation}
          userId={getUserId()}
        />
      )}

      {showViewModal && viewingInvitation && (
        <ViewInvitationModal 
          invitation={viewingInvitation}
          onClose={() => {
            setShowViewModal(false);
            setViewingInvitation(null);
          }}
        />
      )}

      {/* Global Styles */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          input, select, textarea {
            font-size: 16px !important;
          }
          
          button {
            min-height: 44px;
          }
        }
      `}</style>
    </div>
  );
};

export default UserDashboard;
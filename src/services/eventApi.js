// src/services/eventApi.js

const API_BASE_URL = 'http://localhost:5000/api';

export const eventApi = {
  // Create a new event
  createEvent: async (eventData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData)
      });
      
      if (!response.ok) {
        // Get error text but don't store in unused variable
        await response.text(); // Consume the response to avoid memory leaks
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },

  // Get all events for a user
  getUserEvents: async (userId) => {
    try {
      // Ensure userId is a number
      const numericId = parseInt(userId);
      if (isNaN(numericId)) {
        console.error('Invalid user ID:', userId);
        return [];
      }
      
      const response = await fetch(`${API_BASE_URL}/events/user/${numericId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log('No events found for user');
          return [];
        }
        // Get error text but don't store in unused variable
        await response.text(); // Consume the response to avoid memory leaks
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching events:', error);
      return []; // Return empty array on error
    }
  },

  // Delete an event
  deleteEvent: async (eventId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        // Get error text but don't store in unused variable
        await response.text(); // Consume the response to avoid memory leaks
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }
};
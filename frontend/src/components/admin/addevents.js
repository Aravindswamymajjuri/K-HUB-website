import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './addevents.css';

const AddEvent = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [mainPic, setMainPic] = useState(null);
  const [subEvents, setSubEvents] = useState([{ name: '', description: '', images: [] }]);

  const handleAddSubEvent = () => {
    setSubEvents([...subEvents, { name: '', description: '', images: [] }]);
  };

  const handleSubEventChange = (index, key, value) => {
    const newSubEvents = [...subEvents];
    newSubEvents[index][key] = value;
    setSubEvents(newSubEvents);
  };

  const handleSubEventImageChange = (index, files) => {
    const newSubEvents = [...subEvents];
    newSubEvents[index].images = files;
    setSubEvents(newSubEvents);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('mainPic', mainPic);

    const subEventsData = subEvents.map(subEvent => ({
      name: subEvent.name,
      description: subEvent.description,
      imageCount: subEvent.images.length
    }));
    formData.append('subEvents', JSON.stringify(subEventsData));

    // Fixed: Append all sub-event images to the same field name 'subEventImages'
    subEvents.forEach((subEvent) => {
      subEvent.images.forEach((image) => {
        formData.append('subEventImages', image);
      });
    });

    try {
      const response = await axios.post('http://localhost:5000/api/events/add', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Event created successfully:', response.data);
      // Optionally navigate back or show success message
      navigate(-1);
    } catch (error) {
      console.error('Error creating event:', error);
      // Handle error - show user-friendly message
    }
  };

  return (
    <div className="addevent-container">
      <form onSubmit={handleSubmit} className="addevent-form">
        <h1>Add New Event</h1>
        <button type="button" onClick={() => navigate(-1)} className="button">Back</button>
        
        <div>
          <label>Event Name:</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
          />
        </div>
        
        <div>
          <label>Main Picture:</label>
          <input 
            type="file" 
            onChange={(e) => setMainPic(e.target.files[0])} 
            accept="image/*"
            required 
          />
        </div>
        
        {subEvents.map((subEvent, index) => (
          <div key={index} className="subevent-section">
            <h3>Sub-event {index + 1}</h3>
            <div>
              <label>Sub-event Name:</label>
              <input
                type="text"
                value={subEvent.name}
                onChange={(e) => handleSubEventChange(index, 'name', e.target.value)}
                required
              />
            </div>
            <div>
              <label>Sub-event Description:</label>
              <textarea
                value={subEvent.description}
                onChange={(e) => handleSubEventChange(index, 'description', e.target.value)}
                rows="3"
              />
            </div>
            <div>
              <label>Sub-event Images:</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleSubEventImageChange(index, Array.from(e.target.files))}
              />
            </div>
          </div>
        ))}
        
        <button type="button" onClick={handleAddSubEvent}>Add Sub-event</button>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default AddEvent;
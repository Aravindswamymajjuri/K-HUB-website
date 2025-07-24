import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './manageevent.css';

const EventManager = () => {
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [editingEvent, setEditingEvent] = useState(null);
    const [editingSubEvent, setEditingSubEvent] = useState(null);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/events');
            setEvents(response.data);
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    const handleEventClick = async (eventId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/events/${eventId}`);
            setSelectedEvent(response.data);
        } catch (error) {
            console.error('Error fetching event details:', error);
        }
    };

    const handleDeleteEvent = async (eventId) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                await axios.delete(`http://localhost:5000/api/events/${eventId}`);
                fetchEvents();
                setSelectedEvent(null);
            } catch (error) {
                console.error('Error deleting event:', error);
            }
        }
    };

    const handleDeleteSubEvent = async (eventId, subEventIndex) => {
        if (window.confirm('Are you sure you want to delete this sub-event?')) {
            try {
                await axios.delete(`http://localhost:5000/api/events/${eventId}/subevents/${subEventIndex}`);
                const updatedEventResponse = await axios.get(`http://localhost:5000/api/events/${eventId}`);
                setSelectedEvent(updatedEventResponse.data);
                fetchEvents();
            } catch (error) {
                console.error('Error deleting sub-event:', error);
            }
        }
    };

    const handleDeleteImage = async (eventId, subEventIndex, imageIndex) => {
        if (window.confirm('Are you sure you want to delete this image?')) {
            try {
                await axios.delete(`http://localhost:5000/api/events/${eventId}/subevents/${subEventIndex}/images/${imageIndex}`);
                const updatedEventResponse = await axios.get(`http://localhost:5000/api/events/${eventId}`);
                setSelectedEvent(updatedEventResponse.data);
                fetchEvents();
            } catch (error) {
                console.error('Error deleting image:', error);
            }
        }
    };

    const handleEditEvent = async (eventId, updatedData) => {
        try {
            const formData = new FormData();
            formData.append('name', updatedData.name);
            // Only append mainPic if a new file is selected
            if (updatedData.mainPic) {
                formData.append('mainPic', updatedData.mainPic);
            }
            const response = await axios.put(`http://localhost:5000/api/events/${eventId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setSelectedEvent(response.data);
            fetchEvents();
            setEditingEvent(null);
        } catch (error) {
            console.error('Error editing event:', error);
        }
    };

    const handleEditSubEvent = async (eventId, subEventIndex, updatedData) => {
        try {
            const formData = new FormData();
            formData.append('name', updatedData.name);
            formData.append('description', updatedData.description);
            
            if (updatedData.images && updatedData.images.length > 0) {
                updatedData.images.forEach((image) => {
                    formData.append('images', image);
                });
            }

            // Note: This route may not exist in your current backend
            // You may need to add it or modify this call
            const response = await axios.put(`http://localhost:5000/api/events/${eventId}/subevents/${subEventIndex}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setSelectedEvent(response.data);
            fetchEvents();
            setEditingSubEvent(null);
        } catch (error) {
            console.error('Error editing sub-event:', error);
            alert('Error editing sub-event. This route may not be implemented in the backend.');
        }
    };

    // Helper function to safely convert buffer to base64 (browser compatible)
    const bufferToBase64 = (buffer) => {
        try {
            if (!buffer) return null;
            // If already a base64 string
            if (typeof buffer === 'string') return buffer;
            // If buffer is an object with a data property (MongoDB style)
            if (buffer && typeof buffer === 'object' && buffer.data) {
                // If data is a string, return as is
                if (typeof buffer.data === 'string') return buffer.data;
                // If data is an array (of bytes)
                if (Array.isArray(buffer.data)) {
                    const uint8Array = new Uint8Array(buffer.data);
                    return btoa(String.fromCharCode.apply(null, uint8Array));
                }
                // If data is a Uint8Array
                if (buffer.data instanceof Uint8Array) {
                    return btoa(String.fromCharCode.apply(null, buffer.data));
                }
            }
            // If buffer is an array (of bytes)
            if (Array.isArray(buffer)) {
                const uint8Array = new Uint8Array(buffer);
                return btoa(String.fromCharCode.apply(null, uint8Array));
            }
            // If buffer is a Uint8Array
            if (buffer instanceof Uint8Array) {
                return btoa(String.fromCharCode.apply(null, buffer));
            }
            return null;
        } catch (error) {
            console.error('Error converting buffer to base64:', error);
            return null;
        }
    };


    return (
        <div className="event-manager">
            <div className="event-list">
                <h2>Events</h2>
                {events.map(event => (
                    <div key={event._id} className="event-item" onClick={() => handleEventClick(event._id)}>
                        {event.name}
                    </div>
                ))}
            </div>

            {selectedEvent && (
                <div className="event-details">
                    {editingEvent ? (
                        <EditEventForm 
                            event={selectedEvent} 
                            onSave={handleEditEvent} 
                            onCancel={() => setEditingEvent(null)} 
                        />
                    ) : (
                        <>
                            <h2>{selectedEvent.name}</h2>
                            {selectedEvent.mainPic && (
                                <img 
                                    src={`data:image/jpeg;base64,${bufferToBase64(selectedEvent.mainPic)}`}
                                    alt={selectedEvent.name}
                                    style={{ maxWidth: '300px', height: 'auto' }}
                                />
                            )}
                            <button onClick={() => handleDeleteEvent(selectedEvent._id)}>Delete Event</button>
                            <button onClick={() => setEditingEvent(selectedEvent)}>Edit Event</button>
                        </>
                    )}

                    <h3>Sub Events</h3>
                    {selectedEvent.subEvents && selectedEvent.subEvents.length > 0 ? (
                        selectedEvent.subEvents.map((subEvent, subEventIndex) => (
                            <div key={subEventIndex} className="sub-event">
                                {editingSubEvent === subEventIndex ? (
                                    <EditSubEventForm 
                                        subEvent={subEvent} 
                                        onSave={(updatedData) => handleEditSubEvent(selectedEvent._id, subEventIndex, updatedData)} 
                                        onCancel={() => setEditingSubEvent(null)} 
                                    />
                                ) : (
                                    <>
                                        <h4>{subEvent.name}</h4>
                                        <p>{subEvent.description}</p>
                                        <button onClick={() => handleDeleteSubEvent(selectedEvent._id, subEventIndex)}>
                                            Delete Sub-Event
                                        </button>
                                        <button onClick={() => setEditingSubEvent(subEventIndex)}>
                                            Edit Sub-Event
                                        </button>

                                        <div className="sub-event-images">
                                            {subEvent.images && subEvent.images.length > 0 ? (
                                                subEvent.images.map((image, imageIndex) => {
                                                    const base64Image = bufferToBase64(image);
                                                    return base64Image ? (
                                                        <div key={imageIndex} className="sub-event-image">
                                                            <img 
                                                                src={`data:image/jpeg;base64,${base64Image}`}
                                                                alt={`${subEvent.name} image ${imageIndex + 1}`}
                                                                style={{ maxWidth: '200px', height: 'auto', margin: '5px' }}
                                                            />
                                                            <button onClick={() => handleDeleteImage(selectedEvent._id, subEventIndex, imageIndex)}>
                                                                Delete Image
                                                            </button>
                                                        </div>
                                                    ) : null;
                                                })
                                            ) : (
                                                <p>No images found for this sub-event.</p>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))
                    ) : (
                        <p>No sub-events found for this event.</p>
                    )}
                </div>
            )}
        </div>
    );
};

const EditEventForm = ({ event, onSave, onCancel }) => {
    const [name, setName] = useState(event.name);
    const [mainPic, setMainPic] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(event._id, { name, mainPic });
    };

    return (
        <form onSubmit={handleSubmit}>
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
                    accept="image/*"
                    onChange={(e) => setMainPic(e.target.files[0])} 
                />
            </div>
            <button type="submit">Save</button>
            <button type="button" onClick={onCancel}>Cancel</button>
        </form>
    );
};

const EditSubEventForm = ({ subEvent, onSave, onCancel }) => {
    const [name, setName] = useState(subEvent.name);
    const [description, setDescription] = useState(subEvent.description);
    const [images, setImages] = useState([]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ name, description, images });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Sub-event Name:</label>
                <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                />
            </div>
            <div>
                <label>Sub-event Description:</label>
                <textarea 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    rows="3"
                />
            </div>
            <div>
                <label>Add Images:</label>
                <input 
                    type="file" 
                    multiple 
                    accept="image/*"
                    onChange={(e) => setImages(Array.from(e.target.files))} 
                />
            </div>
            <button type="submit">Save</button>
            <button type="button" onClick={onCancel}>Cancel</button>
        </form>
    );
};

export default EventManager;
'use client';
import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation'; 

const TaskList = () => {
    const [startDate, setStartDate] = useState(new Date());
    const [allTasks, setAllTasks] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [datesGenerated, setDatesGenerated] = useState(false);
    const [draggedTaskId, setDraggedTaskId] = useState(null);
    const touchStartX = useRef(0);
    const touchStartY = useRef(0);
    const router = useRouter(); 

    const categoryColors = {
        'new landscaping': '#4CAF50',
        'site clearing': '#F44336',
        'plant maintenance': '#2196F3',
        'grass maintenance': '#FFC107',
        'general maintenance': '#9C27B0',
    };
    
    function generateDates(startDate) {
        const newTasks = [];
        const existingKeys = new Set(allTasks.map(task => `${task.title}-${task.dueDate}`));
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);

            const storageDate = date.toISOString().split('T')[0];

            const templateTasks = [
                { title: 'Install new flower beds', category: 'New landscaping', priority: 'high', status: 'pending' },
                { title: 'Gather Leaves', category: 'Site Clearing', priority: 'low', status: 'inProgress' },
                { title: 'Prune Trees and Shrubs', category: 'Plant Maintenance', priority: 'medium', status: 'completed' },
                { title: 'Mow the Lawn', category: 'Grass Maintenance', priority: 'high', status: 'pending' },
                { title: 'Repair Fence', category: 'General Maintenance', priority: 'medium', status: 'inProgress' },
            ];

            for (const task of templateTasks) {
                const key = `${task.title}-${storageDate}`;
                if (!existingKeys.has(key)) {
                    existingKeys.add(key);
                    newTasks.push({
                        ...task,
                        id: `task-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
                        startDate: storageDate,
                        dueDate: storageDate,
                        completionDate: task.status === 'completed' ? storageDate : '',
                    });
                }
            }
        }
        
        if (newTasks.length > 0) {
            setAllTasks(prev => [...prev, ...newTasks]);
        }
    }
    
    useEffect(() => {
        const storedTasks = JSON.parse(localStorage.getItem('allTasks')) || [];
        setAllTasks(storedTasks);
    }, []);

    useEffect(() => {
        localStorage.setItem('allTasks', JSON.stringify(allTasks));
    }, [allTasks]);

    useEffect(() => {
        if (!datesGenerated && allTasks.length === 0) {
            generateDates(startDate);
            setDatesGenerated(true);
        }
    }, [allTasks, startDate, datesGenerated]);

    function applyFilters() {
        return allTasks.filter(task => {
            const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
            const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
            return matchesPriority && matchesStatus;
        });
    }

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);
        if (query.length > 0) {
            const results = allTasks.filter((task) =>
                task.title.toLowerCase().includes(query)
            );
            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleDateClick = (date) => {
        const taskContent = document.getElementById(`task-content-${date}`);
        let openItems = document.querySelectorAll(".task-content");
        openItems.forEach(item => {
            if (item !== taskContent) {
                item.style.display = "none";
            }
        });
        if (taskContent) {
            taskContent.style.display = taskContent.style.display === 'block' ? 'none' : 'block';
        }
    };

    const handleDragStart = (e, taskId) => {
        setDraggedTaskId(taskId);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e, dropTargetId, tasksForDate) => {
        e.preventDefault();

        if (!draggedTaskId || draggedTaskId === dropTargetId) return;

        const updatedTasks = [...allTasks];
        const draggedTaskIndex = updatedTasks.findIndex(task => task.id === draggedTaskId);
        const dropTargetIndex = updatedTasks.findIndex(task => task.id === dropTargetId);

        const draggedTask = updatedTasks[draggedTaskIndex];
        const dropTargetTask = updatedTasks[dropTargetIndex];

        if (draggedTask.dueDate !== dropTargetTask.dueDate) return;

        const filtered = updatedTasks.filter(task => task.dueDate === draggedTask.dueDate);
        const rest = updatedTasks.filter(task => task.dueDate !== draggedTask.dueDate);

        const draggedInGroupIndex = filtered.findIndex(task => task.id === draggedTaskId);
        const droppedInGroupIndex = filtered.findIndex(task => task.id === dropTargetId);

        const [draggedItem] = filtered.splice(draggedInGroupIndex, 1);
        filtered.splice(droppedInGroupIndex, 0, draggedItem);

        const newList = [...rest, ...filtered];
        setAllTasks(newList);
    };

    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const diffY = touchStartY.current - touchEndY;
        const diffX = touchStartX.current - touchEndX;
    
        const absX = Math.abs(diffX);
        const absY = Math.abs(diffY);
    
        if (absX > absY) {
            if (diffX > 50) {
                window.location.href = 'completed.html';
            } else if (diffX < -50) {
                window.location.href = 'high-priority.html';
            }
        } else {
            if (diffY > 50) {
                setStartDate(prevDate => {
                    const newDate = new Date(prevDate);
                    newDate.setDate(newDate.getDate() + 7);
                    generateDates(new Date(newDate));
                    return newDate;
                });
            } else if (diffY < -50) {
                setStartDate(prevDate => {
                    const newDate = new Date(prevDate);
                    newDate.setDate(newDate.getDate() - 7);
                    generateDates(new Date(newDate));
                    return newDate;
                });
            }
        }
    };
    
    return (
    <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <div className="accordion-body">
            <div className="accordion">
                <h1>Task List</h1>
                <div id="filter-container">
                    <label htmlFor="priorityFilter">Priority:</label>
                    <select id="priorityFilter" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                        <option value="all">All</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                    
                    <label htmlFor="statusFilter">Status:</label>
                    <select id="statusFilter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="all">All</option>
                        <option value="pending">Pending</option>
                        <option value="inProgress">In Progress</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
                
                <div id="searchBar-container">
                    <input type="text" id="searchBar" placeholder="Search Task..." value={searchQuery} onChange={handleSearch} />
                    {searchQuery.length > 0 && (
                        <div id="searchPopup">
                            <span id="closePopup" onClick={clearSearch}>&times;</span>
                            <ul id="searchResults">
                                {searchResults.map((task) => (
                                    <li
                                    key={task.id}
                                    className="search-result-item"
                                    onClick={() => {
                                        const taskElement = document.getElementById(task.id);
                                        if (taskElement) {
                                            taskElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                        }
                                        clearSearch();
                                    }}
                                    >
                                        <span style={{ backgroundColor: categoryColors[task.category.toLowerCase()], color: 'white', padding: '0.2em 0.5em', borderRadius: '5px', marginRight: '5px' }}>
                                            {task.title}
                                            </span>
                                            </li>
                                        ))}
                            </ul>
                        </div>
                    )}
                </div>
                
                <div className="dates">
                    {Array.from({ length: 7 }, (_, i) => {
                        let date = new Date(startDate);
                        date.setDate(startDate.getDate() + i);
                        const displayDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                        const storageDate = date.toISOString().split('T')[0];
                        const taskMap = new Map();
                        applyFilters().forEach(task => {
                            if (task.dueDate === storageDate && !taskMap.has(task.title)) {
                                taskMap.set(task.title, task);
                            }
                        });
                        const tasksForDate = Array.from(taskMap.values());
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const isOverdue = date < today;
                        
                        return (
                        <div key={storageDate} className={`date-item ${isOverdue ? 'overdue' : ''}`} onClick={() => handleDateClick(storageDate)}>
                            {displayDate}
                            <div className="task-content" id={`task-content-${storageDate}`}>
                                <ul>
                                    {tasksForDate.map((task) => {
                                        const categoryColor = categoryColors[task.category.toLowerCase()] || 'gray';
                                        return (
                                        <li
                                        key={task.id}
                                        id={task.id}
                                        className="task-item"
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, task.id)}
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, task.id, tasksForDate)}
                                        style={{ marginBottom: '5px' }}
                                        onClick={() => {
                                        localStorage.setItem('selectedTaskId', task.id);
                                        alert(`Redirecting to Task Details Page for: ${task.title}`);
                                        window.location.href = 'task-details.html';
                                    }}
                                    >
                                        <span style={{ backgroundColor: categoryColor, color: 'white', padding: '0.2em 0.5em', borderRadius: '5px', marginRight: '5px' }}>
                                            {task.title}
                                        </span>
                                        </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </div>
                    );
                })}
                </div>
                </div>
            </div>
    </div>
    );
};

export default TaskList;
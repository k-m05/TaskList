document.addEventListener("DOMContentLoaded", function () {
    const taskId = localStorage.getItem("selectedTaskId");  
    const tasks = JSON.parse(localStorage.getItem("allTasks")) || [];  
    const selectedTask = tasks.find(task => String(task.id) === taskId);  

    if (selectedTask) {
        document.getElementById("taskTitle").value = selectedTask.title || "";
        document.getElementById("startDate").value = selectedTask.startDate || "";
        document.getElementById("dueDate").value = selectedTask.dueDate || "";
        document.getElementById("completionDate").value = selectedTask.completionDate || ""; 
        document.getElementById("priority").value = selectedTask.priority || "medium";
        document.getElementById("status").value = selectedTask.status || "pending";
    } else {
        alert("Error: Task not found!");
        window.location.href = '/'; 
    }

    document.getElementById('return').addEventListener('click', function () {
        window.location.href = '/';
    });

    document.getElementById('newTask').addEventListener('click', function () {
        window.location.href = 'new-task.html';
    });

    document.getElementById('stats').addEventListener('click', function () {
        window.location.href = 'task-stats.html';
    });

    document.getElementById("save").addEventListener("click", function () {
        const taskTitle = document.getElementById("taskTitle").value;
        const startDate = document.getElementById("startDate").value;
        const dueDate = document.getElementById("dueDate").value;
        const completionDate = document.getElementById("completionDate").value; 
        const priority = document.getElementById("priority").value;
        const status = document.getElementById("status").value;

        if (selectedTask) {
            selectedTask.title = taskTitle;
            selectedTask.startDate = startDate;
            selectedTask.dueDate = dueDate;
            selectedTask.completionDate = completionDate; 
            selectedTask.priority = priority;
            selectedTask.status = status;

            const allTasks = JSON.parse(localStorage.getItem("allTasks")) || [];
            const taskIndex = allTasks.findIndex(task => task.id === selectedTask.id);
            if (taskIndex !== -1) {
                allTasks[taskIndex] = selectedTask;
                localStorage.setItem("allTasks", JSON.stringify(allTasks));
                alert("Task details saved successfully!");
                window.location.href = '/'; 
            }
        } else {
            alert("Error: Could not save task details.");
        }
    });

    let startX;
    document.addEventListener('touchstart', function (event) {
        startX = event.touches[0].clientX;
    });

    document.addEventListener('touchend', function (event) {
        const endX = event.changedTouches[0].clientX;
        const diff = endX - startX;

        const taskIndex = tasks.findIndex(task => task.id === selectedTask.id);

        if (diff < -50 && taskIndex > 0) {
            const prevTask = tasks[taskIndex - 1];
            localStorage.setItem("selectedTaskId", prevTask.id);
            location.reload();  

        } else if (diff > 50 && taskIndex < tasks.length - 1) {
            const nextTask = tasks[taskIndex + 1];
            localStorage.setItem("selectedTaskId", nextTask.id);
            location.reload();  
        }
    });

    const pdfUpload = document.getElementById('pdfUpload');
    if (pdfUpload) {
        pdfUpload.addEventListener('change', function (event) {
            const file = event.target.files[0];
            if (file && file.type === "application/pdf") {
                if (selectedTask) {
                    selectedTask.pdfDocument = file.name;  
                    localStorage.setItem("allTasks", JSON.stringify(tasks));
                    alert(`PDF "${file.name}" uploaded and associated with the task.`);
                }
            } else if (file) {
                alert("Please upload a valid PDF document.");
                this.value = '';  
            }
        });
    }
});

// app.js

// Function to calculate FCFS
function calculateFCFS(processes, arrivalTimes) {
    const n = processes.length;
    const waitingTime = Array(n).fill(0);
    const turnaroundTime = Array(n).fill(0);
    let serviceTime = Array(n).fill(0);
    serviceTime[0] = arrivalTimes[0];

    for (let i = 1; i < n; i++) {
        serviceTime[i] = serviceTime[i - 1] + processes[i - 1];
        waitingTime[i] = serviceTime[i] - arrivalTimes[i];
        if (waitingTime[i] < 0) {
            waitingTime[i] = 0;
        }
    }

    for (let i = 0; i < n; i++) {
        turnaroundTime[i] = processes[i] + waitingTime[i];
    }

    return { processes, arrivalTimes, waitingTime, turnaroundTime };
}

// Function to calculate SJF
function calculateSJF(processes, arrivalTimes) {
    const n = processes.length;
    const completed = Array(n).fill(false);
    const waitingTime = Array(n).fill(0);
    const turnaroundTime = Array(n).fill(0);
    let currentTime = 0, completedProcesses = 0;

    while (completedProcesses < n) {
        let shortest = -1;
        let minBurstTime = Number.MAX_VALUE;

        for (let i = 0; i < n; i++) {
            if (arrivalTimes[i] <= currentTime && !completed[i] && processes[i] < minBurstTime) {
                minBurstTime = processes[i];
                shortest = i;
            }
        }

        if (shortest === -1) {
            currentTime++;
            continue;
        }

        currentTime += processes[shortest];
        waitingTime[shortest] = currentTime - arrivalTimes[shortest] - processes[shortest];
        turnaroundTime[shortest] = currentTime - arrivalTimes[shortest];
        completed[shortest] = true;
        completedProcesses++;
    }

    return { processes, arrivalTimes, waitingTime, turnaroundTime };
}

// Function to calculate SRTF
function calculateSRTF(processes, arrivalTimes) {
    const n = processes.length;
    let remainingTimes = [...processes];
    const waitingTime = Array(n).fill(0);
    const turnaroundTime = Array(n).fill(0);
    let complete = 0, currentTime = 0, minm = Number.MAX_VALUE;
    let shortest = 0, finishTime;
    let check = false;

    while (complete !== n) {
        for (let j = 0; j < n; j++) {
            if ((arrivalTimes[j] <= currentTime) && (remainingTimes[j] < minm) && (remainingTimes[j] > 0)) {
                minm = remainingTimes[j];
                shortest = j;
                check = true;
            }
        }

        if (!check) {
            currentTime++;
            continue;
        }

        remainingTimes[shortest]--;
        minm = remainingTimes[shortest];
        if (minm === 0) minm = Number.MAX_VALUE;

        if (remainingTimes[shortest] === 0) {
            complete++;
            check = false;
            finishTime = currentTime + 1;
            waitingTime[shortest] = finishTime - processes[shortest] - arrivalTimes[shortest];
            if (waitingTime[shortest] < 0) waitingTime[shortest] = 0;
        }
        currentTime++;
    }

    for (let i = 0; i < n; i++) {
        turnaroundTime[i] = processes[i] + waitingTime[i];
    }

    return { processes, arrivalTimes, waitingTime, turnaroundTime };
}

// Function to calculate RR
function calculateRR(processes, arrivalTimes, quantum) {
    const n = processes.length;
    const remainingTimes = [...processes];
    const waitingTime = Array(n).fill(0);
    const turnaroundTime = Array(n).fill(0);
    let t = 0;
    const readyQueue = [];

    for (let i = 0; i < n; i++) {
        if (arrivalTimes[i] <= t) {
            readyQueue.push(i);
        }
    }

    while (readyQueue.length > 0) {
        let i = readyQueue.shift();

        if (remainingTimes[i] > 0) {
            if (remainingTimes[i] > quantum) {
                t += quantum;
                remainingTimes[i] -= quantum;
            } else {
                t += remainingTimes[i];
                waitingTime[i] = t - arrivalTimes[i] - processes[i];
                remainingTimes[i] = 0;
            }
        }

        for (let j = 0; j < n; j++) {
            if (arrivalTimes[j] > t && arrivalTimes[j] <= t + quantum && remainingTimes[j] > 0) {
                readyQueue.push(j);
            }
        }

        if (remainingTimes[i] > 0) {
            readyQueue.push(i);
        }
    }

    for (let i = 0; i < n; i++) {
        turnaroundTime[i] = processes[i] + waitingTime[i];
    }

    return { processes, arrivalTimes, waitingTime, turnaroundTime };
}

// Function to generate Gantt Chart
function drawGanttChart(processes, ganttData) {
    google.charts.setOnLoadCallback(drawChart);

    function drawChart() {
        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Process');
        data.addColumn('date', 'Start Time');
        data.addColumn('date', 'End Time');
        data.addRows(ganttData);

        var options = {
            height: (processes.length * 40) + 80,
            gantt: {
                trackHeight: 30
            }
        };

        var chart = new google.visualization.Gantt(document.getElementById('gantt_chart'));

        chart.draw(data, options);
    }
}

// Function to handle form submission
document.getElementById('processForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const processesInput = document.getElementById('processes').value;
    const arrivalTimesInput = document.getElementById('arrivalTimes').value;
    const quantum = parseInt(document.getElementById('quantum').value);
    const processes = processesInput.split(',').map(Number);
    let arrivalTimes;

    if (arrivalTimesInput) {
        arrivalTimes = arrivalTimesInput.split(',').map(Number);
    } else {
        arrivalTimes = Array(processes.length).fill(0);
    }

    const applyArrivalFCFS = document.getElementById('applyArrivalFCFS').checked;
    const applyArrivalSJF = document.getElementById('applyArrivalSJF').checked;
    const applyArrivalSRTF = document.getElementById('applyArrivalSRTF').checked;
    const applyArrivalRR = document.getElementById('applyArrivalRR').checked;

    const fcfsResult = calculateFCFS(processes, applyArrivalFCFS ? arrivalTimes : Array(processes.length).fill(0));
    const sjfResult = calculateSJF(processes, applyArrivalSJF ? arrivalTimes : Array(processes.length).fill(0));
    const srtfResult = calculateSRTF(processes, applyArrivalSRTF ? arrivalTimes : Array(processes.length).fill(0));
    const rrResult = calculateRR(processes, applyArrivalRR ? arrivalTimes : Array(processes.length).fill(0), quantum);

    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
        <h3>FCFS</h3>
        ${generateTable(fcfsResult)}
        ${generateAverages(fcfsResult)}

        <h3>SJF</h3>
        ${generateTable(sjfResult)}
        ${generateAverages(sjfResult)}

        <h3>SRTF</h3>
        ${generateTable(srtfResult)}
        ${generateAverages(srtfResult)}

        <h3>RR</h3>
        ${generateTable(rrResult)}
        ${generateAverages(rrResult)}
    `;

    // Gantt chart data
    const ganttData = generateGanttData(processes, fcfsResult, sjfResult, srtfResult, rrResult);

    // Draw Gantt chart
    drawGanttChart(processes, ganttData);
});

// Function to generate Gantt chart data
function generateGanttData(fcfsResult, sjfResult, srtfResult, rrResult) {
    const ganttData = [];

    // FCFS
    for (let i = 0; i < fcfsResult.processes.length; i++) {
        ganttData.push([
            `P${i + 1}`,
            `FCFS - P${i + 1}`,
            new Date(0, 0, 0, 0, fcfsResult.arrivalTimes[i]),
            new Date(0, 0, 0, 0, fcfsResult.arrivalTimes[i] + fcfsResult.turnaroundTime[i])
        ]);
    }

    // SJF
    for (let i = 0; i < sjfResult.processes.length; i++) {
        ganttData.push([
            `P${i + 1}`,
            `SJF - P${i + 1}`,
            new Date(0, 0, 0, 0, sjfResult.arrivalTimes[i]),
            new Date(0, 0, 0, 0, sjfResult.arrivalTimes[i] + sjfResult.turnaroundTime[i])
        ]);
    }

    // SRTF
    for (let i = 0; i < srtfResult.processes.length; i++) {
        ganttData.push([
            `P${i + 1}`,
            `SRTF - P${i + 1}`,
            new Date(0, 0, 0, 0, srtfResult.arrivalTimes[i]),
            new Date(0, 0, 0, 0, srtfResult.arrivalTimes[i] + srtfResult.turnaroundTime[i])
        ]);
    }

    // RR
    for (let i = 0; i < rrResult.processes.length; i++) {
        ganttData.push([
            `P${i + 1}`,
            `RR - P${i + 1}`,
            new Date(0, 0, 0, 0, rrResult.arrivalTimes[i]),
            new Date(0, 0, 0, 0, rrResult.arrivalTimes[i] + rrResult.turnaroundTime[i])
        ]);
    }

    return ganttData;
}


// Function to generate HTML table from result
function generateTable(result) {
    let table = `<table>
        <tr>
            <th>Process</th>
            <th>Burst Time</th>
            <th>Arrival Time</th>
            <th>Waiting Time</th>
            <th>Turnaround Time</th>
        </tr>`;

    for (let i = 0; i < result.processes.length; i++) {
        table += `<tr>
            <td>P${i + 1}</td>
            <td>${result.processes[i]}</td>
            <td>${result.arrivalTimes[i]}</td>
            <td>${result.waitingTime[i]}</td>
            <td>${result.turnaroundTime[i]}</td>
        </tr>`;
    }

    table += '</table>';
    return table;
}

// Function to generate averages from result
function generateAverages(result) {
    const n = result.processes.length;
    const avgWaitingTime = result.waitingTime.reduce((a, b) => a + b, 0) / n;
    const avgTurnaroundTime = result.turnaroundTime.reduce((a, b) => a + b, 0) / n;

    return `<p>Average Waiting Time: ${avgWaitingTime.toFixed(2)}</p>
            <p>Average Turnaround Time: ${avgTurnaroundTime.toFixed(2)}</p>`;
}

// Function to draw Gantt chart
function drawGanttChart(fcfsResult, sjfResult, srtfResult, rrResult) {
    const data = new google.visualization.DataTable();
    data.addColumn('string', 'Task ID');
    data.addColumn('string', 'Task Group');
    data.addColumn('date', 'Start Time');
    data.addColumn('date', 'End Time');
    data.addRows(generateGanttData(fcfsResult, sjfResult, srtfResult, rrResult));

    const options = {
        height: 400,
        gantt: {
            trackHeight: 30
        }
    };

    const chart = new google.visualization.Gantt(document.getElementById('gantt_chart_div'));

    chart.draw(data, options);
}
// Load Google Charts
google.charts.load('current', {'packages':['gantt']});

